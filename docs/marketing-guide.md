# Hướng dẫn website cho nhóm Marketing

## 1. Website giống một nhà hàng nhỏ

**Giao diện** là mặt tiền và thực đơn; **backend** là nhân viên tiếp nhận; **database** là sổ lưu của quán. Vercel vận hành website, Supabase giữ dữ liệu và kiểm tra tài khoản. Marketing quản lý nội dung; kỹ thuật giữ cấu hình, quyền và bí mật.

Website giới thiệu thương hiệu, món ăn, cơ sở, tin tức, nhận yêu cầu đặt bàn, tuyển dụng và đặt món nhận tại quán. Khách chuyển giữa bảy màn hình và giỏ hàng trên cùng website; chưa có link riêng mỗi bài.

## 2. Những từ cần biết

| Từ | Hiểu đơn giản |
| --- | --- |
| Admin | Khu vực nhân viên được cấp quyền |
| Catalog | Danh mục món, cơ sở, bài viết |
| API | Quầy trao đổi thông tin giữa màn hình và sổ dữ liệu |
| Preview | Bản để kiểm tra trước công khai |
| Production | Bản chính thức dành cho khách |
| Deploy | Đưa phiên bản website lên nơi vận hành |
| Biến môi trường | Cấu hình do kỹ thuật quản lý |
| Secret | Chìa khóa hệ thống; không chia sẻ |

Preview không mặc nhiên là “sổ thử”: cùng database chính thức thì thao tác thử ghi dữ liệu thật. Hỏi người phụ trách trước khi tạo mẫu.

## 3. Vào quản trị an toàn

1. Mở website bàn giao, thêm `#admin` cuối địa chỉ hoặc dùng `Ctrl + Shift + A`.
2. Đăng nhập bằng email/mật khẩu riêng do chủ hệ thống cấp. Không có tài khoản mặc định; đăng ký không tự được quyền admin.
3. Dùng **Làm mới dữ liệu** trong mục Tài khoản khi cần.
4. Chọn **Đăng xuất** khi xong; “ra website” không kết thúc phiên.

Đường dẫn admin không thay thế xác thực. Không đăng tài khoản lên chat công khai/slide; không nhập secret vào giao diện. Tên và số điện thoại khách là thông tin riêng tư.

## 4. Công việc nội dung hằng ngày

### Đăng hoặc sửa bài

Mở khu vực tin tức → **Thêm bài/Sửa**. Điền tiêu đề, tóm tắt, chuyên mục, tác giả, ngày, thời gian đọc và ảnh. Chia đoạn bằng dòng trống. Kiểm tra chính tả, nguồn ảnh, thông tin thương hiệu rồi lưu.

Chờ thông báo thành công, quay lại website kiểm tra. Nếu lỗi, giữ nội dung và báo kỹ thuật; không coi lỗi là đã xuất bản. Bài nổi bật không phải lịch đăng tự động.

### Quản lý món

Mở khu vực món → **Thêm món/Sửa**. Nhập tên, giá VND nguyên, danh mục, mô tả, nguyên liệu, ảnh; chọn hiển thị trang chủ khi phù hợp. Nút còn/hết món giúp tạm ngừng nhận món; nên dùng thay vì xóa món đã có trong đơn.

### Cơ sở, ảnh, ngôn ngữ

Mục cơ sở cho sửa địa chỉ, điện thoại, giờ mở cửa và bản đồ. Xác nhận với cửa hàng trước khi đổi. Ảnh dùng URL HTTPS hoặc đường dẫn có sẵn; chưa có nút upload. Nhờ kỹ thuật chuẩn bị đường dẫn, dùng ảnh có quyền sử dụng.

Website có Việt/Anh/Trung/Hàn, nhưng bài/món mới **chép tiếng Việt** sang ngôn ngữ khác. Sửa nội dung cũ chủ yếu sửa tiếng Việt, giữ bản dịch cũ. Cần phối hợp kiểm tra/bổ sung bản dịch; không quảng cáo “dịch tự động”.

## 5. Tiếp nhận khách

- **Đặt bàn:** yêu cầu mới chờ xác nhận. Liên hệ khách, kiểm tra khả năng phục vụ rồi xác nhận; sau phục vụ chuyển hoàn thành hoặc hủy. Có thể thêm đặt bàn thủ công cho khách gọi điện. Chưa tự kiểm tra bàn trống; receipt chỉ chứng minh đã nhận yêu cầu.
- **Đặt món:** khách chọn món, số lượng, cơ sở, giờ nhận. Chỉ nhận tại quán, trả tiền khi nhận. Nhân viên xác nhận → hoàn thành, hoặc hủy trước hoàn thành. Hoàn thành không chứng minh đã thu tiền; chưa có giao hàng/thanh toán online.
- **Tuyển dụng:** form gửi dữ liệu thật vào danh sách liên hệ. Liên hệ ứng viên ngoài website rồi cập nhật mới/đã liên hệ/đã xử lý. API hỗ trợ liên hệ chung nhưng chưa có form công khai tương ứng.

Chưa tự gửi email/SMS. “Doanh thu ước tính” dựa số khách, không phải tiền thực thu. CSV đặt bàn chứa dữ liệu cá nhân: chỉ xuất khi cần, lưu có kiểm soát, không đưa lên slide.

## 6. Xem cấu hình Vercel cùng kỹ thuật

**Các bước để chủ dự án đưa lên Vercel**; tài liệu này không tự deploy:

1. Chủ dự án đăng nhập Vercel → Add New Project → Import repository GitHub. Nếu đã có project, mở project đã liên kết.
2. Trong Settings, kiểm tra framework **Next.js**, Node **24.x**, install `bun install --frozen-lockfile`, build `bun run build`.
3. Trong Environment Variables, kỹ thuật kiểm tra tên `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` cho Preview/Production. Marketing không cần xem/copy giá trị; không chụp cấu hình bí mật.
4. `APP_URL` thường để unset; nếu dùng, kỹ thuật đặt đúng địa chỉ từng môi trường, không dùng localhost trên bản công khai.
5. Sau khi database/admin đã sẵn sàng và các điều kiện bảo mật dưới đây hoàn tất, chủ dự án chọn Deploy. Nếu có bản Ready được phép xem, mở Preview để kiểm tra; cập nhật cấu hình thì chủ dự án Redeploy. Không coi việc có config là website đã chạy.

Push có thể tự tạo Preview nếu repository đã liên kết. Trước public, chủ hệ thống cần đổi bí mật từng chia sẻ, kiểm tra admin và giới hạn yêu cầu chống spam. Tài liệu không khẳng định đã thực hiện.

## 7. Checklist demo và bàn giao

- [ ] Kiểm tra điện thoại/máy tính, menu, ảnh, bản đồ, bốn ngôn ngữ.
- [ ] Dùng môi trường được duyệt, không nhập thông tin khách thật.
- [ ] Minh họa sửa nội dung; đợi lưu thành công, tải lại kiểm tra.
- [ ] Nói rõ đặt bàn chờ xác nhận; món nhận tại quán/trả tiền khi nhận.
- [ ] Không hứa thanh toán online, QR thật, tồn kho/bàn trống tự động.
- [ ] Khi lỗi, ghi thời điểm/thao tác và thông báo đã che dữ liệu riêng tư; báo kỹ thuật.
- [ ] Đăng xuất, xử lý dữ liệu mẫu theo thỏa thuận, ghi người nhận bàn giao.

Có món trên màn hình nhưng báo lỗi backend có thể chỉ là nội dung mẫu. Nếu không rõ đơn đã gửi chưa, nhờ nhân viên kiểm tra trước khi gửi lại; tránh tạo trùng.

Nguồn: `src/App.tsx`, `src/components/admin/AdminDashboard.tsx`, `src/components/ContactSection.tsx`, `src/services/adminStore.ts`. Chi tiết tại [architecture.md](architecture.md), README và `.env.example`.
