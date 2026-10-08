import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { Dish, Branch, Article, ReservationFormData } from '../types';
import { AdminDish, AdminReservation, AdminInquiry, SecurityLog } from './adminStore';

// Retrieve credentials from environment variables or custom local config
const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Allow runtime override via localStorage for demo / live testing if desired
  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = (localStorage.getItem('PHO_THIN_SUPABASE_URL') || '').trim();
    storedKey = (localStorage.getItem('PHO_THIN_SUPABASE_KEY') || '').trim();
  } catch (e) {
    // Ignore storage restrictions
  }

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co')
  );

  return { url, anonKey, isConfigured };
};

const initialConfig = getSupabaseConfig();

// Initialize the Supabase client safely
export const supabase: SupabaseClient | null = initialConfig.isConfigured
  ? createClient(initialConfig.url, initialConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured && supabase !== null;
};

export const getSupabaseConfigInfo = () => {
  const cfg = getSupabaseConfig();
  return {
    isConfigured: cfg.isConfigured,
    url: cfg.url ? `${cfg.url.slice(0, 15)}...${cfg.url.slice(-10)}` : 'Chưa cấu hình',
    hasKey: Boolean(cfg.anonKey),
  };
};

export const setCustomSupabaseCredentials = (url: string, anonKey: string): boolean => {
  try {
    if (url && anonKey) {
      localStorage.setItem('PHO_THIN_SUPABASE_URL', url.trim());
      localStorage.setItem('PHO_THIN_SUPABASE_KEY', anonKey.trim());
    } else {
      localStorage.removeItem('PHO_THIN_SUPABASE_URL');
      localStorage.removeItem('PHO_THIN_SUPABASE_KEY');
    }
    // Reload page to re-initialize client
    window.location.reload();
    return true;
  } catch {
    return false;
  }
};

// ==============================================================================
// SUPABASE DATABASE OPERATIONS
// ==============================================================================

/**
 * DISHES: Fetch, Insert, Update, Toggle Availability
 */
export async function dbFetchDishes(): Promise<AdminDish[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('is_signature', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((d: any) => ({
      id: d.id,
      category: d.category,
      name: d.name,
      price: Number(d.price),
      formattedPrice: d.formatted_price || d.price.toLocaleString('vi-VN'),
      image: d.image,
      shortDescription: d.short_description,
      fullDescription: d.full_description,
      ingredients: d.ingredients,
      isSignature: Boolean(d.is_signature),
      isFeatured: Boolean(d.is_featured),
      isAvailable: d.is_available !== false,
      preparationNote: d.preparation_note || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch dishes:', err);
    return null;
  }
}

export async function dbUpsertDish(dish: AdminDish): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: dish.id,
      category: dish.category,
      name: dish.name,
      price: dish.price,
      formatted_price: dish.formattedPrice,
      image: dish.image,
      short_description: dish.shortDescription,
      full_description: dish.fullDescription,
      ingredients: dish.ingredients,
      is_signature: Boolean(dish.isSignature),
      is_featured: Boolean(dish.isFeatured),
      is_available: Boolean(dish.isAvailable),
      preparation_note: dish.preparationNote || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('dishes').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to upsert dish:', err);
    return false;
  }
}

export async function dbToggleDishAvailability(id: string, isAvailable: boolean): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to toggle dish availability:', err);
    return false;
  }
}

export async function dbDeleteDish(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('dishes').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete dish:', err);
    return false;
  }
}

/**
 * BRANCHES: Fetch and Update
 */
export async function dbFetchBranches(): Promise<Branch[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('branches').select('*').order('code', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((b: any) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      district: b.district,
      phone: b.phone,
      openingHours: b.opening_hours,
      morningSlot: b.morning_slot,
      afternoonSlot: b.afternoon_slot,
      mapEmbedUrl: b.map_embed_url,
      googleMapsLink: b.google_maps_link,
      highlight: b.highlight,
      isOriginal: Boolean(b.is_original),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch branches:', err);
    return null;
  }
}

export async function dbUpdateBranch(branch: Branch): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: branch.id,
      code: branch.code,
      name: branch.name,
      address: branch.address,
      district: branch.district,
      phone: branch.phone,
      opening_hours: branch.openingHours,
      morning_slot: branch.morningSlot,
      afternoon_slot: branch.afternoonSlot,
      map_embed_url: branch.mapEmbedUrl,
      google_maps_link: branch.googleMapsLink,
      highlight: branch.highlight,
      is_original: Boolean(branch.isOriginal),
    };
    const { error } = await supabase.from('branches').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to update branch:', err);
    return false;
  }
}

/**
 * ARTICLES: Fetch, Upsert, Delete
 */
export async function dbFetchArticles(): Promise<Article[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      date: a.date,
      readTime: a.read_time,
      category: a.category,
      image: a.image,
      author: a.author,
      isHeroArticle: Boolean(a.is_hero_article),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch articles:', err);
    return null;
  }
}

export async function dbUpsertArticle(article: Article): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      date: article.date,
      read_time: article.readTime,
      category: article.category,
      image: article.image,
      author: article.author,
      is_hero_article: Boolean(article.isHeroArticle),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('articles').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to upsert article:', err);
    return false;
  }
}

export async function dbDeleteArticle(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete article:', err);
    return false;
  }
}

/**
 * RESERVATIONS: Fetch, Insert, Update Status, Delete
 */
export async function dbFetchReservations(): Promise<AdminReservation[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return null;

    return data.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      phone: r.phone,
      email: r.email || '',
      reservationDate: r.reservation_date,
      reservationTime: r.reservation_time,
      partySize: Number(r.party_size),
      branchId: r.branch_id || '',
      branchName: r.branch_name,
      notes: r.notes || '',
      status: r.status,
      createdAt: new Date(r.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(r.created_at).toLocaleDateString('vi-VN'),
      isWalkIn: Boolean(r.is_walk_in),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch reservations:', err);
    return null;
  }
}

export async function dbInsertReservation(reservation: AdminReservation): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: reservation.id,
      full_name: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email || null,
      reservation_date: reservation.reservationDate,
      reservation_time: reservation.reservationTime,
      party_size: reservation.partySize,
      branch_id: reservation.branchId || null,
      branch_name: reservation.branchName,
      notes: reservation.notes || '',
      status: reservation.status,
      is_walk_in: Boolean(reservation.isWalkIn),
    };
    const { error } = await supabase.from('reservations').insert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to insert reservation:', err);
    return false;
  }
}

export async function dbUpdateReservationStatus(id: string, status: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to update reservation status:', err);
    return false;
  }
}

export async function dbDeleteReservation(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete reservation:', err);
    return false;
  }
}

/**
 * INQUIRIES: Fetch, Insert, Update Status
 */
export async function dbFetchInquiries(): Promise<AdminInquiry[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data) return null;

    return data.map((i: any) => ({
      id: i.id,
      type: i.type,
      fullName: i.full_name,
      phone: i.phone,
      email: i.email || undefined,
      position: i.position || undefined,
      message: i.message || undefined,
      status: i.status,
      createdAt: new Date(i.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(i.created_at).toLocaleDateString('vi-VN'),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch inquiries:', err);
    return null;
  }
}

export async function dbInsertInquiry(inquiry: AdminInquiry): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: inquiry.id,
      type: inquiry.type,
      full_name: inquiry.fullName,
      phone: inquiry.phone,
      email: inquiry.email || null,
      position: inquiry.position || null,
      message: inquiry.message || null,
      status: inquiry.status,
    };
    const { error } = await supabase.from('inquiries').insert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to insert inquiry:', err);
    return false;
  }
}

export async function dbUpdateInquiryStatus(id: string, status: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to update inquiry status:', err);
    return false;
  }
}

/**
 * SECURITY LOGS: Fetch, Insert
 */
export async function dbFetchSecurityLogs(): Promise<SecurityLog[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    if (!data) return null;

    return data.map((l: any) => ({
      id: l.id,
      type: l.type,
      details: l.details,
      device: l.device,
      timestamp: new Date(l.created_at).toLocaleTimeString('vi-VN') + ' ' + new Date(l.created_at).toLocaleDateString('vi-VN'),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch security logs:', err);
    return null;
  }
}

export async function dbInsertSecurityLog(log: SecurityLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: log.id,
      type: log.type,
      details: log.details,
      device: log.device,
    };
    const { error } = await supabase.from('security_logs').insert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to insert security log:', err);
    return false;
  }
}

/**
 * SUPABASE STORAGE: Image Upload
 */
export async function uploadImageToStorage(file: File, folder = 'uploads'): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('pho-thin-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('pho-thin-assets').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage] Upload error:', err);
    return null;
  }
}

/**
 * SUPABASE AUTHENTICATION
 */
export async function supabaseSignIn(email: string, pass: string): Promise<{ user: User | null; session: Session | null; error: any }> {
  if (!supabase) {
    return { user: null, session: null, error: new Error('Supabase client is not configured') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  return { user: data.user, session: data.session, error };
}

export async function supabaseSignOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) {
    return {
      ok: false,
      message: 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY',
    };
  }
  try {
    const { count, error } = await supabase.from('branches').select('*', { count: 'exact', head: true });
    if (error) {
      return { ok: false, message: `Lỗi kết nối: ${error.message}` };
    }
    return { ok: true, message: `Kết nối thành công! Đã phát hiện ${count ?? 0} bản ghi cơ sở.` };
  } catch (err: any) {
    return { ok: false, message: `Lỗi ngoại lệ: ${err?.message || 'Không thể kết nối'}` };
  }
}
