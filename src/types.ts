export type Language = 'vi' | 'en' | 'zh' | 'ko';

export type PageView = 'home' | 'about' | 'menu' | 'dish-detail' | 'reservation' | 'news' | 'partners' | 'contact' | 'checkout';

export interface Dish {
  id: string;
  name: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  category: 'pho' | 'drinks' | 'others';
  price: number;
  formattedPrice: string;
  image: string;
  shortDescription: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  fullDescription: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  ingredients: {
    vi: string[];
    en: string[];
    zh: string[];
    ko: string[];
  };
  isSignature?: boolean;
  isFeatured?: boolean;
  preparationNote?: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
}

export interface Branch {
  id: string;
  code: string;
  name: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  address: string;
  district: string;
  phone: string;
  openingHours: string;
  morningSlot: string;
  afternoonSlot: string;
  mapEmbedUrl: string;
  googleMapsLink: string;
  highlight: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  isOriginal?: boolean;
}

export interface Article {
  id: string;
  title: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  excerpt: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  content: {
    vi: string[];
    en: string[];
    zh: string[];
    ko: string[];
  };
  date: string;
  readTime: string;
  category: {
    vi: string;
    en: string;
    zh: string;
    ko: string;
  };
  image: string;
  author: string;
  isHeroArticle?: boolean;
}

export interface ReservationFormData {
  fullName: string;
  email: string;
  phone: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  branchId: string;
  notes: string;
}

export interface ReservationRecord {
  id: string;
  createdAt: string;
  data: ReservationFormData;
  branch: Branch;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export interface AdminReservation extends ReservationFormData {
  id: string;
  branchName: string;
  status: ReservationStatus;
  createdAt: string;
  isWalkIn?: boolean;
}
export interface AdminDish extends Dish { isAvailable: boolean }
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
export interface CartItem { dishId: string; quantity: number }
export interface OrderInput {
  fullName: string;
  phone: string;
  branchId: string;
  pickupAt: string;
  notes: string;
  items: CartItem[];
}
export interface OrderItem {
  dishId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export interface Order extends Omit<OrderInput, 'items'> {
  id: string;
  branchName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}
export interface Catalog {
  dishes: AdminDish[];
  branches: Branch[];
  articles: Article[];
}
export interface AdminSession { email: string }
