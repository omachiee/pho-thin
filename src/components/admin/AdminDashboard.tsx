import React, { useState, useEffect } from 'react';
import { adminStore, AdminReservation, AdminDish, AdminInquiry, ReservationStatus } from '../../services/adminStore';
import { Article, Branch, Order, OrderStatus } from '../../types';
import {
  LayoutDashboard, CalendarCheck, UtensilsCrossed, Newspaper, Store, MessageSquare,
  ShieldCheck, LogOut, Search, Filter, Phone, CheckCircle2, Clock, XCircle,
  AlertCircle, Plus, Edit3, Trash2, ExternalLink, Download, RefreshCw,
  DollarSign, ChevronRight, Check,
} from 'lucide-react';
import { PhoThinLogo } from '../PhoThinLogo';

interface AdminDashboardProps {
  onLogout: () => void | Promise<void>;
  onExitToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onExitToWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'orders' | 'dishes' | 'news' | 'branches' | 'inquiries' | 'account'>('overview');
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [dishes, setDishes] = useState<AdminDish[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [resSearch, setResSearch] = useState('');
  const [resBranchFilter, setResBranchFilter] = useState('all');
  const [resStatusFilter, setResStatusFilter] = useState('all');
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [isAddResModalOpen, setIsAddResModalOpen] = useState(false);
  const [newResData, setNewResData] = useState({
    fullName: '', phone: '', email: '', reservationDate: todayStr,
    reservationTime: '11:30', partySize: 2, branchId: '', notes: '',
  });
  const [editingDish, setEditingDish] = useState<AdminDish | null>(null);
  const [isNewDish, setIsNewDish] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const refreshData = () => {
    const data = adminStore.getData();
    setReservations([...data.reservations]);
    setDishes([...data.dishes]);
    setArticles([...data.articles]);
    setBranches([...data.branches]);
    setInquiries([...data.inquiries]);
    setOrders([...data.orders]);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('phothin_store_updated', refreshData);
    return () => window.removeEventListener('phothin_store_updated', refreshData);
  }, []);

  // Writes finish on the server before the store refreshes; failed forms stay open.
  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    if (isBusy) return false;
    setIsBusy(true);
    setErrorMessage('');
    setToastMessage(null);
    try {
      if (await action() === false) throw new Error('Thao tác không thành công. Vui lòng tải lại dữ liệu và thử lại.');
      refreshData();
      showToast(successMessage);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateStatus = (id: string, status: ReservationStatus) =>
    runAction(() => adminStore.updateReservationStatus(id, status), 'Đã cập nhật trạng thái đặt bàn!');
  const handleDeleteReservation = (id: string) => {
    if (window.confirm(`Bạn có chắc muốn xoá đơn đặt bàn #${id}?`)) {
      void runAction(() => adminStore.deleteReservation(id), 'Đã xoá đơn đặt bàn.');
    }
  };
  const handleCreateReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.id === newResData.branchId);
    const phone = newResData.phone.replace(/[\s.()\-]/g, '');
    const arrival = Date.parse(`${newResData.reservationDate}T${newResData.reservationTime}:00+07:00`);
    if (!newResData.fullName.trim() || !/^(?:0|\+?84)[35789]\d{8}$/.test(phone) || !branch ||
      !Number.isInteger(newResData.partySize) || newResData.partySize < 1 || newResData.partySize > 50 ||
      !Number.isFinite(arrival) || arrival <= Date.now()) {
      setErrorMessage('Vui lòng nhập tên, số điện thoại hợp lệ, cơ sở, thời gian sắp tới và số khách nguyên từ 1 đến 50.');
      return;
    }
    const ok = await runAction(() => adminStore.createManualReservation({
      ...newResData, fullName: newResData.fullName.trim(), phone,
      branchName: `${branch.code}: ${branch.name.vi}`,
      notes: `[Đặt tại quầy/Gọi điện] ${newResData.notes}`, status: 'confirmed', isWalkIn: newResData.reservationDate === todayStr,
    }), 'Tạo đơn đặt bàn thành công!');
    if (ok) {
      setIsAddResModalOpen(false);
      setNewResData({ fullName: '', phone: '', email: '', reservationDate: todayStr, reservationTime: '11:30', partySize: 2, branchId: branch.id, notes: '' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã Đơn', 'Khách Hàng', 'Số Điện Thoại', 'Email', 'Cơ Sở', 'Ngày', 'Giờ', 'Số Khách', 'Trạng Thái', 'Ghi Chú'];
    const rows = reservations.map((r) => [r.id, r.fullName, r.phone, r.email, r.branchName, r.reservationDate, r.reservationTime, r.partySize, r.status, r.notes]);
    const csvCell = (value: string | number) => {
      const text = String(value ?? '');
      return `"${(/^[\s]*[=+\-@]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
    };
    const csvContent = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `PhoThin_DanhSachDatBan_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Đã xuất danh sách đơn đặt bàn thành file CSV!');
  };

  const translated = <T,>(vi: T) => ({ vi, en: vi, zh: vi, ko: vi });
  const handleToggleDishAvailability = (id: string) =>
    runAction(() => adminStore.toggleDishAvailability(id), 'Đã cập nhật trạng thái còn/hết món!');
  const handleSaveDishEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    if (!editingDish.name.vi.trim() || !Number.isInteger(editingDish.price) || editingDish.price < 0) {
      setErrorMessage('Tên món và giá bán nguyên không âm là bắt buộc.');
      return;
    }
    const dish = isNewDish ? {
      ...editingDish, name: translated(editingDish.name.vi),
      shortDescription: translated(editingDish.shortDescription.vi),
      fullDescription: translated(editingDish.fullDescription.vi),
      ingredients: translated(editingDish.ingredients.vi.map((value) => value.trim()).filter(Boolean)),
      ...(editingDish.preparationNote ? { preparationNote: translated(editingDish.preparationNote.vi) } : {}),
    } : { ...editingDish, ingredients: { ...editingDish.ingredients, vi: editingDish.ingredients.vi.map((value) => value.trim()).filter(Boolean) } };
    if (await runAction(() => isNewDish ? adminStore.addDish(dish) : adminStore.updateDish(dish), 'Đã lưu món ăn!')) setEditingDish(null);
  };
  const handleNewDish = () => {
    setErrorMessage('');
    setIsNewDish(true);
    setEditingDish({
      id: crypto.randomUUID(), name: translated(''), category: 'pho', price: 0,
      formattedPrice: '0', image: '', shortDescription: translated(''),
      fullDescription: translated(''), ingredients: translated<string[]>([]),
      isSignature: false, isFeatured: false, isAvailable: true,
    });
  };
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editingArticle.title.vi.trim() || !editingArticle.content.vi.some((p) => p.trim())) {
      setErrorMessage('Vui lòng nhập tiêu đề và nội dung bài viết.');
      return;
    }
    const article = isNewArticle ? {
      ...editingArticle, title: translated(editingArticle.title.vi),
      excerpt: translated(editingArticle.excerpt.vi), category: translated(editingArticle.category.vi),
      content: translated(editingArticle.content.vi.filter((p) => p.trim())),
    } : editingArticle;
    if (await runAction(() => isNewArticle ? adminStore.addArticle(article) : adminStore.updateArticle(article), 'Đã lưu bài viết!')) setEditingArticle(null);
  };
  const handleNewArticle = () => {
    setErrorMessage('');
    setIsNewArticle(true);
    setEditingArticle({ id: crypto.randomUUID(), title: translated(''), excerpt: translated(''),
      content: translated<string[]>([]), category: translated('Tin tức'), date: todayStr,
      readTime: '3 phút', image: '', author: 'Phở Thìn Bờ Hồ', isHeroArticle: false });
  };
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    if (await runAction(() => adminStore.updateBranch(editingBranch), 'Đã lưu thông tin cơ sở!')) setEditingBranch(null);
  };
  const handleOrderStatus = (id: string, status: OrderStatus) =>
    runAction(() => adminStore.updateOrderStatus(id, status), 'Đã cập nhật trạng thái đơn món!');
  const statusLabels: Record<OrderStatus, string> = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

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
  const todayReservations = reservations.filter((r) => r.reservationDate === todayStr);
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const completedCount = reservations.filter((r) => r.status === 'completed').length;
  const estimatedRevenueToday = todayReservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.partySize * 85000, 0);

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
                Hệ thống quản lý nội bộ • Cơ sở chính thức Hà Nội
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button disabled={isBusy} onClick={() => setActiveTab('account')} className="hidden md:block text-xs text-[#F4E8D2]/90">
              {adminStore.getSession()?.email || 'Tài khoản quản trị'}
            </button>

            {/* Back to Client Website */}
            <button disabled={isBusy}
              onClick={onExitToWebsite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B0B10] border border-[#B88932]/40 text-xs text-[#F4E8D2] hover:text-[#D6A84F] hover:border-[#D6A84F] transition-colors cursor-pointer"
              title="Quay lại giao diện website khách hàng"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Trang Khách</span>
            </button>

            {/* Secure Logout */}
            <button disabled={isBusy}
              onClick={() => void runAction(() => Promise.resolve(onLogout()), 'Đã đăng xuất.')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A52B25]/80 hover:bg-[#A52B25] text-xs font-semibold text-[#FFF8E9] transition-colors cursor-pointer"
              title="Đăng xuất tài khoản quản trị"
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
          <button disabled={isBusy}
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

          <button disabled={isBusy}
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

          <button disabled={isBusy}
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-[#D6A84F] text-[#160305] shadow-md' : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'}`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Đơn món</span>
          </button>

          <button disabled={isBusy}
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

          <button disabled={isBusy}
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'branches'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Cơ Sở</span>
          </button>

          <button disabled={isBusy}
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

          <button disabled={isBusy}
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

          <button disabled={isBusy}
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-[#D6A84F] text-[#160305] shadow-md'
                : 'text-[#F4E8D2]/80 hover:text-white hover:bg-[#3B0B10]/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tài khoản</span>
          </button>
        </div>
      </nav>

      {/* MAIN ADMIN CONTENT */}
      <main aria-busy={isBusy} className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {errorMessage && <div role="alert" className="p-3 bg-[#A52B25]/20 border border-[#A52B25]/50 rounded-xl text-sm text-[#FF8B8B]">{errorMessage}</div>}
        {isBusy && <p role="status" className="text-xs text-[#D6A84F]">Đang xử lý trên máy chủ...</p>}
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
                  Ước tính 85.000đ/khách, không phải doanh thu thực tế
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
                <span>Tình Trạng Cơ Sở Chính Thức Hôm Nay</span>
                <span className="text-xs text-[#F4E8D2]/70 font-sans font-normal">
                  Giờ phục vụ: 06:00 - 13:00 & 17:00 - 22:00
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {branches.map((b) => {
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
                <button disabled={isBusy}
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

                          <button disabled={isBusy}
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
                  <button disabled={isBusy}
                    onClick={() => { setErrorMessage(''); setNewResData((prev) => ({ ...prev, branchId: branches.some((b) => b.id === prev.branchId) ? prev.branchId : branches[0]?.id || '' })); setIsAddResModalOpen(true); }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] text-[#160305] text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Đơn Tại Quầy</span>
                  </button>

                  <button disabled={isBusy}
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
                  <option value="all">Tất cả cơ sở</option>
                  {branches.map((b) => (
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
                        {item.status === 'pending' && (
                          <button disabled={isBusy}
                            onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                            className="px-2.5 py-1 bg-[#3DD68C] hover:brightness-110 text-[#160305] text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Xác Nhận
                          </button>
                        )}
                        {item.status === 'confirmed' && (
                          <button disabled={isBusy}
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Xong Bữa
                          </button>
                        )}
                        {(item.status === 'pending' || item.status === 'confirmed') && (
                          <button disabled={isBusy}
                            onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                            className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium rounded-lg cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                        <button disabled={isBusy}
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
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">Đơn món mang về</h3>
              <p className="text-xs text-[#F4E8D2]/70">Thanh toán khi nhận món tại cơ sở. Hoàn thành đơn không tự động xác nhận đã thanh toán.</p>
            </div>
            {orders.length === 0 && <p className="text-xs text-[#F4E8D2]/70">Chưa có đơn món.</p>}
            {orders.map((order) => (
              <div key={order.id} className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30 space-y-3">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <strong className="font-mono text-[#D6A84F]">{order.id}</strong>
                  <span>{statusLabels[order.status]}</span>
                </div>
                <div className="text-sm"><strong>{order.fullName}</strong> • <a href={`tel:${order.phone}`} className="text-[#3DD68C]">{order.phone}</a></div>
                <p className="text-xs text-[#D6A84F]">{order.branchName} • Nhận món: {new Date(order.pickupAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                <ul className="text-xs space-y-1 border-y border-[#B88932]/20 py-2">
                  {order.items.map((item, index) => <li key={`${item.dishId}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity} ({item.unitPrice.toLocaleString('vi-VN')} đ/món)</span><span>{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</span></li>)}
                </ul>
                {order.notes && <p className="text-xs text-[#F4E8D2]/80">Ghi chú: {order.notes}</p>}
                <div className="flex flex-wrap justify-between gap-3 items-center">
                  <strong className="text-sm text-[#D6A84F]">Tổng: {order.total.toLocaleString('vi-VN')} đ • Thanh toán khi nhận món</strong>
                  <div className="flex gap-2">
                    {order.status === 'pending' && <button disabled={isBusy} onClick={() => void handleOrderStatus(order.id, 'confirmed')} className="px-3 py-1.5 bg-[#3DD68C] text-[#160305] text-xs font-bold rounded-lg">Xác nhận</button>}
                    {order.status === 'confirmed' && <button disabled={isBusy} onClick={() => void handleOrderStatus(order.id, 'completed')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">Hoàn thành</button>}
                    {(order.status === 'pending' || order.status === 'confirmed') && <button disabled={isBusy} onClick={() => { if (window.confirm('Hủy đơn món này?')) void handleOrderStatus(order.id, 'cancelled'); }} className="px-3 py-1.5 bg-gray-700 text-gray-200 text-xs rounded-lg">Hủy</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                  Bật/tắt trạng thái hết món và cập nhật thông tin thực đơn trên máy chủ.
                </p>
              </div>
              <button disabled={isBusy} onClick={handleNewDish} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] text-[#160305] text-xs font-bold"><Plus className="w-4 h-4" />Thêm món</button>
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
                    <button disabled={isBusy}
                      onClick={() => handleToggleDishAvailability(dish.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        dish.isAvailable
                          ? 'bg-[#3DD68C]/20 border border-[#3DD68C] text-[#3DD68C]'
                          : 'bg-[#E5484D]/20 border border-[#E5484D] text-[#FF8B8B]'
                      }`}
                    >
                      {dish.isAvailable ? '✓ Đang Phục Vụ' : '✕ Tạm Hết Món'}
                    </button>

                    <button disabled={isBusy}
                      onClick={() => { setIsNewDish(false); setErrorMessage(''); setEditingDish(dish); }}
                      className="inline-flex items-center gap-1 text-xs text-[#D6A84F] hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button disabled={isBusy} onClick={() => { if (window.confirm(`Xóa món ${dish.name.vi}?`)) void runAction(() => adminStore.deleteDish(dish.id), 'Đã xóa món ăn.'); }} className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg" title="Xóa món"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: branches MANAGER */}
        {/* ============================================================== */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="bg-[#200609] p-4 rounded-2xl border border-[#B88932]/30">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#D6A84F]">
                Cơ Sở Chính Thức Tại Hà Nội
              </h3>
              <p className="text-xs text-[#F4E8D2]/70">
                Quản lý số điện thoại hotline, thông báo tình trạng phục vụ của từng chi nhánh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
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
                    <button disabled={isBusy} onClick={() => { setErrorMessage(''); setEditingBranch(b); }} className="inline-flex items-center gap-1 text-[#D6A84F] text-xs"><Edit3 className="w-3.5 h-3.5" />Sửa cơ sở</button>
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
                  Thêm, chỉnh sửa hoặc xóa nội dung bảng tin trên website.
                </p>
              </div>
              <button disabled={isBusy} onClick={handleNewArticle} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] text-[#160305] text-xs font-bold"><Plus className="w-4 h-4" />Thêm bài</button>
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
                    <div className="flex gap-3 text-xs pt-2">
                      <button disabled={isBusy} onClick={() => { setIsNewArticle(false); setErrorMessage(''); setEditingArticle(art); }} className="text-[#D6A84F] inline-flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" />Sửa</button>
                      <button disabled={isBusy} onClick={() => { if (window.confirm(`Xóa bài ${art.title.vi}?`)) void runAction(() => adminStore.deleteArticle(art.id), 'Đã xóa bài viết.'); }} className="text-gray-400 hover:text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Xóa</button>
                    </div>
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
                        disabled={isBusy}
                        onChange={(e) => void runAction(() => adminStore.updateInquiryStatus(inq.id, e.target.value as AdminInquiry['status']), 'Đã cập nhật trạng thái liên hệ!')}
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
        {/* TAB 7: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="bg-[#200609] p-5 rounded-2xl border border-[#B88932]/30 space-y-4">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#D6A84F]">Tài khoản quản trị</h3>
            <p className="text-sm">Email: <strong>{adminStore.getSession()?.email || 'Chưa có phiên đăng nhập'}</strong></p>
            <p className="text-xs text-[#F4E8D2]/80">Phiên đăng nhập và quyền quản trị được xác thực trên máy chủ. Tài khoản, mật khẩu và cấu hình backend chỉ được quản lý ngoài giao diện này bởi người phụ trách hệ thống.</p>
            <p className="text-xs text-[#F4E8D2]/80">Làm mới dữ liệu để kiểm tra kết nối. Nếu máy chủ chưa được cấu hình, thao tác sẽ báo lỗi và không lưu thay đổi.</p>
            <div className="flex flex-wrap gap-2">
              <button disabled={isBusy} onClick={() => void runAction(() => adminStore.syncFromSupabase(), 'Đã tải lại dữ liệu từ máy chủ.')} className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl text-xs font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" />{isBusy ? 'Đang xử lý...' : 'Làm mới dữ liệu'}</button>
              <button disabled={isBusy} onClick={() => void runAction(() => Promise.resolve(onLogout()), 'Đã đăng xuất.')} className="px-4 py-2 bg-[#A52B25] rounded-xl text-xs font-bold flex items-center gap-2"><LogOut className="w-4 h-4" />Đăng xuất</button>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: CREATE MANUAL RESERVATION AT COUNTER */}
      {/* ============================================================== */}
      {isAddResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Tạo đơn đặt bàn">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <h3 className="text-lg font-serif font-bold text-[#D6A84F] mb-4">
              Tạo Đơn Đặt Bàn Thủ Công (Tại Quầy / Khách Gọi Điện)
            </h3>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-3 text-xs">
              <fieldset disabled={isBusy} className="space-y-3">
              {errorMessage && <p role="alert" className="text-[#FF8B8B]">{errorMessage}</p>}
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
                    max={50}
                    step={1}
                    required
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
                    required
                    min={todayStr}
                    value={newResData.reservationDate}
                    onChange={(e) => setNewResData({ ...newResData, reservationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#D6A84F] mb-1">Giờ đặt:</label>
                  <input
                    type="time"
                    required
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
                  {branches.map((b) => (
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
                <button disabled={isBusy}
                  type="button"
                  onClick={() => setIsAddResModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button disabled={isBusy}
                  type="submit"
                  className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold hover:brightness-110 cursor-pointer"
                >
                  Tạo Đơn Ngay
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT DISH INFO & PRICE */}
      {/* ============================================================== */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Thông tin món ăn">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <h3 className="text-lg font-serif font-bold text-[#D6A84F] mb-4">
              {isNewDish ? 'Thêm Món Ăn' : `Chỉnh Sửa Món Ăn: ${editingDish.name.vi}`}
            </h3>

            <form onSubmit={handleSaveDishEdit} className="space-y-3 text-xs">
              <fieldset disabled={isBusy} className="space-y-3">
              {errorMessage && <p role="alert" className="text-[#FF8B8B]">{errorMessage}</p>}
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
                    min={0}
                    required
                    step={1}
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

              <label className="block text-[#D6A84F]">Ảnh món (URL hoặc đường dẫn /...):
                <input type="text" required value={editingDish.image} onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
              </label>
              <label className="block text-[#D6A84F]">Mô tả đầy đủ (Tiếng Việt):
                <textarea rows={4} value={editingDish.fullDescription.vi} onChange={(e) => setEditingDish({ ...editingDish, fullDescription: { ...editingDish.fullDescription, vi: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
              </label>
              <label className="block text-[#D6A84F]">Nguyên liệu (cách nhau bởi dấu phẩy):
                <input type="text" value={editingDish.ingredients.vi.join(',')} onChange={(e) => setEditingDish({ ...editingDish, ingredients: { ...editingDish.ingredients, vi: e.target.value.split(',') } })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
              </label>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={Boolean(editingDish.isFeatured)} onChange={(e) => setEditingDish({ ...editingDish, isFeatured: e.target.checked })} /><span>Hiển thị trên trang chủ</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editingDish.isAvailable} onChange={(e) => setEditingDish({ ...editingDish, isAvailable: e.target.checked })} /><span>Đang phục vụ</span></label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingDish.isSignature)}
                    onChange={(e) => setEditingDish({ ...editingDish, isSignature: e.target.checked })}
                    className="rounded text-[#D6A84F] focus:ring-0"
                  />
                  <span>Gắn nhãn Signature (Đặc sản biểu tượng)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button disabled={isBusy}
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button disabled={isBusy}
                  type="submit"
                  className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold hover:brightness-110 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="article-edit-title">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <h3 id="article-edit-title" className="text-lg font-serif font-bold text-[#D6A84F] mb-4">{isNewArticle ? 'Thêm Bài Viết' : 'Chỉnh Sửa Bài Viết'}</h3>
            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <fieldset disabled={isBusy} className="space-y-3">
              {errorMessage && <p role="alert" className="text-[#FF8B8B]">{errorMessage}</p>}
              {([['title', 'Tiêu đề'], ['excerpt', 'Tóm tắt'], ['category', 'Chuyên mục']] as const).map(([field, label]) => (
                <label key={field} className="block text-[#D6A84F]">{label} (Tiếng Việt):
                  <input required type="text" value={editingArticle[field].vi} onChange={(e) => setEditingArticle({ ...editingArticle, [field]: { ...editingArticle[field], vi: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
                </label>
              ))}
              <label className="block text-[#D6A84F]">Nội dung (mỗi đoạn cách nhau bằng một dòng trống):
                <textarea required rows={7} value={editingArticle.content.vi.join('\n\n')} onChange={(e) => setEditingArticle({ ...editingArticle, content: { ...editingArticle.content, vi: e.target.value.split(/\n\s*\n/) } })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
              </label>
              {([['date', 'Ngày đăng'], ['readTime', 'Thời gian đọc'], ['image', 'Ảnh (URL hoặc đường dẫn /...)'], ['author', 'Tác giả']] as const).map(([field, label]) => (
                <label key={field} className="block text-[#D6A84F]">{label}:
                  <input required type="text" value={editingArticle[field]} onChange={(e) => setEditingArticle({ ...editingArticle, [field]: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
                </label>
              ))}
              <p className="text-[#F4E8D2]/70">Bài mới dùng nội dung tiếng Việt cho các ngôn ngữ khác. Sửa bài chỉ thay đổi tiếng Việt, giữ các bản dịch hiện có.</p>
              <div className="flex justify-end gap-2 pt-3">
                <button disabled={isBusy} type="button" onClick={() => setEditingArticle(null)} className="px-4 py-2 bg-gray-700 rounded-xl">Hủy</button>
                <button disabled={isBusy} type="submit" className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold">Lưu bài viết</button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="branch-edit-title">
          <div className="bg-[#180406] border-2 border-[#D6A84F] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <h3 id="branch-edit-title" className="text-lg font-serif font-bold text-[#D6A84F] mb-4">Sửa Cơ Sở {editingBranch.code}</h3>
            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <fieldset disabled={isBusy} className="space-y-3">
              {errorMessage && <p role="alert" className="text-[#FF8B8B]">{errorMessage}</p>}
              {([['name', 'Tên cơ sở'], ['highlight', 'Giới thiệu']] as const).map(([field, label]) => (
                <label key={field} className="block text-[#D6A84F]">{label} (Tiếng Việt):
                  <input required type="text" value={editingBranch[field].vi} onChange={(e) => setEditingBranch({ ...editingBranch, [field]: { ...editingBranch[field], vi: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
                </label>
              ))}
              {([['code', 'Mã cơ sở'], ['address', 'Địa chỉ'], ['district', 'Quận'], ['phone', 'Hotline'], ['morningSlot', 'Ca sáng'], ['afternoonSlot', 'Ca chiều tối'], ['openingHours', 'Giờ mở cửa'], ['googleMapsLink', 'Liên kết Google Maps'], ['mapEmbedUrl', 'URL bản đồ nhúng']] as const).map(([field, label]) => (
                <label key={field} className="block text-[#D6A84F]">{label}:
                  <input required type="text" value={editingBranch[field]} onChange={(e) => setEditingBranch({ ...editingBranch, [field]: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#160305] border border-[#B88932]/40 rounded-xl text-white" />
                </label>
              ))}
              <label className="flex gap-2 items-center"><input type="checkbox" checked={Boolean(editingBranch.isOriginal)} onChange={(e) => setEditingBranch({ ...editingBranch, isOriginal: e.target.checked })} />Cơ sở gốc</label>
              <div className="flex justify-end gap-2 pt-3">
                <button disabled={isBusy} type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 bg-gray-700 rounded-xl">Hủy</button>
                <button disabled={isBusy} type="submit" className="px-4 py-2 bg-[#D6A84F] text-[#160305] rounded-xl font-bold">Lưu cơ sở</button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

