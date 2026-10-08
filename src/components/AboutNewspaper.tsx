import React from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { CalendarCheck, ArrowRight, Utensils } from 'lucide-react';

interface AboutNewspaperProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
}

export const AboutNewspaper: React.FC<AboutNewspaperProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
}) => {
  const t = translations[lang].about;

  return (
    <div className="py-6 sm:py-12 bg-[#F3EAD8] min-h-screen text-[#1E120A] selection:bg-[#B88932]/30">
      <div className="max-w-[880px] mx-auto px-2 sm:px-4">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A5A43] mb-6 sm:mb-8 px-2">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#68131C] transition-colors cursor-pointer font-medium"
          >
            {translations[lang].nav.home}
          </button>
          <span className="text-[#B88932]/50">/</span>
          <span className="text-[#68131C] font-bold">{translations[lang].nav.about}</span>
        </nav>

        {/* ========================================================
            THE AUTHENTIC BROADSHEET VINTAGE NEWSPAPER PAGE
            (Tái hiện 100% trang báo cổ theo hình ảnh mẫu)
            ======================================================== */}
        <article className="relative bg-[#E8D7B8] border-2 border-[#543D2B] p-4 sm:p-7 md:p-8 shadow-2xl rounded-xs text-[#22140B] font-serif">
          
          {/* Inner hairline border */}
          <div className="border border-[#543D2B]/40 p-3 sm:p-5">
            
            {/* 1. TOP RUNNING HEADER BAR */}
            <div className="border-y border-[#543D2B] py-1 mb-4 flex flex-col sm:flex-row items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-[#4A3525] uppercase gap-1 text-center">
              <span>HÀ NỘI BỜ HỒ • NĂM THỨ 71</span>
              <span className="hidden sm:inline">SỐ ĐẶC BIỆT KỶ NIỆM • MÙA THU HÀ NỘI • DI SẢN ẨM THỰC TỪ 1955</span>
              <span>GIÁ TRỊ DI SẢN: VÔ GIÁ</span>
            </div>

            {/* 2. TOP MASTHEAD & HERO SPLIT: HEADLINE + PINNED FOUNDER POLAROID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pb-4 border-b border-[#543D2B]">
              
              {/* Left Headline (approx. 7.5 cols) */}
              <div className="md:col-span-8 flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-serif italic text-[#721F1B] mb-1 font-semibold tracking-wide">
                  Ký ức Phố Cổ Hà Nội
                </span>
                
                <h1
                  onClick={onHeadingClick}
                  className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-serif font-black text-[#1E120A] tracking-tight leading-[1.1] uppercase cursor-pointer hover:text-[#721F1B] transition-colors"
                  title="Bấm vào tiêu đề để xem thông tin bảo vệ di sản"
                >
                  PHỞ THÌN BỜ HỒ<br />
                  VÀ 70 NĂM LƯU GIỮ<br />
                  LINH HỒN ẨM THỰC THỦ ĐÔ
                </h1>

                <p className="mt-2.5 text-xs sm:text-[13px] font-serif italic text-[#4A3525] leading-relaxed max-w-xl">
                  Từ gánh phở rong bên Tháp Rùa cho cậu bé Hà Nội, & câu chuyện bền bỉ hương vị thanh tao
                </p>
              </div>

              {/* Right: Pinned Polaroid with Metal Paperclip */}
              <div className="md:col-span-4 relative mt-2 md:mt-0 flex justify-center md:justify-end">
                {/* Metallic Paperclip SVG pinning the polaroid */}
                <svg 
                  className="w-5 h-9 text-[#3A281E] absolute -top-3.5 right-8 z-20 drop-shadow-sm pointer-events-none" 
                  viewBox="0 0 24 48" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M7 14v22a5 5 0 0 0 10 0V8a7 7 0 0 0-14 0v28a9 9 0 0 0 18 0V14" />
                </svg>

                {/* Polaroid Frame */}
                <div className="relative bg-[#DFCCA8] border border-[#543D2B]/50 p-2 rounded-xs shadow-md max-w-[210px] transform rotate-1">
                  <div className="aspect-[407/600] overflow-hidden bg-[#24150B] border border-[#543D2B]/30">
                    <img
                      src="/src/assets/images/regenerated_image_1790964215309.webp"
                      alt="Ông chủ Phở Thìn Bờ Hồ"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="pt-1.5 text-center">
                    <p className="text-[10px] font-serif font-bold text-[#2A180E] leading-tight">
                      Ông chủ Phở Thìn Bờ Hồ
                    </p>
                    <p className="text-[9px] font-serif italic text-[#543D2B]">
                      — những năm 1980
                    </p>
                  </div>

                  <div className="mt-1 pt-1 border-t border-[#543D2B]/20 flex items-center justify-between text-[8px] font-mono text-[#543D2B]">
                    <span className="w-3.5 h-3.5 rounded-full border border-[#543D2B] flex items-center justify-center text-[7px] font-bold">❖</span>
                    <span className="italic font-serif">Hương vị thanh tao Hà Nội</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. GRAND PANORAMIC CENTERPIECE PHOTO */}
            <div className="my-4">
              <div className="border-2 border-[#543D2B] p-1 bg-[#DECEB0] shadow-xs">
                <img
                  src="/src/assets/images/regenerated_image_1790911897093.png"
                  alt="Gánh phở rong bên Tháp Rùa – Hà Nội xưa"
                  className="w-full h-auto object-cover max-h-[360px] filter contrast-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[11px] font-serif italic text-[#4A3525] text-center mt-1">
                Gánh phở rong bên Tháp Rùa – Hà Nội xưa
              </p>
            </div>

            {/* 4. MIDDLE METADATA LINE */}
            <div className="border-y border-[#543D2B] py-1.5 my-4 text-[9.5px] sm:text-[11px] font-mono font-bold text-[#4A3525] flex flex-wrap justify-between items-center tracking-wider gap-2 text-center">
              <span>* SÁNG LẬP: CỤ BÙI CHÍ THÌN (1955)</span>
              <span>* ĐỊA CHỈ GỐC: 61 ĐINH TIÊN HOÀNG</span>
              <span>* 4 CƠ SỞ CHÍNH THỨC TẠI HÀ NỘI</span>
            </div>

            {/* 5. TWO-COLUMN NEWSPAPER CONTENT GRID (COL 1 & COL 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* ================= LEFT COLUMN: I & III ================= */}
              <div className="md:border-r md:border-[#543D2B]/50 md:pr-6 space-y-6 flex flex-col justify-between">
                
                {/* SECTION I: GIỚI THIỆU PHỞ THÌN BỜ HỒ */}
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#543D2B]/40">
                    <span className="w-4 h-4 rounded-xs bg-[#721F1B] text-[#FFF8E9] font-serif font-black text-[10px] flex items-center justify-center shrink-0">
                      I
                    </span>
                    <h2 
                      onClick={onHeadingClick}
                      className="text-xs sm:text-[13px] font-serif font-black text-[#1E120A] tracking-wider uppercase cursor-pointer hover:text-[#721F1B]"
                    >
                      GIỚI THIỆU PHỞ THÌN BỜ HỒ
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#24150B] leading-relaxed text-justify mb-2">
                    <span className="text-3xl sm:text-4xl font-serif font-black float-left mr-2 leading-none text-[#721F1B]">
                      T
                    </span>
                    rong muôn vàn thức quà của Hà Nội, phở luôn chiếm giữ vị trí độc tôn. Và giữa lòng ba mươi sáu phố phường, nhắc tới phở bò truyền thống thanh tao, không ai là không nhớ tới Phở Thìn Bờ Hồ. Đây không đơn thuần là một quán ăn, mà là chứng nhân lịch sử, là nếp sinh hoạt văn hoá tao nhã gắn liền với bao thế hệ người Hà Nội gốc.
                  </p>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#3A281E] leading-relaxed text-justify mb-3">
                    Khác biệt lớn nhất của Phở Thìn Bờ Hồ chính là triết lý ẩm thực: giữ trọn sự tinh tế nguyên bản, tôn vinh độ ngọt lành thuần khiết của thịt bò tươi và xương ống ninh nhừ, không lạm dụng gia vị nhân tạo hay dầu mỡ ngấy ngán.
                  </p>

                  {/* Photo: Phở cuốn Hà Nội */}
                  <div className="border border-[#543D2B]/40 p-1 bg-[#DECEB0] my-2">
                    <div className="aspect-16/10 overflow-hidden bg-[#24150B]">
                      <img
                        src="/src/assets/images/regenerated_image_1790964450176.png"
                        alt="Phở cuốn bò tươi Hà Nội"
                        className="w-full h-full object-cover filter contrast-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION III: XUẤT THÂN VÀ GIA TỘC CỤ THÌN */}
                <div className="pt-2 border-t border-[#543D2B]/40">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#543D2B]/40">
                    <span className="w-4 h-4 rounded-xs bg-[#721F1B] text-[#FFF8E9] font-serif font-black text-[10px] flex items-center justify-center shrink-0">
                      III
                    </span>
                    <h2 
                      onClick={onHeadingClick}
                      className="text-xs sm:text-[13px] font-serif font-black text-[#1E120A] tracking-wider uppercase cursor-pointer hover:text-[#721F1B]"
                    >
                      XUẤT THÂN VÀ GIA TỘC CỤ THÌN
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#24150B] leading-relaxed text-justify mb-2">
                    <span className="text-3xl sm:text-4xl font-serif font-black float-left mr-2 leading-none text-[#721F1B]">
                      C
                    </span>
                    ụ Bùi Chí Thìn sinh ra tại vùng quê giàu truyền thống hiếu học và trọng nghĩa tình. Với đôi bàn tay tài hoa và cái tâm của người làm nghề, cụ luôn tâm niệm: “Nấu bát phở cho người ăn cũng như nấu cho chính cha mẹ, con cái mình ăn”.
                  </p>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#3A281E] leading-relaxed text-justify mb-3">
                    Bí quyết gia truyền của cụ được truyền lại nghiêm ngặt qua 3 đời: từ tỷ lệ nước, thời gian ủ than, cách hớt bọt cho đến kỹ thuật dùng dao bản đập dập miếng thịt thăn bò trên thớt gỗ nghiến. Nhờ sự khắt khe đó, hương vị năm 1955 vẫn vẹn nguyên tới tận hôm nay.
                  </p>

                  {/* Tape Sticker / Small Box */}
                  <div className="border border-[#543D2B]/40 p-2 bg-[#DECEB0] flex items-center gap-3 rounded-xs">
                    <div className="w-12 h-12 shrink-0 border border-[#543D2B]/30 bg-[#FFF8E9] p-0.5 overflow-hidden">
                      <img
                        src="/src/assets/images/regenerated_image_1790956870285.jpg"
                        alt="Gia vị bí truyền"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] font-serif text-[#3A281E]">
                      <span className="font-bold text-[#721F1B] block">Bí quyết 70 năm:</span>
                      <span className="italic">Thịt bò tươi – xương ống – gia vị tự nhiên</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT COLUMN: II & IV ================= */}
              <div className="space-y-6 flex flex-col justify-between">
                
                {/* SECTION II: LỊCH SỬ HÌNH THÀNH NĂM 1955 */}
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#543D2B]/40">
                    <span className="w-4 h-4 rounded-xs bg-[#721F1B] text-[#FFF8E9] font-serif font-black text-[10px] flex items-center justify-center shrink-0">
                      II
                    </span>
                    <h2 
                      onClick={onHeadingClick}
                      className="text-xs sm:text-[13px] font-serif font-black text-[#1E120A] tracking-wider uppercase cursor-pointer hover:text-[#721F1B]"
                    >
                      LỊCH SỬ HÌNH THÀNH NĂM 1955
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#24150B] leading-relaxed text-justify mb-2">
                    <span className="text-3xl sm:text-4xl font-serif font-black float-left mr-2 leading-none text-[#721F1B]">
                      N
                    </span>
                    ăm 1955, Thủ Đô bước vào những ngày đầu tiên của thời kỳ hòa bình sau giải phóng. Giữa nhịp sống đổi thay rộn rã, chàng trai làng trẻ tuổi Bùi Chí Thìn đã quẩy đôi quang gánh phở đầu tiên ra góc phố Đinh Tiên Hoàng, đối diện Tháp Rùa và Đền Ngọc Sơn.
                  </p>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#3A281E] leading-relaxed text-justify mb-3">
                    Gánh phở của cụ Thìn nhanh chóng nức tiếng khắp phố phường bởi hương thơm nồng ấm và vị thanh ngọt khác lạ. Dù qua thời kỳ bao cấp khó khăn phân phối tem phiếu, gánh phở vẫn bền bỉ đỏ lửa, phục vụ từ các bậc văn nghệ sĩ, trí thức cho đến bà con lao động phố cổ.
                  </p>

                  {/* Sub split: Photo 1950-1960 + Stamped Quote Box */}
                  <div className="grid grid-cols-2 gap-2 my-2 items-stretch">
                    <div className="border border-[#543D2B]/40 p-1 bg-[#DECEB0] flex flex-col justify-between">
                      <div className="aspect-4/3 overflow-hidden bg-[#24150B]">
                        <img
                          src="/src/assets/images/vintage_hanoi_pho_stall_1790702834461.jpg"
                          alt="Hà Nội những năm 1950 - 1960"
                          className="w-full h-full object-cover filter contrast-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-[9px] font-serif italic text-[#4A3525] text-center mt-1">
                        Hà Nội 1950 – 1960
                      </p>
                    </div>

                    <div className="border border-dashed border-[#543D2B] p-2 bg-[#DECEB0]/60 flex flex-col justify-center text-center">
                      <p className="text-[11px] font-serif italic text-[#721F1B] font-bold leading-snug">
                        “Phở Thìn không chỉ là món ăn, mà là một phần ký ức Hà Nội.”
                      </p>
                      <span className="text-[9px] font-serif text-[#543D2B] mt-1.5">— ❖ —</span>
                    </div>
                  </div>
                </div>

                {/* SECTION IV: TINH HOA BÁT PHỞ TRUYỀN THỐNG */}
                <div className="pt-2 border-t border-[#543D2B]/40">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#543D2B]/40">
                    <span className="w-4 h-4 rounded-xs bg-[#721F1B] text-[#FFF8E9] font-serif font-black text-[10px] flex items-center justify-center shrink-0">
                      IV
                    </span>
                    <h2 
                      onClick={onHeadingClick}
                      className="text-xs sm:text-[13px] font-serif font-black text-[#1E120A] tracking-wider uppercase cursor-pointer hover:text-[#721F1B]"
                    >
                      TINH HOA BÁT PHỞ TRUYỀN THỐNG
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#24150B] leading-relaxed text-justify mb-2">
                    <span className="text-3xl sm:text-4xl font-serif font-black float-left mr-2 leading-none text-[#721F1B]">
                      B
                    </span>
                    át phở Bờ Hồ tinh tuý là sự tổng hòa màu sắc và phong vị: bánh phở mỏng dai trắng ngần, thịt bò thái lát hồng tươi mềm ngọt, nước dùng trong vắt ánh vàng hổ phách, điểm xuyết một thảm hành hoa và ngò gai tươi ngát thơm.
                  </p>

                  <p className="text-xs sm:text-[12.5px] font-serif text-[#3A281E] leading-relaxed text-justify mb-3">
                    Thêm một chút giấm ớt tỏi ủ chum sành, vài giọt chanh cốm tươi mọng nước và một đĩa quẩy giòn vàng rượm, thực khách sẽ được tận hưởng trọn vẹn phong vị thanh nhã bậc nhất của ẩm thực Thăng Long – Hà Nội.
                  </p>

                  {/* Photo: Bát phở tái chín thơm lừng */}
                  <div className="border border-[#543D2B]/40 p-1 bg-[#DECEB0] my-2">
                    <div className="aspect-16/9 overflow-hidden bg-[#24150B]">
                      <img
                        src="/src/assets/images/regenerated_image_1790911567588.png"
                        alt="Bát phở bò truyền thống Phở Thìn Bờ Hồ"
                        className="w-full h-full object-cover filter contrast-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-serif mt-1 px-1 text-[#4A3525]">
                      <span className="italic">Điểm hẹn ẩm thực Thăng Long</span>
                      <span className="font-bold text-[#721F1B]">Thanh tao – Tinh tế – Đậm đà</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. BOTTOM RUNNING FOOTER LINE */}
            <div className="border-y-2 border-[#543D2B] py-2 mt-6 text-center">
              <p className="text-xs sm:text-sm font-serif font-black uppercase tracking-widest text-[#24150B]">
                PHỞ THÌN BỜ HỒ — 70 NĂM GIỮ TRỌN HƯƠNG VỊ HÀ NỘI
              </p>
            </div>
          </div>
        </article>

        {/* ========================================================
            BOTTOM FAST NAVIGATION ACTIONS (Khám phá thực đơn & Đặt bàn)
            ======================================================== */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#E8D7B8] border border-[#543D2B]/40 shadow-sm text-xs text-[#22140B]">
          <div className="flex items-center gap-2 text-[#4A3525]">
            <Utensils className="w-4 h-4 text-[#721F1B] shrink-0" />
            <span className="font-serif font-semibold">
              Kính mời quý thực khách ghé thăm và thưởng thức phong vị phở bò truyền thống từ năm 1955.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('menu')}
              className="px-4 py-2 border-2 border-[#68131C] bg-[#FFF8E9] text-[#68131C] hover:bg-[#68131C] hover:text-[#FFF8E9] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Xem Thực Đơn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigate('reservation')}
              className="px-5 py-2 bg-[#721F1B] hover:bg-[#521310] text-[#FFF8E9] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>Đặt Bàn Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
