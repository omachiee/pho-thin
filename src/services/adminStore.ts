import { Dish, Article, Branch, ReservationFormData } from '../types';
import { DISHES } from '../data/dishes';
import { ARTICLES } from '../data/news';
import { BRANCHES } from '../data/branches';
import {
  supabase,
  isSupabaseConfigured,
  dbFetchDishes,
  dbUpsertDish,
  dbToggleDishAvailability,
  dbDeleteDish,
  dbFetchBranches,
  dbUpdateBranch,
  dbFetchArticles,
  dbUpsertArticle,
  dbDeleteArticle,
  dbFetchReservations,
  dbInsertReservation,
  dbUpdateReservationStatus,
  dbDeleteReservation,
  dbFetchInquiries,
  dbInsertInquiry,
  dbUpdateInquiryStatus,
  dbFetchSecurityLogs,
  dbInsertSecurityLog,
  supabaseSignOut,
} from './supabase';


export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AdminReservation {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  branchId: string;
  branchName: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
  isWalkIn?: boolean;
}

export interface AdminDish extends Dish {
  isAvailable: boolean;
}

export interface AdminInquiry {
  id: string;
  type: 'inquiry' | 'recruitment';
  fullName: string;
  phone: string;
  email?: string;
  position?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'login_success' | 'login_failed' | 'password_changed' | 'pin_changed' | 'dish_status_toggled' | 'reservation_status_changed' | 'lockout_triggered';
  details: string;
  device: string;
}

export interface AdminSecurityConfig {
  username: string;
  passwordHash: string; // Plain/Base64 or salt-simulated for secure client storage
  pinCode: string; // 6 digits (default: "195570")
  sessionTimeoutMinutes: number; // default: 15
  failedAttempts: number;
  lockedUntil: number | null; // timestamp ms
  maintenanceMode: boolean;
}

const STORAGE_KEY = 'pho_thin_bo_ho_admin_data_v1';
const AUTH_SESSION_KEY = 'pho_thin_bo_ho_admin_session_v1';

// Initial realistic reservations
const INITIAL_RESERVATIONS: AdminReservation[] = [
  {
    id: 'PTBH-2026-8812',
    fullName: 'Nguyễn Hoàng Long',
    phone: '0912345678',
    email: 'hoanglong.ng@gmail.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '11:30',
    partySize: 4,
    branchId: 'cs1-dinh-tien-hoang',
    branchName: 'CS1 - 61 Đinh Tiên Hoàng (Gốc)',
    notes: 'Bàn ngồi nhìn ra Hồ Gươm, gọi trước 4 bát phở Tái Chín đặc sản.',
    status: 'pending',
    createdAt: '10:15 - Hôm nay',
  },
  {
    id: 'PTBH-2026-7521',
    fullName: 'Trần Thuỳ Dung',
    phone: '0988776655',
    email: 'thuydung.tran@outlook.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '12:00',
    partySize: 6,
    branchId: 'cs2-hang-tre',
    branchName: 'CS2 - 01 Hàng Tre (Tầng 1)',
    notes: 'Gia đình có người cao tuổi, cần chỗ ngồi thoáng tầng 1.',
    status: 'confirmed',
    createdAt: '09:40 - Hôm nay',
  },
  {
    id: 'PTBH-2026-6430',
    fullName: 'David Sterling (USA)',
    phone: '0934112233',
    email: 'david.traveler@gmail.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '18:30',
    partySize: 2,
    branchId: 'cs1-dinh-tien-hoang',
    branchName: 'CS1 - 61 Đinh Tiên Hoàng (Gốc)',
    notes: 'Tourists wanting to try authentic US-DPRK summit pho recipe.',
    status: 'confirmed',
    createdAt: '08:20 - Hôm nay',
  },
  {
    id: 'PTBH-2026-5129',
    fullName: 'Vũ Minh Anh',
    phone: '0903456789',
    email: 'minhanh.vu@techcorp.vn',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '08:00',
    partySize: 3,
    branchId: 'cs3-hang-tre-t2',
    branchName: 'CS3 - 01 Hàng Tre (Tầng 2)',
    notes: 'Khách đối tác ăn sáng nhanh trước giờ họp.',
    status: 'completed',
    createdAt: '07:15 - Hôm nay',
  },
  {
    id: 'PTBH-2026-4411',
    fullName: 'Phạm Đức Duy',
    phone: '0977654321',
    email: 'ducduy.p@gmail.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    partySize: 8,
    branchId: 'cs4-tran-phu-ha-dong',
    branchName: 'CS4 - 150 Trần Phú (Hà Đông)',
    notes: 'Liên hoan nhóm bạn 8 người, gọi quẩy giòn và trà đá.',
    status: 'pending',
    createdAt: '09:05 - Hôm nay',
  },
  {
    id: 'PTBH-2026-3190',
    fullName: 'Lê Hoàng Nam',
    phone: '0945678123',
    email: 'nam.lehoang@yahoo.com',
    reservationDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    reservationTime: '12:30',
    partySize: 2,
    branchId: 'cs1-dinh-tien-hoang',
    branchName: 'CS1 - 61 Đinh Tiên Hoàng (Gốc)',
    notes: 'Đã hoàn thành dùng bữa, thanh toán bằng chuyển khoản.',
    status: 'completed',
    createdAt: 'Hôm qua',
  },
  {
    id: 'PTBH-2026-2088',
    fullName: 'Đỗ Thị Mai Hương',
    phone: '0918765432',
    email: 'maihuong.do@agency.vn',
    reservationDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    reservationTime: '19:30',
    partySize: 5,
    branchId: 'cs2-hang-tre',
    branchName: 'CS2 - 01 Hàng Tre (Tầng 1)',
    notes: 'Khách bận đột xuất huỷ trước 2 tiếng.',
    status: 'cancelled',
    createdAt: '2 ngày trước',
  },
];

// Initial realistic customer inquiries
const INITIAL_INQUIRIES: AdminInquiry[] = [
  {
    id: 'INQ-9901',
    type: 'inquiry',
    fullName: 'Công ty Lữ Hành Saigon Tourist',
    phone: '0903888999',
    email: 'tourhanoi@saigontourist.com',
    message: 'Chúng tôi muốn đặt thực đơn phở truyền thống cố định cho đoàn 40 khách quốc tế vào sáng thứ Ba hàng tuần tại CS 61 Đinh Tiên Hoàng.',
    status: 'new',
    createdAt: '11:15 - Hôm nay',
  },
  {
    id: 'INQ-9844',
    type: 'recruitment',
    fullName: 'Hoàng Quốc Việt',
    phone: '0981223344',
    email: 'viet.hq98@gmail.com',
    position: 'Nhân viên chần phở & Phụ bếp',
    message: 'Em có 4 năm kinh nghiệm làm bếp truyền thống tại Hà Nội, mong muốn ứng tuyển ca sáng tại cơ sở Hàng Tre.',
    status: 'contacted',
    createdAt: 'Hôm qua',
  },
  {
    id: 'INQ-9750',
    type: 'inquiry',
    fullName: 'Trần Bích Thảo',
    phone: '0912000111',
    email: 'thao.tb@vnu.edu.vn',
    message: 'Cho tôi hỏi cơ sở 150 Trần Phú Hà Đông có xuất hóa đơn VAT điện tử cho đoàn khách cơ quan không ạ?',
    status: 'resolved',
    createdAt: '3 ngày trước',
  },
];

export interface AdminStoreData {
  reservations: AdminReservation[];
  dishes: AdminDish[];
  articles: Article[];
  branches: Branch[];
  inquiries: AdminInquiry[];
  securityConfig: AdminSecurityConfig;
  securityLogs: SecurityLog[];
}

class AdminStoreService {
  private data: AdminStoreData;
  private isSyncing = false;
  private realtimeChannel: any = null;

  constructor() {
    this.data = this.loadData();
    // Start background sync from Supabase if connected
    this.syncFromSupabase();
  }

  private loadData(): AdminStoreData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // ensure default dishes merged if missing
        if (!parsed.dishes || parsed.dishes.length === 0) {
          parsed.dishes = DISHES.map((d) => ({ ...d, isAvailable: true }));
        }
        return parsed;
      }
    } catch {
      // fallback
    }

    // Default initialization
    const initialData: AdminStoreData = {
      reservations: INITIAL_RESERVATIONS,
      dishes: DISHES.map((d) => ({ ...d, isAvailable: true })),
      articles: ARTICLES,
      branches: BRANCHES,
      inquiries: INITIAL_INQUIRIES,
      securityConfig: {
        username: 'admin_phothin',
        // Default Master Password: PhoThin1955@BoHo
        passwordHash: 'PhoThin1955@BoHo',
        // Default Security PIN: 195570 (Năm 1955 - 70 năm)
        pinCode: '195570',
        sessionTimeoutMinutes: 15,
        failedAttempts: 0,
        lockedUntil: null,
        maintenanceMode: false,
      },
      securityLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString('vi-VN') + ' - Khởi tạo hệ thống',
          type: 'login_success',
          details: 'Khởi tạo tường lửa và hệ thống bảo mật quản trị Phở Thìn Bờ Hồ',
          device: 'System Gateway / Node Protected',
        },
      ],
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: AdminStoreData) {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('phothin_store_updated'));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- SUPABASE SYNC & REALTIME ---
  public async syncFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured() || this.isSyncing) return false;
    this.isSyncing = true;

    try {
      // Concurrently fetch all datasets from Supabase
      const [dbDishes, dbBranches, dbArticles, dbRes, dbInq, dbLogs] = await Promise.all([
        dbFetchDishes(),
        dbFetchBranches(),
        dbFetchArticles(),
        dbFetchReservations(),
        dbFetchInquiries(),
        dbFetchSecurityLogs(),
      ]);

      let hasChanges = false;

      if (dbDishes && dbDishes.length > 0) {
        this.data.dishes = dbDishes;
        hasChanges = true;
      }
      if (dbBranches && dbBranches.length > 0) {
        this.data.branches = dbBranches;
        hasChanges = true;
      }
      if (dbArticles && dbArticles.length > 0) {
        this.data.articles = dbArticles;
        hasChanges = true;
      }
      if (dbRes && dbRes.length > 0) {
        this.data.reservations = dbRes;
        hasChanges = true;
      }
      if (dbInq && dbInq.length > 0) {
        this.data.inquiries = dbInq;
        hasChanges = true;
      }
      if (dbLogs && dbLogs.length > 0) {
        this.data.securityLogs = dbLogs;
        hasChanges = true;
      }

      if (hasChanges) {
        this.saveData(this.data);
      }

      this.setupRealtimeSubscription();
      return true;
    } catch (err) {
      console.warn('[AdminStore] Supabase sync caught:', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private setupRealtimeSubscription() {
    if (!supabase || this.realtimeChannel) return;
    try {
      this.realtimeChannel = supabase
        .channel('phothin-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          async () => {
            const fresh = await dbFetchReservations();
            if (fresh) {
              this.data.reservations = fresh;
              this.saveData(this.data);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dishes' },
          async () => {
            const fresh = await dbFetchDishes();
            if (fresh) {
              this.data.dishes = fresh;
              this.saveData(this.data);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inquiries' },
          async () => {
            const fresh = await dbFetchInquiries();
            if (fresh) {
              this.data.inquiries = fresh;
              this.saveData(this.data);
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  // --- PUBLIC GETTERS ---
  public getData(): AdminStoreData {
    return this.data;
  }

  public getDishes(): AdminDish[] {
    return this.data.dishes;
  }

  public getReservations(): AdminReservation[] {
    return this.data.reservations;
  }

  public getArticles(): Article[] {
    return this.data.articles;
  }

  public getBranches(): Branch[] {
    return this.data.branches;
  }

  public getInquiries(): AdminInquiry[] {
    return this.data.inquiries;
  }

  public getSecurityLogs(): SecurityLog[] {
    return this.data.securityLogs;
  }

  public getSecurityConfig(): AdminSecurityConfig {
    return this.data.securityConfig;
  }

  // --- SECURITY / AUTH METHODS ---
  public isLocked(): { locked: boolean; remainingSeconds: number } {
    const { lockedUntil } = this.data.securityConfig;
    if (!lockedUntil) return { locked: false, remainingSeconds: 0 };
    const now = Date.now();
    if (now < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }
    // Expired lock, reset
    this.data.securityConfig.lockedUntil = null;
    this.data.securityConfig.failedAttempts = 0;
    this.saveData(this.data);
    return { locked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(device: string): { locked: boolean; attemptsLeft: number } {
    const config = this.data.securityConfig;
    config.failedAttempts += 1;
    let locked = false;

    if (config.failedAttempts >= 5) {
      config.lockedUntil = Date.now() + 60 * 1000; // 60 seconds lockout
      locked = true;
      this.addLog('lockout_triggered', 'Tạm khóa 60 giây do nhập sai thông tin 5 lần liên tiếp', device);
    } else {
      this.addLog('login_failed', `Đăng nhập thất bại (Lần ${config.failedAttempts}/5)`, device);
    }

    this.saveData(this.data);
    return {
      locked,
      attemptsLeft: Math.max(0, 5 - config.failedAttempts),
    };
  }

  public authenticate(username: string, pass: string, pin: string, device: string): boolean {
    const lockStatus = this.isLocked();
    if (lockStatus.locked) {
      return false;
    }

    const config = this.data.securityConfig;
    const isUserValid = username.trim().toLowerCase() === config.username.trim().toLowerCase();
    const isPassValid = pass === config.passwordHash;
    const isPinValid = pin.trim() === config.pinCode.trim();

    if (isUserValid && isPassValid && isPinValid) {
      // Success! Reset attempts
      config.failedAttempts = 0;
      config.lockedUntil = null;
      this.addLog('login_success', `Đăng nhập quản trị thành công qua phiên bảo mật`, device);
      this.saveData(this.data);

      // Save active session
      const sessionExpiry = Date.now() + config.sessionTimeoutMinutes * 60 * 1000;
      sessionStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({
          token: 'auth_' + Math.random().toString(36).substring(2),
          expiresAt: sessionExpiry,
          username: config.username,
        })
      );

      return true;
    }

    this.recordFailedAttempt(device);
    return false;
  }

  public isAuthenticated(): boolean {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public logout(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    this.addLog('login_success', 'Quản trị viên đã đăng xuất an toàn khỏi hệ thống', 'Client Logout');
    this.saveData(this.data);
    supabaseSignOut().catch(() => {});
  }


  public updateSecurityCredentials(newUsername?: string, newPassword?: string, newPin?: string, newTimeout?: number): boolean {
    if (newUsername && newUsername.trim()) {
      this.data.securityConfig.username = newUsername.trim();
    }
    if (newPassword && newPassword.trim()) {
      this.data.securityConfig.passwordHash = newPassword.trim();
      this.addLog('password_changed', 'Đã đổi Mật khẩu quản trị thành công', 'Admin Security Panel');
    }
    if (newPin && newPin.trim().length === 6) {
      this.data.securityConfig.pinCode = newPin.trim();
      this.addLog('pin_changed', 'Đã cập nhật mã PIN cấp 2 (6 số)', 'Admin Security Panel');
    }
    if (newTimeout && newTimeout >= 5) {
      this.data.securityConfig.sessionTimeoutMinutes = newTimeout;
    }
    this.saveData(this.data);
    return true;
  }

  private addLog(type: SecurityLog['type'], details: string, device: string) {
    const newLog: SecurityLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      type,
      details,
      device,
    };
    this.data.securityLogs.unshift(newLog);
    if (this.data.securityLogs.length > 50) {
      this.data.securityLogs.pop();
    }
    // Fire to Supabase asynchronously
    dbInsertSecurityLog(newLog).catch(() => {});
  }

  // --- RESERVATION OPERATIONS ---
  public addReservationFromClient(formData: ReservationFormData, branch: Branch): AdminReservation {
    const code = `PTBH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdminReservation = {
      id: code,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      reservationDate: formData.reservationDate,
      reservationTime: formData.reservationTime,
      partySize: Number(formData.partySize) || 2,
      branchId: branch.id,
      branchName: `${branch.code}: ${branch.name.vi}`,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay',
    };

    this.data.reservations.unshift(newRecord);
    this.saveData(this.data);
    // Persist to Supabase
    dbInsertReservation(newRecord).catch((err) => console.warn('[Supabase Insert Reservation Error]', err));
    return newRecord;
  }

  public createManualReservation(record: Omit<AdminReservation, 'id' | 'createdAt'>): AdminReservation {
    const code = `PTBH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdminReservation = {
      ...record,
      id: code,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Đặt tại quầy',
      isWalkIn: true,
    };
    this.data.reservations.unshift(newRecord);
    this.saveData(this.data);
    // Persist to Supabase
    dbInsertReservation(newRecord).catch((err) => console.warn('[Supabase Insert Reservation Error]', err));
    return newRecord;
  }

  public updateReservationStatus(id: string, status: ReservationStatus): boolean {
    const item = this.data.reservations.find((r) => r.id === id);
    if (item) {
      item.status = status;
      this.addLog(
        'reservation_status_changed',
        `Cập nhật đơn đặt bàn #${id} -> Trạng thái: ${status}`,
        'Admin Portal'
      );
      this.saveData(this.data);
      // Persist to Supabase
      dbUpdateReservationStatus(id, status).catch((err) => console.warn('[Supabase Update Status Error]', err));
      return true;
    }
    return false;
  }

  public deleteReservation(id: string): boolean {
    const index = this.data.reservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.data.reservations.splice(index, 1);
      this.saveData(this.data);
      // Persist to Supabase
      dbDeleteReservation(id).catch((err) => console.warn('[Supabase Delete Reservation Error]', err));
      return true;
    }
    return false;
  }

  // --- DISHES OPERATIONS ---
  public toggleDishAvailability(id: string): boolean {
    const dish = this.data.dishes.find((d) => d.id === id);
    if (dish) {
      dish.isAvailable = !dish.isAvailable;
      this.addLog(
        'dish_status_toggled',
        `Đổi trạng thái món ${dish.name.vi}: ${dish.isAvailable ? 'Còn hàng' : 'Tạm hết món'}`,
        'Admin Menu Manager'
      );
      this.saveData(this.data);
      // Persist to Supabase
      dbToggleDishAvailability(id, dish.isAvailable).catch((err) => console.warn('[Supabase Toggle Dish Error]', err));
      return true;
    }
    return false;
  }

  public updateDish(updated: AdminDish): boolean {
    const index = this.data.dishes.findIndex((d) => d.id === updated.id);
    if (index !== -1) {
      this.data.dishes[index] = updated;
      this.saveData(this.data);
      // Persist to Supabase
      dbUpsertDish(updated).catch((err) => console.warn('[Supabase Upsert Dish Error]', err));
      return true;
    }
    return false;
  }

  public addDish(newDish: AdminDish): boolean {
    this.data.dishes.push(newDish);
    this.saveData(this.data);
    // Persist to Supabase
    dbUpsertDish(newDish).catch((err) => console.warn('[Supabase Upsert Dish Error]', err));
    return true;
  }

  public deleteDish(id: string): boolean {
    const index = this.data.dishes.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.dishes.splice(index, 1);
      this.saveData(this.data);
      // Persist to Supabase
      dbDeleteDish(id).catch((err) => console.warn('[Supabase Delete Dish Error]', err));
      return true;
    }
    return false;
  }

  // --- INQUIRIES & RECRUITMENT OPERATIONS ---
  public addInquiry(inquiry: Omit<AdminInquiry, 'id' | 'createdAt' | 'status'>): AdminInquiry {
    const newInquiry: AdminInquiry = {
      ...inquiry,
      id: 'INQ-' + Date.now().toString().slice(-4),
      status: 'new',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Vừa gửi',
    };
    this.data.inquiries.unshift(newInquiry);
    this.saveData(this.data);
    // Persist to Supabase
    dbInsertInquiry(newInquiry).catch((err) => console.warn('[Supabase Insert Inquiry Error]', err));
    return newInquiry;
  }

  public updateInquiryStatus(id: string, status: AdminInquiry['status']): boolean {
    const item = this.data.inquiries.find((i) => i.id === id);
    if (item) {
      item.status = status;
      this.saveData(this.data);
      // Persist to Supabase
      dbUpdateInquiryStatus(id, status).catch((err) => console.warn('[Supabase Update Inquiry Status Error]', err));
      return true;
    }
    return false;
  }

  // --- BRANCHES OPERATIONS ---
  public updateBranch(updated: Branch): boolean {
    const index = this.data.branches.findIndex((b) => b.id === updated.id);
    if (index !== -1) {
      this.data.branches[index] = updated;
      this.saveData(this.data);
      // Persist to Supabase
      dbUpdateBranch(updated).catch((err) => console.warn('[Supabase Update Branch Error]', err));
      return true;
    }
    return false;
  }

  // --- ARTICLES OPERATIONS ---
  public addArticle(newArticle: Article): boolean {
    this.data.articles.unshift(newArticle);
    this.saveData(this.data);
    // Persist to Supabase
    dbUpsertArticle(newArticle).catch((err) => console.warn('[Supabase Upsert Article Error]', err));
    return true;
  }

  public updateArticle(updated: Article): boolean {
    const index = this.data.articles.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      this.data.articles[index] = updated;
      this.saveData(this.data);
      // Persist to Supabase
      dbUpsertArticle(updated).catch((err) => console.warn('[Supabase Upsert Article Error]', err));
      return true;
    }
    return false;
  }

  public deleteArticle(id: string): boolean {
    const index = this.data.articles.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.data.articles.splice(index, 1);
      this.saveData(this.data);
      // Persist to Supabase
      dbDeleteArticle(id).catch((err) => console.warn('[Supabase Delete Article Error]', err));
      return true;
    }
    return false;
  }
}

export const adminStore = new AdminStoreService();
