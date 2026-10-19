# Thiết kế Hệ thống: Thống nhất Đơn Ăn Tại Bàn và Quản lý Bàn Trống (Capacity Control)

- **Ngày tạo:** 2026-10-19
- **Trạng thái:** Bản thảo đề xuất (Đã qua thẩm định thiết kế)
- **Dự án:** Phở Thìn Bờ Hồ (`pho-thin`)

---

## 1. Bối cảnh & Vấn đề giải quyết

### 1.1. Hiện trạng & Lỗ hổng
1. **Phân tách lỏng lẻo giữa Đặt bàn và Đặt món:**
   - Khách đặt món trong giỏ hàng có thể chọn *"Dùng tại quán (Bàn X người)"*, nhưng thông tin này chỉ được ghép dạng chuỗi text vào ghi chú (`notes`) của đơn hàng `Order`.
   - Hệ thống không tạo bản ghi đặt bàn nào cho đơn này.
   - Tại trang quản trị (Admin Dashboard):
     - Tab **Đơn đặt bàn** (`reservations`): Chỉ thấy khách đặt bàn giữ chỗ, không biết khách đặt món lẻ tại bàn.
     - Tab **Đơn món** (`orders`): Có cả đơn ăn tại chỗ lẫn mang về, nhân viên điều phối bàn không nắm được tổng lượng bàn thực tế cần phục vụ.
2. **Không có cơ chế kiểm soát bàn trống (Capacity Limit):**
   - Khách đặt lúc nào cũng báo thành công, không hiển thị còn bao nhiêu bàn trống.
   - Vào khung giờ cao điểm, khách đặt thành công nhưng khi đến quán lại không còn bàn ăn, gây bức xúc và ảnh hưởng uy tín thương hiệu.

### 1.2. Mục tiêu giải pháp
- **Thống nhất luồng nghiệp vụ theo địa điểm ăn:**
  - Khách ăn tại quán: Đi qua luồng **Đặt bàn** (chỉ giữ chỗ HOẶC đặt bàn kèm món gọi trước).
  - Khách mang về: Đi qua luồng **Đặt món mang về** (chỉ nhận tại quầy, không chiếm bàn).
- **Kiểm soát sức chứa bàn theo thời gian thực:**
  - Giới hạn tối đa **20 đơn online / khung giờ / mỗi cơ sở**.
  - Hiển thị trực quan số bàn còn trống trên trang khách.
  - Chặn không cho đặt khi đã đủ 20 đơn ở cùng khung giờ.
- **Rõ ràng trong quản trị:**
  - Tab "Đơn đặt bàn" là trung tâm điều phối mọi khách ngồi ăn tại quán (kèm danh sách món gọi trước nếu có).
  - Tab "Đơn món" đổi tên thành "Đơn mang về", chuyên biệt 100% cho đơn đóng gói mang đi.

---

## 2. Luồng người dùng & Trải nghiệm (UI/UX)

### 2.1. Luồng Khách Đặt Bàn (`ReservationSection`)
1. **Chọn Cơ sở, Ngày, và Khung giờ:**
   - Hệ thống gọi API `GET /api/reservations/availability?branchId=...&date=...`.
   - Tính số bàn còn lại của khung giờ:
     $$\text{remaining} = 20 - \text{bookedCount}$$
2. **Hiển thị trạng thái bàn trực quan (Badge):**
   - $\text{remaining} \ge 6$: Nhãn xanh `🟢 Còn {remaining} bàn trống`.
   - $1 \le \text{remaining} \le 5$: Nhãn vàng/cam `⚡ Chỉ còn {remaining} bàn cuối trong khung giờ này!`.
   - $\text{remaining} = 0$: Nhãn đỏ `🔴 Khung giờ này đã kín 20/20 bàn online`. Nút submit bị vô hiệu hóa với thông báo chọn giờ khác hoặc gọi hotline.
3. **Món ăn gọi trước (Pre-ordered dishes):**
   - Nếu khách vào đặt bàn từ giỏ hàng hoặc từ nút "Đặt bàn với món này", form hiển thị khối:  
     `Danh sách món chọn trước ({số lượng} món - {tổng tiền} đ)` kèm nút xem/xóa nhanh.
   - Khách không chọn món trước vẫn đặt bàn bình thường như trước.

### 2.2. Luồng Khách Đặt Món Mang Về (`CheckoutSection`)
1. Đổi tên giao diện thành **"Đặt món mang về (Takeaway)"**.
2. Loại bỏ dropdown chọn "Hình thức dùng món / Bàn".
3. Thêm Banner chuyển hướng thông minh trên đầu giỏ hàng:
   > *"Quý khách muốn thưởng thức phở nóng tại bàn? Hãy đặt bàn trước để được giữ chỗ và phục vụ chu đáo nhất!"*  
   > `[Chuyển sang Đặt bàn kèm {N} món này]`
4. Khi bấm nút chuyển: Chuyển sang `ReservationSection`, giữ nguyên các món đã chọn trong giỏ hàng.

### 2.3. Khách Tra Cứu Đơn Của Tôi (`MyOrdersSection`)
- Tab "Đơn đặt bàn": Hiển thị chi tiết giờ đến, số khách, cơ sở, và danh sách các món gọi trước (kèm số lượng, giá tiền).
- Tab "Đơn mang về": Chỉ hiển thị các đơn takeaway hẹn giờ lấy tại quán.

---

## 3. Kiến trúc Dữ liệu & Backend API

### 3.1. Cập nhật Database Schema
Bảng `public.reservations`:
- Thêm cột `pre_ordered_items jsonb DEFAULT '[]'::jsonb`: Mảng chứa các món gọi trước:
  ```json
  [
    { "dishId": "tai-chin-dac-biet", "name": "Phở Tái Chín", "unitPrice": 85000, "quantity": 2 }
  ]
  ```
- Thêm cột `pre_order_total bigint DEFAULT 0`: Tổng giá trị món đặt trước.
- Giữ nguyên các cột hiện có (`id`, `full_name`, `phone`, `email`, `reservation_date`, `reservation_time`, `party_size`, `branch_id`, `branch_name`, `notes`, `status`, `is_walk_in`).

### 3.2. API Specifications

#### a. API Lấy tình trạng bàn trống: `GET /api/reservations/availability`
- **Query params:** `branchId` (string, required), `date` (YYYY-MM-DD, required)
- **Logic:**
  - Lấy tất cả các bản ghi `reservations` có `branch_id = branchId`, `reservation_date = date`, `status IN ('pending', 'confirmed', 'completed')` (loại trừ `'cancelled'`).
  - Gom nhóm theo `reservation_time` và đếm số lượng đơn.
- **Response (200 OK):**
  ```json
  {
    "branchId": "cs1-dinh-tien-hoang",
    "date": "2026-10-20",
    "maxTablesPerSlot": 20,
    "availability": {
      "07:00": { "booked": 2, "remaining": 18 },
      "11:30": { "booked": 19, "remaining": 1 },
      "12:00": { "booked": 20, "remaining": 0 }
    }
  }
  ```

#### b. API Tạo đơn đặt bàn: `POST /api/reservations`
- **Payload bổ sung:** `preOrderedItems` (mảng rỗng hoặc danh sách món hợp lệ).
- **Quy tắc kiểm tra nghiệp vụ (Server-side validation):**
  - Khóa đồng thời / kiểm tra: Đếm số đơn đặt bàn hiện có của cùng `branchId`, `reservationDate`, `reservationTime` (loại trừ `cancelled`).
  - Nếu số lượng $\ge 20$: Trả về lỗi `409 Conflict` với thông điệp rõ ràng:  
    `"Khung giờ này tại cơ sở đã đạt giới hạn 20 bàn đặt trước. Vui lòng chọn khung giờ khác."`
  - Nếu hợp lệ: Lưu đơn kèm `pre_ordered_items` và `pre_order_total`, trả về `201 Created`.

#### c. API Tạo đơn mang về: `POST /api/orders`
- Giữ nguyên luồng xử lý đơn hàng mang về (không chiếm bàn).

---

## 4. Quản trị viên (Admin Dashboard)

### 4.1. Tab "Đơn Đặt Bàn"
- Bổ sung huy hiệu trực quan cho từng thẻ đơn:
  - Nếu có món đặt trước: Badge màu xanh/vàng `[Có đặt trước món: X món • Y đ]`.
  - Bấm vào đơn sẽ mở popup/chi tiết hiển thị danh sách các món cần chuẩn bị cho bàn đó.
- Thêm cảnh báo công suất (Capacity widget) theo từng khung giờ trong ngày để nhân viên dễ theo dõi khung giờ nào sắp đầy bàn.

### 4.2. Tab "Đơn Món" -> Đổi thành "Đơn Mang Về"
- Giao diện chuyên biệt cho đơn mang đi (Takeaway).
- Hiển thị rõ giờ khách đến lấy và trạng thái chuẩn bị món của bếp.

---

## 5. Kế hoạch Kiểm thử & Xác minh (Verification Plan)
1. **Kiểm tra giới hạn 20 bàn:**
   - Tạo test script mô phỏng đặt 20 đơn cho cùng 1 khung giờ -> Bàn thứ 21 phải bị từ chối với mã lỗi 409.
   - Hủy 1 đơn -> Khung giờ mở lại còn 1 bàn trống.
2. **Kiểm tra luồng đặt bàn kèm món:**
   - Thêm món vào giỏ hàng -> Chọn "Chuyển sang đặt bàn kèm món" -> Form đặt bàn nhận đầy đủ thông tin giỏ hàng -> Gửi đơn thành công.
   - Kiểm tra Admin Dashboard hiển thị đúng danh sách món kèm theo đơn đặt bàn đó.
3. **Kiểm tra luồng mang về:**
   - Đặt món từ CheckoutSection -> Lưu thành công vào bảng orders -> Admin tab Đơn Mang Về nhận đơn.
