'use client';

import dynamic from 'next/dynamic';

// ponytail: giữ shell SPA hiện có; tách route khi cần deep link từng màn hình.
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <p className="p-8 text-center">Đang mở Phở Thìn Bờ Hồ…</p>,
});

export function ClientApp() {
  return <App />;
}
