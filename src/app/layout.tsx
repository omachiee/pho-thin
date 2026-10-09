import type { Metadata } from 'next';
import '../index.css';

const title = 'Phở Thìn Bờ Hồ - Tinh Hoa Ẩm Thực Hà Nội Từ 1955';
const description = 'Khám phá hương vị phở truyền thống Bờ Hồ, thực đơn, các cơ sở và đặt bàn, đặt món nhận tại quán.';
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/logo-pho-thin.svg', apple: '/logo-pho-thin.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&family=Cinzel:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#FFF8E9] text-[#68131C] antialiased selection:bg-[#D6A84F] selection:text-[#68131C]">
        {children}
      </body>
    </html>
  );
}
