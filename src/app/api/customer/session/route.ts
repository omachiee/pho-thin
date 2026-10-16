import { assertOrigin, handle } from '../../../../lib/server/http';
import { extractCustomerToken, verifyCustomerToken, removeCustomerCookie } from '../../../../lib/server/customerAuth';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(request, async () => {
    const token = extractCustomerToken(request);
    const session = verifyCustomerToken(token);
    if (!session) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      phone: session.phone,
      expiresAt: session.exp,
    };
  });
}

export function DELETE(request: Request) {
  return handle(request, async (context) => {
    assertOrigin(request);
    removeCustomerCookie(context);
    return { success: true };
  });
}
