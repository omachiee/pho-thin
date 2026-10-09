import 'server-only';
import { NextResponse } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';
import { ApiError } from './validation';

export interface ApiContext { request: Request; cookies: { name: string; value: string; options: CookieOptions }[] }
export function assertOrigin(request: Request, configuredOrigin = process.env.APP_URL): void {
  let expected: string;
  try {
    const url = new URL(request.url);
    const host = request.headers.get('host');
    const forwardedProtocol = request.headers.get('x-forwarded-proto');
    const protocol = forwardedProtocol === 'https' || forwardedProtocol === 'http' ? `${forwardedProtocol}:` : url.protocol;
    expected = new URL(configuredOrigin || (host ? `${protocol}//${host}` : url.origin)).origin;
  } catch { throw new ApiError(503, 'Cấu hình địa chỉ ứng dụng không hợp lệ.'); }
  if (request.headers.get('origin') !== expected) throw new ApiError(403, 'Nguồn yêu cầu không được phép.');
}
export async function readJson(request: Request, maxBytes = 128 * 1024): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(400, 'Yêu cầu phải sử dụng application/json.');
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) throw new ApiError(400, 'Dữ liệu gửi lên quá lớn.');
  if (!request.body) throw new ApiError(400, 'Thiếu dữ liệu JSON.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new ApiError(400, 'Dữ liệu gửi lên quá lớn.'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
    catch { throw new ApiError(400, 'JSON không hợp lệ.'); }
  } finally { reader.releaseLock(); }
}
export async function handle(request: Request, action: (context: ApiContext) => Promise<unknown>): Promise<NextResponse> {
  const context: ApiContext = { request, cookies: [] };
  let response: NextResponse;
  try { response = NextResponse.json({ data: await action(context) }); }
  catch (error) {
    const safe = error instanceof ApiError ? error : new ApiError(503, 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.');
    response = NextResponse.json({ error: safe.message }, { status: safe.status });
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'Cookie');
  for (const cookie of context.cookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
