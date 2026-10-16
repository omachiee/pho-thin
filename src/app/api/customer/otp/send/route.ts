import { assertOrigin, handle, readJson } from '../../../../../lib/server/http';
import { requestOtp } from '../../../../../lib/server/otp';
import { object, phone as validatePhone } from '../../../../../lib/server/validation';

export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return handle(request, async () => {
    assertOrigin(request);
    const body = await readJson(request, 1024);
    const b = object(body, ['phone']);
    const validatedPhone = validatePhone(b.phone);
    return requestOtp(validatedPhone);
  });
}
