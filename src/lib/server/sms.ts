import 'server-only';
import { ApiError } from './validation';

export interface SendSmsResult {
  success: boolean;
  provider: 'twilio' | 'esms' | 'speedsms' | 'webhook' | 'dev';
  messageId?: string;
  error?: string;
}

/**
 * Sends a real SMS OTP to the customer's phone number using the configured SMS provider.
 * Configured via environment variables:
 * - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 * - eSMS.vn: ESMS_API_KEY, ESMS_SECRET_KEY, ESMS_BRAND_NAME
 * - SpeedSMS: SPEEDSMS_ACCESS_TOKEN, SPEEDSMS_SENDER
 * - Custom Webhook: SMS_GATEWAY_URL, SMS_GATEWAY_API_KEY
 */
export async function sendSmsOtp(phone: string, otp: string): Promise<SendSmsResult> {
  const message = `[Phở Thìn Bờ Hồ] Mã xác thực OTP của quý khách là: ${otp}. Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.`;

  // 1. Check Twilio configuration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_FROM?.trim();

  if (twilioSid && twilioToken && twilioFrom) {
    return await sendViaTwilio(phone, message, twilioSid, twilioToken, twilioFrom);
  }

  // 2. Check eSMS (Vietnam) configuration
  const esmsKey = process.env.ESMS_API_KEY?.trim();
  const esmsSecret = process.env.ESMS_SECRET_KEY?.trim();
  const esmsBrand = process.env.ESMS_BRAND_NAME?.trim() || 'PhoThinBoHo';

  if (esmsKey && esmsSecret) {
    return await sendViaEsms(phone, message, esmsKey, esmsSecret, esmsBrand);
  }

  // 3. Check SpeedSMS configuration
  const speedSmsToken = process.env.SPEEDSMS_ACCESS_TOKEN?.trim();
  const speedSmsSender = process.env.SPEEDSMS_SENDER?.trim() || 'PhoThinBoHo';

  if (speedSmsToken) {
    return await sendViaSpeedSms(phone, message, speedSmsToken, speedSmsSender);
  }

  // 4. Check Generic Webhook / Gateway
  const gatewayUrl = process.env.SMS_GATEWAY_URL?.trim();
  const gatewayKey = process.env.SMS_GATEWAY_API_KEY?.trim();

  if (gatewayUrl) {
    return await sendViaWebhook(phone, message, gatewayUrl, gatewayKey);
  }

  // 5. In production: Fail securely if no provider is configured!
  if (process.env.NODE_ENV === 'production') {
    throw new ApiError(
      503,
      'Cổng gửi tin nhắn SMS chưa được cấu hình trên máy chủ sản xuất. Vui lòng liên hệ quản trị viên.'
    );
  }

  // 6. In development / testing: Log to server output
  console.log(`\n======================================================`);
  console.log(`[SMS OTP DEV SIMULATOR]`);
  console.log(`Số điện thoại nhận: ${phone}`);
  console.log(`Mã OTP: ${otp} (Có hiệu lực 5 phút)`);
  console.log(`Nội dung: ${message}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'dev',
    messageId: `dev-${Date.now()}`,
  };
}

// ----------------------------------------------------
// Provider Integrations
// ----------------------------------------------------

async function sendViaTwilio(
  phone: string,
  message: string,
  sid: string,
  token: string,
  from: string
): Promise<SendSmsResult> {
  try {
    // Format to E.164 if starting with 0
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+84' + formattedPhone.slice(1);
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');

    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', from);
    params.append('Body', message);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(json.message || `Twilio HTTP error ${res.status}`);
    }

    return {
      success: true,
      provider: 'twilio',
      messageId: json.sid,
    };
  } catch (err) {
    throw new ApiError(503, `Không thể gửi tin nhắn SMS qua Twilio: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
  }
}

async function sendViaEsms(
  phone: string,
  message: string,
  apiKey: string,
  secretKey: string,
  brandname: string
): Promise<SendSmsResult> {
  try {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('84')) cleanPhone = '0' + cleanPhone.slice(2);

    const endpoint = 'http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json';
    const payload = {
      ApiKey: apiKey,
      SecretKey: secretKey,
      Phone: cleanPhone,
      Content: message,
      SmsType: '2', // 2: CSKH / OTP
      Brandname: brandname,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const json = (await res.json()) as any;
    if (json.CodeResult !== '100') {
      throw new Error(`eSMS error code: ${json.CodeResult} - ${json.ErrorMessage || ''}`);
    }

    return {
      success: true,
      provider: 'esms',
      messageId: json.SMSID,
    };
  } catch (err) {
    throw new ApiError(503, `Không thể gửi tin nhắn SMS qua eSMS: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
  }
}

async function sendViaSpeedSms(
  phone: string,
  message: string,
  accessToken: string,
  sender: string
): Promise<SendSmsResult> {
  try {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    const endpoint = 'https://api.speedsms.vn/index.php/sms/send';
    const payload = {
      to: [cleanPhone],
      content: message,
      sms_type: 2, // OTP
      sender: sender,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${accessToken}:x`).toString('base64'),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const json = (await res.json()) as any;
    if (json.status !== 'success') {
      throw new Error(`SpeedSMS error: ${json.message || ''}`);
    }

    return {
      success: true,
      provider: 'speedsms',
      messageId: json.data?.tranId,
    };
  } catch (err) {
    throw new ApiError(503, `Không thể gửi tin nhắn SMS qua SpeedSMS: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
  }
}

async function sendViaWebhook(
  phone: string,
  message: string,
  gatewayUrl: string,
  apiKey?: string
): Promise<SendSmsResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(gatewayUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, message, type: 'otp' }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      throw new Error(`SMS Gateway HTTP ${res.status}`);
    }

    const json = await res.json().catch(() => ({}));
    return {
      success: true,
      provider: 'webhook',
      messageId: json.messageId || json.id,
    };
  } catch (err) {
    throw new ApiError(503, `Không thể gửi tin nhắn SMS qua Gateway: ${err instanceof Error ? err.message : 'Lỗi kết nối'}`);
  }
}
