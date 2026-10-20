import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapReservation } from '../src/lib/server/mappings';
import { reservationAvailability, createReservation } from '../src/lib/server/operations';
import { ApiError, reservation as validateReservation } from '../src/lib/server/validation';

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

  it('validates preOrderedItems and computes preOrderTotal in validation.reservation', () => {
    const input = {
      fullName: 'Trần Văn B',
      phone: '0987654321',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 4,
      branchId: 'bo-ho',
      notes: '',
      preOrderedItems: [
        { dishId: 'pho-tai', name: 'Phở Tái', unitPrice: 75000, quantity: 2 },
        { dishId: 'quay', name: 'Quẩy giòn', unitPrice: 10000, quantity: 3 }
      ]
    };
    const validated = validateReservation(input);
    assert.deepEqual(validated.preOrderedItems, input.preOrderedItems);
    assert.equal(validated.preOrderTotal, 180000);
  });
});

describe('Reservation Capacity & Availability', () => {
  it('calculates remaining tables per slot with 20 max tables', async () => {
    const mockBookings = [
      ...Array.from({ length: 19 }, (_, i) => ({
        id: `res-1130-${i}`, branch_id: 'bo-ho', reservation_date: '2026-10-20', reservation_time: '11:30', status: 'confirmed'
      })),
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `res-1200-${i}`, branch_id: 'bo-ho', reservation_date: '2026-10-20', reservation_time: '12:00', status: 'pending'
      })),
      { id: 'res-cancelled', branch_id: 'bo-ho', reservation_date: '2026-10-20', reservation_time: '12:00', status: 'cancelled' }
    ];

    const mockClient: any = {
      from: (table: string) => {
        let filters: any = {};
        const builder: any = {
          select: () => builder,
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          then: (resolve: any) => {
            const filtered = mockBookings.filter(b => 
              (!filters.branch_id || b.branch_id === filters.branch_id) &&
              (!filters.reservation_date || b.reservation_date === filters.reservation_date) &&
              (!filters.not_status || b.status !== filters.not_status)
            );
            resolve({ data: filtered, error: null });
          }
        };
        return builder;
      }
    };

    const res = await reservationAvailability(mockClient, 'bo-ho', '2026-10-20');
    assert.equal(res.branchId, 'bo-ho');
    assert.equal(res.date, '2026-10-20');
    assert.equal(res.maxTablesPerSlot, 20);
    assert.equal(res.availability['11:30'].booked, 19);
    assert.equal(res.availability['11:30'].remaining, 1);
    assert.equal(res.availability['12:00'].booked, 20);
    assert.equal(res.availability['12:00'].remaining, 0);
  });

  it('rejects reservation creation when slot has 20 active bookings with 409 Conflict', async () => {
    const existing20 = Array.from({ length: 20 }, (_, i) => ({ id: `res-${i}` }));
    const mockClient: any = {
      from: (table: string) => {
        let filters: Record<string, any> = {};
        const builder: any = {
          select: () => builder,
          in: (col: string, vals: any) => { filters['in_' + col] = vals; return builder; },
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          then: (resolve: any) => {
            if (filters.status === 'pending' && filters.in_phone) {
              return resolve({ data: [], error: null });
            }
            return resolve({ data: existing20, error: null });
          }
        };
        return builder;
      }
    };

    const booking = {
      fullName: 'Trần Văn B',
      phone: '0987654321',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 4,
      branchId: 'bo-ho',
      notes: ''
    };

    await assert.rejects(
      () => createReservation(mockClient, booking),
      (err: any) => err instanceof ApiError && err.status === 409
    );
  });

  it('rejects reservation creation when customer already has >= 2 pending reservations', async () => {
    const mockClient: any = {
      from: (table: string) => {
        let filters: Record<string, any> = {};
        const builder: any = {
          select: () => builder,
          in: (col: string, vals: any) => { filters['in_' + col] = vals; return builder; },
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          then: (resolve: any) => {
            if (filters.status === 'pending' && filters.in_phone) {
              return resolve({ data: [{ id: 'res-p1' }, { id: 'res-p2' }], error: null });
            }
            return resolve({ data: [], error: null });
          }
        };
        return builder;
      }
    };

    const booking = {
      fullName: 'Khách Spam Đặt Bàn',
      phone: '0988096000',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 2,
      branchId: 'bo-ho',
      notes: ''
    };

    await assert.rejects(
      () => createReservation(mockClient, booking),
      (err: any) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 400);
        assert.equal(err.message, 'Bạn đang có đơn hàng chưa hoàn tất, vui lòng chờ xử lý trước khi đặt thêm.');
        return true;
      }
    );
  });

  it('allows reservation creation and saves pre-ordered items when slot has capacity', async () => {
    let insertedRecord: any = null;
    const mockClient: any = {
      from: (table: string) => {
        let filters: any = {};
        const builder: any = {
          select: () => builder,
          in: (col: string, vals: any) => { filters['in_' + col] = vals; return builder; },
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          insert: (record: any) => {
            insertedRecord = record;
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: 'res-new-1',
                    ...record,
                    created_at: new Date().toISOString(),
                    status: record.status || 'pending',
                    is_walk_in: record.is_walk_in || false,
                  },
                  error: null
                })
              })
            };
          },
          then: (resolve: any) => {
            if (filters.status === 'pending' && filters.in_phone) {
              return resolve({ data: [], error: null });
            }
            resolve({ data: [], error: null });
          }
        };
        return builder;
      }
    };

    const booking = {
      fullName: 'Nguyễn Thị C',
      phone: '0901234567',
      reservationDate: '2026-10-25',
      reservationTime: '18:00',
      partySize: 2,
      branchId: 'bo-ho',
      notes: 'Bàn yên tĩnh',
      preOrderedItems: [
        { dishId: 'pho-bo', name: 'Phở Bò', unitPrice: 70000, quantity: 2 }
      ]
    };

    const result = await createReservation(mockClient, booking);
    assert.equal(result.id, 'res-new-1');
    assert.deepEqual(insertedRecord.pre_ordered_items, booking.preOrderedItems);
    assert.equal(insertedRecord.pre_order_total, 140000);
    assert.deepEqual(result.preOrderedItems, booking.preOrderedItems);
    assert.equal(result.preOrderTotal, 140000);
  });

  it('GET /api/reservations/availability rejects missing or invalid query parameters with 400', async () => {
    const { GET: getAvailability } = await import('../src/app/api/reservations/availability/route');

    const resMissing = await getAvailability(new Request('https://pho.test/api/reservations/availability'));
    assert.equal(resMissing.status, 400);
    const bodyMissing = await resMissing.json();
    assert.equal(bodyMissing.error, 'Thiếu cơ sở hoặc ngày đặt bàn.');

    const resBadDate = await getAvailability(new Request('https://pho.test/api/reservations/availability?branchId=bo-ho&date=invalid-date'));
    assert.equal(resBadDate.status, 400);
    const bodyBadDate = await resBadDate.json();
    assert.equal(bodyBadDate.error, 'Thiếu cơ sở hoặc ngày đặt bàn.');
  });
});

