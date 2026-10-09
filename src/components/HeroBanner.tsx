import React from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { CalendarCheck, Navigation, Award, Store } from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface HeroBannerProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
}) => {
  const t = translations[lang].hero;

  return (
    <section className="relative flex flex-col bg-[#200609] overflow-hidden">
      {/* Hero Visual Stage */}
      <div className="relative min-h-[540px] lg:min-h-[580px] flex items-center justify-center">
        {/* Background Hero Image with subtle warm dark-burgundy/brown cinematic overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/regenerated_image_1790911567588.png"
            alt="Phở Thìn Bờ Hồ Hà Nội"
            className="w-full h-full object-cover object-center brightness-75 contrast-105"
            referrerPolicy="no-referrer"
          />
          {/* Subtle warm dark-burgundy / brown cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#200609]/92 via-[#3B0B10]/50 to-[#2A080D]/65" />
          {/* Subtle warm amber glow around the center of the hero to create a cozy dining atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(214,168,79,0.18)_0%,_rgba(59,11,16,0.45)_60%,_rgba(32,6,9,0.88)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 text-center flex flex-col items-center">
          {/* Official Brand Logo Emblem */}
          <div 
            onClick={onHeadingClick}
            className="cursor-pointer group mb-4 transition-transform hover:scale-105"
            title="Logo chính thức Phở Thìn Bờ Hồ - Bấm xem cảnh báo giả mạo"
          >
            <PhoThinLogo size={74} withRing className="shadow-2xl ring-2 ring-[#D6A84F]" />
          </div>

          {/* Hero Badge: Transparent dark-burgundy background, thin muted-gold border #B88932, warm gold text #D6A84F */}
          <div 
            onClick={onHeadingClick}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 rounded-full bg-[#200609]/80 border border-[#B88932] text-[#D6A84F] text-xs uppercase tracking-widest font-semibold mb-6 shadow-md backdrop-blur-sm cursor-pointer hover:border-[#D6A84F] transition-all transform hover:scale-105"
            title="Bấm để xem cảnh báo mạo danh & bảo vệ bản quyền"
          >
            <span className="text-[#D6A84F] text-xs">❖</span>
            <span className="tracking-widest">{t.tagline.toUpperCase()}</span>
            <span className="text-[#D6A84F] text-xs">❖</span>
          </div>

          {/* Hero Headline: Main headline in warm ivory #FFF8E9, Highlighted phrase in warm gold #D6A84F */}
          <h1
            onClick={onHeadingClick}
            className="text-3xl sm:text-4xl lg:text-5xl font-['Be_Vietnam_Pro'] font-extrabold tracking-normal text-[#FFF8E9] max-w-4xl cursor-pointer hover:opacity-95 transition-opacity selection:text-[#3B0B10] leading-tight"
            title="Bấm vào tiêu đề để xem cảnh báo giả mạo địa điểm bản đồ"
          >
            {lang === 'vi' ? (
              <>
                <span>Bát phở bò nồng ấm</span>
                <span className="block text-[#D6A84F] mt-1">giữa lòng Phố Cổ</span>
              </>
            ) : lang === 'en' ? (
              <>
                <span>Warm & Comforting Pho</span>
                <span className="block text-[#D6A84F] mt-1">in the Heart of the Old Quarter</span>
              </>
            ) : (
              <span className="text-[#FFF8E9]">{t.heading}</span>
            )}
          </h1>

          {/* Subtitle / Story Hook: Warm cream text */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#F4E8D2] max-w-2xl leading-relaxed font-normal">
            {t.subtext}
          </p>

          {/* 2 Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary CTA [ĐẶT BÀN]: Warm gold #D6A84F background, Deep burgundy #200609 text, slightly rounded, subtle warm shadow */}
            <button
              onClick={() => onNavigate('reservation')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#D6A84F] text-[#200609] font-bold text-sm uppercase tracking-wider rounded-lg shadow-md hover:bg-[#c7983f] transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#200609]" />
              <span>{t.btnReserve}</span>
            </button>

            {/* Secondary CTA [CHỈ ĐƯỜNG]: Transparent background, thin warm-gold border, warm cream/gold text, hover dark translucent burgundy */}
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-[#3B0B10]/70 border border-[#D6A84F] text-[#F4E8D2] font-bold text-sm uppercase tracking-wider rounded-lg backdrop-blur-sm transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#D6A84F]" />
              <span>{t.btnDirections}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8. Information Strip Below Hero: Deepest burgundy #200609, warm ivory #FFF8E9 text, warm gold #D6A84F icons, muted gold dividers */}
      <div className="w-full bg-[#200609] border-t border-[#B88932]/30 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#B88932]/30 gap-6 sm:gap-0">
          <div className="flex flex-col items-center text-center px-4">
            <CalendarCheck className="w-6 h-6 text-[#D6A84F] mb-2" />
            <span className="text-base sm:text-lg font-serif font-bold text-[#FFF8E9]">{t.stats1955}</span>
            <span className="text-xs text-[#F4E8D2]/80 mt-0.5">70 năm giữ trọn vị</span>
          </div>
          <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
            <Store className="w-6 h-6 text-[#D6A84F] mb-2" />
            <span className="text-base sm:text-lg font-serif font-bold text-[#FFF8E9]">{t.statsBranches}</span>
            <span className="text-xs text-[#F4E8D2]/80 mt-0.5">Hoàn Kiếm • ĐB • HBT</span>
          </div>
          <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
            <Award className="w-6 h-6 text-[#D6A84F] mb-2" />
            <span className="text-base sm:text-lg font-serif font-bold text-[#FFF8E9]">{t.statsHeritage}</span>
            <span className="text-xs text-[#F4E8D2]/80 mt-0.5">Bí kíp ninh xương bò</span>
          </div>
        </div>
      </div>
    </section>
  );
};
