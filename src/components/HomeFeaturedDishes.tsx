import React, { useState, useEffect } from 'react';
import { Language, Dish, PageView } from '../types';
import { adminStore } from '../services/adminStore';
import { translations } from '../data/translations';
import { Award, ArrowRight, Utensils } from 'lucide-react';

interface HomeFeaturedDishesProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onSelectDish: (dish: Dish) => void;
  onHeadingClick: () => void;
}

export const HomeFeaturedDishes: React.FC<HomeFeaturedDishesProps> = ({
  lang,
  onNavigate,
  onSelectDish,
  onHeadingClick,
}) => {
  const t = translations[lang].featuredDishes;
  const [allDishes, setAllDishes] = useState<Dish[]>(() => adminStore.getDishes());

  useEffect(() => {
    const handleUpdate = () => {
      setAllDishes([...adminStore.getDishes()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  // 5 featured dishes with "Phở tái chín" in the middle:
  // Order: [Phở sốt vang, Phở sườn cây đặc biệt, Phở tái chín (CENTER), Phở xào bò, Phở cuốn]
  const orderedDishes = [
    allDishes.find((d) => d.id === 'pho-sot-vang'),
    allDishes.find((d) => d.id === 'pho-suon-cay'),
    allDishes.find((d) => d.id === 'pho-tai-chin'), // CENTER SIGNATURE
    allDishes.find((d) => d.id === 'pho-xao-bo'),
    allDishes.find((d) => d.id === 'pho-cuon-ha-noi'),
  ].filter((d): d is Dish => Boolean(d));


  return (
    <section className="py-16 sm:py-24 bg-[#F4E8D2]/40 text-[#68131C] border-b border-[#B88932]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3">
            <Utensils className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>❖ Thực Đơn Tinh Hoa 1955 ❖</span>
          </div>
          <h2
            onClick={onHeadingClick}
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#68131C] cursor-pointer hover:text-[#560F16] transition-colors"
            title="Bấm để xem cảnh báo mạo danh & bảo vệ bản quyền"
          >
            {t.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#65452F]">
            {t.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-[#B88932]/60 select-none pointer-events-none">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#B88932]/50" />
            <span className="text-[10px] text-[#D6A84F]">❖</span>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#B88932]/50" />
          </div>
        </div>

        {/* 5 Dishes Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {orderedDishes.map((dish, index) => {
            const isCenterSignature = dish.isSignature; // Phở tái chín at center
            return (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className={`group relative rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  isCenterSignature
                    ? 'bg-[#FFF8E9] border-2 border-[#68131C] ring-4 ring-[#68131C]/10 shadow-lg lg:-translate-y-2'
                    : 'bg-[#FFF8E9] border border-[#B88932]/35 hover:border-[#D6A84F] shadow-xs'
                }`}
              >
                {/* Image top with rounded corners */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#F4E8D2]">
                  <img
                    src={dish.image}
                    alt={dish.name[lang]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#560F16]/60 via-transparent to-transparent opacity-60" />

                  {/* SIGNATURE badge strictly on Phở tái chín per instructions */}
                  {dish.isSignature && (
                    <div className="absolute top-3 left-3 bg-[#A52B25] text-[#F4E8D2] font-black text-[11px] px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>SIGNATURE</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#FFF8E9]/95 border border-[#B88932]/40 text-xs font-mono font-bold text-[#A52B25] shadow-xs">
                    {dish.formattedPrice}đ
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-[#FFF8E9]">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#68131C] group-hover:text-[#A52B25] transition-colors leading-snug line-clamp-2">
                      {dish.name[lang]}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-[#3A281E] line-clamp-3 leading-relaxed">
                      {dish.shortDescription[lang]}
                    </p>
                  </div>

                  {/* Quick view indicator */}
                  <div className="mt-4 pt-3 border-t border-[#B88932]/20 flex items-center justify-between text-xs text-[#68131C]">
                    <span className="font-bold group-hover:text-[#A52B25] transition-colors">{t.viewDetail}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button: [Thực đơn chi tiết] */}
        <div className="mt-14 text-center">
          <button
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#68131C] text-[#F4E8D2] hover:bg-[#560F16] border border-[#B88932]/40 font-bold text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all cursor-pointer"
          >
            <span>{t.btnFullMenu}</span>
            <ArrowRight className="w-4 h-4 text-[#D6A84F]" />
          </button>
        </div>
      </div>
    </section>
  );
};
