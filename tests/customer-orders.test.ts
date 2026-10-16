import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  customerOrders,
  cancelCustomerOrder,
  updateCustomerOrder,
  cancelCustomerReservation,
} from '../src/lib/server/operations';
import { requestOtp, verifyOtp } from '../src/lib/server/otp';
import { signCustomerToken, verifyCustomerToken, requireCustomerSession } from '../src/lib/server/customerAuth';
import { ApiError } from '../src/lib/server/validation';

function mockSupabaseClient(handlers: {
  orders?: any[];
  reservations?: any[];
  dishes?: any[];
}) {
  let ordersData = handlers.orders ? [...handlers.orders] : [];
  let reservationsData = handlers.reservations ? [...handlers.reservations] : [];
  let dishesData = handlers.dishes ? [...handlers.dishes] : [];

  return {
    from: (table: string) => {
      let currentTable = table;
      let filterPhone: string[] = [];
      let filterId: string | null = null;
      let updatePayload: any = null;
      let isDelete = false;

      const builder: any = {
        select: (_fields?: string) => builder,
        in: (col: string, values: string[]) => {
          if (col === 'phone') filterPhone = values;
          if (col === 'id') dishesData = dishesData.filter(d => values.includes(d.id));
          return builder;
        },
        eq: (col: string, val: string) => {
          if (col === 'id') filterId = val;
          if (col === 'order_id') filterId = val;
          return builder;
        },
        order: () => builder,
        update: (payload: any) => {
          updatePayload = payload;
          return builder;
        },
        delete: () => {
          isDelete = true;
          return builder;
        },
        insert: (rows: any[]) => {
          if (currentTable === 'order_items') {
            const ord = ordersData.find(o => o.id === filterId || o.id === rows[0]?.order_id);
            if (ord) ord.order_items = rows;
          }
          return { data: rows, error: null };
        },
        maybeSingle: async () => {
          if (currentTable === 'orders') {
            const found = ordersData.find(o => o.id === filterId);
            if (updatePayload && found) {
              Object.assign(found, updatePayload);
            }
            return { data: found || null, error: null };
          }
          if (currentTable === 'reservations') {
            const found = reservationsData.find(r => r.id === filterId);
            if (updatePayload && found) {
              Object.assign(found, updatePayload);
            }
            return { data: found || null, error: null };
          }
          return { data: null, error: null };
        },
        then: (resolve: (res: any) => void) => {
          if (currentTable === 'orders') {
            const list = filterPhone.length
              ? ordersData.filter(o => filterPhone.includes(o.phone))
              : ordersData;
            return resolve({ data: list, error: null });
          }
          if (currentTable === 'reservations') {
            const list = filterPhone.length
              ? reservationsData.filter(r => filterPhone.includes(r.phone))
              : reservationsData;
            return resolve({ data: list, error: null });
          }
          if (currentTable === 'dishes') {
            return resolve({ data: dishesData, error: null });
          }
          if (currentTable === 'order_items') {
            return resolve({ data: [], error: null });
          }
          return resolve({ data: [], error: null });
        },
      };
      return builder;
    },
  } as any;
}

describe('Customer Security & OTP Authentication', () => {
  const testPhone = '0981234567';

  it('generates a random 6-digit cryptographic OTP and sends SMS', async () => {
    const res = await requestOtp(testPhone);
    assert.equal(res.success, true);
    assert.equal(typeof res.devOtp, 'string');
    assert.equal(res.devOtp?.length, 6);
    assert.match(res.devOtp!, /^\d{6}$/);
  });

  it('enforces 60-second cooldown rate limit on resending OTP', async () => {
    await assert.rejects(
      requestOtp(testPhone),
      (err: any) => err instanceof ApiError && err.status === 429 && err.message.includes('Vui lòng đợi')
    );
  });

  it('rejects invalid or incorrect OTP and tracks remaining attempts', async () => {
    const freshPhone = '0987654321';
    await requestOtp(freshPhone);

    // Attempt 1 with wrong OTP
    await assert.rejects(
      verifyOtp(freshPhone, '000000'),
      /Mã OTP không chính xác\. Bạn còn 2 lần thử lại\./
    );

    // Attempt 2 with wrong OTP
    await assert.rejects(
      verifyOtp(freshPhone, '111111'),
      /Mã OTP không chính xác\. Bạn còn 1 lần thử lại\./
    );

    // Attempt 3 with wrong OTP - should lockout & invalidate
    await assert.rejects(
      verifyOtp(freshPhone, '222222'),
      /Bạn đã nhập sai mã OTP quá 3 lần\. Vì lý do bảo mật/
    );

    // Attempt 4 - should report expired or not found
    await assert.rejects(
      verifyOtp(freshPhone, '333333'),
      /Không tìm thấy yêu cầu xác thực OTP hoặc mã đã hết hạn/
    );
  });

  it('successfully verifies correct OTP and creates customer session token', async () => {
    const validPhone = '0912333444';
    const otpRes = await requestOtp(validPhone);
    assert(otpRes.devOtp, 'Dev OTP must be returned in test');

    const verifiedPhone = await verifyOtp(validPhone, otpRes.devOtp);
    assert.equal(verifiedPhone, validPhone);

    // Token creation and verification
    const { token, session } = signCustomerToken(verifiedPhone);
    assert.equal(session.phone, validPhone);

    const decoded = verifyCustomerToken(token);
    assert.ok(decoded);
    assert.equal(decoded?.phone, validPhone);
  });

  it('rejects tampered or malformed session tokens', () => {
    const { token } = signCustomerToken('0912333444');
    const tampered = token.slice(0, -5) + 'xxxxx';
    assert.equal(verifyCustomerToken(tampered), null);
    assert.equal(verifyCustomerToken('invalid.token'), null);
    assert.equal(verifyCustomerToken(''), null);
  });

  it('requireCustomerSession throws 401 when Authorization header / cookie is missing', () => {
    const req = new Request('http://localhost:3000/api/customer/orders');
    assert.throws(
      () => requireCustomerSession(req),
      (err: any) => err instanceof ApiError && err.status === 401
    );
  });

  it('requireCustomerSession accepts valid Bearer token', () => {
    const { token } = signCustomerToken('0912333444');
    const req = new Request('http://localhost:3000/api/customer/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = requireCustomerSession(req);
    assert.equal(session.phone, '0912333444');
  });

  it('requireCustomerSession accepts valid customer_session cookie', () => {
    const { token } = signCustomerToken('0912333444');
    const req = new Request('http://localhost:3000/api/customer/orders', {
      headers: { Cookie: `customer_session=${token}` },
    });
    const session = requireCustomerSession(req);
    assert.equal(session.phone, '0912333444');
  });
});

describe('Customer Orders Operations & IDOR Protection', () => {
  const victimOrder = {
    id: 'ord-victim-1111',
    full_name: 'Khách A',
    phone: '0911111111',
    branch_id: 'bo-ho',
    branch_name: 'Phở Thìn Bờ Hồ',
    pickup_at: '2026-10-20T12:00:00+07:00',
    notes: 'Bàn riêng',
    total: 140000,
    status: 'pending',
    created_at: '2026-10-16T10:00:00Z',
    order_items: [
      { dish_id: 'pho-tai-chin', name: 'Phở tái chín', unit_price: 70000, quantity: 2 },
    ],
  };

  const victimReservation = {
    id: 'res-victim-2222',
    full_name: 'Khách A',
    phone: '0911111111',
    email: 'khacha@example.com',
    reservation_date: '2026-10-20',
    reservation_time: '12:00',
    party_size: 4,
    branch_id: 'bo-ho',
    branch_name: 'Phở Thìn Bờ Hồ',
    notes: 'Bàn tầng 2',
    status: 'pending',
    created_at: '2026-10-16T10:00:00Z',
  };

  const sampleDishes = [
    { id: 'pho-tai-chin', name: { vi: 'Phở tái chín' }, price: 70000, is_available: true },
    { id: 'pho-nam', name: { vi: 'Phở nạm' }, price: 75000, is_available: true },
    { id: 'quay', name: { vi: 'Quẩy giòn' }, price: 10000, is_available: true },
  ];

  it('fetch customer orders strictly returns data for the verified phone', async () => {
    const client = mockSupabaseClient({
      orders: [victimOrder],
      reservations: [victimReservation],
    });

    // Verified phone of victim returns 1 order & 1 reservation
    const victimResult = await customerOrders(client, '0911111111');
    assert.equal(victimResult.orders.length, 1);
    assert.equal(victimResult.reservations.length, 1);

    // Another phone queries: receives 0 orders and 0 reservations
    const attackerResult = await customerOrders(client, '0999999999');
    assert.equal(attackerResult.orders.length, 0);
    assert.equal(attackerResult.reservations.length, 0);
  });

  it('SECURITY: Rejects attacker attempt to cancel victim order (403 Forbidden)', async () => {
    const client = mockSupabaseClient({ orders: [{ ...victimOrder }] });
    const attackerPhone = '0999999999';

    await assert.rejects(
      cancelCustomerOrder(client, victimOrder.id, attackerPhone),
      (err: any) => err instanceof ApiError && err.status === 403 && /Bạn không có quyền thao tác với đơn này\./.test(err.message)
    );
  });

  it('SECURITY: Rejects attacker attempt to edit victim order (403 Forbidden)', async () => {
    const client = mockSupabaseClient({
      orders: [{ ...victimOrder }],
      dishes: sampleDishes,
    });
    const attackerPhone = '0999999999';

    await assert.rejects(
      updateCustomerOrder(
        client,
        victimOrder.id,
        attackerPhone,
        [{ dishId: 'pho-nam', quantity: 1 }]
      ),
      (err: any) => err instanceof ApiError && err.status === 403 && /Bạn không có quyền thao tác với đơn này\./.test(err.message)
    );
  });

  it('SECURITY: Rejects attacker attempt to cancel victim reservation (403 Forbidden)', async () => {
    const client = mockSupabaseClient({
      reservations: [{ ...victimReservation }],
    });
    const attackerPhone = '0999999999';

    await assert.rejects(
      cancelCustomerReservation(client, victimReservation.id, attackerPhone),
      (err: any) => err instanceof ApiError && err.status === 403 && /Bạn không có quyền thao tác với yêu cầu này\./.test(err.message)
    );
  });

  it('allows owner to cancel their own pending order', async () => {
    const client = mockSupabaseClient({ orders: [{ ...victimOrder }] });
    const ownerPhone = '0911111111';

    const cancelled = await cancelCustomerOrder(client, victimOrder.id, ownerPhone);
    assert.equal(cancelled.status, 'cancelled');
  });

  it('allows owner to edit their own pending order', async () => {
    const client = mockSupabaseClient({
      orders: [{ ...victimOrder }],
      dishes: sampleDishes,
    });
    const ownerPhone = '0911111111';

    const updated = await updateCustomerOrder(
      client,
      victimOrder.id,
      ownerPhone,
      [
        { dishId: 'pho-nam', quantity: 1 },
        { dishId: 'quay', quantity: 3 },
      ],
      'Ăn ít hành'
    );

    assert.equal(updated.total, 105000);
    assert.equal(updated.notes, 'Ăn ít hành');
  });
});
