import { assertOrigin, handle, readJson } from '../../../../lib/server/http';
import {
  customerOrders,
  cancelCustomerOrder,
  updateCustomerOrder,
  cancelCustomerReservation,
} from '../../../../lib/server/operations';
import { serviceClient } from '../../../../lib/server/supabase';
import { extractCustomerToken, verifyCustomerToken } from '../../../../lib/server/customerAuth';
import { ApiError, choice, object, text, phone as validatePhone } from '../../../../lib/server/validation';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(request, async () => {
    const url = new URL(request.url);
    const queryPhone = url.searchParams.get('phone');
    let phoneToQuery = queryPhone ? queryPhone.trim() : null;

    if (!phoneToQuery) {
      const token = extractCustomerToken(request);
      const session = verifyCustomerToken(token);
      if (session) phoneToQuery = session.phone;
    }

    if (!phoneToQuery) {
      throw new ApiError(400, 'Vui lòng cung cấp số điện thoại để tra cứu đơn hàng.');
    }

    const cleanPhone = validatePhone(phoneToQuery);
    return customerOrders(serviceClient(), cleanPhone);
  });
}

export function PATCH(request: Request) {
  return handle(request, async () => {
    assertOrigin(request);

    const body = await readJson(request);
    const b = object(body, ['action', 'type', 'id', 'phone', 'items', 'notes']);
    const action = choice(b.action as string, ['cancel', 'update'], 'Hành động');
    const type = typeof b.type === 'string' ? b.type : 'order';
    const recordId = text(b.id, 'Mã đơn', 100);

    let customerPhone = typeof b.phone === 'string' && b.phone.trim() ? b.phone.trim() : null;
    if (!customerPhone) {
      const token = extractCustomerToken(request);
      const session = verifyCustomerToken(token);
      if (session) customerPhone = session.phone;
    }

    if (!customerPhone) {
      throw new ApiError(400, 'Thiếu số điện thoại để xác nhận quyền thao tác đơn.');
    }

    const cleanPhone = validatePhone(customerPhone);

    if (action === 'cancel') {
      if (type === 'reservation') {
        return cancelCustomerReservation(serviceClient(), recordId, cleanPhone);
      }
      return cancelCustomerOrder(serviceClient(), recordId, cleanPhone);
    }

    if (action === 'update') {
      return updateCustomerOrder(serviceClient(), recordId, cleanPhone, b.items, b.notes as string | undefined);
    }

    throw new ApiError(400, 'Hành động không hợp lệ.');
  });
}
