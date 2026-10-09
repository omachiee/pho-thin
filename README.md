# Phở Thìn Bờ Hồ — bài tập nhóm

Website Next.js 16 + React + Tailwind, backend Route Handlers và Supabase Postgres/Auth. Đặt món nhận tại quán, thanh toán khi nhận; không có payment online/giao hàng.

## Tài liệu bàn giao

- [Kiến trúc đầy đủ](docs/architecture.md): code, API, dữ liệu, quyền truy cập, cấu hình và kiểm thử.
- [Hướng dẫn cho nhóm Marketing](docs/marketing-guide.md): thao tác quản trị, xử lý khách, demo và giới hạn.
- `design-reference/`: bản thiết kế/Canva/OCR và logo nguồn gốc; không phải tài nguyên chạy website.
- `public/`: ảnh, logo và tài nguyên được phục vụ cho khách.

## Chạy local

Cần **Node 24.x**, Bun 1.3.14.

```bash
bun install --frozen-lockfile
cp -n .env.example .env.local
bun run dev
```

Chỉ chạy lệnh copy khi chưa có `.env.local`; không ghi đè cấu hình đang dùng. Mở **http://localhost:3000**. Điền ba biến server-side và khởi động lại server:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<secret-key>
APP_URL=http://localhost:3000
```

Tên cũ `SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` vẫn được hỗ trợ. Không cần `NEXT_PUBLIC_*` hoặc JWKS riêng: browser gọi Next API, backend xác minh Auth bằng `getUser()`.

**Không commit/chụp/chia sẻ secret hoặc mật khẩu database.** `.env.local` bị Git ignore. Chưa có dữ liệu backend thì website ghi rõ bản xem trước; không giả báo lưu thành công.

## Khởi tạo database mới

Trong `.env.local`, thêm `DATABASE_URL` bằng connection **Session Pooler port 5432** lấy đúng từ Supabase **Connect**. Mật khẩu trong URI phải được URL-encode nếu có ký tự đặc biệt. URI này chỉ dùng local, **không cần đưa lên Vercel**. Nếu cần CA riêng, đặt `DATABASE_CA_FILE` tới certificate đáng tin cậy; không tắt xác minh TLS.

```bash
bun run db:check
bun run db:init
bun run db:security
```

- `db:check`: kết nối TLS và kiểm tra schema, không tạo bảng.
- `db:init`: chỉ khởi tạo khi chưa có bảng ứng dụng; chạy `supabase/schema.sql` rồi `seed.sql` (9 bảng, 14 món, 9 bài, 4 cơ sở). Không reset dữ liệu hoặc tạo Auth account.
- `db:security`: kiểm tra SQL/RLS/đơn hàng với fixture rollback; không giữ khách/đơn/tài khoản thử.
- Nếu schema đã tồn tại/dở dang, review migration `supabase/migrations/202610080001_server_backend.sql`, không ép reset.
- Nếu không kết nối được, kiểm tra Session Pooler/credentials/TLS. Script không in connection string; lỗi phải được xử lý trước khi tuyên bố DB sẵn sàng.

Có thể chạy schema/seed qua SQL Editor của Supabase nếu kết nối local bị chặn. Đây là thao tác chủ project thực hiện, không phải deploy Vercel.

### Admin website

Tạo Auth user email/password trong Supabase Dashboard → Authentication → Users. Đây là tài khoản website, không tự dùng tài khoản chủ Supabase. Copy UUID và chạy bằng quyền quản trị:

```sql
insert into public.admin_profiles (id, username, role)
values ('YOUR-USER-UUID', 'admin_nhom', 'admin')
on conflict (id) do update set role = excluded.role;
```

Mở `/#admin` hoặc **Ctrl + Shift + A**. Không có mật khẩu/PIN mặc định; người dùng không tự cấp quyền admin. Các quyền `admin/manager/superadmin` hiện tương đương; `staff` không quản trị.

## Host Vercel

1. Import repository vào Vercel, Root Directory là root repo, Framework **Next.js**, Node **24.x**.
2. `vercel.json` đã đặt install `bun install --frozen-lockfile` và build `bun run build`. Không dùng static export: website có API.
3. Trong Environment Variables, thêm ba biến Supabase server-side ở trên cho môi trường được phép dùng. **Không upload `.env.local`, không thêm secret vào `NEXT_PUBLIC_*` hoặc `vercel.json`.**
4. Khuyến nghị **không đặt `APP_URL` trên Vercel** để dùng origin của từng request/Preview. Nếu đặt, phải đúng domain riêng của môi trường, không dùng localhost hoặc origin Production cho Preview.
5. Trước public: rotate secret/database password đã từng chia sẻ, provision admin, cân nhắc tắt public signup trong Supabase, bật Vercel Firewall/rate-limit cho các POST công khai và login. Code không có limiter bền vững; thiếu cấu hình này có nguy cơ spam.
6. Chủ project chọn Deploy sau khi các điều kiện trên hoàn tất. Push Git có thể tự tạo Preview nếu repository đã liên kết; chuẩn bị config không chứng minh đã deploy.

Header có nosniff, chống framing, referrer/permissions policy và CSP giới hạn frame/object/base/form; **không** thay thế CSP `script-src` đầy đủ hoặc WAF.

## Kiểm tra

```bash
bun run test
bun run lint
bun run build
bun run start
```

`lint` tạo type Next rồi chạy TypeScript. Test Node gồm backend/catalog/loading, mock/static checks; không chứng minh DB thật. Khi có kết nối, chạy thêm `db:security`.

Ở terminal khác, với production app local đang chạy:

```bash
bun run test:loading
```

Dùng Python Playwright + Chrome đã có trên máy, không thêm frontend dependency. Sáu ca: desktop, mobile/reduced-motion/bàn phím, màn thấp, timeout 6 giây, lỗi API và app thật. Mock GET không ghi DB. Ảnh ở `.playwright-mcp/` là cache kiểm tra; được tạo lại và không commit.

## API và giới hạn

`GET /api/catalog`, `GET/POST/DELETE /api/auth`, `POST /api/reservations`, `POST /api/inquiries`, `POST /api/orders`, `/api/admin/[resource]`.

Success `{data: ...}`, error `{error: ...}`. API kiểm tra input, Origin, Auth/role; RLS bảo vệ dữ liệu; giá đơn được tính trong transaction DB. Cookie HttpOnly; không lưu dữ liệu khách/mật khẩu vào localStorage.

Website chuyển màn hình bằng state tại `/`, chưa có URL riêng từng bài. Giỏ hàng mất khi reload; đặt bàn chỉ là yêu cầu chờ xác nhận; QR minh họa. Không có payment tracking, customer account, email/SMS, quản lý kho/chỗ ngồi hay realtime đa thiết bị. Chỉ dùng thông tin giả khi demo.
