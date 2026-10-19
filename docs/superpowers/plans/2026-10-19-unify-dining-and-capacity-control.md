# Unify Dining-In & Table Capacity Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thống nhất toàn bộ khách ăn tại quán vào luồng Đặt bàn (kèm món gọi trước tùy chọn), kiểm soát giới hạn tối đa 20 đơn online / khung giờ / mỗi cơ sở với nhãn hiển thị số bàn trống trực quan, và tách biệt đơn mang về tại quầy.

**Architecture:** Mở rộng bảng `reservations` để lưu trữ `pre_ordered_items` và `pre_order_total`. Tạo endpoint `GET /api/reservations/availability` tính toán số bàn đã đặt / còn lại theo thời gian thực và ép giới hạn 20 đơn tại `POST /api/reservations`. Cập nhật `ReservationSection` hiển thị badge số bàn trống, cập nhật `CheckoutSection` thuần túy thành Đặt món mang về kèm nút chuyển sang đặt bàn, và nâng cấp `AdminDashboard` để quản lý bàn kèm món gọi trước.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase / PostgreSQL, Tailwind CSS v4, Bun test runner.

**Spec:** `docs/superpowers/specs/2026-10-19-unify-dining-and-capacity-control-design.md`

## Global Constraints
- Tất cả các lệnh kiểm tra và test chạy bằng Bun: `bun test --conditions=react-server <test-file>` và `bun run lint`.
- Ngưỡng giới hạn bàn đặt trước trực tuyến là đúng 20 đơn / khung giờ / mỗi chi nhánh (`maxTablesPerSlot = 20`).
- Các đơn có trạng thái `cancelled` không được tính vào số bàn đã chiếm.
- Luôn kiểm tra tính tương thích ngược với dữ liệu đặt bàn hiện có (đơn đặt bàn không có món gọi trước thì `pre_ordered_items` là mảng rỗng `[]` và `pre_order_total` là `0`).

## Review Focus
1. Hai khách đặt đồng thời ở bàn thứ 20 cùng 1 giây: Backend phải kiểm tra atomic/count và trả về lỗi 409 cho khách thứ 2 thay vì vượt quá 20 bàn.
2. Khách đổi ngày hoặc cơ sở trong form đặt bàn: UI phải làm mới trạng thái số bàn trống tương ứng với cơ sở và ngày mới ngay lập tức.
3. Khách chuyển từ giỏ hàng sang Đặt bàn: Giỏ hàng phải được chuyển đầy đủ số lượng, đơn giá và tên món sang danh sách `preOrderedItems` của đơn đặt bàn.
4. Đơn mang về (Takeaway) trong `CheckoutSection`: Không được tạo bản ghi đặt bàn, chỉ tạo bản ghi `orders` và không làm giảm số bàn trống của cơ sở.
5. Hiển thị số bàn trong Admin Dashboard: Nhân viên xem chi tiết đơn đặt bàn phải thấy được danh sách từng món phở/đồ uống khách đã gọi trước kèm tổng tiền tạm tính.

---

### Task 1: Data Model & Schema Updates for Reservations Pre-ordering

**Files:**
- Create: `supabase/migrations/202610190001_reservation_preorders.sql`
- Modify: `supabase/schema.sql:50-65`
- Modify: `src/types.ts:104-130`
- Modify: `src/lib/server/mappings.ts:1-50`
- Test: `tests/reservation-capacity.test.ts`

**Interfaces:**
- Produces:
  - `ReservationFormData.preOrderedItems?: OrderItem[]`
  - `AdminReservation.preOrderedItems?: OrderItem[]`
  - `AdminReservation.preOrderTotal?: number`

- [ ] **Step 1: Write failing test for reservation types and mappings with pre-ordered items**

```typescript
// tests/reservation-capacity.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test --conditions=react-server tests/reservation-capacity.test.ts`
Expected: FAIL (`preOrderedItems` / `preOrderTotal` undefined on mapped object).

- [ ] **Step 3: Implement migration and update types/mappings**

1. Write `supabase/migrations/202610190001_reservation_preorders.sql`:
```sql
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS pre_ordered_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pre_order_total bigint DEFAULT 0;
```
2. Update `src/types.ts`: add `preOrderedItems?: OrderItem[]` and `preOrderTotal?: number` to `ReservationFormData`, `ReservationRecord`, and `AdminReservation`.
3. Update `src/lib/server/mappings.ts`: in `mapReservation`, assign `preOrderedItems: Array.isArray(row.pre_ordered_items) ? row.pre_ordered_items : []` and `preOrderTotal: Number(row.pre_order_total || 0)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test --conditions=react-server tests/reservation-capacity.test.ts`
Expected: PASS

- [ ] **Step 5: Run lint & Commit**

Run: `bun run lint`
Commit: `git add supabase/ src/types.ts src/lib/server/mappings.ts tests/reservation-capacity.test.ts && git commit -m "feat: add pre-ordered items schema to reservations"`

---

### Task 2: Backend Capacity Checking & Availability API

**Files:**
- Create: `src/app/api/reservations/availability/route.ts`
- Modify: `src/lib/server/validation.ts:100-140`
- Modify: `src/lib/server/operations.ts:18-35`
- Test: `tests/reservation-capacity.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/reservations/availability?branchId=<id>&date=<YYYY-MM-DD>`
  - `getReservationAvailability(client: SupabaseClient, branchId: string, date: string): Promise<AvailabilityResponse>`
  - `createReservation` enforces maximum 20 reservations per slot and saves `pre_ordered_items` / `pre_order_total`.

- [ ] **Step 1: Write tests for capacity limit and availability check**

Append to `tests/reservation-capacity.test.ts`:
```typescript
describe('Reservation Capacity & Availability', () => {
  it('calculates remaining tables per slot with 20 max tables', async () => {
    // mock DB with 19 bookings at 11:30 and 20 bookings at 12:00
    // test availability function returns 1 remaining for 11:30, 0 for 12:00, 20 for 12:30
  });

  it('rejects reservation creation when slot has 20 active bookings with 409 Conflict', async () => {
    // verify createReservation throws ApiError(409)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test --conditions=react-server tests/reservation-capacity.test.ts`
Expected: FAIL (functions not implemented or not enforcing limit).

- [ ] **Step 3: Implement validation, operations, and availability route**

1. In `src/lib/server/validation.ts`: validate `preOrderedItems` (optional array of valid items with positive quantity and unit price).
2. In `src/lib/server/operations.ts`:
   - Implement `reservationAvailability(client, branchId, date)`: query `reservations` for `branch_id = branchId` and `reservation_date = date` where `status != 'cancelled'`. Aggregate counts by `reservation_time`. Return slots with `{ booked, remaining: Math.max(0, 20 - booked) }`.
   - In `createReservation`: before inserting, count existing reservations with `branch_id = r.branchId`, `reservation_date = r.reservationDate`, `reservation_time = r.reservationTime`, and `status != 'cancelled'`. If count >= 20, throw `new ApiError(409, 'Khung giờ này tại cơ sở đã đạt giới hạn 20 bàn đặt trước. Vui lòng chọn khung giờ khác.')`.
3. Create `src/app/api/reservations/availability/route.ts`:
   - Handle `GET(request: Request)`: read `branchId` and `date` search params, call `reservationAvailability`, return JSON response.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test --conditions=react-server tests/reservation-capacity.test.ts`
Expected: PASS

- [ ] **Step 5: Run lint & Commit**

Run: `bun run lint`
Commit: `git add src/app/api/reservations/ src/lib/server/ tests/ && git commit -m "feat: implement 20-table capacity limit and availability endpoint"`

---

### Task 3: Customer Reservation UI with Real-time Capacity Badges & Pre-order Dish Handling

**Files:**
- Modify: `src/services/adminStore.ts`
- Modify: `src/components/ReservationSection.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/reservations/availability?branchId=&date=`
  - `preselectedDishes?: CartItem[]`
- Produces:
  - Real-time badges for available tables per slot
  - Pre-ordered dishes tray inside reservation form
  - Submit reservation with `preOrderedItems` and `preOrderTotal`

- [ ] **Step 1: Update adminStore to fetch availability and handle pre-orders**

Add method to `adminStore`:
```typescript
async getReservationAvailability(branchId: string, date: string): Promise<Record<string, { booked: number; remaining: number }>>
```
Update `createReservation` payload in `adminStore` to pass `preOrderedItems` and `preOrderTotal`.

- [ ] **Step 2: Update `ReservationSection.tsx`**

1. Add state `availability: Record<string, { booked: number; remaining: number }>` fetched whenever `formData.branchId` or `formData.reservationDate` changes.
2. Render table availability status for selected `reservationTime`:
   - `remaining >= 6`: `🟢 Còn ${remaining} bàn trống` (text-emerald-700 bg-emerald-50).
   - `remaining > 0 && remaining < 6`: `⚡ Chỉ còn ${remaining} bàn cuối!` (text-amber-800 bg-amber-50).
   - `remaining === 0`: `🔴 Khung giờ này đã kín 20/20 bàn online. Vui lòng chọn giờ khác.` (text-red-700 bg-red-50).
   - Disable submit button when `remaining === 0`.
3. Support `preselectedCart?: CartItem[]`:
   - Display pre-ordered items card: list dishes, quantity, unit price, total amount.
   - Allow removing an item or clearing pre-orders.
   - On submit, include pre-ordered items in reservation request.
4. On voucher/confirmation view: display the pre-ordered dishes and total amount if present.

- [ ] **Step 3: Connect App.tsx to pass cart into ReservationSection**

In `App.tsx`:
- Add prop/state for passing `cart` when transitioning from checkout to reservation.

- [ ] **Step 4: Verify with typegen and lint**

Run: `bun run lint`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

Run: `git commit -am "feat: add real-time table capacity badges and pre-order dishes to reservation UI"`

---

### Task 4: Streamlined Takeaway Checkout & Table Booking Transition Banner

**Files:**
- Modify: `src/components/CheckoutSection.tsx`
- Modify: `src/components/DishDetailModal.tsx`
- Modify: `src/components/MyOrdersSection.tsx`

**Interfaces:**
- Consumes:
  - `cart: CartItem[]`
- Produces:
  - `onSwitchToReservation?: () => void` in `CheckoutSection`
  - Remove ambiguous "Dùng tại quán" dropdown from CheckoutSection
  - Pure takeaway checkout with clear pickup instructions

- [ ] **Step 1: Refactor `CheckoutSection.tsx` to pure Takeaway**

1. Update page header: "Đặt món mang về (Takeaway - Nhận tại quầy)".
2. Add a highlighted banner at the top of the form:
   > 🍜 **Quý khách muốn dùng bữa tại quán?**  
   > Đặt bàn trước để được giữ chỗ và phục vụ món nóng hổi ngay khi đến!  
   > `[Chuyển sang Đặt bàn kèm {cart.length} món này]`
3. Remove the `diningOption` `<select>` field (no more confusion between table dining and takeaway).
4. When customer clicks "Chuyển sang Đặt bàn kèm món này", call `onSwitchToReservation` which navigates to `reservation` view with the current cart items.

- [ ] **Step 2: Update `MyOrdersSection.tsx`**

1. In the "Đơn đặt bàn" tab: render pre-ordered items if `res.preOrderedItems` exists with item details and `preOrderTotal`.
2. In the "Đơn món" tab: rename header / tab label to "Đơn mang về".

- [ ] **Step 3: Verify with typegen and lint**

Run: `bun run lint`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

Run: `git commit -am "feat: refactor checkout to pure takeaway and add switch-to-reservation banner"`

---

### Task 5: Admin Dashboard Enhancements for Table Capacity and Pre-orders

**Files:**
- Modify: `src/components/admin/AdminDashboard.tsx`
- Test: Manual verification + unit test

**Interfaces:**
- Displays:
  - Pre-order dish badges in Reservations manager table
  - Detail modal for Reservations showing dish quantities & total price
  - Renamed Orders tab to "Đơn Mang Về (Takeaway)"
  - Table capacity overview widget for today's reservations

- [ ] **Step 1: Enhance Reservations Tab in `AdminDashboard.tsx`**

1. For each reservation item:
   - Check if `item.preOrderedItems && item.preOrderedItems.length > 0`.
   - Render badge: `🍜 Có gọi trước {N} món • {total.toLocaleString('vi-VN')} đ` in amber/gold.
   - Clicking details shows the itemized dish list (e.g., `2 × Phở Tái Chín, 1 × Trà Đá`) and temporary total bill.
2. Add capacity monitor widget above reservations table:
   - Group today's reservations by time slot.
   - Show slots nearing capacity (e.g. `11:30: 18/20 bàn`, `12:00: 20/20 bàn [KÍN]`).

- [ ] **Step 2: Refactor Orders Tab in `AdminDashboard.tsx`**

1. Change tab label and header to "Đơn Mang Về (Takeaway)".
2. Subtitle: "Chỉ bao gồm các đơn khách hẹn giờ đến quầy lấy mang đi. Không chiếm bàn tại quán."

- [ ] **Step 3: Verify with typegen and lint**

Run: `bun run lint`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

Run: `git commit -am "feat: enhance admin dashboard with reservation pre-order details and capacity monitor"`

---

### Task 6: End-to-End Integration Tests & Verification

**Files:**
- Create/Modify: `tests/capacity-integration.test.ts`
- Run: Full test suite

- [ ] **Step 1: Write integration tests covering all critical flows**

1. Test capacity endpoint returns slots with correct available counts.
2. Test reservation creation rejects 21st booking with 409.
3. Test pre-ordered dishes are stored and returned properly.
4. Test takeaway order does not decrease table capacity.

- [ ] **Step 2: Run all backend tests and lint**

Run: `bun test --conditions=react-server`
Run: `bun run lint`
Expected: All tests PASS with 0 errors.

- [ ] **Step 3: Final commit**

Run: `git commit -am "test: add integration test suite for capacity and unified reservations"`
