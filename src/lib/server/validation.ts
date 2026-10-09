import type { AdminDish, AdminInquiry, Article, Branch, OrderInput, ReservationFormData } from '../../types';

export class ApiError extends Error {
  constructor(public status: 400 | 401 | 403 | 503, message: string) { super(message); }
}
const invalid = (message: string): never => { throw new ApiError(400, message); };
export function object(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Dữ liệu phải là một đối tượng JSON.');
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !fields.includes(key))) invalid('Dữ liệu có trường không được phép.');
  return result;
}
export function text(value: unknown, label: string, max = 200, optional = false): string {
  if (optional && (value === undefined || value === null)) return '';
  if (typeof value !== 'string') invalid(`${label} phải là văn bản.`);
  const result = (value as string).trim();
  if ((!optional && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) invalid(`${label} không hợp lệ (tối đa ${max} ký tự).`);
  return result;
}
export function id(value: unknown): string {
  const result = text(value, 'Mã', 100);
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) invalid('Mã không hợp lệ.');
  return result;
}
export function integer(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) invalid(`${label} phải là số nguyên từ ${min} đến ${max}.`);
  return value as number;
}
export function boolean(value: unknown, label: string, fallback?: boolean): boolean {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'boolean') invalid(`${label} phải là true hoặc false.`);
  return value as boolean;
}
export function choice<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) invalid(`${label} không hợp lệ.`);
  return value as T;
}
export function phone(value: unknown): string {
  const result = text(value, 'Số điện thoại', 25).replace(/[\s().-]/g, '');
  if (!/^\+?\d{9,15}$/.test(result)) invalid('Số điện thoại không hợp lệ.');
  return result;
}
export function email(value: unknown, required = false): string {
  const result = text(value, 'Email', 254, !required);
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) invalid('Email không hợp lệ.');
  return result;
}
function date(value: unknown): string {
  const result = text(value, 'Ngày', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) invalid('Ngày không hợp lệ.');
  return result;
}
export function futureTimestamp(value: unknown, now = Date.now()): string {
  const result = text(value, 'Thời gian nhận món', 40);
  // Require a timezone: a browser-local datetime is never silently treated as UTC.
  if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(result)) invalid('Thời gian nhận món phải là ISO có múi giờ.');
  date(result.slice(0, 10));
  if (!Number.isFinite(Date.parse(result)) || Date.parse(result) <= now || Date.parse(result) > now + 90 * 86400000) invalid('Chọn thời gian nhận món trong tương lai, tối đa 90 ngày.');
  return new Date(result).toISOString();
}
export function reservation(value: unknown, manual = false, now = Date.now()): ReservationFormData & { status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; isWalkIn: boolean } {
  const body = object(value, ['fullName', 'phone', 'email', 'reservationDate', 'reservationTime', 'partySize', 'branchId', 'notes', ...(manual ? ['branchName', 'status', 'isWalkIn'] : [])]);
  const reservationDate = date(body.reservationDate);
  const reservationTime = text(body.reservationTime, 'Giờ đặt bàn', 5);
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(reservationTime)) invalid('Giờ đặt bàn không hợp lệ.');
  const isWalkIn = manual ? boolean(body.isWalkIn, 'Khách tại quầy', false) : false;
  const timestamp = Date.parse(`${reservationDate}T${reservationTime}:00+07:00`);
  const today = new Date(now + 7 * 3600000).toISOString().slice(0, 10);
  if ((isWalkIn ? reservationDate !== today : timestamp <= now) || timestamp > now + 90 * 86400000) invalid('Chọn ngày giờ đặt bàn trong tương lai, tối đa 90 ngày (khách tại quầy: hôm nay).');
  return { fullName: text(body.fullName, 'Họ tên', 120), phone: phone(body.phone), email: email(body.email), reservationDate, reservationTime,
    partySize: integer(body.partySize, 'Số khách', 1, 50), branchId: id(body.branchId), notes: text(body.notes, 'Ghi chú', 2000, true), isWalkIn,
    status: manual && body.status !== undefined ? choice(body.status, ['pending', 'confirmed', 'completed', 'cancelled'], 'Trạng thái') : 'pending' };
}
export function inquiry(value: unknown): Omit<AdminInquiry, 'id' | 'status' | 'createdAt'> {
  const body = object(value, ['type', 'fullName', 'phone', 'email', 'position', 'message']);
  const type = choice(body.type, ['inquiry', 'recruitment'], 'Loại liên hệ');
  const position = text(body.position, 'Vị trí', 200, true);
  const message = text(body.message, 'Nội dung', 5000, true);
  if (!message) invalid('Vui lòng nhập nội dung liên hệ.');
  if (type === 'recruitment' && !position) invalid('Vui lòng nhập vị trí ứng tuyển.');
  return { type, fullName: text(body.fullName, 'Họ tên', 120), phone: phone(body.phone), email: email(body.email), position, message };
}
export function order(value: unknown, now = Date.now()): OrderInput {
  const body = object(value, ['fullName', 'phone', 'branchId', 'pickupAt', 'notes', 'items']);
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) invalid('Giỏ hàng phải có từ 1 đến 20 món.');
  const items = (body.items as unknown[]).map(value => {
    const item = object(value, ['dishId', 'quantity']);
    return { dishId: id(item.dishId), quantity: integer(item.quantity, 'Số lượng', 1, 50) };
  });
  if (new Set(items.map(item => item.dishId)).size !== items.length) invalid('Giỏ hàng có món bị trùng.');
  return { fullName: text(body.fullName, 'Họ tên', 120), phone: phone(body.phone), branchId: id(body.branchId), pickupAt: futureTimestamp(body.pickupAt, now), notes: text(body.notes, 'Ghi chú', 2000, true), items };
}
const languages = ['vi', 'en', 'zh', 'ko'] as const;
function localized(value: unknown, label: string, max: number) {
  const body = object(value, languages);
  return Object.fromEntries(languages.map(lang => [lang, text(body[lang], `${label} (${lang})`, max)])) as Record<typeof languages[number], string>;
}
function localizedList(value: unknown, label: string, maxCount: number, maxText: number) {
  const body = object(value, languages);
  return Object.fromEntries(languages.map(lang => {
    const entries = body[lang];
    if (!Array.isArray(entries) || entries.length > maxCount) invalid(`${label} không hợp lệ.`);
    return [lang, (entries as unknown[]).map(item => text(item, label, maxText))];
  })) as Record<typeof languages[number], string[]>;
}
function url(value: unknown, label: string, local = false): string {
  const result = text(value, label, 2000);
  if (local && /^\/(?!\/)[^\\\s]*$/.test(result)) return result;
  try { const parsed = new URL(result); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) invalid(`${label} phải là đường dẫn HTTPS.`); }
  catch { invalid(`${label} phải là đường dẫn HTTPS.`); }
  return result;
}
export function dish(value: unknown): AdminDish {
  const b = object(value, ['id', 'category', 'name', 'price', 'formattedPrice', 'image', 'shortDescription', 'fullDescription', 'ingredients', 'isSignature', 'isFeatured', 'isAvailable', 'preparationNote']);
  const price = integer(b.price, 'Giá VND', 0, 10000000);
  return { id: id(b.id), category: choice(b.category, ['pho', 'drinks', 'others'], 'Danh mục'), name: localized(b.name, 'Tên món', 200), price,
    formattedPrice: new Intl.NumberFormat('vi-VN').format(price), image: url(b.image, 'Ảnh', true), shortDescription: localized(b.shortDescription, 'Mô tả ngắn', 1000),
    fullDescription: localized(b.fullDescription, 'Mô tả', 10000), ingredients: localizedList(b.ingredients, 'Nguyên liệu', 50, 500),
    isSignature: boolean(b.isSignature, 'Món đặc trưng', false), isFeatured: boolean(b.isFeatured, 'Nổi bật', false), isAvailable: boolean(b.isAvailable, 'Còn món', true),
    ...(b.preparationNote == null ? {} : { preparationNote: localized(b.preparationNote, 'Lưu ý', 2000) }) };
}
export function branch(value: unknown): Branch {
  const b = object(value, ['id', 'code', 'name', 'address', 'district', 'phone', 'openingHours', 'morningSlot', 'afternoonSlot', 'mapEmbedUrl', 'googleMapsLink', 'highlight', 'isOriginal']);
  return { id: id(b.id), code: text(b.code, 'Mã cơ sở', 30), name: localized(b.name, 'Tên cơ sở', 200), address: text(b.address, 'Địa chỉ', 500), district: text(b.district, 'Quận', 100), phone: phone(b.phone),
    openingHours: text(b.openingHours, 'Giờ mở cửa', 200), morningSlot: text(b.morningSlot, 'Ca sáng', 100), afternoonSlot: text(b.afternoonSlot, 'Ca chiều', 100),
    mapEmbedUrl: url(b.mapEmbedUrl, 'Bản đồ nhúng'), googleMapsLink: url(b.googleMapsLink, 'Bản đồ'), highlight: localized(b.highlight, 'Giới thiệu cơ sở', 2000), isOriginal: boolean(b.isOriginal, 'Cơ sở gốc', false) };
}
export function article(value: unknown): Article {
  const b = object(value, ['id', 'title', 'excerpt', 'content', 'date', 'readTime', 'category', 'image', 'author', 'isHeroArticle']);
  return { id: id(b.id), title: localized(b.title, 'Tiêu đề', 300), excerpt: localized(b.excerpt, 'Tóm tắt', 2000), content: localizedList(b.content, 'Nội dung', 100, 10000),
    date: text(b.date, 'Ngày bài viết', 100), readTime: text(b.readTime, 'Thời gian đọc', 100), category: localized(b.category, 'Chuyên mục', 100), image: url(b.image, 'Ảnh', true),
    author: text(b.author, 'Tác giả', 200), isHeroArticle: boolean(b.isHeroArticle, 'Bài nổi bật', false) };
}
export const orderTransitions = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: [] } as const;
export function canTransitionOrder(from: string, to: string): boolean {
  return from in orderTransitions && (orderTransitions[from as keyof typeof orderTransitions] as readonly string[]).includes(to);
}
