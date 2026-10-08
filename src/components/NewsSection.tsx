import React, { useState, useEffect } from 'react';
import { Language, PageView, Article } from '../types';
import { adminStore } from '../services/adminStore';
import { translations } from '../data/translations';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CalendarCheck, 
  Sparkles,
  Share2,
  CheckCircle2,
  BookOpen,
  ZoomIn,
  X
} from 'lucide-react';

interface NewsSectionProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
  selectedArticle: Article | null;
  onSelectArticle: (article: Article | null) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
  selectedArticle,
  onSelectArticle,
}) => {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [articles, setArticles] = useState<Article[]>(() => adminStore.getArticles());

  useEffect(() => {
    const handleUpdate = () => {
      setArticles([...adminStore.getArticles()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  const t = translations[lang].news;

  // Banner articles on Trang 1 (5 bài tiêu điểm & mới nhất)
  const page1Articles = [
    articles[0],
    articles[3] || articles[1],
    articles[1] || articles[0],
    articles[2] || articles[0],
    articles[4] || articles[0],
  ].filter(Boolean);

  // Banner articles on Trang 2 (4 bài cộng đồng & di sản)
  const page2Articles = [
    articles[5] || articles[0],
    articles[6] || articles[1],
    articles[7] || articles[2],
    articles[8] || articles[3],
  ].filter(Boolean);


  const currentBoardArticles = currentPage === 1 ? page1Articles : page2Articles;

  // LOGIC HIỂN THỊ KHÔNG LẶP:
  // Khi đang ở Trang 1 (Banner hiển thị 5 bài mới nhất) -> Danh mục bên dưới hiển thị 4 bài Di sản & Cộng đồng tiếp theo
  // Khi đang ở Trang 2 (Banner hiển thị 4 bài cộng đồng) -> Danh mục bên dưới hiển thị 5 bài Tiêu điểm & Hợp tác
  // Như vậy trên cùng một trang, mỗi bài viết chỉ xuất hiện ĐÚNG 1 LẦN, hoàn toàn không bị trùng lặp!
  const catalogArticles = currentPage === 1 
    ? page2Articles 
    : page1Articles;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="py-8 sm:py-14 bg-[#FFF8E9] min-h-screen text-[#68131C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#65452F] mb-6 flex-wrap">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#68131C] transition-colors cursor-pointer"
          >
            {translations[lang].nav.home}
          </button>
          <span>/</span>
          <button
            onClick={() => onSelectArticle(null)}
            className={`cursor-pointer transition-colors ${!selectedArticle ? 'text-[#68131C] font-bold' : 'hover:text-[#68131C]'}`}
          >
            {t.pageTitle}
          </button>
          {selectedArticle && (
            <>
              <span>/</span>
              <span className="text-[#68131C] font-semibold truncate max-w-[240px] sm:max-w-md">
                {selectedArticle.title[lang]}
              </span>
            </>
          )}
        </div>

        {/* ========================================================
            CASE 1: CHI TIẾT BÀI VIẾT (FULL ARTICLE DETAIL VIEW)
            (Mỗi bài viết hiển thị đúng nội dung, ảnh đại diện và tiêu đề riêng)
            ======================================================== */}
        {selectedArticle ? (
          <article className="bg-[#F4E8D2] border border-[#B88932]/40 rounded-2xl p-5 sm:p-8 lg:p-10 shadow-xl text-[#68131C] animate-in fade-in duration-200">
            {/* Top Bar inside Article */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#B88932]/30">
              <button
                onClick={() => onSelectArticle(null)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#68131C] hover:text-[#FFF8E9] hover:bg-[#68131C] cursor-pointer bg-[#FFF8E9] px-3.5 py-1.5 rounded-lg border border-[#B88932]/40 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToList}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="bg-[#A52B25] text-[#FFF8E9] border border-[#D6A84F]/40 px-3 py-1 rounded-md text-xs font-bold shadow-xs">
                  {selectedArticle.category[lang]}
                </span>
              </div>
            </div>

            {/* Article Metadata Tags */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#65452F]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A52B25]" />
                {selectedArticle.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#A52B25]" />
                {selectedArticle.readTime}
              </span>
              <span>•</span>
              <span className="text-[#3A281E] font-medium">Tác giả: {selectedArticle.author}</span>
            </div>

            {/* Headline */}
            <h1
              onClick={onHeadingClick}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#68131C] mb-6 leading-tight cursor-pointer hover:underline"
            >
              {selectedArticle.title[lang]}
            </h1>

            {/* Hero Image of This Article */}
            <div className="my-6 rounded-xl overflow-hidden border border-[#B88932]/40 shadow-lg bg-[#2A1810]">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title[lang]}
                className="w-full h-auto max-h-[500px] object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Excerpt / Summary Quote Block */}
            <div className="p-4 sm:p-5 bg-[#FFF8E9] border-l-4 border-[#A52B25] rounded-r-xl italic font-serif text-sm sm:text-base text-[#68131C] leading-relaxed my-6 shadow-xs">
              {selectedArticle.excerpt[lang]}
            </div>

            {/* Full Content Body */}
            <div className="space-y-4 text-sm sm:text-base text-[#24150B] leading-relaxed font-serif bg-[#FFF8E9] p-6 sm:p-8 rounded-xl border border-[#B88932]/35 shadow-xs">
              {selectedArticle.content[lang].map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Chin-su specific infographic view button if applicable */}
            {selectedArticle.id === 'news-1-chinsu-pho-story' && (
              <div className="mt-6 p-4 rounded-xl bg-[#FFF8E9] border border-[#B88932]/35 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#65452F]">
                  <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                  <span>Bài viết có bản poster infographic khổ lớn.</span>
                </div>
                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#68131C] hover:bg-[#560F16] text-[#F4E8D2] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Xem poster toàn màn hình</span>
                </button>
              </div>
            )}

            {/* Related Articles / Footer Actions */}
            <div className="mt-10 pt-6 border-t border-[#B88932]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onSelectArticle(null)}
                className="text-xs sm:text-sm font-bold text-[#65452F] hover:text-[#68131C] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToList}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-[#FFF8E9] hover:bg-[#68131C] hover:text-[#FFF8E9] text-[#68131C] border border-[#B88932]/40 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Đã sao chép link' : 'Chia sẻ'}</span>
                </button>

                <button
                  onClick={() => onNavigate('reservation')}
                  className="px-6 py-2.5 bg-[#A52B25] hover:bg-[#721F1B] text-[#FFF8E9] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <CalendarCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>{translations[lang].hero.btnReserve}</span>
                </button>
              </div>
            </div>

            {/* Related Articles Section */}
            <div className="mt-12 pt-8 border-t border-[#B88932]/30">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#68131C] mb-4">
                Bài Viết Khác Bạn Có Thể Quan Tâm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.filter((a: Article) => a.id !== selectedArticle.id).slice(0, 3).map((item: Article) => (
                  <div

                    key={item.id}
                    onClick={() => {
                      onSelectArticle(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#FFF8E9] p-3.5 rounded-xl border border-[#B88932]/30 hover:border-[#A52B25] cursor-pointer transition-all hover:-translate-y-1 shadow-xs"
                  >
                    <div className="aspect-16/10 rounded-lg overflow-hidden mb-2 bg-[#2A1810]">
                      <img
                        src={item.image}
                        alt={item.title[lang]}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] bg-[#A52B25] text-white px-2 py-0.5 rounded font-bold">
                      {item.category[lang]}
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif font-bold text-[#68131C] mt-1.5 line-clamp-2 hover:text-[#A52B25]">
                      {item.title[lang]}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ) : (
          /* ========================================================
              CASE 2: DANH SÁCH BẢNG TIN (PAGE VIEW)
              (Phần Banner/Slider phía trên + Phần Danh Mục phía dưới KHÔNG lặp bài)
              ======================================================== */
          <div>
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-[#8C1D24]" />
                <span>Góc Tin Tức & Di Sản Văn Hoá</span>
              </div>
              <h1
                onClick={onHeadingClick}
                className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-[#68131C] tracking-tight leading-tight cursor-pointer hover:opacity-95 transition-opacity"
              >
                {t.pageTitle}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#65452F] max-w-2xl mx-auto leading-relaxed">
                {currentPage === 1 
                  ? 'Cập nhật những hoạt động, hành trình đưa vị phở gia truyền từ ngõ nhỏ 61 Đinh Tiên Hoàng vươn tầm quốc tế'
                  : 'Hoạt động cộng đồng, văn hoá và hành trình gìn giữ phong vị Phở Thìn Bờ Hồ'}
              </p>
              {/* Heritage Accent Divider */}
              <div className="flex items-center justify-center gap-2 mt-4 text-[#B88932]/60 select-none pointer-events-none">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#B88932]/50" />
                <span className="text-[10px] text-[#D6A84F]">❖</span>
                <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#B88932]/50" />
              </div>
            </div>

            {/* Unified Segmented Control: Trang 1 vs Trang 2 */}
            <div className="flex justify-center mb-8 sm:mb-10">
              <div className="inline-flex p-1.5 bg-[#F4E8D2] border border-[#B88932]/40 rounded-xl shadow-xs gap-1.5 max-w-md w-full sm:w-auto">
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentPage === 1
                      ? 'bg-[#68131C] text-[#F4E8D2] shadow-sm border border-[#B88932]/30'
                      : 'text-[#68131C] hover:bg-[#FFF8E9] hover:text-[#560F16] border border-transparent'
                  }`}
                >
                  <span>Trang 1 • 5 Bài Mới Nhất</span>
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentPage === 2
                      ? 'bg-[#68131C] text-[#F4E8D2] shadow-sm border border-[#B88932]/30'
                      : 'text-[#68131C] hover:bg-[#FFF8E9] hover:text-[#560F16] border border-transparent'
                  }`}
                >
                  <span>Trang 2 • 4 Bài Cộng Đồng</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                BẢNG TIN PHỞ THÌN BỜ HỒ (HERITAGE BOARD)
                ======================================================== */}
            <div className="relative bg-[#360909] border border-[#B88932]/40 rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8 text-[#FFF8E9] overflow-hidden">
              {/* Header Section */}
              <div className="relative mb-6 sm:mb-8 text-center">
                {/* Left decorative stall drawing */}
                <div className="hidden lg:block absolute left-2 top-0 w-28 xl:w-32 pointer-events-none select-none">
                  <img
                    src="/news/stall-drawing.png"
                    alt="Phở Thìn 61 Bờ Hồ"
                    className="w-full h-auto object-contain drop-shadow-md rounded-lg"
                  />
                </div>

                {/* Center Titles */}
                <div className="max-w-2xl mx-auto px-4">
                  <p className="text-[#D6A84F] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">
                    Góc Tin Tức & Di Sản Văn Hoá
                  </p>
                  <h2
                    onClick={onHeadingClick}
                    className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#D6A84F] cursor-pointer hover:opacity-95 transition-opacity"
                  >
                    BẢNG TIN PHỞ THÌN BỜ HỒ
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#FFE8B6]/90 leading-relaxed font-light">
                    {currentPage === 1 
                      ? 'Cập nhật những hoạt động, hành trình đưa vị phở gia truyền từ ngõ nhỏ 61 Đinh Tiên Hoàng vươn tầm quốc tế.'
                      : 'Hoạt động cộng đồng, văn hoá và hành trình gìn giữ phong vị Phở Thìn Bờ Hồ.'}
                  </p>
                </div>
              </div>

              {/* ================= CARDS GRID ================= */}
              <div
                className={
                  currentPage === 1
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-3.5 xl:gap-4 items-stretch'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch max-w-5xl mx-auto'
                }
              >
                {currentBoardArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      onSelectArticle(article);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-xl overflow-hidden flex flex-col h-full border border-[#D6A84F]/30 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#D6A84F] transition-all duration-200 cursor-pointer group text-[#68131C]"
                  >
                    {/* [ẢNH BÀI VIẾT] */}
                    <div className="w-full h-[180px] sm:h-[190px] md:h-[200px] overflow-hidden shrink-0 bg-[#2A1810]">
                      <img
                        src={article.image}
                        alt={article.title[lang]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Admin & Date */}
                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#6B5E51] font-semibold mb-2">
                          <span>Admin</span>
                          <span>{article.date}</span>
                        </div>

                        {/* TIÊU ĐỀ BÀI VIẾT */}
                        <h3 className="font-bold text-xs sm:text-[13px] leading-snug text-[#68131C] uppercase line-clamp-3 mb-2 min-h-[3.6em]">
                          {article.title[lang]}
                        </h3>

                        {/* Mô tả / Nội dung nếu có */}
                        <p className="text-[11px] sm:text-xs text-[#554030] line-clamp-2 leading-relaxed mb-3">
                          {article.excerpt[lang]}
                        </p>
                      </div>

                      {/* [ Đọc bài viết chi tiết => ] */}
                      <div className="pt-2 mt-auto flex justify-center">
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#521313] group-hover:bg-[#380B0B] text-[#FFE8B6] text-xs sm:text-[13px] font-bold whitespace-nowrap shadow-sm transition-colors duration-200">
                          Đọc bài viết chi tiết =&gt;
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= PHÂN TRANG (1 2 >>) ================= */}
              <div className="mt-8 sm:mt-10 mb-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  aria-label="Trang 1"
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                    currentPage === 1
                      ? 'bg-[#521313] text-[#FFE8B6] border-2 border-[#D6A84F] shadow-md scale-105'
                      : 'bg-white text-[#521313] hover:bg-[#FFE8B6] border border-[#521313]/20 shadow-sm'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  aria-label="Trang 2"
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                    currentPage === 2
                      ? 'bg-[#521313] text-[#FFE8B6] border-2 border-[#D6A84F] shadow-md scale-105'
                      : 'bg-white text-[#521313] hover:bg-[#FFE8B6] border border-[#521313]/20 shadow-sm'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => (prev === 1 ? 2 : 1))}
                  aria-label="Trang tiếp theo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold bg-white text-[#521313] hover:bg-[#FFE8B6] border border-[#521313]/20 shadow-sm transition-all cursor-pointer"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>

            {/* ========================================================
                PHẦN 2: DANH MỤC BÀI VIẾT (KHÔNG TRÙNG LẶP VỚI BANNER)
                (Mỗi bài viết hiển thị ảnh thật, tiêu đề, ngày đăng và mô tả riêng)
                ======================================================== */}
            <div className="mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-[#B88932]/30">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#68131C]">
                    {currentPage === 1 
                      ? 'Danh Mục Bài Viết Di Sản & Đời Sống (4 Bài)' 
                      : 'Danh Mục Bài Viết Tiêu Điểm & Hợp Tác (5 Bài)'}
                  </h3>
                  <p className="text-xs text-[#65452F] mt-0.5">
                    {currentPage === 1 
                      ? 'Các bài viết về văn hoá cộng đồng, hoạt động thiện nguyện và ký ức phố xưa' 
                      : 'Các bài viết về hành trình đưa phở gia truyền vươn xa và bí quyết nấu phở 70 năm'}
                  </p>
                </div>
                <span className="text-xs text-[#65452F] font-medium shrink-0">
                  {catalogArticles.length} bài viết riêng biệt
                </span>
              </div>

              {/* Article Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      onSelectArticle(article);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#F4E8D2] border border-[#B88932]/35 hover:border-[#D6A84F] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-xs cursor-pointer group"
                  >
                    <div>
                      {/* Unique Thumbnail Image for Each Article */}
                      <div className="relative aspect-16/10 overflow-hidden bg-[#24150B]">
                        <img
                          src={article.image}
                          alt={article.title[lang]}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="bg-[#A52B25] text-[#FFF8E9] border border-[#D6A84F]/40 text-[10px] px-2.5 py-0.5 rounded font-bold shadow-sm">
                            {article.category[lang]}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#65452F] mb-2 font-medium">
                          <Calendar className="w-3 h-3 text-[#A52B25]" />
                          <span>{article.date}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3 text-[#A52B25]" />
                          <span>{article.readTime}</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-serif font-bold text-[#68131C] group-hover:text-[#A52B25] leading-snug line-clamp-2 mb-2 transition-colors">
                          {article.title[lang]}
                        </h4>

                        <p className="text-xs text-[#3A281E] line-clamp-3 leading-relaxed">
                          {article.excerpt[lang]}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#B88932]/25 flex items-center justify-between text-xs text-[#A52B25] font-bold">
                      <span className="group-hover:underline">Đọc bài viết chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Pagination Buttons */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'bg-[#68131C] text-[#F4E8D2] border border-[#B88932] shadow-md scale-102'
                    : 'bg-[#F4E8D2] text-[#68131C] border border-[#B88932]/40 hover:bg-[#68131C] hover:text-[#F4E8D2] shadow-sm'
                }`}
              >
                ← Trang 1 (5 Bài Mới Nhất)
              </button>
              <button
                onClick={() => {
                  setCurrentPage(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentPage === 2
                    ? 'bg-[#68131C] text-[#F4E8D2] border border-[#B88932] shadow-md scale-102'
                    : 'bg-[#F4E8D2] text-[#68131C] border border-[#B88932]/40 hover:bg-[#68131C] hover:text-[#F4E8D2] shadow-sm'
                }`}
              >
                Trang 2 (4 Bài Cộng Đồng) →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal for Infographic Posters (if requested) */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src="/news/news-article-chinsu.png"
              alt="Poster infographic Phở Story"
              className="w-full h-auto object-contain max-h-[85vh] rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
