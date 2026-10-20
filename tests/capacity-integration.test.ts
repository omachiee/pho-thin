import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reservationAvailability, createReservation, createOrder, customerOrders } from '../src/lib/server/operations';
import { ApiError } from '../src/lib/server/validation';

describe('End-to-End Table Capacity & Reservation Integration', () => {
  it('enforces table capacity limit and releases table when reservation is cancelled', async () => {
    let mockReservations: any[] = [];
    const mockClient: any = {
      from: (table: string) => {
        let filters: any = {};
        const builder: any = {
          select: () => builder,
          in: (col: string, val: any) => { filters['in_' + col] = val; return builder; },
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          insert: (payload: any) => {
            const row = { id: `res-${mockReservations.length + 1}`, ...payload };
            mockReservations.push(row);
            return {
              select: () => ({
                single: async () => ({ data: row, error: null })
              })
            };
          },
          then: (resolve: any) => {
            if (filters.status === 'pending' && filters.in_phone) {
              const pendingRows = mockReservations.filter(r =>
                filters.in_phone.includes(r.phone) && (r.status === 'pending' || r.status === undefined)
              );
              return resolve({ data: pendingRows, error: null });
            }
            const filtered = mockReservations.filter(r =>
              (!filters.branch_id || r.branch_id === filters.branch_id) &&
              (!filters.reservation_date || r.reservation_date === filters.reservation_date) &&
              (!filters.reservation_time || r.reservation_time === filters.reservation_time) &&
              (!filters.not_status || r.status !== filters.not_status)
            );
            resolve({ data: filtered, error: null });
          }
        };
        return builder;
      }
    };

    // 1. Initial slot availability: 0 booked, 20 remaining
    const initial = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(initial.availability['12:00']?.booked || 0, 0);
    assert.equal(initial.availability['12:00']?.remaining || 20, 20);

    // 2. Book 20 reservations for 12:00
    for (let i = 0; i < 20; i++) {
      await createReservation(mockClient, {
        fullName: `Khách ${i + 1}`,
        phone: `09123456${i.toString().padStart(2, '0')}`,
        reservationDate: '2026-10-25',
        reservationTime: '12:00',
        partySize: 2,
        branchId: 'bo-ho',
        notes: ''
      });
    }

    // 3. Verify slot is now full: 20 booked, 0 remaining
    const full = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(full.availability['12:00'].booked, 20);
    assert.equal(full.availability['12:00'].remaining, 0);

    // 4. Attempt 21st booking -> MUST throw ApiError 409
    await assert.rejects(
      () => createReservation(mockClient, {
        fullName: 'Khách thứ 21',
        phone: '0988888888',
        reservationDate: '2026-10-25',
        reservationTime: '12:00',
        partySize: 2,
        branchId: 'bo-ho',
        notes: ''
      }),
      (err: any) => err instanceof ApiError && err.status === 409
    );

    // 5. Cancel 1 reservation -> Capacity is released (19 booked, 1 remaining)
    mockReservations[0].status = 'cancelled';
    const released = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(released.availability['12:00'].booked, 19);
    assert.equal(released.availability['12:00'].remaining, 1);

    // 6. Now booking succeeds
    const reopenedBooking = await createReservation(mockClient, {
      fullName: 'Khách thứ 21 sau khi có bàn hủy',
      phone: '0988888888',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 2,
      branchId: 'bo-ho',
      notes: ''
    });
    assert(reopenedBooking.id);
  });

  it('correctly saves pre-ordered dishes and computes total amount', async () => {
    let savedRow: any = null;
    const mockClient: any = {
      from: () => {
        const builder: any = {
          select: () => builder,
          in: () => builder,
          eq: () => builder,
          neq: () => builder,
          insert: (payload: any) => {
            savedRow = payload;
            return { select: () => ({ single: async () => ({ data: { id: 'res-preorder-1', ...payload }, error: null }) }) };
          },
          then: (r: any) => r({ data: [], error: null })
        };
        return builder;
      }
    };

    const preOrderedItems = [
      { dishId: 'pho-tai', name: 'Phở Tái Chín', unitPrice: 75000, quantity: 2 },
      { dishId: 'tra-da', name: 'Trà Đá', unitPrice: 10000, quantity: 2 }
    ];

    const result = await createReservation(mockClient, {
      fullName: 'Nguyễn Văn C',
      phone: '0901234567',
      reservationDate: '2026-10-26',
      reservationTime: '18:30',
      partySize: 2,
      branchId: 'bo-ho',
      notes: 'Ăn tại chỗ',
      preOrderedItems
    });

    assert.equal(savedRow.pre_order_total, 170000);
    assert.deepEqual(savedRow.pre_ordered_items, preOrderedItems);
    assert.equal(result.preOrderTotal, 170000);
    assert.equal(result.preOrderedItems?.length, 2);
  });

  it('separates takeaway orders from table reservations without consuming table capacity', async () => {
    let mockReservations: any[] = [];
    let mockOrders: any[] = [];

    const mockClient: any = {
      from: (table: string) => {
        let filters: any = {};
        const builder: any = {
          select: () => builder,
          in: () => builder,
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          insert: (payload: any) => {
            const row = { id: `res-${mockReservations.length + 1}`, ...payload };
            mockReservations.push(row);
            return {
              select: () => ({
                single: async () => ({ data: row, error: null })
              })
            };
          },
          then: (resolve: any) => {
            const filtered = mockReservations.filter(r =>
              (!filters.branch_id || r.branch_id === filters.branch_id) &&
              (!filters.reservation_date || r.reservation_date === filters.reservation_date) &&
              (!filters.reservation_time || r.reservation_time === filters.reservation_time) &&
              (!filters.not_status || r.status !== filters.not_status)
            );
            resolve({ data: filtered, error: null });
          }
        };
        return builder;
      },
      rpc: (fn: string, params: any) => {
        if (fn === 'create_order') {
          const newOrder = {
            id: `order-${mockOrders.length + 1}`,
            full_name: params.p_full_name,
            phone: params.p_phone,
            branch_id: params.p_branch_id,
            pickup_at: params.p_pickup_at,
            notes: params.p_notes,
            status: 'pending',
            total: 150000,
            created_at: new Date().toISOString(),
            order_items: params.p_items.map((item: any) => ({
              dish_id: item.dish_id,
              name: 'Phở Bò Mang Về',
              unit_price: 75000,
              quantity: item.quantity
            }))
          };
          mockOrders.push(newOrder);
          return Promise.resolve({ data: newOrder, error: null });
        }
        return Promise.resolve({ data: null, error: new Error(`Unknown RPC ${fn}`) });
      }
    };

    // 1. Check initial table availability: 20 remaining
    const beforeTakeaway = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(beforeTakeaway.availability['12:00']?.booked || 0, 0);
    assert.equal(beforeTakeaway.availability['12:00']?.remaining || 20, 20);

    // 2. Place multiple takeaway orders for 12:00 on the same date and branch
    const takeawayOrder = await createOrder(mockClient, {
      fullName: 'Khách Mang Về',
      phone: '0912345678',
      branchId: 'bo-ho',
      pickupAt: '2026-10-25T12:00:00+07:00',
      notes: 'Đóng gói cẩn thận',
      items: [{ dishId: 'pho-tai', quantity: 2 }]
    });

    assert.equal(takeawayOrder.id, 'order-1');
    assert.equal(takeawayOrder.items.length, 1);
    assert.equal(mockOrders.length, 1);

    // 3. Table reservation capacity is completely unaffected by takeaway orders
    const afterTakeaway = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(afterTakeaway.availability['12:00']?.booked || 0, 0);
    assert.equal(afterTakeaway.availability['12:00']?.remaining || 20, 20);

    // 4. A table reservation can still be placed normally
    const reservation = await createReservation(mockClient, {
      fullName: 'Khách Đặt Bàn',
      phone: '0933333333',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 4,
      branchId: 'bo-ho',
      notes: 'Bàn gia đình'
    });
    assert(reservation.id);

    const afterReservation = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(afterReservation.availability['12:00'].booked, 1);
    assert.equal(afterReservation.availability['12:00'].remaining, 19);
  });

  it('isolates capacity per branch and time slot independently', async () => {
    let mockReservations: any[] = [];
    const mockClient: any = {
      from: (table: string) => {
        let filters: any = {};
        const builder: any = {
          select: () => builder,
          in: (col: string, val: any) => { filters['in_' + col] = val; return builder; },
          eq: (col: string, val: any) => { filters[col] = val; return builder; },
          neq: (col: string, val: any) => { filters['not_' + col] = val; return builder; },
          insert: (payload: any) => {
            const row = { id: `res-${mockReservations.length + 1}`, ...payload };
            mockReservations.push(row);
            return {
              select: () => ({
                single: async () => ({ data: row, error: null })
              })
            };
          },
          then: (resolve: any) => {
            if (filters.status === 'pending' && filters.in_phone) {
              const pendingRows = mockReservations.filter(r =>
                filters.in_phone.includes(r.phone) && (r.status === 'pending' || r.status === undefined)
              );
              return resolve({ data: pendingRows, error: null });
            }
            const filtered = mockReservations.filter(r =>
              (!filters.branch_id || r.branch_id === filters.branch_id) &&
              (!filters.reservation_date || r.reservation_date === filters.reservation_date) &&
              (!filters.reservation_time || r.reservation_time === filters.reservation_time) &&
              (!filters.not_status || r.status !== filters.not_status)
            );
            resolve({ data: filtered, error: null });
          }
        };
        return builder;
      }
    };

    // Fill bo-ho at 12:00 with 20 reservations
    for (let i = 0; i < 20; i++) {
      await createReservation(mockClient, {
        fullName: `Khách Bờ Hồ ${i + 1}`,
        phone: `09123456${i.toString().padStart(2, '0')}`,
        reservationDate: '2026-10-25',
        reservationTime: '12:00',
        partySize: 2,
        branchId: 'bo-ho',
        notes: ''
      });
    }

    // 12:00 at bo-ho is full
    const boHo12 = await reservationAvailability(mockClient, 'bo-ho', '2026-10-25');
    assert.equal(boHo12.availability['12:00'].booked, 20);
    assert.equal(boHo12.availability['12:00'].remaining, 0);

    // 12:30 at bo-ho is still open with 20 tables remaining
    assert.equal(boHo12.availability['12:30']?.booked || 0, 0);
    assert.equal(boHo12.availability['12:30']?.remaining || 20, 20);

    // 12:00 at dong-da branch is also still open with 20 tables remaining
    const dongDa12 = await reservationAvailability(mockClient, 'dong-da', '2026-10-25');
    assert.equal(dongDa12.availability['12:00']?.booked || 0, 0);
    assert.equal(dongDa12.availability['12:00']?.remaining || 20, 20);

    // Customer can book 12:30 at bo-ho
    const booking1230 = await createReservation(mockClient, {
      fullName: 'Khách Đặt 12h30',
      phone: '0977777777',
      reservationDate: '2026-10-25',
      reservationTime: '12:30',
      partySize: 2,
      branchId: 'bo-ho',
      notes: ''
    });
    assert(booking1230.id);

    // Customer can book 12:00 at dong-da
    const bookingDongDa = await createReservation(mockClient, {
      fullName: 'Khách Đặt Đống Đa',
      phone: '0966666666',
      reservationDate: '2026-10-25',
      reservationTime: '12:00',
      partySize: 2,
      branchId: 'dong-da',
      notes: ''
    });
    assert(bookingDongDa.id);
  });

  it('GET /api/reservations/availability validates required parameters and returns 400 if missing or invalid', async () => {
    const { GET: getAvailability } = await import('../src/app/api/reservations/availability/route');

    const resNoParams = await getAvailability(new Request('https://pho.test/api/reservations/availability'));
    assert.equal(resNoParams.status, 400);
    const bodyNoParams = await resNoParams.json();
    assert.equal(bodyNoParams.error, 'Thiếu cơ sở hoặc ngày đặt bàn.');

    const resInvalidDate = await getAvailability(new Request('https://pho.test/api/reservations/availability?branchId=bo-ho&date=not-a-date'));
    assert.equal(resInvalidDate.status, 400);
    const bodyInvalidDate = await resInvalidDate.json();
    assert.equal(bodyInvalidDate.error, 'Thiếu cơ sở hoặc ngày đặt bàn.');
  });

  it('customerOrders unifies takeaway orders and table reservations with pre-ordered items for customer tracking', async () => {
    const mockClient: any = {
      from: (table: string) => {
        let phoneFilters: string[] = [];
        const builder: any = {
          select: () => builder,
          in: (col: string, values: string[]) => {
            if (col === 'phone') phoneFilters = values;
            return builder;
          },
          order: () => {
            if (table === 'orders') {
              return Promise.resolve({
                data: [{
                  id: 'ord-takeaway-1',
                  full_name: 'Phạm Minh',
                  phone: '0912345678',
                  branch_id: 'bo-ho',
                  branch_name: 'Phở Thìn Bờ Hồ',
                  pickup_at: '2026-10-25T12:00:00.000Z',
                  notes: 'Mang về',
                  status: 'pending',
                  total: 150000,
                  created_at: '2026-10-20T10:00:00.000Z',
                  order_items: [{ dish_id: 'pho-tai', name: 'Phở Tái', unit_price: 75000, quantity: 2 }]
                }],
                error: null
              });
            }
            if (table === 'reservations') {
              return Promise.resolve({
                data: [{
                  id: 'res-preorder-1',
                  full_name: 'Phạm Minh',
                  phone: '0912345678',
                  reservation_date: '2026-10-25',
                  reservation_time: '18:00',
                  party_size: 2,
                  branch_id: 'bo-ho',
                  branch_name: 'Phở Thìn Bờ Hồ',
                  notes: 'Ăn tại quán',
                  status: 'pending',
                  created_at: '2026-10-20T10:30:00.000Z',
                  pre_ordered_items: [{ dishId: 'pho-chin', name: 'Phở Chín', unitPrice: 75000, quantity: 2 }],
                  pre_order_total: 150000
                }],
                error: null
              });
            }
            return Promise.resolve({ data: [], error: null });
          }
        };
        return builder;
      }
    };

    const history = await customerOrders(mockClient, '0912345678');
    assert.equal(history.orders.length, 1);
    assert.equal(history.orders[0].id, 'ord-takeaway-1');
    assert.equal(history.orders[0].total, 150000);
    assert.equal(history.orders[0].items.length, 1);

    assert.equal(history.reservations.length, 1);
    assert.equal(history.reservations[0].id, 'res-preorder-1');
    assert.equal(history.reservations[0].preOrderTotal, 150000);
    assert.equal(history.reservations[0].preOrderedItems?.length, 1);
    assert.equal(history.reservations[0].preOrderedItems?.[0]?.dishId, 'pho-chin');
  });
});
