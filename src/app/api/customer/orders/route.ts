import { assertOrigin, handle, readJson } from '../../../../lib/server/http';
import {
  customerOrders,
  cancelCustomerOrder,
  updateCustomerOrder,
  cancelCustomerReservation,
} from '../../../../lib/server/operations';
import { serviceClient } from '../../../../lib/server/supabase';
import { requireCustomerSession } from '../../../../lib/server/customerAuth';
import { ApiError, choice, object, text } from '../../../../lib/server/validation';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(request, async () => {
    // 1. Authenticate customer ownership via verified OTP session token / cookie
    const session = requireCustomerSession(request);

    // 2. Fetch orders and reservations belonging strictly to the verified phone number
    return customerOrders(serviceClient(), session.phone);
  });
}

export function PATCH(request: Request) {
  return handle(request, async () => {
    // 1. Authenticate customer ownership via verified OTP session token / cookie
    const session = requireCustomerSession(request);
    assertOrigin(request);

    const body = await readJson(request);
    const b = object(body, ['action', 'type', 'id', 'items', 'notes']);
    const action = choice(b.action as string, ['cancel', 'update'], 'Hành động');
    const type = typeof b.type === 'string' ? b.type : 'order';
    const recordId = text(b.id, 'Mã đơn', 100);

    // 2. Perform action using trusted session.phone, completely ignoring any untrusted client phone
    if (action === 'cancel') {
      if (type === 'reservation') {
        return cancelCustomerReservation(serviceClient(), recordId, session.phone);
      }
      return cancelCustomerOrder(serviceClient(), recordId, session.phone);
    }

    if (action === 'update') {
      return updateCustomerOrder(serviceClient(), recordId, session.phone, b.items, b.notes as string | undefined);
    }

    throw new ApiError(400, 'Hành động không hợp lệ.');
  });
}
