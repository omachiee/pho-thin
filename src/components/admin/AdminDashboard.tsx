import React, { useState, useEffect } from 'react';
import { 
  adminStore, 
  AdminReservation, 
  AdminDish, 
  AdminInquiry, 
  ReservationStatus,
  SecurityLog
} from '../../services/adminStore';
import { BRANCHES } from '../../data/branches';
import { Article } from '../../types';
import {
  isSupabaseConfigured,
  getSupabaseConfigInfo,
  checkSupabaseConnection,
  setCustomSupabaseCredentials,
} from '../../services/supabase';

import { 
  LayoutDashboard, 
  CalendarCheck, 
  UtensilsCrossed, 
  Newspaper, 
  Store, 
  MessageSquare, 
  ShieldAlert, 
  LogOut, 
  Search, 
  Filter, 
  Phone, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Download, 
  Lock, 
  Key, 
  Smartphone, 
  RefreshCw, 
  ShieldCheck, 
  Save, 
  TrendingUp, 
  Users, 
  DollarSign, 
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';
import { PhoThinLogo } from '../PhoThinLogo';

interface AdminDashboardProps {
  onLogout: () => void;
  onExitToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onExitToWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'dishes' | 'news' | 'branches' | 'inquiries' | 'security'>('overview');
  
  // Real-time local copy of store
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [dishes, setDishes] = useState<AdminDish[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  // Session timeout countdown in seconds
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState(15 * 60);

  // Reservation Filter & Search
  const [resSearch, setResSearch] = useState('');
  const [resBranchFilter, setResBranchFilter] = useState('all');
  const [resStatusFilter, setResStatusFilter] = useState<string>('all');
  
  // Modal for new reservation
  const [isAddResModalOpen, setIsAddResModalOpen] = useState(false);
  const [newResData, setNewResData] = useState({
    fullName: '',
    phone: '',
    email: '',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '11:30',
    partySize: 2,
    branchId: 'cs1-dinh-tien-hoang',
    notes: '',
  });

  // Modal for edit dish
  const [editingDish, setEditingDish] = useState<AdminDish | null>(null);

  // Security credentials form
  const [secUsername, setSecUsername] = useState('');
  const [secPassword, setSecPassword] = useState('');
  const [secPin, setSecPin] = useState('');
  const [secTimeout, setSecTimeout] = useState(15);
  const [secSuccessMsg, setSecSuccessMsg] = useState('');

  // Supabase Backend Management State
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfigInfo());
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<string | null>(null);
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState('');
  const [customSupabaseKey, setCustomSupabaseKey] = useState('');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestMsg(null);
    try {
      const res = await checkSupabaseConnection();
      setSupabaseTestMsg(res.message);
      showToast(res.ok ? 'Kết nối Supabase thành công!' : res.message);
    } catch (e: any) {
      setSupabaseTestMsg(e?.message || 'Lỗi kiểm tra kết nối');
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSyncCloud = async () => {
    showToast('Đang kết nối & đồng bộ dữ liệu từ Supabase Cloud...');
    const ok = await adminStore.syncFromSupabase();
    if (ok) {
      refreshData();
      setSupabaseConfig(getSupabaseConfigInfo());
      showToast('Đã đồng bộ thành công toàn bộ thực đơn, cơ sở và đơn đặt bàn từ Supabase!');
    } else {
      showToast('Hệ thống đang hoạt động ổn định với bộ nhớ đệm an toàn.');
    }
  };

  const handleSaveCustomCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSupabaseUrl.trim() || !customSupabaseKey.trim()) {
      showToast('Vui lòng điền đầy đủ URL dự án Supabase và Anon Public Key!');
      return;
    }
    setCustomSupabaseCredentials(customSupabaseUrl, customSupabaseKey);
    setIsSupabaseModalOpen(false);
    showToast('Đã lưu cấu hình Supabase! Đang tải lại để kết nối...');
  };


  // Sync data from adminStore
  const refreshData = () => {
    const data = adminStore.getData();
    setReservations([...data.reservations]);
    setDishes([...data.dishes]);
    setArticles([...data.articles]);
    setInquiries([...data.inquiries]);
    setSecurityLogs([...data.securityLogs]);
    setSecUsername(data.securityConfig.username);
    setSecPin(data.securityConfig.pinCode);
    setSecTimeout(data.securityConfig.sessionTimeoutMinutes);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('phothin_store_updated', refreshData);
    return () => window.removeEventListener('phothin_store_updated', refreshData);
  }, []);

  // Session auto-lock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  const handleExtendSession = () => {
    const config = adminStore.getSecurityConfig();
    setSessionSecondsRemaining(config.sessionTimeoutMinutes * 60);
    showToast(`Đã gia hạn phiên làm việc thêm ${config.sessionTimeoutMinutes} phút!`);
  };

  // --- RESERVATION HANDLERS ---
  const handleUpdateStatus = (id: string, newStatus: ReservationStatus) => {
    adminStore.updateReservationStatus(id, newStatus);
    refreshData();
    showToast(`Đã cập nhật trạng thái đơn #${id} thành công!`);
  };

  const handleDeleteReservation = (id: string) => {
    if (window.confirm(`Bạn có chắc muốn xoá đơn đặt bàn #${id}?`)) {
      adminStore.deleteReservation(id);
      refreshData();
      showToast(`Đã xoá đơn #${id}.`);
    }
  };

  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.fullName || !newResData.phone) {
      alert('Vui lòng nhập tên khách và số điện thoại!');
      return;
    }

    const branch = BRANCHES.find((b) => b.id === newResData.branchId) || BRANCHES[0];
    adminStore.createManualReservation({
      fullName: newResData.fullName,
      phone: newResData.phone,
      email: newResData.email || 'dat-truc-tiep@phothin.vn',
      reservationDate: newResData.reservationDate,
      reservationTime: newResData.reservationTime,
      partySize: Number(newResData.partySize) || 2,
      branchId: branch.id,
      branchName: `${branch.code}: ${branch.name.vi}`,
      notes: newResData.notes ? `[Đặt tại quầy/Gọi điện] ${newResData.notes}` : '[Đặt tại quầy/Gọi điện]',
      status: 'confirmed',
    });

    setIsAddResModalOpen(false);
    setNewResData({
      fullName: '',
      phone: '',
      email: '',
      reservationDate: new Date().toISOString().split('T')[0],
      reservationTime: '11:30',
      partySize: 2,
      branchId: 'cs1-dinh-tien-hoang',
      notes: '',
    });
    refreshData();
    showToast('Tạo đơn đặt bàn thành công!');
  };

  const handleExportCSV = () => {
    const headers = ['Mã Đơn', 'Khách Hàng', 'Số Điện Thoại', 'Email', 'Cơ Sở', 'Ngày', 'Giờ', 'Số Khách', 'Trạng Thái', 'Ghi Chú'];
    const rows = reservations.map((r) => [
      r.id,
      `"${r.fullName}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.branchName}"`,
      r.reservationDate,
      r.reservationTime,
      r.partySize,
      r.status,
      `"${r.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PhoThin_DanhSachDatBan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách đơn đặt bàn thành file CSV!');
  };

  // --- DISH HANDLERS ---
  const handleToggleDishAvailability = (dishId: string) => {
    adminStore.toggleDishAvailability(dishId);
    refreshData();
    showToast('Đã cập nhật trạng thái còn/hết món!');
  };

  const handleSaveDishEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    adminStore.updateDish(editingDish);
    setEditingDish(null);
    refreshData();
    showToast('Đã cập nhật thông tin món ăn thành công!');
  };

  // --- SECURITY CREDENTIALS UPDATE ---
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (secPin.length !== 6 || !/^\d+$/.test(secPin)) {
      alert('Mã PIN phải bao gồm đúng 6 chữ số!');
      return;
    }

    adminStore.updateSecurityCredentials(secUsername, secPassword || undefined, secPin, secTimeout);
    setSecSuccessMsg('Đã cập nhật thông tin bảo mật thành công! Ghi nhớ mã PIN mới để đăng nhập lần sau.');
    showToast('Cập nhật bảo mật thành công!');
    setTimeout(() => setSecSuccessMsg(''), 4000);
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(resSearch.toLowerCase()) ||
      r.phone.includes(resSearch) ||
      r.id.toLowerCase().includes(resSearch.toLowerCase());
    const matchesBranch = resBranchFilter === 'all' || r.branchId === resBranchFilter;
    const matchesStatus = resStatusFilter === 'all' || r.status === resStatusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Calculate Overview Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter((r) => r.reservationDate === todayStr);
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const completedCount = reservations.filter((r) => r.status === 'completed').length;
  const estimatedRevenueToday = todayReservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.partySize * 85000, 0);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#160305] text-[#FFF8E9] flex flex-col font-sans selection:bg-[#D6A84F] selection:text-[#160305]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#3B0B10] border-2 border-[#D6A84F] text-[#FFF8E9] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#D6A84F] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP ADMIN BAR */}
      <header className="bg-[#200609] border-b border-[#B88932]/40 sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <PhoThinLogo size={36} withRing />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-serif font-black text-[#D6A84F]">
                  Phở Thìn Bờ Hồ
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold bg-[#A52B25] text-white rounded">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-[#F4E8D2]/70 hidden sm:block">
                Hệ thống quản lý nội bộ • 4 Cơ sở chính thức Hà Nội
              </p>
            </div>
          </div>

          {/* Quick Actions & Session Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Status Pill */}
            <div 
              onClick={() => setActiveTab('security')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors border-[#B88932]/30 bg-[#160305] hover:border-[#D6A84F]"
              title={supabaseConfig.isConfigured ? 'Supabase Cloud Backend đã kết nối' : 'Supabase Backend đang hoạt động ở chế độ đệm an toàn'}
            >
              <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono font-medium text-[#F4E8D2]/90 hidden md:inline">
                {supabaseConfig.isConfigured ? 'Supabase Online' : 'Supabase Standby'}
              </span>
            </div>

            {/* Auto-Lock Timer */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#160305] px-2.5 py-1 rounded-lg border border-[#B88932]/30 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span className="text-[11px] text-[#F4E8D2]/70">Khóa sau:</span>
              <span className="font-mono font-bold text-[#D6A84F]">
                {formatSessionTime(sessionSecondsRemaining)}
              </span>
              <button
                onClick={handleExtendSession}
                className="text-[10px] text-[#FFF8E9] underline hover:text-[#D6A84F] ml-1 cursor-pointer"
                title="Gia hạn thêm thời gian đăng nhập"
              >
                Gia hạn
              </button>
            </div>


            {/* Back to Client Website */}
            <button
              onClick={onExitToWebsite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B0B10] border border-[#B88932]/40 text-xs text-[#F4E8D2] hover:text-[#D6A84F] hover:border-[#D6A84F] transition-colors cursor-pointer"
              title="Quay lại giao diện website khách hàng"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Trang Khách</span>
            </button>

            {/* Secure Logout */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A52B25]/80 hover:bg-[#A52B25] text-xs font-semibold text-[#FFF8E9] transition-colors cursor-pointer"
              title="Đăng xuất và khóa bảo mật"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SCROLLABLE TAB BAR */}
      <nav className="bg-[#180406] border-b border-[#B88932]/25 overflow-x-auto no-scrollbar px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng Quan</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'reservations'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Đơn Đặt Bàn</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#A52B25] text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dishes'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Quản Lý Món</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'branches'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>4 Cơ Sở</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Tin Tức</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'inquiries'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Liên Hệ / Tuyển Dụng</span>
            {inquiries.filter((i) => i.status === 'new').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Bảo Mật & Cài Đặt</span>
          </button>
        </div>
      </nav>

      {/* MAIN ADMIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 shadow-lg">
                <div className="flex items-center justify-between text-[#D6A84F] mb-2">
                  <span className="text-xs font-semibold uppercase">Đơn Hôm Nay</span>
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-white">
                  {todayReservations.length}
                </div>
                <p className="text-[11px] text-[#F4E8D2]/70 mt-1">
                  Đang chờ duyệt: <strong className="text-[#E5484D]">{pendingCount}</strong>
                </p>
              </div>

              <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 shadow-lg">
                <div className="flex items-center justify-between text-[#D6A84F] mb-2">
                  <span className="text-xs font-semibold uppercase">Đã Xác Nhận</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-white">
                  {confirmedCount}
                </div>
                <p className="text-[11px] text-[#F4E8D2]/70 mt-1">
                  Hoàn thành: <strong className="text-[#3DD68C]">{completedCount}</strong>
                </p>
              </div>

              <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 shadow-lg">
                <div className="flex items-center justify-between text-[#D6A84F] mb-2">
                  <span className="text-xs font-semibold uppercase">Ước Tính Doanh Thu</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-xl sm:text-2xl font-serif font-black text-[#D6A84F]">
                  {estimatedRevenueToday.toLocaleString('vi-VN')} đ
                </div>
                <p className="text-[11px] text-[#F4E8D2]/70 mt-1">
                  Dựa trên lượng khách hôm nay
                </p>
              </div>

              <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 shadow-lg">
                <div className="flex items-center justify-between text-[#D6A84F] mb-2">
                  <span className="text-xs font-semibold uppercase">Tình Trạng Món</span>
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-white">
                  {dishes.filter((d) => d.isAvailable).length} / {dishes.length}
                </div>
                <p className="text-[11px] text-[#F4E8D2]/70 mt-1">
                  Đang mở bán đầy đủ
                </p>
              </div>
            </div>

            {/* 4 Branches Capacity Status */}
            <div className="bg-[#200609] p-4 sm:p-6 rounded-2xl border border-[#B88932]/30">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F] mb-4 flex items-center justify-between">
                <span>Tình Trạng 4 Cơ Sở Chính Thức Hôm Nay</span>
                <span className="text-xs text-[#F4E8D2]/70 font-sans font-normal">
                  Giờ phục vụ: 06:00 - 13:00 & 17:00 - 22:00
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BRANCHES.map((b) => {
                  const branchBookings = todayReservations.filter((r) => r.branchId === b.id);
                  return (
                    <div
                      key={b.id}
                      className="bg-[#160305] p-3.5 rounded-xl border border-[#B88932]/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs text-[#FFF8E9]">
                          {b.code}: {b.name.vi}
                        </span>
                        {b.isOriginal && (
                          <span className="text-[9px] bg-[#A52B25] text-white px-1.5 py-0.5 rounded font-bold">
                            CS GỐC
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#F4E8D2]/70 line-clamp-1">{b.address}</p>
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-[#D6A84F] font-mono">
                          {branchBookings.length} đơn đặt hôm nay
                        </span>
                        <a
                          href={`tel:${b.phone}`}
                          className="p-1 rounded bg-[#3B0B10] text-[#D6A84F] hover:bg-[#D6A84F] hover:text-[#160305] transition-colors"
                          title="Gọi hotline cơ sở"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Urgent Reservations List */}
            <div className="bg-[#200609] p-4 sm:p-6 rounded-2xl border border-[#B88932]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D6A84F]" />
                  <span>Đơn Cần Xử Lý Ngay ({pendingCount} đơn chờ duyệt)</span>
                </h3>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className="text-xs text-[#D6A84F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {reservations.filter((r) => r.status === 'pending').length === 0 ? (
                <div className="text-center py-6 text-xs text-[#F4E8D2]/60">
                  Tuyệt vời! Không còn đơn đặt bàn nào đang chờ duyệt.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reservations
                    .filter((r) => r.status === 'pending')
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#160305] p-3.5 rounded-xl border border-[#B88932]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#D6A84F]">
                              {item.id}
                            </span>
                            <span className="font-bold text-sm text-white">
                              {item.fullName}
                            </span>
                            <span className="text-xs bg-[#3B0B10] px-2 py-0.5 rounded text-[#F4E8D2]/90">
                              {item.partySize} khách
                            </span>
                          </div>
                          <div className="text-xs text-[#F4E8D2]/80 mt-1 flex flex-wrap gap-2">
                            <span>Giờ: <strong className="text-white">{item.reservationTime}</strong> ({item.reservationDate})</span>
                            <span>•</span>
                            <span className="text-[#D6A84F]">{item.branchName}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-[#F4E8D2]/70 italic mt-1">
                              "{item.notes}"
                            </p>
                          )}
                        </div>

                        {/* Mobile-Friendly Quick Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B0B10] text-xs font-bold text-[#3DD68C] hover:bg-[#3DD68C] hover:text-[#160305] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.phone}</span>
                          </a>

                          <button
                            onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-[#3DD68C] text-[#160305] text-xs font-bold hover:brightness-110 transition-colors cursor-pointer"
                          >
                            Xác Nhận
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RESERVATIONS MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {/* Action Bar: Search, Filters, Add, Export */}
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#D6A84F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Tìm theo tên khách, số điện thoại, mã đơn..."
                    className="w-full pl-9 pr-3 py-2 bg-[#160305] border border-[#B88932]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#D6A84F]"
                  />
                </div>

                {/* Buttons: Add Manual & Export CSV */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsAddResModalOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] text-[#160305] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Đơn Tại Quầy</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3B0B10] border border-[#B88932]/40 text-xs font-semibold text-[#F4E8D2] hover:text-[#D6A84F] hover:border-[#D6A84F] transition-all cursor-pointer"
                    title="Xuất file danh sách CSV cho Excel"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Xuất CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#B88932]/20 text-xs">
                <span className="text-[#D6A84F] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Bộ lọc:</span>
                </span>

                <select
                  value={resBranchFilter}
                  onChange={(e) => setResBranchFilter(e.target.value)}
                  className="bg-[#160305] border border-[#B88932]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="all">Tất cả 4 cơ sở</option>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name.vi}
                    </option>
                  ))}
                </select>

                <select
                  value={resStatusFilter}
                  onChange={(e) => setResStatusFilter(e.target.value)}
                  className="bg-[#160305] border border-[#B88932]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>

                <span className="ml-auto text-[#F4E8D2]/60 text-[11px]">
                  Tổng: <strong>{filteredReservations.length}</strong> đơn
                </span>
              </div>
            </div>

            {/* Reservations Cards List (Mobile & Desktop Responsive) */}
            <div className="space-y-3">
              {filteredReservations.length === 0 ? (
                <div className="bg-[#200609] p-8 text-center rounded-2xl border border-[#B88932]/30 text-xs text-[#F4E8D2]/70">
                  Không tìm thấy đơn đặt bàn nào phù hợp với bộ lọc.
                </div>
              ) : (
                filteredReservations.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 hover:border-[#D6A84F]/60 transition-all shadow-md space-y-3"
                  >
                    {/* Header Row: ID, Status, Branch */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B88932]/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#D6A84F] bg-[#160305] px-2 py-0.5 rounded border border-[#B88932]/20">
                          {item.id}
                        </span>
                        {item.isWalkIn && (
                          <span className="text-[10px] bg-[#3B0B10] border border-[#D6A84F]/40 text-[#D6A84F] px-1.5 py-0.5 rounded">
                            Tại Quầy
                          </span>
                        )}
                        <span className="text-xs text-[#F4E8D2]/60">
                          {item.createdAt}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#E5484D]/20 text-[#FF8B8B] border border-[#E5484D]/50 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Chờ Xác Nhận</span>
                          </span>
                        )}
                        {item.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã Xác Nhận</span>
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/50 px-2.5 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Đã Hoàn Thành</span>
                          </span>
                        )}
                        {item.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/50 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            <span>Đã Hủy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[#F4E8D2]/60 block text-[11px]">Khách hàng:</span>
                        <strong className="text-sm text-white font-bold block">{item.fullName}</strong>
                        <span className="text-[#F4E8D2]/80 font-mono">{item.email}</span>
                      </div>

                      <div>
                        <span className="text-[#F4E8D2]/60 block text-[11px]">Thời gian & Cơ sở:</span>
                        <div className="text-white font-semibold">
                          {item.reservationTime} - Ngày {item.reservationDate}
                        </div>
                        <span className="text-[#D6A84F] block">{item.branchName}</span>
                      </div>

                      <div>
                        <span className="text-[#F4E8D2]/60 block text-[11px]">Số lượng khách:</span>
                        <div className="text-white font-bold text-sm">
                          {item.partySize} Người lớn
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-[#F4E8D2]/80 italic line-clamp-2 mt-0.5">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Mobile Touch Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#B88932]/20">
                      {/* One-touch Call Button (Ideal for Smartphone) */}
                      <a
                        href={`tel:${item.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#160305] border border-[#3DD68C]/50 text-xs font-mono font-bold text-[#3DD68C] hover:bg-[#3DD68C] hover:text-[#160305] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi {item.phone}</span>
                      </a>

                      {/* State switch buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                            className="px-2.5 py-1 bg-[#3DD68C] hover:brightness-110 text-[#160305] text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Xác Nhận
                          </button>
                        )}
                        {item.status !== 'completed' && item.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Xong Bữa
                          </button>
                        )}
                        {item.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                            className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium rounded-lg cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReservation(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg cursor-pointer"
                          title="Xóa đơn khỏi hệ thống"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DISHES MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'dishes' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">
                  Quản Lý Danh Sách Món Ăn
                </h3>
                <p className="text-xs text-[#F4E8D2]/70">
                  Bật/tắt trạng thái hết món ngay tức thì để khách đặt bàn và xem thực đơn cập nhật tức thì.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    dish.isAvailable
                      ? 'bg-[#200609] border-[#B88932]/30'
                      : 'bg-[#200609]/50 border-red-500/40 opacity-75'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={dish.image}
                      alt={dish.name.vi}
                      className="w-20 h-20 rounded-xl object-cover border border-[#B88932]/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-sm text-white line-clamp-1">
                          {dish.name.vi}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#D6A84F] mt-1">
                        {dish.price.toLocaleString('vi-VN')} đ
                      </div>
                      <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#160305] text-[#F4E8D2]/70">
                        {dish.category === 'pho' ? 'Phở Bò' : dish.category === 'drinks' ? 'Đồ Uống' : 'Món Kèm'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#F4E8D2]/80 line-clamp-2 mt-2.5">
                    {dish.shortDescription.vi}
                  </p>

                  <div className="pt-3 mt-3 border-t border-[#B88932]/20 flex items-center justify-between gap-2">
                    {/* Availability Toggle */}
                    <button
                      onClick={() => handleToggleDishAvailability(dish.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        dish.isAvailable
                          ? 'bg-[#3DD68C]/20 border border-[#3DD68C] text-[#3DD68C]'
                          : 'bg-[#E5484D]/20 border border-[#E5484D] text-[#FF8B8B]'
                      }`}
                    >
                      {dish.isAvailable ? '✓ Đang Phục Vụ' : '✕ Tạm Hết Món'}
                    </button>

                    <button
                      onClick={() => setEditingDish(dish)}
                      className="inline-flex items-center gap-1 text-xs text-[#D6A84F] hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BRANCHES MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">
                4 Cơ Sở Chính Thức Tại Hà Nội
              </h3>
              <p className="text-xs text-[#F4E8D2]/70">
                Quản lý số điện thoại hotline, thông báo tình trạng phục vụ của từng chi nhánh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BRANCHES.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#200609] p-5 rounded-2xl border border-[#B88932]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif font-bold text-base text-white">
                        {b.code}: {b.name.vi}
                      </span>
                      {b.isOriginal && (
                        <span className="ml-2 text-[10px] bg-[#A52B25] text-white px-2 py-0.5 rounded font-bold uppercase">
                          Cơ Sở Gốc 1955
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#F4E8D2]/80">
                    <p><strong>Địa chỉ:</strong> {b.address}</p>
                    <p><strong>Hotline:</strong> <a href={`tel:${b.phone}`} className="text-[#D6A84F] font-mono">{b.phone}</a></p>
                    <p><strong>Ca sáng:</strong> {b.morningSlot} | <strong>Ca chiều tối:</strong> {b.afternoonSlot}</p>
                    <p className="text-[11px] text-[#F4E8D2]/60 italic mt-1">{b.highlight.vi}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <a
                      href={b.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D6A84F] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Google Maps</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: NEWS ARTICLES MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">
                  Bảng Tin & Thông Cáo Báo Chí ({articles.length} bài)
                </h3>
                <p className="text-xs text-[#F4E8D2]/70">
                  Bao gồm các sự kiện hợp tác Masan Chin-su Phở Story, phục vụ Thượng đỉnh Mỹ - Triều,...
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 flex flex-col sm:flex-row gap-4 items-start"
                >
                  <img
                    src={art.image}
                    alt={art.title.vi}
                    className="w-full sm:w-36 h-24 object-cover rounded-xl border border-[#B88932]/30 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#3B0B10] text-[#D6A84F] px-2 py-0.5 rounded font-semibold">
                        {art.category.vi}
                      </span>
                      <span className="text-[11px] text-[#F4E8D2]/60 font-mono">
                        {art.date}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-white">
                      {art.title.vi}
                    </h4>
                    <p className="text-xs text-[#F4E8D2]/80 line-clamp-2">
                      {art.excerpt.vi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: INQUIRIES & RECRUITMENT */}
        {/* ============================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">
                Tin Nhắn Khách Hàng & Đơn Tuyển Dụng
              </h3>
              <p className="text-xs text-[#F4E8D2]/70">
                Theo dõi khách đặt tiệc số lượng lớn và hồ sơ ứng viên nộp qua website.
              </p>
            </div>

            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inq.type === 'recruitment'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {inq.type === 'recruitment' ? 'Ứng Tuyển Việc Làm' : 'Tin Nhắn Khách'}
                      </span>
                      <strong className="text-sm text-white">{inq.fullName}</strong>
                    </div>
                    <span className="text-[11px] text-[#F4E8D2]/60 font-mono">{inq.createdAt}</span>
                  </div>

                  {inq.position && (
                    <p className="text-xs text-[#D6A84F] font-semibold">
                      Vị trí ứng tuyển: {inq.position}
                    </p>
                  )}

                  {inq.message && (
                    <p className="text-xs text-[#F4E8D2]/90 bg-[#160305] p-2.5 rounded-xl border border-[#B88932]/20">
                      "{inq.message}"
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3B0B10] text-[#3DD68C] font-mono font-bold rounded-lg hover:bg-[#3DD68C] hover:text-[#160305] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inq.phone}</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => {
                          adminStore.updateInquiryStatus(inq.id, e.target.value as AdminInquiry['status']);
                          refreshData();
                          showToast('Đã cập nhật trạng thái liên hệ!');
                        }}
                        className="bg-[#160305] border border-[#B88932]/30 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="new">Mới tiếp nhận</option>
                        <option value="contacted">Đã liên hệ phỏng vấn</option>
                        <option value="resolved">Đã giải quyết / Đã tuyển</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: SECURITY & SYSTEM SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Secret Gateway Access Instructions for Owner */}
            <div className="bg-[#200609] p-5 rounded-2xl border-2 border-[#D6A84F]/50 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-[#D6A84F]">
                <ShieldCheck className="w-5 h-5 text-[#D6A84F]" />
                <h3 className="font-serif font-black text-sm sm:text-base text-white">
                  Cơ Chế Ẩn Bảo Mật & Hướng Dẫn Truy Cập Dành Riêng Cho Quản Trị Viên
                </h3>
              </div>

              <p className="text-xs text-[#F4E8D2]/90 leading-relaxed">
                Để đảm bảo người dùng bình thường không nhìn thấy giao diện quản lý và không xuất hiện nút đăng nhập Admin công khai, hệ thống kích hoạt qua 3 cách bí mật sau:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-[#160305] p-3.5 rounded-xl border border-[#B88932]/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#D6A84F] font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>1. Trên Điện Thoại (Cử chỉ chạm)</span>
                  </div>
                  <p className="text-[11px] text-[#F4E8D2]/80 leading-normal">
                    Tại chân trang website (Footer), <strong>nhấn giữ 2.5 giây</strong> vào dòng chữ <em>"Hanoi Heritage • Est. 1955"</em> hoặc <strong>chạm 3 lần liên tiếp</strong> vào Logo Phở Thìn Bờ Hồ.
                  </p>
                </div>

                <div className="bg-[#160305] p-3.5 rounded-xl border border-[#B88932]/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#D6A84F] font-bold">
                    <ExternalLink className="w-4 h-4" />
                    <span>2. Đường Link Bí Mật (URL)</span>
                  </div>
                  <p className="text-[11px] text-[#F4E8D2]/80 leading-normal">
                    Thêm <code className="bg-[#3B0B10] px-1 py-0.5 rounded text-[#D6A84F]">#admin</code> hoặc <code className="bg-[#3B0B10] px-1 py-0.5 rounded text-[#D6A84F]">#quantri</code> vào sau địa chỉ web trên thanh trình duyệt điện thoại/máy tính.
                  </p>
                </div>

                <div className="bg-[#160305] p-3.5 rounded-xl border border-[#B88932]/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#D6A84F] font-bold">
                    <Key className="w-4 h-4" />
                    <span>3. Phím Tắt Trên Máy Tính</span>
                  </div>
                  <p className="text-[11px] text-[#F4E8D2]/80 leading-normal">
                    Bấm tổ hợp phím <kbd className="bg-[#3B0B10] px-1.5 py-0.5 rounded text-white font-mono">Ctrl + Shift + A</kbd> ở bất kỳ màn hình nào.
                  </p>
                </div>
              </div>
            </div>

            {/* Change Credentials Form */}
            <div className="bg-[#200609] p-5 rounded-2xl border border-[#B88932]/30">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#D6A84F] mb-3">
                Thay Đổi Mật Khẩu Quản Trị & Mã PIN Cấp 2
              </h3>

              {secSuccessMsg && (
                <div className="mb-4 p-3 bg-[#3DD68C]/20 border border-[#3DD68C]/50 rounded-xl text-xs text-[#3DD68C] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{secSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSecurity} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-[#D6A84F] mb-1 uppercase tracking-wider">
                    Tên Quản Trị Viên (Username)
                  </label>
                  <input
                    type="text"
                    value={secUsername}
                    onChange={(e) => setSecUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#D6A84F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6A84F] mb-1 uppercase tracking-wider">
                    Mật Khẩu Mới (Để trống nếu không muốn đổi)
                  </label>
                  <input
                    type="password"
                    value={secPassword}
                    onChange={(e) => setSecPassword(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị mới..."
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#D6A84F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6A84F] mb-1 uppercase tracking-wider">
                    Mã PIN Bảo Mật Cấp 2 (Bắt buộc đúng 6 chữ số)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={secPin}
                    onChange={(e) => setSecPin(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="Ví dụ: 195570"
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/30 rounded-xl text-xs font-mono text-[#D6A84F] tracking-widest focus:outline-none focus:border-[#D6A84F]"
                  />
                  <p className="text-[10px] text-[#F4E8D2]/60 mt-1">
                    * Mã PIN này sẽ được yêu cầu ở Bước 2 khi đăng nhập trên bàn phím ảo điện thoại.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6A84F] mb-1 uppercase tracking-wider">
                    Thời Gian Tự Động Khóa Phiên (Session Timeout)
                  </label>
                  <select
                    value={secTimeout}
                    onChange={(e) => setSecTimeout(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/30 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value={5}>5 phút không hoạt động</option>
                    <option value={15}>15 phút (Khuyên dùng)</option>
                    <option value={30}>30 phút</option>
                    <option value={60}>60 phút</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D6A84F] hover:brightness-110 text-[#160305] font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình Bảo Mật</span>
                </button>
              </form>
            </div>

            {/* SUPABASE BACKEND & DATABASE MANAGEMENT */}
            <div className="bg-[#200609] p-5 sm:p-6 rounded-2xl border border-[#B88932]/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B88932]/20 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#D6A84F] flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${supabaseConfig.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>Hạ Tầng Backend Supabase & PostgreSQL (RLS)</span>
                  </h3>
                  <p className="text-xs text-[#F4E8D2]/70 mt-1">
                    Cơ sở dữ liệu PostgreSQL thực tế, phân quyền Row Level Security (RLS) và lưu trữ Supabase Storage
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSupabase}
                    disabled={testingSupabase}
                    className="px-3 py-1.5 bg-[#3B0B10] hover:bg-[#560F16] border border-[#B88932]/40 rounded-xl text-xs text-[#D6A84F] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
                    <span>{testingSupabase ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}</span>
                  </button>
                  <button
                    onClick={handleSyncCloud}
                    className="px-3 py-1.5 bg-[#D6A84F] hover:brightness-110 rounded-xl text-xs text-[#160305] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Đồng Bộ Cloud</span>
                  </button>
                </div>
              </div>

              {/* Status info bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#160305] p-3 rounded-xl border border-[#B88932]/20">
                  <span className="text-[#F4E8D2]/60 block mb-1">Trạng thái kết nối:</span>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className={supabaseConfig.isConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                      {supabaseConfig.isConfigured ? 'Supabase Cloud Connected' : 'Đang hoạt động (Safe Fallback)'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#160305] p-3 rounded-xl border border-[#B88932]/20">
                  <span className="text-[#F4E8D2]/60 block mb-1">URL Dự Án:</span>
                  <span className="font-mono text-[#D6A84F] truncate block" title={supabaseConfig.url}>
                    {supabaseConfig.url}
                  </span>
                </div>

                <div className="bg-[#160305] p-3 rounded-xl border border-[#B88932]/20">
                  <span className="text-[#F4E8D2]/60 block mb-1">Cấu hình API Key:</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">
                      {supabaseConfig.hasKey ? 'Đã cài đặt Anon Key' : 'Chưa nhập Anon Key'}
                    </span>
                    <button
                      onClick={() => setIsSupabaseModalOpen(true)}
                      className="text-[#D6A84F] hover:underline text-[11px] cursor-pointer"
                    >
                      Tùy chỉnh
                    </button>
                  </div>
                </div>
              </div>

              {supabaseTestMsg && (
                <div className="p-3 bg-[#160305] border border-[#B88932]/40 rounded-xl text-xs text-[#F4E8D2]">
                  <strong>Kết quả kiểm tra:</strong> {supabaseTestMsg}
                </div>
              )}

              {/* Database Tables and RLS status */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase text-[#D6A84F] tracking-wider mb-2">
                  Danh Mục Bảng Dữ Liệu & Chính Sách RLS Đã Thiết Lập
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.dishes</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Public Read / Admin Write</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.branches</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Public Read / Admin Write</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.articles</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Public Read / Admin Write</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.reservations</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Public Insert / Admin CRUD</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.inquiries</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Public Insert / Admin CRUD</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.security_logs</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Protected Audit Trail</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">public.admin_profiles</strong>
                    <span className="text-[#F4E8D2]/60">RLS: Role-Based Access</span>
                  </div>
                  <div className="bg-[#160305] p-2 rounded-lg border border-[#B88932]/20">
                    <strong className="text-white block font-mono">pho-thin-assets</strong>
                    <span className="text-[#F4E8D2]/60">Storage Bucket: Media & Ảnh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Audit Logs */}
            <div className="bg-[#200609] p-5 rounded-2xl border border-[#B88932]/30 space-y-3">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#D6A84F]">
                Nhật Ký Bảo Mật & Hoạt Động Hệ Thống (Audit Logs)
              </h3>


              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#160305] p-2.5 rounded-xl border border-[#B88932]/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{log.details}</span>
                      <span className="text-[10px] text-[#F4E8D2]/60 block font-mono">
                        {log.timestamp} • Thiết bị: {log.device}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#D6A84F] uppercase bg-[#3B0B10] px-2 py-0.5 rounded">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: CREATE MANUAL RESERVATION AT COUNTER */}
      {/* ============================================================== */}
      {isAddResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white">
            <h3 className="text-lg font-serif font-bold text-[#D6A84F] mb-4">
              Tạo Đơn Đặt Bàn Thủ Công (Tại Quầy / Khách Gọi Điện)
            </h3>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#D6A84F] mb-1">Tên khách hàng (*):</label>
                <input
                  type="text"
                  required
                  value={newResData.fullName}
                  onChange={(e) => setNewResData({ ...newResData, fullName: e.target.value })}
                  placeholder="Ví dụ: Anh Hoàng Long"
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D6A84F] mb-1">Số điện thoại (*):</label>
                  <input
                    type="tel"
                    required
                    value={newResData.phone}
                    onChange={(e) => setNewResData({ ...newResData, phone: e.target.value })}
                    placeholder="0912..."
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#D6A84F] mb-1">Số lượng khách:</label>
                  <input
                    type="number"
                    min={1}
                    value={newResData.partySize}
                    onChange={(e) => setNewResData({ ...newResData, partySize: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D6A84F] mb-1">Ngày đặt:</label>
                  <input
                    type="date"
                    value={newResData.reservationDate}
                    onChange={(e) => setNewResData({ ...newResData, reservationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#D6A84F] mb-1">Giờ đặt:</label>
                  <input
                    type="time"
                    value={newResData.reservationTime}
                    onChange={(e) => setNewResData({ ...newResData, reservationTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#D6A84F] mb-1">Cơ sở đặt:</label>
                <select
                  value={newResData.branchId}
                  onChange={(e) => setNewResData({ ...newResData, branchId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name.vi} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#D6A84F] mb-1">Ghi chú (món đặt trước, yêu cầu chỗ ngồi):</label>
                <textarea
                  rows={2}
                  value={newResData.notes}
                  onChange={(e) => setNewResData({ ...newResData, notes: e.target.value })}
                  placeholder="Khách đặt trước 4 bát phở Tái Chín, ngồi cạnh cửa sổ..."
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddResModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold hover:brightness-110 cursor-pointer"
                >
                  Tạo Đơn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT DISH INFO & PRICE */}
      {/* ============================================================== */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white">
            <h3 className="text-lg font-serif font-bold text-[#D6A84F] mb-4">
              Chỉnh Sửa Món Ăn: {editingDish.name.vi}
            </h3>

            <form onSubmit={handleSaveDishEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#D6A84F] mb-1">Tên món (Tiếng Việt):</label>
                <input
                  type="text"
                  required
                  value={editingDish.name.vi}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      name: { ...editingDish.name, vi: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D6A84F] mb-1">Giá bán (VNĐ):</label>
                  <input
                    type="number"
                    step={1000}
                    value={editingDish.price}
                    onChange={(e) => {
                      const priceVal = Number(e.target.value);
                      setEditingDish({
                        ...editingDish,
                        price: priceVal,
                        formattedPrice: priceVal.toLocaleString('vi-VN').replace(/,/g, '.'),
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#D6A84F] mb-1">Danh mục:</label>
                  <select
                    value={editingDish.category}
                    onChange={(e) =>
                      setEditingDish({
                        ...editingDish,
                        category: e.target.value as 'pho' | 'drinks' | 'others',
                      })
                    }
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  >
                    <option value="pho">Phở Bò Gia Truyền</option>
                    <option value="drinks">Đồ Uống Hà Nội</option>
                    <option value="others">Món Ăn Kèm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#D6A84F] mb-1">Mô tả ngắn:</label>
                <textarea
                  rows={2}
                  value={editingDish.shortDescription.vi}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      shortDescription: { ...editingDish.shortDescription, vi: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isSignature}
                    onChange={(e) => setEditingDish({ ...editingDish, isSignature: e.target.checked })}
                    className="rounded text-[#D6A84F] focus:ring-0"
                  />
                  <span>Gắn nhãn Signature (Đặc sản biểu tượng)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold hover:brightness-110 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}

      {/* MODAL: CUSTOM SUPABASE CREDENTIALS CONFIG */}
      {/* ============================================================== */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white">
            <h3 className="text-lg font-serif font-bold text-[#D6A84F] mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span>Cấu Hình Kết Nối Supabase Cloud</span>
            </h3>
            <p className="text-xs text-[#F4E8D2]/70 mb-4">
              Bạn có thể nhập URL dự án và Anon Public Key từ Supabase Dashboard (Project Settings &rarr; API) để kết nối trực tiếp.
            </p>

            <form onSubmit={handleSaveCustomCredentials} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#D6A84F] mb-1 font-semibold uppercase">
                  Supabase Project URL (*):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={customSupabaseUrl}
                  onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[#D6A84F] mb-1 font-semibold uppercase">
                  Supabase Anon Public Key (*):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customSupabaseKey}
                  onChange={(e) => setCustomSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white font-mono break-all"
                />
                <p className="text-[10px] text-[#F4E8D2]/60 mt-1">
                  * Khóa public anon key an toàn để sử dụng ở phía máy khách. Không nhập service_role secret key tại đây.
                </p>
              </div>

              <div className="p-3 bg-[#160305] rounded-xl border border-[#B88932]/20 text-[11px] text-[#F4E8D2]/80 space-y-1">
                <span className="text-[#D6A84F] font-bold block">💡 Gợi ý thiết lập:</span>
                <p>1. Chạy script SQL tại <code className="text-amber-300">/supabase/schema.sql</code> trong Supabase SQL Editor.</p>
                <p>2. Chạy dữ liệu mẫu tại <code className="text-amber-300">/supabase/seed.sql</code>.</p>
                <p>3. Dán URL và anon key vào form này hoặc lưu trong <code className="text-amber-300">.env</code>.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupabaseModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold hover:brightness-110 cursor-pointer"
                >
                  Lưu & Kết Nối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

