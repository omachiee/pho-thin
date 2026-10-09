import type {
  AdminDish, AdminInquiry, AdminReservation, AdminSession, Article, Branch,
  Catalog, Order, OrderInput, OrderStatus, ReservationFormData, ReservationStatus,
} from '../types';
import { DISHES } from '../data/dishes';
import { ARTICLES } from '../data/news';
import { BRANCHES } from '../data/branches';
import { apiRequest, ApiError } from './supabase';
export type { AdminDish, AdminInquiry, AdminReservation, Order, OrderStatus, ReservationStatus } from '../types';

export interface AdminStoreData extends Catalog {
  reservations: AdminReservation[];
  inquiries: AdminInquiry[];
  orders: Order[];
}
type Resource = keyof AdminStoreData;

class AdminStoreService {
  // ponytail: seed chỉ để xem giao diện khi chưa cấu hình; không giả lưu form/đơn.
  private data: AdminStoreData = {
    dishes: DISHES.map((dish) => ({ ...dish, isAvailable: true })),
    articles: ARTICLES,
    branches: BRANCHES,
    reservations: [], inquiries: [], orders: [],
  };
  private session: AdminSession | null = null;
  private error: string | null = null;
  private authVersion = 0;
  private initialization: Promise<void> | null = null;

  private notify() {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('phothin_store_updated'));
  }
  private clearPrivateData() {
    this.data.reservations = [];
    this.data.inquiries = [];
    this.data.orders = [];
    this.session = null;
    this.authVersion++;
  }
  getData() { return this.data; }
  getDishes() { return this.data.dishes; }
  getBranches() { return this.data.branches; }
  getArticles() { return this.data.articles; }
  getReservations() { return this.data.reservations; }
  getInquiries() { return this.data.inquiries; }
  getOrders() { return this.data.orders; }
  getSession() { return this.session; }
  getError() { return this.error; }
  isAuthenticated() { return this.session !== null; }

  initialize(): Promise<void> {
    return this.initialization ??= this.initializeData();
  }
  private async initializeData(): Promise<void> {
    // Discard obsolete local credentials/PII, never restore them as an Auth session.
    try {
      localStorage.removeItem('pho_thin_bo_ho_admin_data_v1');
      localStorage.removeItem('PHO_THIN_SUPABASE_URL');
      localStorage.removeItem('PHO_THIN_SUPABASE_KEY');
      sessionStorage.removeItem('pho_thin_bo_ho_admin_session_v1');
    } catch { /* Storage may be disabled. */ }
    try {
      this.session = await apiRequest<AdminSession | null>('/api/auth');
    } catch {
      this.clearPrivateData();
    }
    try { await this.syncFromSupabase(); }
    catch (error) {
      this.error = error instanceof Error ? error.message : 'Không thể tải dữ liệu.';
      this.notify();
    }
  }

  async syncFromSupabase(): Promise<boolean> {
    const version = this.authVersion;
    const catalog = await apiRequest<Catalog>('/api/catalog');
    Object.assign(this.data, catalog);
    if (this.session) {
      try {
        const [reservations, inquiries, orders] = await Promise.all([
          apiRequest<AdminReservation[]>('/api/admin/reservations'),
          apiRequest<AdminInquiry[]>('/api/admin/inquiries'),
          apiRequest<Order[]>('/api/admin/orders'),
        ]);
        if (version === this.authVersion && this.session) Object.assign(this.data, { reservations, inquiries, orders });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) this.clearPrivateData();
        this.notify();
        throw error;
      }
    }
    this.error = null;
    this.notify();
    return true;
  }

  async authenticate(email: string, password: string): Promise<boolean> {
    this.session = await apiRequest<AdminSession>('/api/auth', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    this.authVersion++;
    await this.syncFromSupabase();
    return true;
  }
  async logout(): Promise<void> {
    try { await apiRequest('/api/auth', { method: 'DELETE' }); }
    finally { this.clearPrivateData(); this.notify(); }
  }

  private async save<T extends { id: string }>(resource: Resource, method: string, input: unknown): Promise<T> {
    const version = this.authVersion;
    const record = await apiRequest<T>(`/api/admin/${resource}`, { method, body: JSON.stringify(input) });
    if (version !== this.authVersion || !this.session) return record;
    const list = this.data[resource] as { id: string }[];
    const index = list.findIndex((item) => item.id === record.id);
    if (index < 0) list.unshift(record); else list[index] = record;
    this.notify();
    return record;
  }
  private async remove(resource: Resource, id: string): Promise<boolean> {
    await apiRequest(`/api/admin/${resource}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const list = this.data[resource] as { id: string }[];
    const index = list.findIndex((item) => item.id === id);
    if (index >= 0) list.splice(index, 1);
    this.notify();
    return true;
  }
  async addReservationFromClient(form: ReservationFormData, _branch: Branch): Promise<AdminReservation> {
    const record = await apiRequest<AdminReservation>('/api/reservations', { method: 'POST', body: JSON.stringify(form) });
    // The public receipt is not added to a shared/private admin list.
    return record;
  }
  async createManualReservation(record: Omit<AdminReservation, 'id' | 'createdAt'>) {
    return this.save<AdminReservation>('reservations', 'POST', record);
  }
  async updateReservationStatus(id: string, status: ReservationStatus) {
    await this.save<AdminReservation>('reservations', 'PATCH', { id, status }); return true;
  }
  deleteReservation(id: string) { return this.remove('reservations', id); }
  async toggleDishAvailability(id: string) {
    const dish = this.data.dishes.find((item) => item.id === id);
    if (!dish) throw new Error('Không tìm thấy món.');
    await this.save<AdminDish>('dishes', 'PATCH', { id, isAvailable: !dish.isAvailable }); return true;
  }
  async updateDish(dish: AdminDish) { await this.save<AdminDish>('dishes', 'POST', dish); return true; }
  addDish(dish: AdminDish) { return this.updateDish(dish); }
  deleteDish(id: string) { return this.remove('dishes', id); }
  async updateBranch(branch: Branch) { await this.save<Branch>('branches', 'POST', branch); return true; }
  async updateArticle(article: Article) { await this.save<Article>('articles', 'POST', article); return true; }
  addArticle(article: Article) { return this.updateArticle(article); }
  deleteArticle(id: string) { return this.remove('articles', id); }
  async addInquiry(input: Omit<AdminInquiry, 'id' | 'createdAt' | 'status'>) {
    return apiRequest<AdminInquiry>('/api/inquiries', { method: 'POST', body: JSON.stringify(input) });
  }
  async updateInquiryStatus(id: string, status: AdminInquiry['status']) {
    await this.save<AdminInquiry>('inquiries', 'PATCH', { id, status }); return true;
  }
  async createOrder(input: OrderInput) {
    return apiRequest<Order>('/api/orders', { method: 'POST', body: JSON.stringify(input) });
  }
  async updateOrderStatus(id: string, status: OrderStatus) {
    await this.save<Order>('orders', 'PATCH', { id, status }); return true;
  }
}

export const adminStore = new AdminStoreService();
