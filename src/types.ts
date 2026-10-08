export type Language = 'vi' | 'en' | 'zh' | 'ko';

export type PageView = 'home' | 'about' | 'menu' | 'dish-detail' | 'reservation' | 'news' | 'partners' | 'contact';

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
