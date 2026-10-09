// Browser adapter: credentials and database access stay in Next.js Route Handlers.
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(result?.error || 'Không thể kết nối backend. Vui lòng thử lại.', response.status);
  }
  if (!result || !('data' in result)) throw new Error('Backend trả dữ liệu không hợp lệ.');
  return result.data as T;
}
