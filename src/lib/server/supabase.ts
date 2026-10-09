import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AdminSession } from '../../types';
import type { ApiContext } from './http';
import { ApiError } from './validation';

function configuration(service = false) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (service
    ? process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) throw new ApiError(503, 'Chưa cấu hình dịch vụ dữ liệu trên máy chủ.');
  try { const parsed = new URL(url); if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error(); }
  catch { throw new ApiError(503, 'Cấu hình dịch vụ dữ liệu không hợp lệ.'); }
  return { url, key };
}
export function publicClient(): SupabaseClient {
  const { url, key } = configuration();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export function serviceClient(): SupabaseClient {
  const { url, key } = configuration(true);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export async function cookieClient(context: ApiContext): Promise<SupabaseClient> {
  const { url, key } = configuration();
  const store = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
    cookies: {
      getAll: () => store.getAll(),
      setAll: values => {
        for (const cookie of values) {
          const options = { ...cookie.options, httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
          store.set(cookie.name, cookie.value, options);
          // Also attach refresh/removal cookies to error responses from this handler.
          context.cookies.push({ name: cookie.name, value: cookie.value, options });
        }
      },
    },
  });
}
export async function adminSession(client: SupabaseClient, required = true): Promise<AdminSession | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    if (error && !['AuthSessionMissingError', 'AuthApiError'].includes(error.name)) throw new ApiError(503, 'Không thể xác minh phiên đăng nhập.');
    if (error && 'status' in error && Number(error.status) >= 500) throw new ApiError(503, 'Không thể xác minh phiên đăng nhập.');
    if (required) throw new ApiError(401, 'Vui lòng đăng nhập quản trị.');
    return null;
  }
  const { data: allowed, error: roleError } = await client.rpc('is_admin');
  if (roleError) throw new ApiError(503, 'Không thể xác minh quyền quản trị.');
  if (allowed !== true) throw new ApiError(403, 'Tài khoản không có quyền quản trị.');
  return { email: data.user.email || '' };
}
export function databaseError(error: { code?: string } | null, fallback = 'Không thể lưu dữ liệu. Vui lòng thử lại.'): void {
  if (!error) return;
  if (['23503', '23505', '23514', '22023', 'P0001', '22P02'].includes(error.code || '')) throw new ApiError(400, error.code === '23503' ? 'Dữ liệu đang được sử dụng hoặc cơ sở/món không tồn tại.' : 'Dữ liệu không hợp lệ hoặc trạng thái đã thay đổi.');
  if (error.code === '42501') throw new ApiError(403, 'Không có quyền thực hiện thao tác này.');
  throw new ApiError(503, fallback);
}
