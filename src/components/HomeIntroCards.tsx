import React from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, BookOpen, Compass, Flame, Sparkles } from 'lucide-react';
import vintageStallImg from '../assets/images/regenerated_image_1790911897093.png';
import heroPhoImg from '../assets/images/regenerated_image_1790911567588.png';
import dishPhoImg from '../assets/images/regenerated_image_1790911567588.png';
import bowlPhoImg from '../assets/images/loading_pho_bowl_1790702809711.jpg';

interface HomeIntroCardsProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
}

export const HomeIntroCards: React.FC<HomeIntroCardsProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
}) => {
  const t = translations[lang].homeCards;

  const cards = [
    {
      id: 'intro',
      title: t.card1Title,
      desc: t.card1Desc,
      icon: BookOpen,
      year: '1955',
      bgImage: vintageStallImg,
    },
    {
      id: 'history',
      title: t.card2Title,
      desc: t.card2Desc,
      icon: Compass,
      year: '70 Năm',
      bgImage: heroPhoImg,
    },
    {
      id: 'origin',
      title: t.card3Title,
      desc: t.card3Desc,
      icon: Flame,
      year: 'Gia Tộc',
      bgImage: dishPhoImg,
    },
    {
      id: 'quintessence',
      title: t.card4Title,
      desc: t.card4Desc,
      icon: Sparkles,
      year: 'Tinh Hoa',
      bgImage: bowlPhoImg,
    },
  ];

  const handleCardClick = () => {
    onNavigate('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FFF8E9] text-[#68131C] border-b border-[#B88932]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3">
            <span>❖ Tinh Hoa 70 Năm ❖</span>
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-[#F4E8D2]/90 border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-xs overflow-hidden"
              >
                {/* Ảnh minh họa rõ nét, bắt mắt chìm dưới chữ */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img
                    src={card.bgImage}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500 filter saturate-125 contrast-105"
                  />
                  {/* Lớp phủ kem ấm để ảnh hiện rõ nét mà chữ luôn dễ đọc */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F4E8D2]/95 via-[#F4E8D2]/80 to-[#F4E8D2]/35 group-hover:from-[#F4E8D2]/90 group-hover:via-[#F4E8D2]/70 group-hover:to-[#F4E8D2]/25 transition-colors duration-300" />
                </div>

                {/* Nội dung trên thẻ */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#68131C] border border-[#B88932]/50 flex items-center justify-center text-[#D6A84F] transition-all group-hover:bg-[#560F16] shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#68131C] bg-[#FFF8E9]/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#B88932]/40 shadow-xs">
                      0{idx + 1} • {card.year}
                    </span>
                  </div>

                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeadingClick();
                    }}
                    className="text-lg font-serif font-bold text-[#68131C] group-hover:text-[#560F16] mb-2 cursor-pointer transition-colors drop-shadow-[0_1px_2px_rgba(244,232,210,0.9)]"
                    title="Bấm vào tiêu đề để xem cảnh báo"
                  >
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#3A281E] leading-relaxed font-medium drop-shadow-[0_1px_1px_rgba(244,232,210,0.9)]">
                    {card.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-[#B88932]/30">
                  <button
                    onClick={handleCardClick}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68131C] bg-[#FFF8E9]/90 hover:bg-[#FFF8E9] px-3 py-1.5 rounded-md border border-[#B88932]/40 shadow-xs group-hover:text-[#A52B25] transition-all cursor-pointer"
                  >
                    <span>{t.discoverMore}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
