import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { PhoThinLogo } from './PhoThinLogo';

interface LoadingScreenProps {
  lang: Language;
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ lang, onFinish }) => {
  const [progress, setProgress] = useState(15);
  const t = translations[lang].loading;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 350);
          return 100;
        }
        return prev + 15;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F2] text-stone-900 px-4 sm:px-6 select-none overflow-hidden">
      {/* Background patterned watermark */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#870505_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full text-center p-6 bg-white rounded-2xl shadow-xl border border-stone-200/90">
        {/* Official Brand Logo */}
        <PhoThinLogo size={68} withRing className="mb-2 shadow-md" />

        {/* Vintage Seal badge */}
        <div className="mb-3 inline-flex items-center gap-2 border border-[#870505]/20 bg-[#FAF7F2] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#870505] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#870505] animate-ping" />
          Phở Thìn Bờ Hồ • Từ 1955
        </div>

        {/* Authentic Canva Loading Graphic or Steaming Bowl Container */}
        <div className="relative my-3 w-56 sm:w-60 max-h-[300px] rounded-xl overflow-hidden border border-stone-200 shadow-md bg-stone-50">
          <img
            src="/news/loading-canva.png"
            onError={(e) => {
              // Fallback to pho bowl image if needed
              (e.target as HTMLImageElement).src = '/src/assets/images/loading_pho_bowl_1790702809711.jpg';
            }}
            alt="Đang tải Phở Thìn Bờ Hồ"
            className="w-full h-auto object-cover max-h-[280px]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Brand Title */}
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#870505] tracking-tight mt-1">
          PHỞ THÌN BỜ HỒ
        </h2>

        {/* Loading status message */}
        <p className="text-xs sm:text-sm font-medium text-stone-700 mt-1 max-w-xs">
          {t.text}
        </p>
        <p className="text-[11px] text-[#A17311] font-medium">
          {t.subtext}
        </p>

        {/* Progress Bar with gold and brand accent */}
        <div className="w-56 h-2 bg-stone-100 rounded-full overflow-hidden mt-4 border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-[#870505] via-[#C92A2A] to-[#F2C14E] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Manual Skip button */}
        <button
          onClick={onFinish}
          className="mt-4 text-xs font-medium text-stone-500 hover:text-[#870505] underline decoration-stone-300 hover:decoration-[#870505] transition-colors cursor-pointer"
        >
          {lang === 'vi' ? 'Vào xem trang ngay →' : 'Enter Website Now →'}
        </button>
      </div>
    </div>
  );
};
