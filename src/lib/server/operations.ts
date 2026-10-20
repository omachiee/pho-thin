import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Catalog } from '../../types';
import * as validate from './validation';
import { ApiError } from './validation';
import { databaseError } from './supabase';
import { articleRow, branchRow, dishRow, mapArticle, mapBranch, mapDish, mapInquiry, mapOrder, mapReservation } from './mappings';

export async function catalog(client: SupabaseClient): Promise<Catalog> {
  const [dishes, branches, articles] = await Promise.all([
    client.from('dishes').select('*').order('is_signature', { ascending: false }),
    client.from('branches').select('*').order('code'),
    client.from('articles').select('*').order('created_at', { ascending: false }),
  ]);
  for (const result of [dishes, branches, articles]) databaseError(result.error, 'Không thể tải danh mục.');
  return { dishes: (dishes.data || []).map(mapDish), branches: (branches.data || []).map(mapBranch), articles: (articles.data || []).map(mapArticle) };
}
export async function reservationAvailability(client: SupabaseClient, branchId: string, date: string) {
  const validBranchId = validate.id(branchId);
  const validDate = validate.date(date);
  const { data, error } = await client
    .from('reservations')
    .select('reservation_time, status')
    .eq('branch_id', validBranchId)
    .eq('reservation_date', validDate)
    .neq('status', 'cancelled');
  databaseError(error);

  const availability: Record<string, { booked: number; remaining: number }> = {};
  for (const row of data || []) {
    const time = row.reservation_time;
    if (!time) continue;
    if (!availability[time]) {
      availability[time] = { booked: 0, remaining: 20 };
    }
    availability[time].booked += 1;
    availability[time].remaining = Math.max(0, 20 - availability[time].booked);
  }

  return {
    branchId: validBranchId,
    date: validDate,
    maxTablesPerSlot: 20,
    availability,
  };
}
export async function createReservation(client: SupabaseClient, body: unknown, manual = false) {
  const r = validate.reservation(body, manual);
  if (!manual) {
    const { data: existing, error: countErr } = await client
      .from('reservations')
      .select('id')
      .eq('branch_id', r.branchId)
      .eq('reservation_date', r.reservationDate)
      .eq('reservation_time', r.reservationTime)
      .neq('status', 'cancelled');
    databaseError(countErr);
    if (existing && existing.length >= 20) {
      throw new ApiError(409, 'Khung giờ này tại cơ sở đã đạt giới hạn 20 bàn đặt trước. Vui lòng chọn khung giờ khác.');
    }
  }
  const { data, error } = await client.from('reservations').insert({
    full_name: r.fullName, phone: r.phone, email: r.email || null, reservation_date: r.reservationDate,
    reservation_time: r.reservationTime, party_size: r.partySize, branch_id: r.branchId,
    notes: r.notes, pre_ordered_items: r.preOrderedItems || [], pre_order_total: r.preOrderTotal || 0,
    ...(manual ? { status: r.status, is_walk_in: r.isWalkIn } : {}),
  }).select('*').single();
  databaseError(error);
  if (!data) throw new ApiError(503, 'Không thể tạo đặt bàn.');
  return mapReservation(data);
}
export async function createInquiry(client: SupabaseClient, body: unknown) {
  const i = validate.inquiry(body);
  const { data, error } = await client.from('inquiries').insert({
    type: i.type, full_name: i.fullName, phone: i.phone, email: i.email || null,
    position: i.position || null, message: i.message,
  }).select('*').single();
  databaseError(error);
  if (!data) throw new ApiError(503, 'Không thể tạo liên hệ.');
  return mapInquiry(data);
}
export function phoneVariants(phone: string): string[] {
  const clean = phone.replace(/[\s().-]/g, '');
  const set = new Set<string>([clean]);
  if (clean.startsWith('0')) {
    set.add('+84' + clean.slice(1));
    set.add('84' + clean.slice(1));
  } else if (clean.startsWith('+84')) {
    set.add('0' + clean.slice(3));
    set.add(clean.slice(1));
  } else if (clean.startsWith('84')) {
    set.add('0' + clean.slice(2));
    set.add('+' + clean);
  }
  return Array.from(set);
}

export async function createOrder(client: SupabaseClient, body: unknown) {
  const o = validate.order(body);
  const variants = phoneVariants(o.phone);
  const { data: pendingOrders, error: countErr } = await client
    .from('orders')
    .select('id')
    .in('phone', variants)
    .eq('status', 'pending');
  databaseError(countErr);
  if (pendingOrders && pendingOrders.length >= 2) {
    throw new ApiError(400, 'Bạn đang có đơn hàng chưa hoàn tất, vui lòng chờ xử lý trước khi đặt thêm.');
  }
  const { data, error } = await client.rpc('create_order', {
    p_full_name: o.fullName, p_phone: o.phone, p_branch_id: o.branchId, p_pickup_at: o.pickupAt,
    p_notes: o.notes, p_items: o.items.map(item => ({ dish_id: item.dishId, quantity: item.quantity })),
  });
  databaseError(error);
  if (!data) throw new ApiError(503, 'Không thể tạo đơn hàng.');
  return mapOrder(data);
}
export const resources = ['dishes', 'branches', 'articles', 'reservations', 'inquiries', 'orders'] as const;
export type Resource = typeof resources[number];
export function resource(value: string): Resource { return validate.choice(value, resources, 'Loại dữ liệu'); }
const mappers = { dishes: mapDish, branches: mapBranch, articles: mapArticle, reservations: mapReservation, inquiries: mapInquiry, orders: mapOrder };
export async function adminList(client: SupabaseClient, name: Resource) {
  const { data, error } = await client.from(name).select(name === 'orders' ? '*,order_items(*)' : '*').order('created_at', { ascending: false });
  databaseError(error, 'Không thể tải dữ liệu quản trị.');
  return (data || []).map(row => mappers[name](row));
}
export async function adminSave(client: SupabaseClient, name: Resource, body: unknown) {
  if (name === 'reservations') return createReservation(client, body, true);
  const row: Record<string, unknown> | null = name === 'dishes' ? dishRow(validate.dish(body)) : name === 'branches' ? branchRow(validate.branch(body)) : name === 'articles' ? articleRow(validate.article(body)) : null;
  if (!row) throw new ApiError(400, 'Không hỗ trợ tạo dữ liệu này trong quản trị.');
  const { data, error } = await client.from(name).upsert(row).select('*').single();
  databaseError(error);
  if (!data) throw new ApiError(503, 'Không thể lưu dữ liệu.');
  return mappers[name](data);
}
export async function adminPatch(client: SupabaseClient, name: Resource, body: unknown) {
  if (!['dishes', 'reservations', 'inquiries', 'orders'].includes(name)) throw new ApiError(400, 'Không hỗ trợ cập nhật dữ liệu này.');
  const b = validate.object(body, name === 'dishes' ? ['id', 'isAvailable'] : ['id', 'status']);
  const recordId = validate.id(b.id);
  const patch = name === 'dishes' ? { is_available: validate.boolean(b.isAvailable, 'Còn món') } : { status: name === 'inquiries'
    ? validate.choice(b.status, ['new', 'contacted', 'resolved'], 'Trạng thái')
    : validate.choice(b.status, ['pending', 'confirmed', 'completed', 'cancelled'], 'Trạng thái') };
  // The database trigger also checks the transition under a row lock; this condition prevents lost updates.
  let previousStatus: string | undefined;
  if (name === 'orders') {
    const { data, error } = await client.from('orders').select('status').eq('id', recordId).maybeSingle();
    databaseError(error);
    if (!data) throw new ApiError(400, 'Không tìm thấy đơn hàng.');
    previousStatus = data.status;
    if (!validate.canTransitionOrder(data.status, b.status as string)) throw new ApiError(400, 'Không thể chuyển đơn hàng sang trạng thái này.');
  }
  let query = client.from(name).update(patch).eq('id', recordId);
  if (previousStatus) query = query.eq('status', previousStatus);
  const { data, error } = await query.select(name === 'orders' ? '*,order_items(*)' : '*').maybeSingle();
  databaseError(error);
  if (!data) throw new ApiError(400, 'Không tìm thấy dữ liệu hoặc trạng thái đã thay đổi.');
  return mappers[name](data);
}
export async function adminDelete(client: SupabaseClient, name: Resource, recordId: string | null) {
  if (!['dishes', 'articles', 'reservations'].includes(name)) throw new ApiError(400, 'Không hỗ trợ xóa dữ liệu này.');
  const validatedId = validate.id(recordId);
  const { data, error } = await client.from(name).delete().eq('id', validatedId).select('id').maybeSingle();
  databaseError(error);
  if (!data) throw new ApiError(400, 'Không tìm thấy dữ liệu.');
  return { id: validatedId };
}

function matchesPhone(storedPhone: string, testPhone: string): boolean {
  const s = storedPhone.replace(/[\s().-]/g, '');
  const t = testPhone.replace(/[\s().-]/g, '');
  if (s === t) return true;
  const sNorm = s.startsWith('+84') ? '0' + s.slice(3) : (s.startsWith('84') ? '0' + s.slice(2) : s);
  const tNorm = t.startsWith('+84') ? '0' + t.slice(3) : (t.startsWith('84') ? '0' + t.slice(2) : t);
  return sNorm === tNorm;
}

export async function customerOrders(client: SupabaseClient, rawPhone: string) {
  const clean = validate.phone(rawPhone);
  const variants = phoneVariants(clean);
  const [ordersRes, reservationsRes] = await Promise.all([
    client.from('orders').select('*,order_items(*)').in('phone', variants).order('created_at', { ascending: false }),
    client.from('reservations').select('*').in('phone', variants).order('created_at', { ascending: false }),
  ]);
  databaseError(ordersRes.error, 'Không thể tải danh sách đơn đặt món.');
  databaseError(reservationsRes.error, 'Không thể tải danh sách đơn đặt bàn.');
  return {
    orders: (ordersRes.data || []).map(mapOrder),
    reservations: (reservationsRes.data || []).map(mapReservation),
  };
}

export async function cancelCustomerOrder(client: SupabaseClient, orderId: string, rawPhone: string) {
  const validatedId = validate.id(orderId);
  const clean = validate.phone(rawPhone);
  const { data: existing, error } = await client.from('orders').select('*').eq('id', validatedId).maybeSingle();
  databaseError(error);
  if (!existing) throw new ApiError(400, 'Không tìm thấy đơn hàng.');
  if (!matchesPhone(existing.phone, clean)) throw new ApiError(403, 'Bạn không có quyền thao tác với đơn này.');
  if (existing.status !== 'pending') throw new ApiError(400, 'Chỉ có thể hủy đơn đang chờ xác nhận.');

  const { data: updated, error: updateError } = await client
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', validatedId)
    .select('*,order_items(*)')
    .maybeSingle();
  databaseError(updateError);
  if (!updated) throw new ApiError(503, 'Không thể cập nhật trạng thái đơn.');
  return mapOrder(updated);
}

export async function updateCustomerOrder(
  client: SupabaseClient,
  orderId: string,
  rawPhone: string,
  rawItems: unknown,
  notes?: string
) {
  const validatedId = validate.id(orderId);
  const clean = validate.phone(rawPhone);

  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) {
    throw new ApiError(400, 'Danh sách món ăn phải từ 1 đến 20 món.');
  }
  const seenDishIds = new Set<string>();
  const items = rawItems.map((item: any) => {
    const dishId = validate.text(item?.dishId, 'Mã món ăn', 100);
    const quantity = validate.integer(Number(item?.quantity), 'Số lượng món', 1, 50);
    if (seenDishIds.has(dishId)) throw new ApiError(400, 'Không được chọn trùng món ăn.');
    seenDishIds.add(dishId);
    return { dishId, quantity };
  });

  const { data: existing, error } = await client.from('orders').select('*').eq('id', validatedId).maybeSingle();
  databaseError(error);
  if (!existing) throw new ApiError(400, 'Không tìm thấy đơn hàng.');
  if (!matchesPhone(existing.phone, clean)) throw new ApiError(403, 'Bạn không có quyền thao tác với đơn này.');
  if (existing.status !== 'pending') throw new ApiError(400, 'Chỉ có thể chỉnh sửa đơn đang chờ xác nhận.');

  const dishIds = items.map((i) => i.dishId);
  const { data: dishes, error: dishesError } = await client.from('dishes').select('*').in('id', dishIds);
  databaseError(dishesError);
  const dishesMap = new Map((dishes || []).map((d) => [d.id, d]));

  let total = 0;
  const orderItemsToInsert = items.map((item) => {
    const d = dishesMap.get(item.dishId);
    if (!d || d.is_available === false) {
      throw new ApiError(400, `Món "${d?.name?.vi || item.dishId}" tạm hết hoặc không khả dụng.`);
    }
    const unitPrice = Number(d.price);
    total += unitPrice * item.quantity;
    return {
      order_id: validatedId,
      dish_id: item.dishId,
      name: d.name.vi,
      unit_price: unitPrice,
      quantity: item.quantity,
    };
  });

  const { error: delError } = await client.from('order_items').delete().eq('order_id', validatedId);
  databaseError(delError);

  const { error: insError } = await client.from('order_items').insert(orderItemsToInsert);
  databaseError(insError);

  const newNotes = typeof notes === 'string' ? validate.text(notes, 'Ghi chú', 2000, true) : existing.notes;
  const { data: updatedOrder, error: upError } = await client
    .from('orders')
    .update({ total, notes: newNotes, updated_at: new Date().toISOString() })
    .eq('id', validatedId)
    .select('*,order_items(*)')
    .maybeSingle();
  databaseError(upError);
  if (!updatedOrder) throw new ApiError(503, 'Không thể cập nhật đơn hàng.');

  return mapOrder(updatedOrder);
}

export async function cancelCustomerReservation(client: SupabaseClient, resId: string, rawPhone: string) {
  const validatedId = validate.id(resId);
  const clean = validate.phone(rawPhone);
  const { data: existing, error } = await client.from('reservations').select('*').eq('id', validatedId).maybeSingle();
  databaseError(error);
  if (!existing) throw new ApiError(400, 'Không tìm thấy yêu cầu đặt bàn.');
  if (!matchesPhone(existing.phone, clean)) throw new ApiError(403, 'Bạn không có quyền thao tác với yêu cầu này.');
  if (existing.status !== 'pending') throw new ApiError(400, 'Chỉ có thể hủy yêu cầu đặt bàn đang chờ xác nhận.');

  const { data: updated, error: updateError } = await client
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', validatedId)
    .select('*')
    .maybeSingle();
  databaseError(updateError);
  if (!updated) throw new ApiError(503, 'Không thể cập nhật trạng thái đặt bàn.');
  return mapReservation(updated);
}

