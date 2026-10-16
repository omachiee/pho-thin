import 'server-only';
import crypto from 'node:crypto';
import { ApiError, phone as validatePhone } from './validation';
import { sendSmsOtp } from './sms';

interface OtpEntry {
  phone: string;
  hashedCode: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
  windowStart: number;
}

// In-memory thread-safe store for OTP lifecycle and rate limiting
const store = new Map<string, OtpEntry>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const HOURLY_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SENDS_PER_HOUR = 5; // Max 5 OTPs per phone per hour
const MAX_ATTEMPTS = 3; // Max 3 failed verification attempts

function cleanPhoneKey(rawPhone: string): string {
  const p = validatePhone(rawPhone);
  // Normalize to standard 0xxxxxxxxx
  if (p.startsWith('+84')) return '0' + p.slice(3);
  if (p.startsWith('84')) return '0' + p.slice(2);
  return p;
}

function hashCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
}

/**
 * Periodically purge expired OTP entries from memory.
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now && now - entry.windowStart > HOURLY_WINDOW_MS) {
      store.delete(key);
    }
  }
}

/**
 * Generates and sends a cryptographic 6-digit OTP to the phone number.
 * Enforces rate limiting (60s cooldown, 5/hour max).
 */
export async function requestOtp(rawPhone: string): Promise<{
  success: boolean;
  message: string;
  cooldownSeconds: number;
  devOtp?: string;
}> {
  cleanupExpired();
  const phone = cleanPhoneKey(rawPhone);
  const now = Date.now();
  let entry = store.get(phone);

  if (entry) {
    // 1. Reset hourly counter if window passed
    if (now - entry.windowStart > HOURLY_WINDOW_MS) {
      entry.sendCount = 0;
      entry.windowStart = now;
    }

    // 2. Cooldown check: 60s minimum interval
    const timeSinceLastSent = now - entry.lastSentAt;
    if (timeSinceLastSent < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastSent) / 1000);
      throw new ApiError(
        429,
        `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu gửi lại mã OTP.`
      );
    }

    // 3. Hourly limit check: max 5 sends / hour
    if (entry.sendCount >= MAX_SENDS_PER_HOUR) {
      const resetMinutes = Math.ceil((HOURLY_WINDOW_MS - (now - entry.windowStart)) / 60000);
      throw new ApiError(
        429,
        `Số điện thoại này đã vượt quá giới hạn 5 lần gửi mã OTP trong 1 giờ. Vui lòng thử lại sau ${resetMinutes} phút.`
      );
    }
  }

  // 4. Generate random 6-digit cryptographic numeric code (100000 - 999999)
  const numericCode = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedCode = hashCode(numericCode, salt);

  // 5. Update or initialize the store record
  if (entry) {
    entry.hashedCode = hashedCode;
    entry.salt = salt;
    entry.createdAt = now;
    entry.expiresAt = now + OTP_EXPIRY_MS;
    entry.attempts = 0;
    entry.lastSentAt = now;
    entry.sendCount += 1;
  } else {
    entry = {
      phone,
      hashedCode,
      salt,
      createdAt: now,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now,
      sendCount: 1,
      windowStart: now,
    };
    store.set(phone, entry);
  }

  // 6. Send the SMS via the configured provider
  await sendSmsOtp(phone, numericCode);

  return {
    success: true,
    message: 'Mã xác thực OTP đã được gửi đến số điện thoại của quý khách qua tin nhắn SMS.',
    cooldownSeconds: 60,
    ...(process.env.NODE_ENV !== 'production' ? { devOtp: numericCode } : {}),
  };
}

/**
 * Verifies the customer-provided OTP against the stored hashed code.
 * Implements max-attempt lockout (max 3 tries) and timing-attack protection.
 */
export async function verifyOtp(rawPhone: string, rawOtp: string): Promise<string> {
  const phone = cleanPhoneKey(rawPhone);
  const otp = String(rawOtp || '').trim();

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(400, 'Mã OTP không hợp lệ. Vui lòng nhập đúng 6 chữ số.');
  }

  const entry = store.get(phone);
  const now = Date.now();

  if (!entry || !entry.hashedCode) {
    throw new ApiError(400, 'Không tìm thấy yêu cầu xác thực OTP hoặc mã đã hết hạn. Vui lòng gửi lại mã mới.');
  }

  if (now > entry.expiresAt) {
    store.delete(phone);
    throw new ApiError(400, 'Mã OTP đã hết hiệu lực (quá 5 phút). Vui lòng yêu cầu mã mới.');
  }

  entry.attempts += 1;

  const testHash = hashCode(otp, entry.salt);
  const a = Buffer.from(testHash);
  const b = Buffer.from(entry.hashedCode);

  const isValid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!isValid) {
    const remaining = MAX_ATTEMPTS - entry.attempts;
    if (remaining <= 0) {
      store.delete(phone);
      throw new ApiError(
        400,
        'Bạn đã nhập sai mã OTP quá 3 lần. Vì lý do bảo mật, mã OTP này đã bị hủy. Vui lòng yêu cầu gửi lại mã mới.'
      );
    }
    throw new ApiError(400, `Mã OTP không chính xác. Bạn còn ${remaining} lần thử lại.`);
  }

  // Verification succeeded: Invalidate the OTP to prevent replay attacks
  store.delete(phone);

  return phone;
}
