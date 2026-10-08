import React, { useState, useEffect } from 'react';
import { Language, PageView, Article } from '../types';
import { adminStore } from '../services/adminStore';
import { translations } from '../data/translations';
import { Newspaper, Calendar, Clock, ArrowRight, Sparkles, Image as ImageIcon, FileText } from 'lucide-react';

interface HomeFeaturedNewsProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onSelectArticle: (article: Article) => void;
  onHeadingClick: () => void;
}

export const HomeFeaturedNews: React.FC<HomeFeaturedNewsProps> = ({
  lang,
  onNavigate,
  onSelectArticle,
  onHeadingClick,
}) => {
  const t = translations[lang].featuredNews;
  const [articles, setArticles] = useState<Article[]>(() => adminStore.getArticles());

  useEffect(() => {
    const handleUpdate = () => {
      setArticles([...adminStore.getArticles()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  // 3 featured news matching the Canva design
  const featuredArticles = articles.slice(0, 3);


  return (
    <section className="py-16 sm:py-24 bg-[#FFF8E9] text-[#68131C] border-b border-[#B88932]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3">
              <Newspaper className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>❖ Góc Tin Tức & Di Sản Văn Hoá ❖</span>
            </div>
            <h2
              onClick={onHeadingClick}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#68131C] cursor-pointer hover:text-[#560F16] transition-colors"
              title="Bấm để xem cảnh báo mạo danh & bảo vệ bản quyền"
            >
              {t.title}
            </h2>
            <p className="mt-2 text-sm text-[#65452F]">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4E8D2] hover:bg-[#68131C] text-[#68131C] hover:text-[#F4E8D2] border border-[#B88932]/40 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D6A84F]" />
              <span>{lang === 'vi' ? 'Xem tất cả bảng tin (9 bài)' : 'View all news (9 articles)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article, idx) => (
            <article
              key={article.id}
              className="group bg-[#F4E8D2]/80 border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-xs"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-[#F4E8D2]">
                  <img
                    src={article.image}
                    alt={article.title[lang]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#68131C] text-[#F4E8D2] text-[10px] font-bold px-2.5 py-0.5 rounded shadow">
                    {article.category[lang]}
                  </div>

                  {idx === 0 && (
                    <div className="absolute bottom-3 right-3 bg-[#D6A84F] text-[#560F16] text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#560F16]" />
                      <span>Nổi bật nhất</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-[#65452F] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D6A84F]" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D6A84F]" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeadingClick();
                    }}
                    className="text-base sm:text-lg font-serif font-bold text-[#68131C] group-hover:text-[#A52B25] transition-colors leading-snug line-clamp-2 cursor-pointer"
                  >
                    {article.title[lang]}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#3A281E] line-clamp-3 leading-relaxed">
                    {article.excerpt[lang]}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectArticle(article)}
                  className="w-full py-2.5 px-3 bg-[#FFF8E9] hover:bg-[#68131C] text-[#68131C] hover:text-[#F4E8D2] border border-[#B88932]/40 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{t.btnViewDetail}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
