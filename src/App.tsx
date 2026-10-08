import React, { useState, useEffect } from 'react';
import { Language, PageView, Dish, Article } from './types';
import { Navbar } from './components/Navbar';
import { LoadingScreen } from './components/LoadingScreen';
import { FakeMapWarningModal } from './components/FakeMapWarningModal';
import { HeroBanner } from './components/HeroBanner';
import { HomeIntroCards } from './components/HomeIntroCards';
import { HomeFeaturedDishes } from './components/HomeFeaturedDishes';
import { HomeFeaturedNews } from './components/HomeFeaturedNews';
import { AboutNewspaper } from './components/AboutNewspaper';
import { MenuSection } from './components/MenuSection';
import { DishDetailModal } from './components/DishDetailModal';
import { ReservationSection } from './components/ReservationSection';
import { NewsSection } from './components/NewsSection';
import { PartnerSection } from './components/PartnerSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { adminStore } from './services/adminStore';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Step 0: Loading screen with steaming pho bowl
  const [isLoading, setIsLoading] = useState(true);

  // Active view page ('home' | 'about' | 'menu' | 'reservation' | 'news' | 'partners' | 'contact')
  const [currentView, setCurrentView] = useState<PageView>('home');

  // Selected language: vi, en, zh, ko
  const [lang, setLang] = useState<Language>('vi');

  // Dish details modal
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Reservation pre-selected parameters
  const [dishForReservation, setDishForReservation] = useState<Dish | null>(null);
  const [branchForReservation, setBranchForReservation] = useState<string | undefined>(undefined);

  // Article details
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Impersonation & Fake Map Warning modal
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  // Admin Stealth Gateway State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => adminStore.isAuthenticated());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);

  const handleOpenAdminPortal = () => {
    if (adminStore.isAuthenticated()) {
      setIsAdminLoggedIn(true);
      setIsAdminViewActive(true);
    } else {
      setIsAdminModalOpen(true);
    }
  };

  // Stealth Trigger Listeners (URL Hash, Key combo, Custom events)
  useEffect(() => {
    const checkHashAndQuery = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        hash === '#admin' || 
        hash === '#quantri' || 
        hash === '#admin-portal' ||
        params.get('admin') === 'portal' ||
        params.get('admin') === 'true'
      ) {
        handleOpenAdminPortal();
      }
    };

    checkHashAndQuery();
    window.addEventListener('hashchange', checkHashAndQuery);

    // Keyboard shortcut: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdminPortal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Custom stealth event from footer
    const handleCustomOpen = () => handleOpenAdminPortal();
    window.addEventListener('open_admin_portal', handleCustomOpen);

    return () => {
      window.removeEventListener('hashchange', checkHashAndQuery);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open_admin_portal', handleCustomOpen);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminModalOpen(false);
    setIsAdminViewActive(true);
  };

  const handleAdminLogout = () => {
    adminStore.logout();
    setIsAdminLoggedIn(false);
    setIsAdminViewActive(false);
    // Remove secret hash from URL
    if (window.location.hash.includes('admin') || window.location.hash.includes('quantri')) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  };

  const handleHeadingClick = () => {
    setIsWarningOpen(true);
  };

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDish = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const handleReserveWithDish = (dish: Dish) => {
    setDishForReservation(dish);
    setSelectedDish(null);
    setCurrentView('reservation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReserveBranch = (branchId: string) => {
    setBranchForReservation(branchId);
    setCurrentView('reservation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: Article | null) => {
    setSelectedArticle(article);
    if (article) {
      setCurrentView('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isAdminViewActive) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onExitToWebsite={() => setIsAdminViewActive(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E9] text-[#68131C] flex flex-col font-sans selection:bg-[#D6A84F] selection:text-[#68131C]">
      {/* Step 0: Initial Steam Loading Screen */}
      {isLoading && (
        <LoadingScreen lang={lang} onFinish={() => setIsLoading(false)} />
      )}

      {/* Persistent Top Navigation Bar (Zone 1: Brand Wordmark, Zone 2: Links, Zone 3: Language & [Đặt bàn]) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        lang={lang}
        onLanguageChange={setLang}
        onTriggerWarning={() => setIsWarningOpen(true)}
      />

      {/* Main Content Area based on current view */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <>
            {/* Banner: Tên quán + Slogan + [Đặt bàn] [Chỉ đường] */}
            <HeroBanner
              lang={lang}
              onNavigate={handleNavigate}
              onHeadingClick={handleHeadingClick}
            />

            {/* 4 Thẻ giới thiệu */}
            <HomeIntroCards
              lang={lang}
              onNavigate={handleNavigate}
              onHeadingClick={handleHeadingClick}
            />

            {/* 5 Món nổi bật (Phở tái chín ở giữa có nhãn SIGNATURE) */}
            <HomeFeaturedDishes
              lang={lang}
              onNavigate={handleNavigate}
              onSelectDish={handleSelectDish}
              onHeadingClick={handleHeadingClick}
            />

            {/* Khối Bảng tin nổi bật */}
            <HomeFeaturedNews
              lang={lang}
              onNavigate={handleNavigate}
              onSelectArticle={handleSelectArticle}
              onHeadingClick={handleHeadingClick}
            />
          </>
        )}

        {/* VIEW 2: GIỚI THIỆU - PHONG CÁCH BÁO CŨ (Vàng cổ #F3E3B3, Chữ đỏ đô #870505) */}
        {currentView === 'about' && (
          <AboutNewspaper
            lang={lang}
            onNavigate={handleNavigate}
            onHeadingClick={handleHeadingClick}
          />
        )}

        {/* VIEW 3: THỰC ĐƠN (Phở -> Đồ uống -> Khác) */}
        {currentView === 'menu' && (
          <MenuSection
            lang={lang}
            onNavigate={handleNavigate}
            onSelectDish={handleSelectDish}
            onHeadingClick={handleHeadingClick}
          />
        )}

        {/* VIEW 4 & 5: ĐIỀN FORM ĐẶT BÀN & XÁC NHẬN */}
        {currentView === 'reservation' && (
          <ReservationSection
            lang={lang}
            onNavigate={handleNavigate}
            onHeadingClick={handleHeadingClick}
            preselectedDish={dishForReservation}
            initialBranchId={branchForReservation}
          />
        )}

        {/* VIEW 5: BẢNG TIN (2 trang tin: 5 mục & 4 mục, chi tiết bài) */}
        {currentView === 'news' && (
          <NewsSection
            lang={lang}
            onNavigate={handleNavigate}
            onHeadingClick={handleHeadingClick}
            selectedArticle={selectedArticle}
            onSelectArticle={setSelectedArticle}
          />
        )}

        {/* VIEW 6: ĐỐI TÁC (Masan Chin-su Phở Story) */}
        {currentView === 'partners' && (
          <PartnerSection
            lang={lang}
            onNavigate={handleNavigate}
            onHeadingClick={handleHeadingClick}
          />
        )}

        {/* VIEW 7: LIÊN HỆ & TUYỂN DỤNG */}
        {currentView === 'contact' && (
          <ContactSection
            lang={lang}
            onNavigate={handleNavigate}
            onHeadingClick={handleHeadingClick}
            onReserveBranch={handleReserveBranch}
          />
        )}
      </main>

      {/* Modal View: Step 3 - Dish Detail (Ảnh lớn, Giá, Mô tả, Nguyên liệu, Món cùng loại, [Đặt bàn]) */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={Boolean(selectedDish)}
        onClose={() => setSelectedDish(null)}
        lang={lang}
        onNavigate={handleNavigate}
        onReserveWithDish={handleReserveWithDish}
        onSelectDish={handleSelectDish}
      />

      {/* Modal View: Cảnh Báo Mạo Danh & Bản Đồ Giả Mạo Phở Thìn Bờ Hồ */}
      <FakeMapWarningModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        lang={lang}
        onNavigate={handleNavigate}
      />

      {/* Stealth Admin Gateway Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Discreet floating return button ONLY visible to currently logged-in Admin */}
      {isAdminLoggedIn && !isAdminViewActive && (
        <button
          onClick={() => setIsAdminViewActive(true)}
          className="fixed bottom-4 left-4 z-40 bg-[#560F16] border border-[#D6A84F] text-[#D6A84F] px-3 py-1.5 rounded-full text-xs font-mono shadow-2xl flex items-center gap-1.5 hover:bg-[#68131C] cursor-pointer animate-in fade-in"
          title="Quay lại Bảng Quản Trị"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
          <span>Bảng Quản Trị</span>
        </button>
      )}

      {/* Footer: 4 cơ sở, kênh kết nối, thông tin pháp lý, bản quyền */}
      <Footer
        lang={lang}
        onNavigate={handleNavigate}
        onHeadingClick={handleHeadingClick}
        onReserveBranch={handleReserveBranch}
        onTriggerAdmin={handleOpenAdminPortal}
      />
    </div>
  );
}
