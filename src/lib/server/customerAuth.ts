import 'server-only';
import crypto from 'node:crypto';
import { ApiError } from './validation';
import type { ApiContext } from './http';

export interface CustomerSession {
  phone: string;
  verifiedAt: number;
  exp: number;
}

const COOKIE_NAME = 'customer_session';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret(): string {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(503, 'Chưa cấu hình khóa bảo mật phiên khách hàng trên máy chủ.');
    }
    return 'dev-customer-secret-pho-thin-bo-ho-1955-key';
  }
  return secret;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Creates a cryptographically signed session token for a verified customer phone number.
 */
export function signCustomerToken(phone: string): { token: string; session: CustomerSession } {
  const now = Math.floor(Date.now() / 1000);
  const session: CustomerSession = {
    phone,
    verifiedAt: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(session));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(dataToSign);
  const signature = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return {
    token: `${dataToSign}.${signature}`,
    session,
  };
}

/**
 * Verifies and decodes a customer session token.
 * Returns null if invalid or expired.
 */
export function verifyCustomerToken(token: string | null | undefined): CustomerSession | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', getSecret());
  hmac.update(dataToSign);
  const expectedSig = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const session = JSON.parse(payloadJson) as CustomerSession;

    if (!session || typeof session.phone !== 'string' || typeof session.exp !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (session.exp < now) {
      return null; // Expired
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extracts the customer token from Request cookies or Authorization header.
 */
export function extractCustomerToken(request: Request): string | null {
  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }

  // 2. Try Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Resolves the authenticated customer session from request, throwing 401 if unauthenticated.
 */
export function requireCustomerSession(request: Request): CustomerSession {
  const token = extractCustomerToken(request);
  const session = verifyCustomerToken(token);
  if (!session) {
    throw new ApiError(401, 'Vui lòng xác thực số điện thoại qua mã OTP để xem và quản lý đơn.');
  }
  return session;
}

/**
 * Helper to attach the session cookie to the response context.
 */
export function attachCustomerCookie(context: ApiContext, token: string, exp: number) {
  context.cookies.push({
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: exp - Math.floor(Date.now() / 1000),
    },
  });
}

/**
 * Helper to remove the session cookie on logout.
 */
export function removeCustomerCookie(context: ApiContext) {
  context.cookies.push({
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    },
  });
}
