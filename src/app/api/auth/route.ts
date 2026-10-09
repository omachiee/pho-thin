import { assertOrigin, handle, readJson } from '../../../lib/server/http';
import { adminSession, cookieClient } from '../../../lib/server/supabase';
import { ApiError, email, object } from '../../../lib/server/validation';

export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  return handle(request, async context => adminSession(await cookieClient(context), false));
}
export function POST(request: Request) {
  return handle(request, async context => {
    assertOrigin(request);
    const body = object(await readJson(request, 4096), ['email', 'password']);
    const loginEmail = email(body.email, true);
    if (typeof body.password !== 'string' || !body.password || body.password.length > 256) throw new ApiError(400, 'Mật khẩu không hợp lệ.');
    const client = await cookieClient(context);
    const { error } = await client.auth.signInWithPassword({ email: loginEmail, password: body.password });
    if (error) throw new ApiError(error.status && error.status >= 500 ? 503 : 401, 'Không thể đăng nhập. Kiểm tra email và mật khẩu hoặc thử lại.');
    try { return await adminSession(client); }
    catch (error) { await client.auth.signOut({ scope: 'local' }); throw error; }
  });
}
export function DELETE(request: Request) {
  return handle(request, async context => {
    assertOrigin(request);
    const { error } = await (await cookieClient(context)).auth.signOut({ scope: 'local' });
    if (error) throw new ApiError(503, 'Không thể đăng xuất. Vui lòng thử lại.');
    return null;
  });
}
