# Kiến trúc Phở Thìn Bờ Hồ

## 1. Phạm vi và công nghệ

Đồ án kết hợp giới thiệu thương hiệu, thực đơn, tin tức, đặt bàn, tuyển dụng và đặt món nhận tại quán. Mục tiêu là hệ thống nhỏ, dễ bàn giao; không phải nền tảng quản lý nhà hàng đầy đủ.

Stack: Next.js 16.4, React 19.3, TypeScript 7, Tailwind CSS 4; Bun 1.3.14 quản lý gói, Node.js 24.x chạy backend. Supabase cung cấp PostgreSQL, Auth và Storage; Vercel chạy Next.js.

`src/app/page.tsx` mở `ClientApp`, tải `App` với `ssr: false`. Website là **SPA tại `/`**: React state chuyển bảy màn hình và checkout, không phải bảy route SSR. Layout cung cấp metadata chung; chưa có URL/SEO riêng từng bài hoặc màn hình. Ngôn ngữ: `vi/en/zh/ko`; bài/món mới sao chép tiếng Việt sang các ngôn ngữ khác, không dịch AI.

## 2. Cấu trúc và luồng

```text
src/
  app/                 layout, page, client, api/*/route.ts
  components/          giao diện khách và admin
  lib/server/          HTTP, validation, Supabase, operations, mappings
  services/            fetch API và store bộ nhớ
  data/                nội dung mẫu đa ngôn ngữ
  types.ts             hợp đồng TypeScript
public/                ảnh và tài nguyên web
supabase/              schema.sql, seed.sql, migrations/
scripts/               sinh seed, init-db.mjs
tests/                 kiểm thử Node và Python Playwright
design-reference/      PNG, OCR, Canva ZIP, logo nguồn
docs/                  kiến trúc và hướng dẫn marketing
```

Tài liệu thiết kế được giữ riêng khỏi tài nguyên phục vụ web; ảnh gốc trong `public/` được giữ, bản sao dư thừa trong `src/assets/` được dọn. `AGENTS.md` chứa hướng dẫn Next.js, không phải cấu hình triển khai.

```text
Trình duyệt → fetch /api cùng website → Next Route Handler
  → kiểm tra Origin/JSON/quyền → Supabase SDK → PostgreSQL + RLS
  ← {data} hoặc {error} ← kết quả ← cơ sở dữ liệu
```

`adminStore` giữ catalog và dữ liệu quản trị trong RAM, phát `phothin_store_updated` để cập nhật UI. Khởi tạo xóa thông tin nhạy cảm cũ trong local/session storage; đăng xuất xóa danh sách riêng tư. Không có realtime đa thiết bị: cần làm mới dữ liệu. Catalog mẫu giúp xem giao diện khi backend lỗi, **không giả lưu** form/đơn thành công.

## 3. Dữ liệu

Chín bảng ứng dụng trong `supabase/schema.sql`:

| Bảng | Vai trò |
| --- | --- |
| `dishes` | Tên/mô tả đa ngôn ngữ, giá, ảnh, còn món |
| `branches` | Cơ sở, địa chỉ, giờ mở cửa, bản đồ |
| `articles` | Tiêu đề, đoạn nội dung, ảnh, bài nổi bật |
| `reservations` | Khách, cơ sở, ngày/giờ, số người, trạng thái |
| `inquiries` | Liên hệ/tuyển dụng, thông tin ứng viên |
| `admin_profiles` | Liên kết `auth.users`, quyền quản trị |
| `security_logs` | Bảng nhật ký; chưa có luồng ghi audit đầy đủ |
| `orders` | Khách, cơ sở, giờ nhận, tổng tiền, trạng thái |
| `order_items` | Món, số lượng, snapshot tên/giá |

`orders` có nhiều `order_items`; đơn/đặt bàn tham chiếu cơ sở, item tham chiếu món. Khóa ngoại ngăn xóa món đang được sử dụng. Nội dung đa ngôn ngữ dùng JSONB.

RPC `create_order` chỉ cấp cho `service_role`, tạo đơn và item trong một transaction. Database kiểm tra món còn bán, lấy **giá catalog đáng tin cậy**, lưu snapshot, tính tổng VND nguyên; không nhận giá/tổng do trình duyệt quyết định. Giỏ: 1–20 loại món, mỗi loại 1–50 phần. Đặt bàn/nhận món giới hạn thời gian tương lai tối đa 90 ngày; đặt bàn theo giờ Việt Nam.

Đơn: `pending → confirmed → completed`, hoặc hủy trước hoàn thành; trigger kiểm tra chuyển trạng thái. Đặt bàn cũng có `pending/confirmed/completed/cancelled`, nhưng không áp dụng cùng state machine. Liên hệ: `new/contacted/resolved`.

## 4. Hợp đồng API

Nguồn: `src/app/api/`, `src/lib/server/{operations,validation,http}.ts`. JSON thành công `{data: ...}`, lỗi `{error: ...}`; HTTP 400 dữ liệu sai, 401 chưa đăng nhập, 403 thiếu quyền/Origin sai, 503 dịch vụ lỗi. Response `private, no-store`.

| Endpoint | Hợp đồng chính |
| --- | --- |
| `GET /api/catalog` | Trả `{dishes, branches, articles}` công khai |
| `GET/POST/DELETE /api/auth` | Phiên hiện tại; đăng nhập `{email,password}`; đăng xuất |
| `POST /api/reservations` | `fullName,phone,email?,reservationDate,reservationTime,partySize,branchId,notes?`; trả receipt pending |
| `POST /api/inquiries` | `type,fullName,phone,email?,position?,message`; recruitment cần position |
| `POST /api/orders` | `fullName,phone,branchId,pickupAt,notes?,items[{dishId,quantity}]`; pickupAt ISO có múi giờ |
| `/api/admin/[resource]` | GET danh sách; POST lưu; PATCH trạng thái/còn món; DELETE `?id=...` |

Resource chỉ gồm `dishes/branches/articles/reservations/inquiries/orders`. POST cho món, cơ sở, bài và đặt bàn thủ công; PATCH cho món, đặt bàn, liên hệ, đơn; DELETE cho món, bài, đặt bàn. Không phải mọi resource đều hỗ trợ CRUD. Frontend dùng `src/services/supabase.ts`, không kết nối Supabase trực tiếp.

## 5. Ranh giới tin cậy

- Trình duyệt không đáng tin: server kiểm tra trường cho phép, kiểu, độ dài, ngày giờ và số nguyên. JSON tối đa 128 KiB, đăng nhập 4 KiB; thao tác ghi kiểm tra cùng Origin. SDK truyền tham số, không ghép SQL từ dữ liệu khách.
- Supabase Auth xác minh từ xa bằng `getUser()` và RPC `is_admin` cho mỗi yêu cầu quản trị. Cookie `HttpOnly`, `SameSite=Lax`, `Secure` ở production; không dùng localStorage làm phiên. Không cần chủ dự án tự cấu hình JWKS.
- RLS: catalog đọc công khai; dữ liệu khách chỉ admin đọc/xử lý. Public POST đi qua server dùng secret có quyền cao, nên validation tại API là bắt buộc. Secret không được đưa vào bundle, `NEXT_PUBLIC_*`, Git hoặc ảnh chụp.
- Chủ hệ thống phải tạo Auth user và `admin_profiles` thủ công. Không có tài khoản/mật khẩu mặc định. `admin/manager/superadmin` hiện quyền ngang nhau; `staff` bị từ chối. PIN/timeout legacy không điều khiển phiên hiện tại. `#admin` chỉ mở UI, không thay thế xác thực.
- Bucket `pho-thin-assets` đọc công khai, admin ghi. UI nhận URL HTTPS hoặc đường dẫn `/...`; chưa có uploader. Không lưu hồ sơ khách trong bucket công khai.

`vercel.json` có nosniff, chống nhúng website, hạn chế quyền thiết bị và CSP cho frame/object/base/form; chưa có `script-src` chống XSS đầy đủ. Chưa có rate limiter bền vững. Trước public, chủ dự án cần xoay bí mật từng chia sẻ, cấu hình Vercel Firewall giới hạn public/auth POST, cân nhắc tắt signup. Thiết lập Dashboard **không tự áp dụng**.

## 6. Cấu hình và khởi tạo

1. Cài Node 24.x, Bun 1.3.14; chạy `bun install --frozen-lockfile`. Chỉ lưu bí mật vào cấu hình riêng, theo tên biến trong `.env.example`.
2. Runtime cần `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, đều server-side. `DATABASE_URL` chỉ dành CLI Bun SQL cục bộ, không đưa lên Vercel. TLS xác minh certificate; tùy chọn `DATABASE_CA_FILE` nếu cần CA riêng, không tắt xác minh.
3. Backup trước thay đổi. `bun run db:check` (`--check`) kiểm tra; `bun run db:init` (`--apply`) chỉ nhận database chưa có bảng ứng dụng, tạo schema + seed (14 món, 9 bài, 4 cơ sở). Nếu đã có bảng hoặc schema dở dang, CLI từ chối: kỹ thuật review `supabase/migrations/202610080001_server_backend.sql` để nâng cấp bảo toàn dữ liệu, không reset/reseed. `bun run db:security` (`--smoke`) chạy `supabase/security-smoke.sql`, rollback fixture kể cả Auth, không giữ tài khoản thử.
4. Provision admin ngoài website. Chạy `bun run dev` khi phát triển; production dùng `bun run build`, `bun run start`.
5. Vercel dùng preset Next.js, Node 24.x, install `bun install --frozen-lockfile`, build `bun run build` trong `vercel.json`. Cấu hình biến riêng cho Preview/Production. Khuyến nghị để `APP_URL` unset: kiểm tra Origin theo host yêu cầu. Nếu đặt, mỗi môi trường phải dùng đúng origin của nó, không dùng localhost trên Vercel.

Cấu hình không đồng nghĩa đã deploy. Push có thể tạo Preview nếu chủ dự án đã liên kết repository; không tự chứng minh database đã được khởi tạo.

## 7. Kiểm thử, phục hồi, giới hạn

`bun run lint` kiểm tra TypeScript; `bun run test` chạy bốn ca Node (backend/catalog/loading), gồm mock/static checks, không chứng minh quyền trên database thật. Với production server cục bộ đã chạy, `bun run test:loading` chạy sáu ca Python Playwright qua Chrome cài sẵn; tránh nhiễu DevTools của dev mode. Ảnh kiểm thử ở `.playwright-mcp/` bị ignore, không phải tài liệu lâu dài. Cần kiểm tra thêm đăng nhập, quyền và nghiệp vụ trên môi trường được phép; không suy diễn “đã pass”.

Khi lỗi: 401 đăng nhập lại; 403 kiểm tra role/Origin; 503 kiểm tra cấu hình, logs server và Supabase. Đừng gửi secret hoặc PII trong ticket. Reload không sửa dữ liệu DB; khi migration lỗi, kiểm tra rollback/backup trước chạy lại. Rollback deployment Vercel không rollback database.

Chưa có thanh toán online, theo dõi tiền đã thu, giao hàng, tài khoản khách, email/SMS, QR thật, quản lý sức chứa/tồn kho. Receipt đặt bàn không đảm bảo bàn đã xác nhận. Có form tuyển dụng thật; API hỗ trợ inquiry chung nhưng chưa có form công khai tương ứng. Doanh thu dashboard ước tính từ số khách, không phải doanh thu thực thu.
