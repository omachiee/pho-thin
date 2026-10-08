import React, { useState, useEffect } from 'react';
import { Language, PageView } from '../types';
import { BRANCHES } from '../data/branches';
import { translations } from '../data/translations';
import { adminStore } from '../services/adminStore';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Briefcase, 
  ExternalLink, 
  CheckCircle, 
  CalendarCheck, 
  AlertTriangle,
  Building
} from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface ContactSectionProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
  onReserveBranch: (branchId: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
  onReserveBranch,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'careers'>('branches');
  const [appliedPosition, setAppliedPosition] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantSubmitted, setApplicantSubmitted] = useState(false);
  const [branchesList, setBranchesList] = useState(() => adminStore.getBranches());

  useEffect(() => {
    const handleUpdate = () => {
      setBranchesList([...adminStore.getBranches()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  const t = translations[lang].contact;


  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;
    setApplicantSubmitted(true);
    adminStore.addInquiry({
      type: 'recruitment',
      fullName: applicantName,
      phone: applicantPhone,
      position: appliedPosition || 'Nhân viên',
      message: `Ứng tuyển vị trí ${appliedPosition || 'Nhân viên'} qua website.`,
    });
    setTimeout(() => {
      setApplicantSubmitted(false);
      setShowApplyModal(false);
      setApplicantName('');
      setApplicantPhone('');
    }, 2500);
  };

  return (
    <div className="py-10 sm:py-14 bg-[#FFF8E9] min-h-screen text-[#68131C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A5A43] mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#68131C] transition-colors cursor-pointer font-medium"
          >
            {translations[lang].nav.home}
          </button>
          <span className="text-[#B88932]/50">/</span>
          <span className="text-[#68131C] font-bold">{translations[lang].nav.contact}</span>
        </nav>

        {/* Unified Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#8C1D24]" />
            <span>Hệ Thống 4 Cơ Sở & Tuyển Dụng</span>
          </div>
          <h1
            onClick={onHeadingClick}
            className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-[#68131C] tracking-tight leading-tight cursor-pointer hover:opacity-95 transition-opacity"
            title="Bấm để xem cảnh báo"
          >
            {t.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#65452F] max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          {/* Heritage Accent Divider */}
          <div className="flex items-center justify-center gap-2 mt-4 text-[#B88932]/60 select-none pointer-events-none">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#B88932]/50" />
            <span className="text-[10px] text-[#D6A84F]">❖</span>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#B88932]/50" />
          </div>
        </div>

        {/* Unified Segmented Control: 4 Cơ Sở vs Tuyển Dụng */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex p-1.5 bg-[#F4E8D2] border border-[#B88932]/40 rounded-xl shadow-xs gap-1.5 max-w-md w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('branches')}
              className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'branches'
                  ? 'bg-[#68131C] text-[#F4E8D2] shadow-sm border border-[#B88932]/30'
                  : 'text-[#68131C] hover:bg-[#FFF8E9] hover:text-[#560F16] border border-transparent'
              }`}
            >
              {t.tabBranches}
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'careers'
                  ? 'bg-[#68131C] text-[#F4E8D2] shadow-sm border border-[#B88932]/30'
                  : 'text-[#68131C] hover:bg-[#FFF8E9] hover:text-[#560F16] border border-transparent'
              }`}
            >
              {t.tabCareers}
            </button>
          </div>
        </div>

        {/* TAB 1: 4 CƠ SỞ CHÍNH THỨC */}
        {activeTab === 'branches' && (
          <div className="space-y-8">
            <div className="bg-[#F4E8D2] border border-[#B88932]/40 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 text-xs text-[#68131C]">
              <div className="flex items-center gap-2 text-[#A52B25]">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-[#68131C]">
                  Khung giờ phục vụ chung: Sáng 06:00 – 13:00 | Chiều 17:00 – 22:00
                </span>
              </div>
              <button
                onClick={onHeadingClick}
                className="text-[#65452F] hover:text-[#A52B25] underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#A52B25]" />
                <span>Xem cảnh báo ghim vị trí sai lệch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branchesList.map((b) => (
                <div
                  key={b.id}
                  className={`bg-[#F4E8D2] rounded-xl p-6 border flex flex-col justify-between transition-all shadow-sm ${
                    b.isOriginal 
                      ? 'border-2 border-[#A52B25] ring-2 ring-[#A52B25]/20 shadow-md' 
                      : 'border-[#B88932]/35 hover:border-[#B88932] hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-[#68131C]/10 border border-[#B88932]/30 text-[#68131C] text-xs font-mono font-bold">
                        {b.code}
                      </span>
                      {b.isOriginal && (
                        <span className="text-[11px] font-bold bg-[#A52B25] text-[#FFF8E9] px-2 py-0.5 rounded border border-[#D6A84F]/40">
                          CỘI NGUỒN TỪ 1955
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={onHeadingClick}
                      className="text-lg font-serif font-bold text-[#68131C] hover:text-[#A52B25] mb-2 cursor-pointer hover:underline"
                    >
                      {b.name[lang]}
                    </h3>

                    <p className="text-xs text-[#65452F] italic mb-4">
                      "{b.highlight[lang]}"
                    </p>

                    <div className="space-y-2.5 text-xs text-[#3A281E]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#A52B25] shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#A52B25] shrink-0" />
                        <a
                          href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`}
                          className="font-mono font-bold text-[#A52B25] hover:underline"
                        >
                          {b.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#A52B25] shrink-0" />
                        <span>{b.openingHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this specific branch */}
                  <div className="mt-6 pt-4 border-t border-[#B88932]/30 flex flex-wrap gap-2">
                    <button
                      onClick={() => onReserveBranch(b.id)}
                      className="flex-1 py-2 px-3 bg-[#68131C] text-[#F4E8D2] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#560F16] border border-[#B88932]/40 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Đặt bàn tại {b.code}</span>
                    </button>

                    <a
                      href={b.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#FFF8E9] hover:bg-[#68131C] hover:text-[#FFF8E9] border border-[#B88932]/40 text-[#68131C] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#A52B25]" />
                      <span>{t.btnDirections}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TUYỂN DỤNG NHÂN SỰ */}
        {activeTab === 'careers' && (
          <div className="bg-[#F4E8D2] border border-[#B88932]/40 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8 text-[#68131C]">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 flex items-center justify-center mx-auto mb-3 text-[#68131C]">
                <Briefcase className="w-7 h-7 text-[#A52B25]" />
              </div>
              <h2
                onClick={onHeadingClick}
                className="text-2xl font-serif font-bold text-[#68131C] cursor-pointer hover:underline"
              >
                {t.careersHeading}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#65452F]">
                {t.careersSub}
              </p>
            </div>

            {/* Positions list */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#68131C] mb-4">
                {t.positionsTitle}
              </h3>

              <div className="space-y-3">
                {[
                  { title: t.pos1, type: 'Full-time / Part-time', salary: '7.500.000 – 9.000.000 đ' },
                  { title: t.pos2, type: 'Học nghề gia truyền', salary: '8.500.000 – 12.000.000 đ' },
                  { title: t.pos3, type: 'Ca xoay linh hoạt', salary: '8.000.000 – 10.000.000 đ' },
                ].map((pos, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FFF8E9] border border-[#B88932]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#68131C]">{pos.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#65452F] mt-1">
                        <span>Hình thức: {pos.type}</span>
                        <span>•</span>
                        <span className="text-[#A52B25] font-mono font-semibold">Thu nhập: {pos.salary}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setAppliedPosition(pos.title);
                        setShowApplyModal(true);
                      }}
                      className="px-4 py-2 bg-[#68131C] hover:bg-[#560F16] text-[#F4E8D2] text-xs font-bold uppercase tracking-wider rounded-lg border border-[#B88932]/40 transition-colors cursor-pointer shadow-sm"
                    >
                      Ứng tuyển ngay
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-[#FFF8E9] p-5 rounded-xl border border-[#B88932]/30 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#68131C]">
                {t.benefitsTitle}
              </h4>
              <p className="text-xs sm:text-sm text-[#3A281E] leading-relaxed">
                {t.benefits}
              </p>
            </div>

            {/* Google Docs link button according to specification */}
            <div className="text-center pt-4">
              <a
                href="https://docs.google.com/forms"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#68131C] text-[#F4E8D2] font-bold text-xs uppercase tracking-wider rounded-lg border border-[#B88932]/40 shadow-md hover:bg-[#560F16] transition-colors"
              >
                <span>{t.btnApplyDocs}</span>
                <ExternalLink className="w-4 h-4 text-[#D6A84F]" />
              </a>
            </div>
          </div>
        )}

        {/* Application Modal Popup */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-[#FFF8E9] border-2 border-[#B88932] rounded-xl p-6 max-w-md w-full text-[#68131C] shadow-2xl">
              <h3 className="text-lg font-serif font-bold text-[#68131C] mb-1">
                Ứng Tuyển: {appliedPosition}
              </h3>
              <p className="text-xs text-[#65452F] mb-4">
                Điền nhanh thông tin liên lạc để Bộ phận Nhân sự Phở Thìn Bờ Hồ gọi lại phỏng vấn:
              </p>

              {applicantSubmitted ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto" />
                  <p className="text-sm font-bold text-[#68131C]">Đã gửi thông tin ứng tuyển thành công!</p>
                  <p className="text-xs text-[#65452F]">Quán sẽ liên hệ bạn qua điện thoại trong 24 giờ tới.</p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#68131C] mb-1">Họ và tên của bạn</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 bg-[#F4E8D2] border border-[#B88932]/40 rounded-lg text-sm text-[#68131C] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#68131C] mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="098xxxxxxx"
                      className="w-full px-3 py-2 bg-[#F4E8D2] border border-[#B88932]/40 rounded-lg text-sm text-[#68131C] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#68131C] text-[#F4E8D2] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#560F16] border border-[#B88932]/40 cursor-pointer shadow-sm"
                    >
                      Gửi ứng tuyển
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2.5 bg-[#F4E8D2] border border-[#B88932]/40 text-[#68131C] text-xs rounded-lg hover:bg-[#B88932]/20 cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
