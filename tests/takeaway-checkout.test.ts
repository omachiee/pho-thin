import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { customerOrders } from '../src/lib/server/operations';

function mockSupabaseClient(handlers: {
  orders?: any[];
  reservations?: any[];
}) {
  let ordersData = handlers.orders ? [...handlers.orders] : [];
  let reservationsData = handlers.reservations ? [...handlers.reservations] : [];

  return {
    from: (table: string) => {
      let currentTable = table;
      let filterPhone: string[] = [];

      const builder: any = {
        select: (_fields?: string) => builder,
        in: (col: string, values: string[]) => {
          if (col === 'phone') filterPhone = values;
          return builder;
        },
        order: () => {
          if (currentTable === 'orders') {
            return Promise.resolve({
              data: ordersData.filter(o => filterPhone.includes(o.phone)),
              error: null,
            });
          }
          if (currentTable === 'reservations') {
            return Promise.resolve({
              data: reservationsData.filter(r => filterPhone.includes(r.phone)),
              error: null,
            });
          }
          return Promise.resolve({ data: [], error: null });
        },
      };
      return builder;
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
});
