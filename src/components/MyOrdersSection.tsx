import React, { useState, useEffect } from 'react';
import type { AdminReservation, CartItem, Language, Order, PageView } from '../types';
import { adminStore } from '../services/adminStore';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Plus,
  Minus,
  Edit3,
  Search,
  ArrowLeft,
  ArrowRight,
  Receipt,
  RefreshCw,
  LogOut,
  Utensils,
  ChevronRight,
  Eye,
  Info,
  ShoppingBag,
  ShieldCheck,
  KeyRound,
  Lock,
} from 'lucide-react';

interface Props {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onOpenDishDetail?: (dishId: string) => void;
  cart?: CartItem[];
  onQuantity?: (id: string, qty: number) => void;
  onClearCart?: () => void;
  initialTab?: 'cart' | 'orders' | 'reservations';
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: {
    label: 'Chờ xác nhận',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-stone-200',
    text: 'text-stone-700',
    border: 'border-stone-300',
    icon: XCircle,
  },
};

const money = (amount: number) => amount.toLocaleString('vi-VN') + ' đ';

export const MyOrdersSection: React.FC<Props> = ({
  lang,
  onNavigate,
  onOpenDishDetail,
  cart = [],
  onQuantity,
  onClearCart,
  initialTab,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [currentPhone, setCurrentPhone] = useState<string>('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'cart' | 'orders' | 'reservations'>(() => {
    if (initialTab) return initialTab;
    if (cart && cart.length > 0) return 'cart';
    return 'orders';
  });

  // Modal states
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailReservation, setDetailReservation] = useState<AdminReservation | null>(null);

  const [cancelTarget, setCancelTarget] = useState<{ type: 'order' | 'reservation'; id: string; name: string } | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<{ dishId: string; name: string; unitPrice: number; quantity: number }[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [selectedNewDishId, setSelectedNewDishId] = useState('');

  const dishes = adminStore.getDishes().filter((d) => d.isAvailable !== false);

  // Auto-load orders on mount if customer phone is already saved in localStorage
  useEffect(() => {
    let cancelled = false;
    const savedPhone = adminStore.getCustomerPhone();
    if (savedPhone && !cancelled) {
      setPhoneInput(savedPhone);
      setCurrentPhone(savedPhone);
      void loadOrders(savedPhone);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadOrders(phoneToLoad?: string) {
    const targetPhone = (phoneToLoad || currentPhone || phoneInput).trim();
    if (!targetPhone) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminStore.fetchCustomerOrders(targetPhone);
      setOrders(data.orders);
      setReservations(data.reservations);
      setCurrentPhone(targetPhone);
      // Auto-switch tab if one has items and the other doesn't (preserve cart tab if currently viewing)
      if (data.orders.length === 0 && data.reservations.length > 0) {
        setActiveTab((prev) => (prev === 'cart' ? 'cart' : 'reservations'));
      } else if (data.orders.length > 0) {
        setActiveTab((prev) => (prev === 'cart' ? 'cart' : 'orders'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đơn.');
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const clean = phoneInput.trim();
    if (!clean) {
      setError('Vui lòng nhập số điện thoại để tra cứu đơn hàng.');
      return;
    }
    void loadOrders(clean);
  }

  function handleLogout() {
    setCurrentPhone('');
    setOrders([]);
    setReservations([]);
    adminStore.setCustomerPhone(null);
    setSuccessMsg('Đã chuyển sang tra cứu số điện thoại khác.');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // Cancel order or reservation
  async function confirmCancel() {
    if (!cancelTarget || cancelBusy) return;
    setCancelBusy(true);
    setError('');
    try {
      if (cancelTarget.type === 'order') {
        const updated = await adminStore.cancelCustomerOrder(cancelTarget.id, currentPhone);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (detailOrder?.id === updated.id) setDetailOrder(updated);
        setSuccessMsg(`Đã hủy thành công đơn hàng #${cancelTarget.id.slice(0, 8)}`);
      } else {
        const updated = await adminStore.cancelCustomerReservation(cancelTarget.id, currentPhone);
        setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        if (detailReservation?.id === updated.id) setDetailReservation(updated);
        setSuccessMsg(`Đã hủy thành công yêu cầu đặt bàn #${cancelTarget.id.slice(0, 8)}`);
      }
      setCancelTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chưa hủy được đơn. Vui lòng thử lại.');
    } finally {
      setCancelBusy(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  }

  // Open edit modal
  function startEdit(order: Order) {
    setEditingOrder(order);
    setEditItems(
      order.items.map((i) => ({
        dishId: i.dishId,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      }))
    );
    setEditNotes(order.notes);
    setSelectedNewDishId('');
  }

  function handleQuantityChange(dishId: string, delta: number) {
    setEditItems((prev) =>
      prev
        .map((item) => {
          if (item.dishId === dishId) {
            const nextQty = Math.min(50, Math.max(1, item.quantity + delta));
            return { ...item, quantity: nextQty };
          }
          return item;
        })
    );
  }

  function handleRemoveItem(dishId: string) {
    if (editItems.length <= 1) {
      alert('Đơn hàng cần có ít nhất 1 món ăn. Nếu không muốn đặt nữa, quý khách có thể chọn Hủy đơn.');
      return;
    }
    setEditItems((prev) => prev.filter((item) => item.dishId !== dishId));
  }

  function handleAddNewDish() {
    if (!selectedNewDishId) return;
    const existing = editItems.find((i) => i.dishId === selectedNewDishId);
    if (existing) {
      handleQuantityChange(selectedNewDishId, 1);
      setSelectedNewDishId('');
      return;
    }
    const dish = dishes.find((d) => d.id === selectedNewDishId);
    if (!dish) return;
    setEditItems((prev) => [
      ...prev,
      {
        dishId: dish.id,
        name: dish.name.vi,
        unitPrice: dish.price,
        quantity: 1,
      },
    ]);
    setSelectedNewDishId('');
  }

  // Calculate live edited total
  const editCalculatedTotal = editItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrder || editBusy) return;
    if (editItems.length === 0) {
      setError('Đơn hàng cần có ít nhất 1 món ăn.');
      return;
    }
    setEditBusy(true);
    setError('');
    try {
      const updated = await adminStore.updateCustomerOrder(
        editingOrder.id,
        currentPhone,
        editItems.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        editNotes
      );
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (detailOrder?.id === updated.id) setDetailOrder(updated);
      setEditingOrder(null);
      setSuccessMsg(`Đã cập nhật thành công món ăn cho đơn #${editingOrder.id.slice(0, 8)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật đơn hàng.');
    } finally {
      setEditBusy(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  }

  // Filter lists
  const filteredOrders = orders.filter((o) => statusFilter === 'all' || o.status === statusFilter);
  const filteredReservations = reservations.filter((r) => statusFilter === 'all' || r.status === statusFilter);

  const cartTotalCount = (cart || []).reduce((acc, item) => acc + item.quantity, 0);
  const cartItemsDetailed = (cart || []).map((ci) => {
    const dish = dishes.find((d) => d.id === ci.dishId);
    return {
      ...ci,
      dish,
      unitPrice: dish ? dish.price : 0,
      subtotal: dish ? dish.price * ci.quantity : 0,
      name: dish ? (dish.name[lang] || dish.name.vi) : ci.dishId,
      image: dish?.image,
    };
  });
  const cartTotalAmount = cartItemsDetailed.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <section className="min-h-screen bg-[#FFF8E9] text-[#68131C] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B88932]/30 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#65452F] mb-1">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#68131C] transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <span>/</span>
              <span className="font-bold text-[#68131C]">Đơn của tôi & Giỏ hàng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#68131C] tracking-tight">
              ĐƠN CỦA TÔI & GIỎ HÀNG
            </h1>
            <p className="text-xs sm:text-sm text-[#65452F] mt-1">
              Quản lý giỏ hàng hiện tại, xem lịch sử đặt bàn, đặt món và chỉnh sửa hoặc hủy đơn theo quy định.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('menu')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#F4E8D2] hover:bg-[#B88932]/20 border border-[#B88932]/40 text-[#68131C] transition-colors cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Xem thực đơn</span>
            </button>
            <button
              onClick={() => onNavigate('reservation')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#68131C] text-[#FFF8E9] hover:bg-[#560F16] transition-colors cursor-pointer shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>Đặt bàn mới</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="font-bold cursor-pointer text-red-600 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary Tabs: [Giỏ hàng] [Đơn đặt món] [Yêu cầu đặt bàn] */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#F4E8D2] border border-[#B88932]/30 text-xs sm:text-sm font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cart'
                ? 'bg-[#68131C] text-[#FFF8E9] shadow-sm'
                : 'text-[#68131C] hover:bg-[#FFF8E9]/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#D6A84F]" />
            <span>Giỏ hàng</span>
            {cartTotalCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'cart' ? 'bg-[#A52B25] text-[#FFF8E9]' : 'bg-[#68131C] text-[#F4E8D2]'
              }`}>
                {cartTotalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#68131C] text-[#FFF8E9] shadow-sm'
                : 'text-[#68131C] hover:bg-[#FFF8E9]/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Đơn mang về</span>
            {orders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'orders' ? 'bg-[#A52B25] text-[#FFF8E9]' : 'bg-[#B88932] text-white'
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'bg-[#68131C] text-[#FFF8E9] shadow-sm'
                : 'text-[#68131C] hover:bg-[#FFF8E9]/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Yêu cầu đặt bàn</span>
            {reservations.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'reservations' ? 'bg-[#A52B25] text-[#FFF8E9]' : 'bg-[#B88932] text-white'
              }`}>
                {reservations.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 0: GIỎ HÀNG */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            {cartItemsDetailed.length === 0 ? (
              <div className="bg-[#F4E8D2]/60 border border-[#B88932]/30 rounded-2xl p-8 sm:p-12 text-center space-y-4">
                <ShoppingBag className="w-14 h-14 text-[#B88932]/60 mx-auto" />
                <h3 className="font-serif font-bold text-xl text-[#68131C]">
                  Giỏ hàng của bạn đang trống
                </h3>
                <p className="text-xs sm:text-sm text-[#65452F] max-w-md mx-auto">
                  Bạn chưa thêm món ăn nào vào giỏ hàng. Hãy xem thực đơn để chọn các món phở bò truyền thống và đồ uống đặc trưng của quán.
                </p>
                <button
                  onClick={() => onNavigate('menu')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#68131C] text-[#FFF8E9] font-bold text-sm hover:bg-[#560F16] cursor-pointer shadow-md transition-all transform active:scale-95"
                >
                  <Utensils className="w-4 h-4 text-[#D6A84F]" />
                  <span>Khám phá thực đơn ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="bg-[#FFF8E9] border-2 border-[#B88932]/40 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 divide-y divide-[#B88932]/20">
                  <div className="flex items-center justify-between pb-3">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#68131C]">
                      Món ăn đã chọn ({cartTotalCount} phần)
                    </span>
                    {onClearCart && (
                      <button
                        onClick={onClearCart}
                        className="text-xs text-red-700 hover:text-red-900 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa toàn bộ giỏ</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 pt-3">
                    {cartItemsDetailed.map((item) => (
                      <div
                        key={item.dishId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#F4E8D2]/40 border border-[#B88932]/20 hover:border-[#B88932]/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0 border border-[#B88932]/30"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#F4E8D2] flex items-center justify-center shrink-0 border border-[#B88932]/30">
                              <Utensils className="w-6 h-6 text-[#B88932]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-[#68131C] truncate">
                              {item.name}
                            </h4>
                            <div className="font-mono text-xs sm:text-sm text-[#A52B25] font-semibold">
                              {money(item.unitPrice)}
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#B88932]/20">
                          <div className="flex items-center gap-1.5 bg-[#FFF8E9] p-1 rounded-lg border border-[#B88932]/40 shadow-xs">
                            <button
                              type="button"
                              onClick={() => onQuantity?.(item.dishId, item.quantity - 1)}
                              className="w-7 h-7 rounded bg-[#F4E8D2] hover:bg-[#B88932]/30 text-[#68131C] flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                              aria-label="Giảm 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantity?.(item.dishId, Math.min(50, item.quantity + 1))}
                              className="w-7 h-7 rounded bg-[#F4E8D2] hover:bg-[#B88932]/30 text-[#68131C] flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                              aria-label="Tăng 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-mono font-bold text-sm sm:text-base text-[#68131C] min-w-24 text-right">
                            {money(item.subtotal)}
                          </div>

                          <button
                            type="button"
                            onClick={() => onQuantity?.(item.dishId, 0)}
                            className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Xóa món"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total & Next Steps */}
                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center bg-[#F4E8D2] p-4 rounded-xl border border-[#B88932]/40">
                      <div>
                        <span className="font-bold text-sm text-[#68131C]">Tạm tính tổng tiền món:</span>
                        <div className="text-[11px] text-[#65452F]">Thanh toán trực tiếp khi nhận món tại cơ sở</div>
                      </div>
                      <div className="font-mono font-black text-xl sm:text-2xl text-[#A52B25]">
                        {money(cartTotalAmount)}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onNavigate('menu')}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#B88932]/50 bg-[#F4E8D2] text-[#68131C] hover:bg-[#B88932]/20 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Chọn thêm món khác</span>
                      </button>

                      <button
                        onClick={() => onNavigate('checkout')}
                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#68131C] hover:bg-[#560F16] text-[#FFF8E9] text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Tiến hành gửi đơn</span>
                        <ArrowRight className="w-4 h-4 text-[#D6A84F]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1 & 2: ORDERS OR RESERVATIONS (CẦN SỐ ĐIỆN THOẠI TRA CỨU) */}
        {activeTab !== 'cart' && (
          <div className="space-y-6">
            {/* Direct Phone Lookup Form when no phone is active */}
            {!currentPhone && (
              <div className="bg-[#F4E8D2] border-2 border-[#B88932]/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3 text-[#68131C]">
                  <div className="w-10 h-10 rounded-full bg-[#68131C] text-[#D6A84F] flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#68131C]">
                      Tra cứu đơn đặt món & đặt bàn
                    </h3>
                    <p className="text-xs text-[#65452F]">
                      Nhập số điện thoại quý khách đã dùng khi đặt bàn hoặc đặt món để xem lịch sử và quản lý đơn.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLookup} className="space-y-3 max-w-md">
                  <label className="block text-xs font-bold text-[#68131C]">
                    Số điện thoại của quý khách:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-[#65452F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="Ví dụ: 0912345678"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#B88932]/50 bg-white text-[#68131C] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#68131C]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !phoneInput.trim()}
                      className="px-5 py-2.5 rounded-lg bg-[#68131C] text-[#FFF8E9] font-bold text-sm hover:bg-[#560F16] disabled:opacity-50 transition-colors cursor-pointer shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D6A84F]" />
                      ) : (
                        <Search className="w-4 h-4 text-[#D6A84F]" />
                      )}
                      <span>Xem đơn hàng</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Customer Orders Header & Controls */}
            {currentPhone && (
              <div className="space-y-4">
                <div className="bg-[#F4E8D2] border border-[#B88932]/40 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#68131C] text-[#D6A84F] flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5 text-[#D6A84F]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#65452F] font-semibold">Đang xem đơn theo số điện thoại:</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#68131C] flex items-center gap-2">
                        <span>{currentPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadOrders(currentPhone)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF8E9] border border-[#B88932]/40 text-[#68131C] text-xs font-semibold hover:bg-[#FFF8E9]/70 cursor-pointer transition-colors"
                      title="Làm mới danh sách đơn"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Làm mới</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF8E9] border border-[#B88932]/40 text-[#65452F] hover:text-[#68131C] text-xs font-semibold cursor-pointer transition-colors"
                      title="Đổi số điện thoại khác"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đổi số khác</span>
                    </button>
                  </div>
                </div>

                {/* Status Filters Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-[#B88932]/30 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65452F]">
                    Lọc theo trạng thái:
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'pending', label: 'Chờ xác nhận' },
                      { key: 'confirmed', label: 'Đã xác nhận' },
                      { key: 'completed', label: 'Hoàn thành' },
                      { key: 'cancelled', label: 'Đã hủy' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setStatusFilter(s.key)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          statusFilter === s.key
                            ? 'bg-[#B88932] text-white shadow-xs'
                            : 'bg-[#F4E8D2] text-[#65452F] hover:bg-[#B88932]/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="py-12 flex flex-col items-center justify-center text-[#65452F] gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#B88932]" />
                    <span className="text-xs">Đang tải danh sách đơn của bạn...</span>
                  </div>
                )}

            {/* TAB 1: ORDERS LIST (Đơn đặt món / Đặt bàn có món) */}
            {!loading && activeTab === 'orders' && (
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-[#F4E8D2]/60 border border-[#B88932]/30 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                    <Receipt className="w-12 h-12 text-[#B88932]/60 mx-auto" />
                    <h3 className="font-serif font-bold text-lg text-[#68131C]">
                      {statusFilter === 'all'
                        ? 'Chưa có đơn đặt món nào cho số điện thoại này'
                        : `Không có đơn nào ở trạng thái "${statusConfig[statusFilter]?.label || statusFilter}"`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#65452F] max-w-md mx-auto">
                      Quý khách có thể chọn món yêu thích trong thực đơn để đặt trước hoặc thêm món vào đơn.
                    </p>
                    <button
                      onClick={() => onNavigate('menu')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#68131C] text-[#FFF8E9] font-bold text-xs sm:text-sm hover:bg-[#560F16] cursor-pointer shadow-sm transition-colors"
                    >
                      <Utensils className="w-4 h-4 text-[#D6A84F]" />
                      <span>Xem thực đơn và đặt ngay</span>
                    </button>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const isPending = order.status === 'pending';

                    return (
                      <div
                        key={order.id}
                        className="bg-[#FFF8E9] border-2 border-[#B88932]/40 hover:border-[#B88932] rounded-2xl p-4 sm:p-6 shadow-sm transition-all space-y-4"
                      >
                        {/* Order Header: ID, Date & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B88932]/25 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#68131C] bg-[#F4E8D2] px-2.5 py-1 rounded border border-[#B88932]/30">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#65452F]">
                              Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                            </span>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${status.bg} ${status.text} ${status.border}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{status.label}</span>
                          </div>
                        </div>

                        {/* Order Main Information: Branch, Time, Table/Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#A52B25] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[#68131C]">{order.branchName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#D6A84F] shrink-0" />
                              <span>
                                Thời gian: <strong>{new Date(order.pickupAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 bg-[#F4E8D2]/50 p-2.5 rounded-xl border border-[#B88932]/20">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-[#65452F]" />
                              <span>Người nhận: <strong>{order.fullName}</strong> ({order.phone})</span>
                            </div>
                            {order.notes && (
                              <div className="text-xs text-[#65452F]">
                                <strong>Ghi chú / Bàn:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dishes list preview */}
                        <div className="border-t border-b border-[#B88932]/20 py-3 space-y-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-[#65452F]">
                            Món đã chọn ({order.items.reduce((acc, i) => acc + i.quantity, 0)} phần):
                          </div>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={`${item.dishId}-${idx}`} className="flex justify-between items-center text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#A52B25]" />
                                  <span className="font-semibold text-[#68131C]">{item.name}</span>
                                  <span className="text-[#65452F]">× {item.quantity}</span>
                                </div>
                                <span className="font-mono font-semibold text-[#68131C]">
                                  {money(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Footer: Total & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div>
                            <span className="text-xs text-[#65452F]">Tổng thanh toán: </span>
                            <span className="font-mono font-bold text-lg sm:text-xl text-[#A52B25]">
                              {money(order.total)}
                            </span>
                            <span className="text-[11px] text-[#65452F] block sm:inline sm:ml-2">
                              (Thanh toán tại cơ sở khi nhận)
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Detail Button */}
                            <button
                              onClick={() => setDetailOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-[#F4E8D2] hover:bg-[#B88932]/20 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>

                            {/* Edit Button (Only allowed when pending) */}
                            {isPending && (
                              <button
                                onClick={() => startEdit(order)}
                                className="px-3 py-1.5 rounded-lg bg-[#D6A84F] hover:bg-[#B88932] text-[#560F16] hover:text-[#FFF8E9] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Chỉnh sửa món</span>
                              </button>
                            )}

                            {/* Cancel Button (Only allowed when pending) */}
                            {isPending && (
                              <button
                                onClick={() =>
                                  setCancelTarget({
                                    type: 'order',
                                    id: order.id,
                                    name: `Đơn món #${order.id.slice(0, 8)} (${order.branchName})`,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hủy đơn</span>
                              </button>
                            )}

                            {!isPending && order.status === 'confirmed' && (
                              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                Đã xác nhận chuẩn bị món
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: RESERVATIONS LIST (Yêu cầu đặt bàn) */}
            {!loading && activeTab === 'reservations' && (
              <div className="space-y-4">
                {filteredReservations.length === 0 ? (
                  <div className="bg-[#F4E8D2]/60 border border-[#B88932]/30 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                    <Calendar className="w-12 h-12 text-[#B88932]/60 mx-auto" />
                    <h3 className="font-serif font-bold text-lg text-[#68131C]">
                      {statusFilter === 'all'
                        ? 'Chưa có yêu cầu đặt bàn nào cho số điện thoại này'
                        : `Không có yêu cầu đặt bàn nào ở trạng thái "${statusConfig[statusFilter]?.label || statusFilter}"`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#65452F] max-w-md mx-auto">
                      Đặt bàn trước giúp cơ sở chuẩn bị vị trí ngồi và phục vụ chu đáo nhất.
                    </p>
                    <button
                      onClick={() => onNavigate('reservation')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#68131C] text-[#FFF8E9] font-bold text-xs sm:text-sm hover:bg-[#560F16] cursor-pointer shadow-sm transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#D6A84F]" />
                      <span>Đặt bàn ngay</span>
                    </button>
                  </div>
                ) : (
                  filteredReservations.map((res) => {
                    const status = statusConfig[res.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const isPending = res.status === 'pending';

                    return (
                      <div
                        key={res.id}
                        className="bg-[#FFF8E9] border-2 border-[#B88932]/40 hover:border-[#B88932] rounded-2xl p-4 sm:p-6 shadow-sm transition-all space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B88932]/25 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#68131C] bg-[#F4E8D2] px-2.5 py-1 rounded border border-[#B88932]/30">
                              #{res.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#65452F]">
                              Gửi lúc: {new Date(res.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                            </span>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${status.bg} ${status.text} ${status.border}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{status.label}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#A52B25] shrink-0 mt-0.5" />
                              <span className="font-bold text-[#68131C]">{res.branchName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#D6A84F] shrink-0" />
                              <span>
                                Ngày: <strong>{res.reservationDate}</strong> • Giờ: <strong>{res.reservationTime}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 bg-[#F4E8D2]/50 p-2.5 rounded-xl border border-[#B88932]/20">
                            <div>
                              Số lượng bàn: <strong className="text-[#68131C]">{res.partySize} người</strong>
                            </div>
                            <div>
                              Khách đặt: <strong>{res.fullName}</strong> ({res.phone})
                            </div>
                            {res.notes && <div className="text-[#65452F]">Ghi chú: {res.notes}</div>}
                          </div>
                        </div>

                        {res.preOrderedItems && res.preOrderedItems.length > 0 && (
                          <div className="rounded-xl border border-[#D6A84F] bg-[#FFF8E9] p-3 text-xs text-[#68131C] flex flex-wrap items-center justify-between gap-2 shadow-xs">
                            <span className="font-bold">
                              🍜 Món gọi trước ({res.preOrderedItems.length} món • {(res.preOrderTotal || 0).toLocaleString('vi-VN')} đ)
                            </span>
                            <span className="text-[11px] text-[#68131C]/80">
                              Phục vụ khi đến quán
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <span className="text-xs text-[#65452F]">
                            Vui lòng có mặt đúng giờ để cơ sở sắp xếp bàn chu đáo.
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailReservation(res)}
                              className="px-3 py-1.5 rounded-lg bg-[#F4E8D2] hover:bg-[#B88932]/20 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem phiếu</span>
                            </button>

                            {isPending && (
                              <button
                                onClick={() =>
                                  setCancelTarget({
                                    type: 'reservation',
                                    id: res.id,
                                    name: `Đặt bàn ${res.partySize} người tại ${res.branchName}`,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hủy đặt bàn</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>

      {/* MODAL 1: VIEW ORDER DETAILS */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#FFF8E9] border-2 border-[#B88932] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#B88932]/30 pb-3">
              <div>
                <h3 className="text-xl font-serif font-black text-[#68131C]">CHI TIẾT ĐƠN ĐẶT MÓN</h3>
                <span className="font-mono text-xs text-[#65452F]">Mã đơn: #{detailOrder.id}</span>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="p-1 rounded text-[#68131C] hover:bg-[#B88932]/20 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-[#F4E8D2]/60 p-4 rounded-xl border border-[#B88932]/30">
              <div className="space-y-1">
                <div>Khách hàng: <strong>{detailOrder.fullName}</strong></div>
                <div>Số điện thoại: <strong>{detailOrder.phone}</strong></div>
                <div>Cơ sở nhận: <strong>{detailOrder.branchName}</strong></div>
              </div>
              <div className="space-y-1">
                <div>
                  Thời gian nhận:{' '}
                  <strong>{new Date(detailOrder.pickupAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</strong>
                </div>
                <div>
                  Trạng thái:{' '}
                  <span className={`inline-block px-2 py-0.5 rounded font-bold ${statusConfig[detailOrder.status]?.bg} ${statusConfig[detailOrder.status]?.text}`}>
                    {statusConfig[detailOrder.status]?.label || detailOrder.status}
                  </span>
                </div>
                {detailOrder.notes && <div>Ghi chú: {detailOrder.notes}</div>}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#68131C]">Danh Sách Món Ăn</h4>
              <div className="border border-[#B88932]/30 rounded-xl overflow-hidden divide-y divide-[#B88932]/20">
                {detailOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 text-xs sm:text-sm bg-[#FFF8E9]">
                    <div>
                      <div className="font-bold text-[#68131C]">{item.name}</div>
                      <div className="text-xs text-[#65452F]">
                        {money(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#68131C]">
                      {money(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#F4E8D2] p-4 rounded-xl border border-[#B88932]/40">
              <span className="font-bold text-sm">Tổng tiền thanh toán:</span>
              <span className="font-mono font-black text-xl text-[#A52B25]">{money(detailOrder.total)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#B88932]/20">
              {detailOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      const o = detailOrder;
                      setDetailOrder(null);
                      startEdit(o);
                    }}
                    className="px-4 py-2 bg-[#D6A84F] hover:bg-[#B88932] text-[#560F16] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Chỉnh sửa món
                  </button>
                  <button
                    onClick={() => {
                      const o = detailOrder;
                      setDetailOrder(null);
                      setCancelTarget({
                        type: 'order',
                        id: o.id,
                        name: `Đơn món #${o.id.slice(0, 8)}`,
                      });
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2 bg-[#F4E8D2] hover:bg-[#B88932]/20 text-[#68131C] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW RESERVATION DETAILS */}
      {detailReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-[#FFF8E9] border-2 border-[#B88932] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#B88932]/30 pb-3">
              <h3 className="text-xl font-serif font-black text-[#68131C]">PHIẾU ĐẶT BÀN</h3>
              <button
                onClick={() => setDetailReservation(null)}
                className="p-1 rounded text-[#68131C] hover:bg-[#B88932]/20 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm bg-[#F4E8D2]/60 p-4 rounded-xl border border-[#B88932]/30">
              <div>Mã yêu cầu: <strong className="font-mono">#{detailReservation.id}</strong></div>
              <div>Cơ sở: <strong>{detailReservation.branchName}</strong></div>
              <div>Thời gian: <strong>{detailReservation.reservationTime} ngày {detailReservation.reservationDate}</strong></div>
              <div>Số khách: <strong>{detailReservation.partySize} người</strong></div>
              <div>Khách hàng: <strong>{detailReservation.fullName}</strong> - {detailReservation.phone}</div>
              {detailReservation.notes && <div>Ghi chú: {detailReservation.notes}</div>}
              <div>
                Trạng thái:{' '}
                <span className={`inline-block px-2.5 py-0.5 rounded font-bold ${statusConfig[detailReservation.status]?.bg} ${statusConfig[detailReservation.status]?.text}`}>
                  {statusConfig[detailReservation.status]?.label || detailReservation.status}
                </span>
              </div>
            </div>

            {detailReservation.preOrderedItems && detailReservation.preOrderedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#68131C]">
                    🍜 Món gọi trước ({detailReservation.preOrderedItems.length} món)
                  </h4>
                  <span className="font-mono font-bold text-xs text-[#A52B25]">
                    Tổng tiền: {(detailReservation.preOrderTotal || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="border border-[#B88932]/30 rounded-xl overflow-hidden divide-y divide-[#B88932]/20">
                  {detailReservation.preOrderedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs sm:text-sm bg-[#FFF8E9]">
                      <div>
                        <div className="font-bold text-[#68131C]">{item.name}</div>
                        <div className="text-xs text-[#65452F]">
                          {money(item.unitPrice)} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-[#68131C]">
                        {money(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[#65452F] italic">
                  * Món ăn gọi trước sẽ được phục vụ khi quý khách đến bàn. Thanh toán khi dùng bữa.
                </div>
              </div>
            )}

            <p className="text-xs text-[#65452F]">
              Quý khách vui lòng xuất trình mã đơn hoặc đọc số điện thoại khi đến cơ sở để được nhân viên xếp bàn.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#B88932]/20">
              {detailReservation.status === 'pending' && (
                <button
                  onClick={() => {
                    const r = detailReservation;
                    setDetailReservation(null);
                    setCancelTarget({
                      type: 'reservation',
                      id: r.id,
                      name: `Đặt bàn ${r.partySize} người tại ${r.branchName}`,
                    });
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Hủy đặt bàn
                </button>
              )}
              <button
                onClick={() => setDetailReservation(null)}
                className="px-4 py-2 bg-[#68131C] text-[#FFF8E9] font-bold text-xs rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM CANCEL DIALOG */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#FFF8E9] border-2 border-red-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#68131C]">Xác nhận hủy yêu cầu</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#3A281E] leading-relaxed">
              Quý khách có chắc chắn muốn hủy <strong>{cancelTarget.name}</strong> không?
            </p>
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              Lưu ý: Thao tác này không thể hoàn tác sau khi xác nhận.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#B88932]/30">
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg bg-[#F4E8D2] hover:bg-[#B88932]/20 text-[#68131C] font-semibold text-xs cursor-pointer"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                disabled={cancelBusy}
                onClick={confirmCancel}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {cancelBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Xác nhận hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT ORDER (Thêm, xóa, sửa số lượng món & tự động cập nhật tổng tiền) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#FFF8E9] border-2 border-[#B88932] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#B88932]/30 pb-3">
              <div>
                <h3 className="text-xl font-serif font-black text-[#68131C]">CHỈNH SỬA MÓN ĂN</h3>
                <span className="text-xs text-[#65452F]">Đơn hàng #{editingOrder.id.slice(0, 8)} • {editingOrder.branchName}</span>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded text-[#68131C] hover:bg-[#B88932]/20 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Items List to Edit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#65452F]">
                    Các món trong đơn ({editItems.length})
                  </h4>
                  <span className="text-xs text-[#B88932]">Tối đa 50 phần/món</span>
                </div>

                <div className="space-y-2 border border-[#B88932]/30 rounded-xl p-3 bg-white/70 max-h-60 overflow-y-auto divide-y divide-[#B88932]/20">
                  {editItems.map((item) => (
                    <div key={item.dishId} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-[#68131C] truncate">{item.name}</div>
                        <div className="text-xs text-[#65452F]">{money(item.unitPrice)} / món</div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.dishId, -1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded border border-[#B88932]/40 bg-[#FFF8E9] hover:bg-[#F4E8D2] flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
                          aria-label="Giảm 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.dishId, 1)}
                          disabled={item.quantity >= 50}
                          className="w-7 h-7 rounded border border-[#B88932]/40 bg-[#FFF8E9] hover:bg-[#F4E8D2] flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
                          aria-label="Tăng 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.dishId)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded ml-2 cursor-pointer transition-colors"
                          title="Xóa món này khỏi đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Dish from Menu */}
              <div className="bg-[#F4E8D2]/60 p-3.5 rounded-xl border border-[#B88932]/30 space-y-2">
                <label className="block text-xs font-bold text-[#68131C]">
                  + Thêm món khác từ thực đơn vào đơn này:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedNewDishId}
                    onChange={(e) => setSelectedNewDishId(e.target.value)}
                    className="flex-1 rounded-lg border border-[#B88932]/50 bg-white p-2 text-xs text-[#68131C]"
                  >
                    <option value="">-- Chọn món muốn thêm --</option>
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name.vi} — {money(d.price)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddNewDish}
                    disabled={!selectedNewDishId}
                    className="px-3.5 py-2 rounded-lg bg-[#B88932] text-white font-bold text-xs hover:bg-[#A52B25] disabled:opacity-50 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Thêm món
                  </button>
                </div>
              </div>

              {/* Edit Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#68131C]">
                  Ghi chú cho cơ sở (tùy chọn):
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder="Ghi chú yêu cầu thêm về món ăn hoặc vị trí bàn..."
                  className="w-full rounded-lg border border-[#B88932]/50 bg-white p-2 text-xs text-[#68131C]"
                />
              </div>

              {/* Real-time Recalculated Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F4E8D2] border border-[#B88932]/50">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#68131C]">Tổng tiền mới (Tự động tính):</span>
                  <div className="text-[11px] text-[#65452F]">Giá cập nhật trực tiếp theo số lượng món</div>
                </div>
                <div className="font-mono font-black text-xl sm:text-2xl text-[#A52B25]">
                  {money(editCalculatedTotal)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#B88932]/30">
                <button
                  type="button"
                  disabled={editBusy}
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2.5 rounded-lg bg-[#F4E8D2] hover:bg-[#B88932]/20 text-[#68131C] font-semibold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editBusy || editItems.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-[#68131C] hover:bg-[#560F16] text-[#FFF8E9] font-bold text-xs sm:text-sm cursor-pointer shadow-sm flex items-center gap-2"
                >
                  {editBusy ? <RefreshCw className="w-4 h-4 animate-spin text-[#D6A84F]" /> : <CheckCircle2 className="w-4 h-4 text-[#D6A84F]" />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
