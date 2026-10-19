import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapReservation } from '../src/lib/server/mappings';

describe('Reservation Schema & Mappings', () => {
  it('maps reservation with pre_ordered_items and pre_order_total correctly', () => {
    const raw = {
      id: 'res-1',
      full_name: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'a@example.com',
      reservation_date: '2026-10-20',
      reservation_time: '11:30',
      party_size: 2,
      branch_id: 'bo-ho',
      branch_name: 'Phở Thìn Bờ Hồ',
      notes: 'Gần cửa sổ',
      status: 'pending',
      is_walk_in: false,
      created_at: '2026-10-19T10:00:00Z',
      pre_ordered_items: [{ dishId: 'pho-tai', name: 'Phở Tái', unitPrice: 75000, quantity: 2 }],
      pre_order_total: 150000,
    };
    const mapped = mapReservation(raw);
    assert.equal(mapped.id, 'res-1');
    assert.deepEqual(mapped.preOrderedItems, raw.pre_ordered_items);
    assert.equal(mapped.preOrderTotal, 150000);
  });
});
