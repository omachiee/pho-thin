import 'server-only';
import type { AdminDish, AdminInquiry, AdminReservation, Article, Branch, Order } from '../../types';

// Only database rows reach these mappers. Request bodies go through validation first.
type Row = Record<string, any>;
const imagePath = (value: string): string => value.replace(/^\/src\/assets\/images\//, '/assets/');
export function mapDish(d: Row): AdminDish {
  return { id: d.id, category: d.category, name: d.name, price: Number(d.price), formattedPrice: d.formatted_price,
    image: imagePath(d.image), shortDescription: d.short_description, fullDescription: d.full_description, ingredients: d.ingredients,
    isSignature: Boolean(d.is_signature), isFeatured: Boolean(d.is_featured), isAvailable: d.is_available !== false,
    ...(d.preparation_note ? { preparationNote: d.preparation_note } : {}) };
}
export function dishRow(d: AdminDish) {
  return { id: d.id, category: d.category, name: d.name, price: d.price, formatted_price: d.formattedPrice, image: d.image,
    short_description: d.shortDescription, full_description: d.fullDescription, ingredients: d.ingredients,
    is_signature: d.isSignature, is_featured: d.isFeatured, is_available: d.isAvailable, preparation_note: d.preparationNote || null };
}
export function mapBranch(b: Row): Branch {
  return { id: b.id, code: b.code, name: b.name, address: b.address, district: b.district, phone: b.phone,
    openingHours: b.opening_hours, morningSlot: b.morning_slot, afternoonSlot: b.afternoon_slot,
    mapEmbedUrl: b.map_embed_url, googleMapsLink: b.google_maps_link, highlight: b.highlight, isOriginal: Boolean(b.is_original) };
}
export function branchRow(b: Branch) {
  return { id: b.id, code: b.code, name: b.name, address: b.address, district: b.district, phone: b.phone,
    opening_hours: b.openingHours, morning_slot: b.morningSlot, afternoon_slot: b.afternoonSlot,
    map_embed_url: b.mapEmbedUrl, google_maps_link: b.googleMapsLink, highlight: b.highlight, is_original: b.isOriginal };
}
export function mapArticle(a: Row): Article {
  return { id: a.id, title: a.title, excerpt: a.excerpt, content: a.content, date: a.date, readTime: a.read_time,
    category: a.category, image: imagePath(a.image), author: a.author, isHeroArticle: Boolean(a.is_hero_article) };
}
export function articleRow(a: Article) {
  return { id: a.id, title: a.title, excerpt: a.excerpt, content: a.content, date: a.date, read_time: a.readTime,
    category: a.category, image: a.image, author: a.author, is_hero_article: a.isHeroArticle };
}
export function mapReservation(r: Row): AdminReservation {
  return { id: r.id, fullName: r.full_name, phone: r.phone, email: r.email || '', reservationDate: r.reservation_date,
    reservationTime: r.reservation_time, partySize: Number(r.party_size), branchId: r.branch_id || '', branchName: r.branch_name,
    notes: r.notes || '', status: r.status, createdAt: r.created_at, isWalkIn: Boolean(r.is_walk_in) };
}
export function mapInquiry(i: Row): AdminInquiry {
  return { id: i.id, type: i.type, fullName: i.full_name, phone: i.phone, email: i.email || '', position: i.position || '',
    message: i.message || '', status: i.status, createdAt: i.created_at };
}
export function mapOrder(o: Row): Order {
  return { id: o.id, fullName: o.full_name, phone: o.phone, branchId: o.branch_id, branchName: o.branch_name,
    pickupAt: o.pickup_at, notes: o.notes || '', total: Number(o.total), status: o.status, createdAt: o.created_at,
    items: (o.order_items || []).map((i: Row) => ({ dishId: i.dish_id, name: i.name, unitPrice: Number(i.unit_price), quantity: Number(i.quantity) })) };
}
