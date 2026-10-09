import React, { useEffect, useRef } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { PhoThinLogo } from './PhoThinLogo';

interface LoadingScreenProps {
  lang: Language;
  ready: boolean;
  onFinish: () => void;
}

// ponytail: tối đa 6 giây chờ; dữ liệu tiếp tục tải nền, không chặn website.
export function loadingDelay(ready: boolean, elapsed: number): number {
  return Math.max(0, (ready ? 700 : 6000) - elapsed);
}

const copy = {
  vi: { heritage: 'Hương vị Bờ Hồ, từ năm 1955.', status: 'Đang mở thực đơn…', skip: 'Vào xem trước', hint: 'Thực đơn sẽ tiếp tục tải trong nền.' },
  en: { heritage: 'The taste of Bo Ho, since 1955.', status: 'Opening the menu…', skip: 'Explore while we load', hint: 'The menu will continue loading in the background.' },
  zh: { heritage: '1955年传承至今的还剑湖风味。', status: '正在加载菜单…', skip: '先浏览网站', hint: '菜单将在后台继续加载。' },
  ko: { heritage: '1955년부터 이어온 보 호의 맛.', status: '메뉴를 불러오는 중…', skip: '먼저 둘러보기', hint: '메뉴는 백그라운드에서 계속 불러옵니다.' },
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ lang, ready, onFinish }) => {
  const startedAt = useRef(performance.now());
  const t = copy[lang];

  useEffect(() => {
    const timer = setTimeout(onFinish, loadingDelay(ready, performance.now() - startedAt.current));
    return () => clearTimeout(timer);
  }, [ready, onFinish]);

  return (
    <main data-testid="loading-screen" aria-labelledby="loading-title" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#3B0B10] px-6 py-8 text-[#FFF8E9]">
      <div className="my-auto flex w-full max-w-2xl shrink-0 flex-col items-center self-center text-center">
        <PhoThinLogo size={68} withRing />
        <h1 id="loading-title" className="mt-7 text-[clamp(2rem,5vw,3.5rem)] font-serif font-semibold leading-tight tracking-tight">
          {translations[lang].siteName}
        </h1>
        <p className="mt-3 text-sm text-[#F4E8D2] sm:text-base">{t.heritage}</p>

        <svg viewBox="0 0 300 225" aria-hidden="true" focusable="false" className="my-5 h-44 w-60 shrink-0 sm:my-7 sm:h-52 sm:w-72" fill="none">
          <g stroke="#F4E8D2" strokeWidth="2" strokeLinecap="round">
            <path className="animate-steam-1 loading-steam [transform-origin:center]" d="M112 80c-15-12 16-22 2-36" />
            <path className="animate-steam-2 loading-steam [transform-origin:center]" d="M149 70c-17-16 16-26 3-44" />
            <path className="animate-steam-3 loading-steam [transform-origin:center]" d="M188 80c-14-12 14-23 2-36" />
          </g>
          <path d="M57 116c10 49 47 73 93 73s83-24 93-73" fill="#68131C" stroke="#D6A84F" strokeWidth="2.5" />
          <ellipse cx="150" cy="113" rx="93" ry="29" fill="#F4E8D2" stroke="#D6A84F" strokeWidth="2.5" />
          <ellipse cx="150" cy="113" rx="78" ry="19" fill="#B88932" fillOpacity="0.25" />
          <g stroke="#B88932" strokeWidth="2.2" strokeLinecap="round">
            <path d="M95 114c12-14 28 11 42-2s27 7 44-2 21 0 24 5" />
            <path d="M91 120c18-10 23 5 38 1s21-8 35-1 20-3 39-1" />
            <path d="M110 104c9 8 18-5 28 0s15-5 26 1" />
          </g>
          <g fill="#68131C">
            <ellipse cx="136" cy="110" rx="13" ry="5" transform="rotate(-15 136 110)" />
            <ellipse cx="174" cy="118" rx="11" ry="4" transform="rotate(14 174 118)" />
          </g>
          <g stroke="#3B0B10" strokeWidth="2" strokeLinecap="round">
            <path d="m111 110 4-5m39 17 5-5m33-15 5 2m-68 13 4 2" />
          </g>
          <path d="M127 189v8h46v-8M71 151c16 25 43 35 79 35" stroke="#D6A84F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        <p role="status" className="text-sm font-medium text-[#D6A84F] sm:text-base">{t.status}</p>
        <button type="button" onClick={onFinish} className="mt-6 min-h-11 rounded px-5 py-2 text-sm text-[#FFF8E9] underline decoration-[#B88932] underline-offset-4 hover:decoration-[#FFF8E9]">
          {t.skip}
        </button>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#F4E8D2]/75">{t.hint}</p>
      </div>
    </main>
  );
};
