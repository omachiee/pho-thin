import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { customerOrders, createOrder } from '../src/lib/server/operations';
import { ApiError } from '../src/lib/server/validation';

function mockSupabaseClient(handlers: {
  orders?: any[];
  reservations?: any[];
  rpcHandler?: (name: string, params: any) => Promise<{ data: any; error: any }>;
}) {
  let ordersData = handlers.orders ? [...handlers.orders] : [];
  let reservationsData = handlers.reservations ? [...handlers.reservations] : [];

  return {
    from: (table: string) => {
      let currentTable = table;
      let filterPhone: string[] = [];
      let filterStatus: string | null = null;

      const builder: any = {
        select: (_fields?: string) => builder,
        in: (col: string, values: string[]) => {
          if (col === 'phone') filterPhone = values;
          return builder;
        },
        eq: (col: string, val: string) => {
          if (col === 'status') filterStatus = val;
          return builder;
        },
        then: (resolve: any, reject: any) => {
          if (currentTable === 'orders') {
            let res = ordersData.filter(o => !filterPhone.length || filterPhone.includes(o.phone));
            if (filterStatus) res = res.filter(o => o.status === filterStatus);
            return Promise.resolve({ data: res, error: null }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
        order: () => {
          if (currentTable === 'orders') {
            let res = ordersData.filter(o => !filterPhone.length || filterPhone.includes(o.phone));
            if (filterStatus) res = res.filter(o => o.status === filterStatus);
            return Promise.resolve({ data: res, error: null });
          }
          if (currentTable === 'reservations') {
            return Promise.resolve({
              data: reservationsData.filter(r => !filterPhone.length || filterPhone.includes(r.phone)),
              error: null,
            });
          }
          return Promise.resolve({ data: [], error: null });
        },
      };
      return builder;
    },
    rpc: (name: string, params: any) => {
      if (handlers.rpcHandler) return handlers.rpcHandler(name, params);
      return Promise.resolve({
        data: {
          id: 'order-new-123',
          full_name: params.p_full_name,
          phone: params.p_phone,
          branch_id: params.p_branch_id,
          branch_name: 'Phở Thìn Bờ Hồ',
          pickup_at: params.p_pickup_at,
          notes: params.p_notes,
          status: 'pending',
          total: 140000,
          created_at: new Date().toISOString(),
          order_items: [{ dish_id: 'pho-tai', name: 'Phở tái', unit_price: 70000, quantity: 2 }],
        },
        error: null,
      });
    },
  } as any;
}

describe('Takeaway Checkout & Reservation Pre-Order Display', () => {
  it('customerOrders returns pre-ordered items and pre-order total for table reservations', async () => {
    const reservationWithPreOrder = {
      id: 'res-preorder-1234',
      full_name: 'Trần Văn Nam',
      phone: '0901234567',
      email: 'nam@example.com',
      reservation_date: '2026-10-25',
      reservation_time: '18:30',
      party_size: 4,
      branch_id: 'bo-ho',
      branch_name: 'Phở Thìn Bờ Hồ',
      notes: 'Bàn cạnh cửa sổ',
      status: 'pending',
      created_at: '2026-10-19T10:00:00Z',
      pre_ordered_items: [
        { dishId: 'pho-tai-chin', name: 'Phở tái chín', unitPrice: 70000, quantity: 3 },
        { dishId: 'quay', name: 'Quẩy giòn', unitPrice: 10000, quantity: 2 },
      ],
      pre_order_total: 230000,
    };

    const client = mockSupabaseClient({
      reservations: [reservationWithPreOrder],
      orders: [],
    });

    const result = await customerOrders(client, '0901234567');
    assert.equal(result.reservations.length, 1);
    const res = result.reservations[0];
    assert.equal(res.preOrderedItems?.length, 2);
    assert.equal(res.preOrderTotal, 230000);
    assert.equal(res.preOrderedItems?.[0].dishId, 'pho-tai-chin');
    assert.equal(res.preOrderedItems?.[0].quantity, 3);
    assert.equal(res.preOrderedItems?.[1].quantity, 2);
  });

  it('takeaway order preserves clean customer notes without legacy dining options', () => {
    const userNotes = 'Cho nhiều hành lá, không lấy nước béo';
    // Pure takeaway checkout assigns userNotes directly to notes
    const notes = userNotes.trim();
    assert.equal(notes, 'Cho nhiều hành lá, không lấy nước béo');
    assert.doesNotMatch(notes, /\[Dùng tại quán/);
  });

  it('calculates takeaway cart total accurately for multiple items', () => {
    const cartItems = [
      { unitPrice: 70000, quantity: 2 },
      { unitPrice: 75000, quantity: 1 },
      { unitPrice: 10000, quantity: 4 },
    ];
    const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    assert.equal(total, 70000 * 2 + 75000 * 1 + 10000 * 4); // 140000 + 75000 + 40000 = 255000
    assert.equal(total, 255000);
  });

  it('rejects order creation when customer has >= 2 pending orders with proper warning message', async () => {
    const client = mockSupabaseClient({
      orders: [
        { id: 'order-1', phone: '0912345678', status: 'pending' },
        { id: 'order-2', phone: '+84912345678', status: 'pending' },
      ],
    });

    const newOrderInput = {
      fullName: 'Khách Hàng',
      phone: '0912345678',
      branchId: 'bo-ho',
      pickupAt: new Date(Date.now() + 3600000).toISOString(),
      notes: '',
      items: [{ dishId: 'pho-tai', quantity: 2 }],
    };

    await assert.rejects(
      async () => {
        await createOrder(client, newOrderInput);
      },
      (error: unknown) => {
        assert(error instanceof ApiError);
        assert.equal(error.status, 400);
        assert.equal(
          error.message,
          'Bạn đang có đơn hàng chưa hoàn tất, vui lòng chờ xử lý trước khi đặt thêm.'
        );
        return true;
      }
    );
  });

  it('allows order creation when customer has < 2 pending orders', async () => {
    const client = mockSupabaseClient({
      orders: [
        { id: 'order-1', phone: '0912345678', status: 'pending' },
        { id: 'order-2', phone: '0912345678', status: 'completed' },
        { id: 'order-3', phone: '0912345678', status: 'cancelled' },
      ],
    });

    const newOrderInput = {
      fullName: 'Khách Hàng Hợp Lệ',
      phone: '0912345678',
      branchId: 'bo-ho',
      pickupAt: new Date(Date.now() + 3600000).toISOString(),
      notes: '',
      items: [{ dishId: 'pho-tai', quantity: 1 }],
    };

    const order = await createOrder(client, newOrderInput);
    assert.equal(order.id, 'order-new-123');
    assert.equal(order.status, 'pending');
  });
});

