import React, { useState } from 'react';
import type { CartItem, Language, Order } from '../types';
import { adminStore } from '../services/adminStore';

interface Props {
  cart: CartItem[];
  lang: Language;
  onQuantity: (id: string, quantity: number) => void;
  onBack: () => void;
  onComplete: () => void;
  onViewMyOrders?: () => void;
  onSwitchToReservation?: () => void;
}
const money = (amount: number) => amount.toLocaleString('vi-VN') + ' đ';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

export function CheckoutSection({
  cart,
  lang,
  onQuantity,
  onBack,
  onComplete,
  onViewMyOrders,
  onSwitchToReservation,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const branches = adminStore.getBranches();
  const dishes = adminStore.getDishes();
  const items = cart.map((item) => ({ ...item, dish: dishes.find((dish) => dish.id === item.dishId) }));
  const unavailable = items.some((item) => !item.dish || !item.dish.isAvailable);
  const total = items.reduce((sum, item) => sum + (item.dish?.price || 0) * item.quantity, 0);
  const inputClass = 'w-full rounded border border-[#B88932]/50 bg-white p-3 text-[#68131C]';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const pickup = `${form.get('date')}T${form.get('time')}:00+07:00`;
    const pickupAt = new Date(pickup);
    if (unavailable || !items.length) { setError('Hãy bỏ món đã hết hoặc chọn thêm món.'); return; }
    if (!Number.isFinite(pickupAt.getTime()) || pickupAt.getTime() <= Date.now()) {
      setError('Vui lòng chọn thời gian nhận trong tương lai.'); return;
    }
    const phone = String(form.get('phone') || '').trim();
    const notes = String(form.get('notes') || '').trim();

    setBusy(true);
    try {
      const result = await adminStore.createOrder({
        fullName: String(form.get('fullName') || '').trim(),
        phone,
        branchId: String(form.get('branchId') || ''),
        pickupAt: pickupAt.toISOString(),
        notes,
        items: cart,
      });
      try {
        localStorage.setItem('pho_thin_customer_phone', phone);
      } catch {}
      setOrder(result);
      onComplete();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa gửi được đơn. Vui lòng thử lại.');
    } finally { setBusy(false); }
  }

  if (order) return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-xl border-2 border-[#B88932] bg-[#F4E8D2] p-6 sm:p-10 space-y-4">
        <h1 className="text-3xl font-bold">Đã tiếp nhận đơn món mang về</h1>
        <p className="break-all">Mã đơn: <strong>{order.id}</strong></p>
        <p>Chờ cơ sở xác nhận. Nhận tại <strong>{order.branchName}</strong>.</p>
        <p>{new Date(order.pickupAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
        <ul className="space-y-2">{order.items.map((item) => <li key={item.dishId}>{item.quantity} × {item.name} — {money(item.unitPrice * item.quantity)}</li>)}</ul>
        <p className="text-xl font-bold">Tổng tiền: {money(order.total)}</p>
        <p>Thanh toán khi nhận món. Chưa thu tiền trực tuyến.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {onViewMyOrders && (
            <button
              onClick={onViewMyOrders}
              className="rounded bg-[#D6A84F] hover:bg-[#B88932] px-6 py-3 font-bold text-[#560F16] transition-colors cursor-pointer shadow-sm"
            >
              Xem đơn của tôi
            </button>
          )}
          <button onClick={onBack} className="rounded bg-[#68131C] px-6 py-3 font-bold text-[#FFF8E9] cursor-pointer">
            Về thực đơn
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#68131C] hover:text-[#560F16] underline cursor-pointer">
        ← Quay lại giỏ hàng
      </button>
      <h1 className="mb-8 text-3xl font-bold">Đặt món mang về (Takeaway - Nhận tại quầy)</h1>
      {!cart.length ? <p>Giỏ hàng trống. Chọn món trong thực đơn để bắt đầu.</p> : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#B88932]/50 bg-[#F4E8D2] p-5 sm:p-7">
            <h2 className="mb-4 text-xl font-bold">Món đã chọn</h2>
            <ul className="divide-y divide-[#B88932]/30">
              {items.map((item) => (
                <li key={item.dishId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div><p className="font-semibold">{item.dish?.name[lang] || 'Món không còn trong thực đơn'}</p><p className="text-sm">{item.dish ? money(item.dish.price) : ''} {item.dish && !item.dish.isAvailable ? '· Tạm hết món' : ''}</p></div>
                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`quantity-${item.dishId}`}>Số lượng {item.dish?.name[lang]}</label>
                    <input id={`quantity-${item.dishId}`} type="number" min={1} max={50} value={item.quantity} disabled={busy} onChange={(event) => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= 50) onQuantity(item.dishId, value); }} className="w-20 rounded border border-[#B88932]/50 bg-white p-2" />
                    <button disabled={busy} onClick={() => onQuantity(item.dishId, 0)} className="p-2 underline" aria-label={`Xóa ${item.dish?.name[lang] || 'món'}`}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[#B88932]/40 pt-4 text-xl font-bold">Tạm tính: {money(total)}</p>
            <p className="mt-2 text-sm">Giá được kiểm tra lại khi gửi đơn. Chỉ nhận tại cơ sở, thanh toán khi nhận.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {onSwitchToReservation && (
              <div className="rounded-xl border-2 border-[#D6A84F] bg-[#FFF8E9] p-4 text-[#68131C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold flex items-center gap-1.5 text-sm sm:text-base">
                    🍜 Quý khách muốn dùng bữa tại bàn?
                  </p>
                  <p className="text-xs text-[#68131C]/80 mt-0.5">
                    Đặt bàn trước để được giữ chỗ và phục vụ món nóng hổi ngay khi đến quán!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToReservation}
                  className="shrink-0 rounded-lg bg-[#68131C] hover:bg-[#560F16] text-[#FFF8E9] px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  Chuyển sang Đặt bàn kèm món →
                </button>
              </div>
            )}
            <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
              <legend className="mb-4 text-xl font-bold">Thông tin nhận món mang về</legend>
              <label className="block space-y-1"><span>Họ tên</span><input name="fullName" autoComplete="name" required maxLength={100} className={inputClass} /></label>
              <label className="block space-y-1"><span>Số điện thoại</span><input name="phone" type="tel" autoComplete="tel" required maxLength={20} className={inputClass} /></label>
              <label className="block space-y-1"><span>Cơ sở nhận</span><select name="branchId" required className={inputClass}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name[lang]} — {branch.address}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1"><span>Ngày nhận</span><input name="date" type="date" required min={today()} defaultValue={today()} className={inputClass} /></label>
                <label className="block space-y-1"><span>Giờ nhận (Việt Nam)</span><input name="time" type="time" required className={inputClass} /></label>
              </div>
              <label className="block space-y-1"><span>Ghi chú</span><textarea name="notes" maxLength={1000} rows={3} className={inputClass} /></label>
            </fieldset>
            {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>}
            <button type="submit" disabled={busy || unavailable || !branches.length} className="w-full rounded-lg bg-[#68131C] px-6 py-3 font-bold text-[#FFF8E9] disabled:opacity-50">{busy ? 'Đang gửi đơn…' : 'Gửi đơn mang về · Thanh toán khi nhận'}</button>
          </form>
        </div>
      )}
    </section>
  );
}
