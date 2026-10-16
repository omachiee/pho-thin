import { assertOrigin, handle, readJson } from '../../../../../lib/server/http';
import { verifyOtp } from '../../../../../lib/server/otp';
import { signCustomerToken, attachCustomerCookie } from '../../../../../lib/server/customerAuth';
import { object, phone as validatePhone } from '../../../../../lib/server/validation';

export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return handle(request, async (context) => {
    assertOrigin(request);
    const body = await readJson(request, 1024);
    const b = object(body, ['phone', 'otp']);
    const validatedPhone = validatePhone(b.phone);
    const verifiedPhone = await verifyOtp(validatedPhone, b.otp as string);
    const { token, session } = signCustomerToken(verifiedPhone);
    attachCustomerCookie(context, token, session.exp);
    return {
      success: true,
      phone: verifiedPhone,
      token,
      expiresAt: session.exp,
    };
  });
}
