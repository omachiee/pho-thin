import React from 'react';
import { Dish, Language, PageView } from '../types';
import { adminStore } from '../services/adminStore';
import { translations } from '../data/translations';
import { ArrowLeft, CalendarCheck, Award, CheckCircle2, Info } from 'lucide-react';

interface DishDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (view: PageView) => void;
  onReserveWithDish: (dish: Dish) => void;
  onSelectDish: (dish: Dish) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  isOpen,
  onClose,
  lang,
  onNavigate,
  onReserveWithDish,
  onSelectDish,
}) => {
  if (!isOpen || !dish) return null;

  const t = translations[lang].dishDetail;
  const relatedDishes = adminStore.getDishes().filter(
    (d) => d.category === dish.category && d.id !== dish.id
  ).slice(0, 3);


  const handleReserve = () => {
    onReserveWithDish(dish);
    onClose();
  };

  const handleBackToMenu = () => {
    onClose();
    onNavigate('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FFF8E9] border-2 border-[#B88932] rounded-2xl shadow-2xl text-[#68131C] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Breadcrumbs & Close bar */}
        <div className="bg-[#F4E8D2] border-b border-[#B88932]/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#65452F]">
            <button
              onClick={() => {
                onClose();
                onNavigate('home');
              }}
              className="hover:text-[#68131C] transition-colors cursor-pointer"
            >
              {t.breadcrumbHome}
            </button>
            <span>/</span>
            <button
              onClick={handleBackToMenu}
              className="hover:text-[#68131C] transition-colors cursor-pointer"
            >
              {t.breadcrumbMenu}
            </button>
            <span>/</span>
            <span className="text-[#68131C] font-bold truncate max-w-[200px] sm:max-w-xs">
              {dish.name[lang]}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#68131C] hover:bg-[#B88932]/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Main Dish Presentation: Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Large Dish Photo */}
            <div className="md:col-span-6 relative rounded-xl overflow-hidden border border-[#B88932]/30 shadow-md bg-[#F4E8D2] aspect-4/3 sm:aspect-auto sm:h-80">
              <img
                src={dish.image}
                alt={dish.name[lang]}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {dish.isSignature && (
                <div className="absolute top-3 left-3 bg-[#A52B25] text-[#FFF8E9] border border-[#D6A84F] font-black text-xs px-3 py-1 rounded shadow-lg flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D6A84F]" />
                  <span>SIGNATURE DISH</span>
                </div>
              )}
            </div>

            {/* Right: Info & Primary Actions */}
            <div className="md:col-span-6 flex flex-col justify-between h-full space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#68131C] leading-tight">
                  {dish.name[lang]}
                </h1>

                {/* Price Display */}
                <div className="mt-3 inline-flex items-baseline gap-1 text-2xl sm:text-3xl font-mono font-bold text-[#68131C] bg-[#F4E8D2] px-3.5 py-1.5 rounded-lg border border-[#B88932]/50">
                  <span>{dish.formattedPrice}</span>
                  <span className="text-sm font-sans text-[#65452F]">VNĐ</span>
                </div>

                {/* Full Description */}
                <p className="mt-4 text-xs sm:text-sm text-[#3A281E]/90 leading-relaxed">
                  {dish.fullDescription[lang]}
                </p>
              </div>

              {/* Online Order notice as required in brief */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F4E8D2]/70 border border-[#B88932]/35 text-xs text-[#65452F]">
                <Info className="w-4 h-4 text-[#A52B25] shrink-0" />
                <span>{t.reservationNote}</span>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {/* [Đặt bàn] - Primary Button */}
                <button
                  onClick={handleReserve}
                  className="flex-1 px-6 py-3.5 bg-[#D6A84F] text-[#560F16] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-md hover:bg-[#B88932] hover:text-[#FFF8E9] transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-[#560F16]" />
                  <span>{t.btnReserveThis}</span>
                </button>

                {/* [Quay lại thực đơn] */}
                <button
                  onClick={handleBackToMenu}
                  className="px-5 py-3.5 bg-[#F4E8D2] hover:bg-[#B88932]/20 border border-[#B88932]/40 text-[#68131C] font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToMenu}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-[#F4E8D2]/60 border border-[#B88932]/30 rounded-xl p-6">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#68131C] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#A52B25]" />
              <span>{t.ingredientsTitle}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dish.ingredients[lang].map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs sm:text-sm text-[#68131C] bg-[#FFF8E9] p-2.5 rounded-lg border border-[#B88932]/25 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A52B25] shrink-0" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Dishes (Món cùng loại) */}
          {relatedDishes.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#68131C] mb-4">
                {t.relatedTitle}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedDishes.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectDish(rel)}
                    className="group bg-[#F4E8D2]/70 border border-[#B88932]/30 hover:border-[#D6A84F] rounded-xl p-3 flex gap-3 cursor-pointer transition-all hover:bg-[#F4E8D2] shadow-xs"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name[lang]}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col justify-between overflow-hidden">
                      <h4 className="text-xs font-serif font-bold text-[#68131C] group-hover:text-[#A52B25] truncate">
                        {rel.name[lang]}
                      </h4>
                      <span className="text-xs font-mono font-bold text-[#68131C]">
                        {rel.formattedPrice}đ
                      </span>
                      <span className="text-[10px] text-[#65452F] font-semibold">
                        {lang === 'vi' ? 'Xem món →' : 'View dish →'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
