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
export async function createReservation(client: SupabaseClient, body: unknown, manual = false) {
  const r = validate.reservation(body, manual);
  const { data, error } = await client.from('reservations').insert({
    full_name: r.fullName, phone: r.phone, email: r.email || null, reservation_date: r.reservationDate,
    reservation_time: r.reservationTime, party_size: r.partySize, branch_id: r.branchId,
    notes: r.notes, ...(manual ? { status: r.status, is_walk_in: r.isWalkIn } : {}),
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
export async function createOrder(client: SupabaseClient, body: unknown) {
  const o = validate.order(body);
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
