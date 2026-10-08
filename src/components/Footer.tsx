import React, { useState, useEffect } from 'react';
import { Language, PageView } from '../types';
import { BRANCHES } from '../data/branches';
import { translations } from '../data/translations';
import { adminStore } from '../services/adminStore';
import { MapPin, Phone, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface FooterProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
  onReserveBranch: (branchId: string) => void;
  onTriggerAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
  onReserveBranch,
  onTriggerAdmin,
}) => {
  const t = translations[lang].footer;
  const [branchesList, setBranchesList] = useState(() => adminStore.getBranches());

  useEffect(() => {
    const handleUpdate = () => {
      setBranchesList([...adminStore.getBranches()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  // Discrete multi-tap and long-press handlers for stealth Admin entry
  const [logoTapCount, setLogoTapCount] = React.useState(0);

  const logoTimerRef = React.useRef<any>(null);
  const longPressTimerRef = React.useRef<any>(null);

  const handleLogoTap = () => {
    setLogoTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        if (onTriggerAdmin) onTriggerAdmin();
        else window.dispatchEvent(new CustomEvent('open_admin_portal'));
        return 0;
      }
      return next;
    });

    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      setLogoTapCount(0);
    }, 900);
  };

  const handleSecretTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(60);
      }
      if (onTriggerAdmin) onTriggerAdmin();
      else window.dispatchEvent(new CustomEvent('open_admin_portal'));
    }, 2200);
  };

  const handleSecretTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  return (
    <footer className="bg-[#560F16] text-[#F4E8D2] border-t-2 border-[#B88932]/50 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#B88932]/25">
          {/* Col 1: Brand & Heritage (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                onClick={handleLogoTap} 
                className="cursor-pointer select-none active:scale-95 transition-transform"
                title=""
              >
                <PhoThinLogo size={52} withRing />
              </div>
              <div>
                <h3
                  onClick={onHeadingClick}
                  className="text-lg font-serif font-bold text-[#D6A84F] cursor-pointer hover:underline"
                >
                  {t.heritageBrand}
                </h3>
                <span className="text-xs text-[#F4E8D2]/80 block">
                  {lang === 'vi' ? '4 Cơ Sở Chính Thức Tại Hà Nội' : '4 Verified Official Branches'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#F4E8D2]/85 leading-relaxed">
              {t.description}
            </p>

            {/* Impersonation warning trigger */}
            <div className="pt-1">
              <button
                onClick={onHeadingClick}
                className="inline-flex items-center gap-1.5 text-xs text-[#D6A84F] bg-[#68131C] px-3 py-1.5 rounded-lg border border-[#B88932]/50 hover:bg-[#A52B25] hover:text-[#FFF8E9] transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D6A84F]" />
                <span>Cảnh báo mạo danh & bản đồ giả mạo</span>
              </button>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-xs text-[#F4E8D2]/70 block mb-2">{t.socialTitle}:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#68131C] border border-[#B88932]/40 flex items-center justify-center text-[#F4E8D2] hover:text-[#560F16] hover:bg-[#D6A84F] transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#68131C] border border-[#B88932]/40 flex items-center justify-center text-[#F4E8D2] hover:text-[#560F16] hover:bg-[#D6A84F] transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6A84F]">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#F4E8D2]/90">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.about} (Báo Xưa 1955)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.menu}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('news')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.news} (9 bài viết)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('partners')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.partners} (Masan Chin-su)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#D6A84F] cursor-pointer">
                  {translations[lang].nav.contact} & Tuyển Dụng
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: 4 Official Branches List (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>4 Cơ Sở Chính Thức Duy Nhất Tại Hà Nội</span>
              </h4>
              <span className="text-[11px] text-[#F4E8D2]/70 font-mono">
                06:00–13:00 & 17:00–22:00
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {branchesList.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#68131C] p-3 rounded-lg border border-[#B88932]/30 hover:border-[#D6A84F] transition-colors relative"
                >
                  {b.isOriginal && (
                    <span className="absolute top-2 right-2 text-[9px] bg-[#A52B25] text-[#FFF8E9] border border-[#D6A84F]/50 font-bold px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                      GỐC
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <strong className={`text-[#FFF8E9] font-serif ${b.isOriginal ? 'pr-11' : ''}`}>
                      {b.code}: {b.name[lang]}
                    </strong>
                  </div>
                  <p className="text-[#F4E8D2]/80 text-[11px] line-clamp-1 mb-1.5">{b.address}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <a href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`} className="text-[#F4E8D2] font-mono hover:text-[#D6A84F]">
                      {b.phone}
                    </a>
                    <button
                      onClick={() => onReserveBranch(b.id)}
                      className="text-[#D6A84F] hover:underline cursor-pointer font-medium"
                    >
                      Đặt bàn →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal & Notice Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F4E8D2]/70 text-center sm:text-left">
          <p>{t.legalNotice}</p>
          <span 
            className="font-mono text-[#D6A84F] select-none cursor-default active:text-amber-300 transition-colors"
            onTouchStart={handleSecretTouchStart}
            onTouchEnd={handleSecretTouchEnd}
            onMouseDown={handleSecretTouchStart}
            onMouseUp={handleSecretTouchEnd}
          >
            Hanoi Heritage • Est. 1955
          </span>
        </div>
      </div>
    </footer>
  );
};
