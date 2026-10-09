import React, { useState } from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { Menu as MenuIcon, X, Globe, AlertCircle, ShoppingBag } from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onTriggerWarning: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  lang,
  onLanguageChange,
  onTriggerWarning,
  cartCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = translations[lang].nav;

  const navItems: { view: PageView; label: string }[] = [
    { view: 'home', label: t.home },
    { view: 'about', label: t.about },
    { view: 'menu', label: t.menu },
    { view: 'news', label: t.news },
    { view: 'partners', label: t.partners },
    { view: 'contact', label: t.contact },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  const handleNavClick = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4E8D2] border-b border-[#B88932]/30 shadow-sm">
      {/* Top micro alert ticker */}
      <div className="bg-[#560F16] text-[#F4E8D2] text-[11px] py-1.5 px-3 sm:px-4 border-b border-[#B88932]/20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={onTriggerWarning}
            className="flex items-center gap-1.5 text-[#F4E8D2] hover:text-[#D6A84F] cursor-pointer transition-colors font-medium truncate"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#D6A84F]" />
            <span className="truncate">
              {lang === 'vi'
                ? 'Lưu ý: Chỉ có 4 cơ sở chính thức tại Hà Nội • Cảnh báo giả mạo'
                : 'Advisory: Only 4 official branches in Hanoi • Warning on counterfeit locations'}
            </span>
          </button>
          <span className="hidden md:inline text-[#D6A84F] text-[11px] font-medium tracking-wide shrink-0">
            {lang === 'vi' ? 'Remix Phở Thìn Bờ Hồ - Tinh Hoa Ẩm Thực Hà Nội Từ 1955' : 'Pho Thin Bo Ho - Hanoi Culinary Heritage Since 1955'}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          {/* Official Pho Thin Bo Ho Logo seal */}
          <PhoThinLogo size={42} withRing className="transition-transform group-hover:scale-105 shrink-0" />

          <div className="flex flex-col justify-center">
            <span className="text-[15px] sm:text-lg md:text-xl font-sans font-black text-[#68131C] tracking-tight group-hover:text-[#560F16] transition-colors leading-none whitespace-nowrap">
              PHỞ THÌN BỜ HỒ
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#65452F] font-bold mt-1 whitespace-nowrap">
              HÀ NỘI TỪ 1955 • 4 CƠ SỞ
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#F4E8D2] bg-[#68131C] shadow-sm'
                    : 'text-[#68131C] hover:text-[#560F16] hover:bg-[#FFF8E9]/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Selector & Booking CTA */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile language choices remain in the drawer to keep the header compact. */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold bg-[#FFF8E9] text-[#68131C] border border-[#B88932]/40 rounded hover:border-[#B88932] transition-colors cursor-pointer shadow-xs"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#68131C] shrink-0" />
              <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.label}</span>
              <span className="sm:hidden text-[11px] font-bold">{currentLangObj.code.toUpperCase()}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#FFF8E9] border border-[#B88932]/40 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left cursor-pointer transition-colors ${
                      lang === l.code
                        ? 'bg-[#68131C] text-[#F4E8D2] font-bold'
                        : 'text-[#68131C] hover:bg-[#F4E8D2] hover:text-[#560F16]'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-1 rounded border border-[#B88932]/40 px-2 py-2 text-xs font-bold"
            aria-label={`Giỏ hàng, ${cartCount} món`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Giỏ hàng</span><span>{cartCount}</span>
          </button>

          {/* Primary Action Button: [Đặt bàn] - Synchronized to theme Đỏ Đô #68131C */}
          <button
            onClick={() => handleNavClick('reservation')}
            className="px-2.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#68131C] text-[#F4E8D2] hover:bg-[#560F16] border border-[#B88932]/40 rounded-md shadow-sm hover:shadow transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {t.reserve}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden min-h-11 min-w-11 p-2 text-[#68131C] hover:text-[#560F16] rounded focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5.5 h-5.5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5.5 h-5.5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#F4E8D2] border-b border-[#B88932]/30 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3 duration-200 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === item.view
                  ? 'bg-[#68131C] text-[#F4E8D2] font-bold'
                  : 'text-[#68131C] hover:bg-[#FFF8E9] hover:text-[#560F16]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#B88932]/30 flex items-center justify-between text-xs text-[#65452F]">
            <span>Ngôn ngữ:</span>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    lang === l.code ? 'bg-[#68131C] text-[#F4E8D2] font-bold' : 'text-[#68131C] hover:text-[#560F16]'
                  }`}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
