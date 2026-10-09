import React, { useState, useEffect, useRef } from 'react';
import { Language, PageView, Branch, Dish, ReservationFormData, ReservationRecord } from '../types';
import { translations } from '../data/translations';
import { adminStore } from '../services/adminStore';
import { 
  Calendar, 
  CalendarCheck,
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Home, 
  Sparkles,
  Info,
  Download,
  Loader2,
  QrCode,
  FileText,
  ShieldCheck,
  Award
} from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface ReservationSectionProps {
  lang: Language;
  onNavigate: (view: PageView) => void;
  onHeadingClick: () => void;
  preselectedDish?: Dish | null;
  initialBranchId?: string;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  lang,
  onNavigate,
  onHeadingClick,
  preselectedDish,
  initialBranchId,
}) => {
  const t = translations[lang].reservation;

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  // Available Time Slots inside Opening Hours (06:00 - 13:00 and 17:00 - 22:00)
  const timeSlots = [
    // Morning: 06:00 – 13:00
    '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', 
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    // Afternoon: 17:00 – 22:00
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
    '20:00', '20:30', '21:00', '21:30'
  ];

  // Form State
  const [branchesList, setBranchesList] = useState<Branch[]>(() => adminStore.getBranches());

  useEffect(() => {
    const handleUpdate = () => {
      setBranchesList([...adminStore.getBranches()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  const [formData, setFormData] = useState<ReservationFormData>({
    fullName: '',
    email: '',
    phone: '',
    reservationDate: todayStr,
    reservationTime: '11:30',
    partySize: 2,
    branchId: initialBranchId || 'cs1-dinh-tien-hoang',
    notes: preselectedDish 
      ? (lang === 'vi' ? `Muốn thưởng thức món: ${preselectedDish.name.vi}` : `Interested in ordering: ${preselectedDish.name[lang]}`)
      : '',
  });

  // Validation errors map
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ReservationRecord | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialBranchId) {
      setFormData((prev) => ({ ...prev, branchId: initialBranchId }));
    }
  }, [initialBranchId]);

  useEffect(() => {
    if (preselectedDish) {
      const dishNote = lang === 'vi' 
        ? `Muốn thưởng thức món: ${preselectedDish.name.vi}` 
        : `Interested in ordering: ${preselectedDish.name[lang]}`;
      setFormData((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}. ${dishNote}` : dishNote
      }));
    }
  }, [preselectedDish, lang]);

  const selectedBranch = branchesList.find((b) => b.id === formData.branchId);
  const [submitError, setSubmitError] = useState('');
  const [isSample, setIsSample] = useState(false);
  const receiptTitle = { vi: 'Đã tiếp nhận yêu cầu đặt bàn', en: 'Reservation request received', zh: '已收到预订申请', ko: '예약 요청이 접수되었습니다' }[lang];
  const receiptNotice = { vi: 'Yêu cầu đang chờ xác nhận từ cơ sở. Đây không phải xác nhận giữ bàn.', en: 'Your request awaits confirmation from the branch. This is not a confirmed table booking.', zh: '申请正在等待门店确认，此凭证不代表已保留座位。', ko: '지점 확인을 기다리고 있습니다. 이 접수증은 테이블 예약 확정이 아닙니다.' }[lang];

  useEffect(() => {
    if (!initialBranchId && branchesList.length) {
      setFormData((prev) => branchesList.some((b) => b.id === prev.branchId) ? prev : { ...prev, branchId: branchesList[0].id });
    }
  }, [branchesList, initialBranchId]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'partySize' ? Number(value) : value }));
    // Clear specific field error when user modifies
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Tên bắt buộc
    if (!formData.fullName.trim()) {
      newErrors.fullName = t.errors.nameRequired;
    }

    // 2. Số điện thoại bắt buộc & đúng format Việt Nam
    if (!formData.phone.trim()) {
      newErrors.phone = t.errors.phoneRequired;
    } else {
      // Clean phone
      const cleanPhone = formData.phone.replace(/[\s\-\.\(\)]/g, '');
      const vnPhoneRegex = /^(?:0|\+?84)[35789]\d{8}$/;
      if (!vnPhoneRegex.test(cleanPhone)) {
        newErrors.phone = t.errors.phoneInvalid;
      }
    }

    // 3. Ngày bắt buộc & không chọn ngày quá khứ
    if (!formData.reservationDate) {
      newErrors.reservationDate = t.errors.dateRequired;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.reservationDate) || !Number.isFinite(Date.parse(`${formData.reservationDate}T00:00:00+07:00`)) || new Date(`${formData.reservationDate}T00:00:00Z`).toISOString().slice(0, 10) !== formData.reservationDate || formData.reservationDate < todayStr) {
      newErrors.reservationDate = t.errors.datePast;
    }

    // 4. Giờ bắt buộc & trong giờ mở cửa
    if (!timeSlots.includes(formData.reservationTime) || (formData.reservationDate === todayStr && Date.parse(`${formData.reservationDate}T${formData.reservationTime}:00+07:00`) <= Date.now())) {
      newErrors.reservationTime = t.errors.timeRequired;
    }

    // 5. Số lượng người >= 1
    if (!Number.isInteger(Number(formData.partySize)) || Number(formData.partySize) < 1 || Number(formData.partySize) > 50) {
      newErrors.partySize = t.errors.partySizeRequired;
    }

    // 6. Cơ sở bắt buộc
    if (!selectedBranch) {
      newErrors.branchId = t.errors.branchRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate() || !selectedBranch) return;
    setIsSubmitting(true);
    setSubmitError('');
    const submittedData = { ...formData, fullName: formData.fullName.trim(), phone: formData.phone.replace(/[\s.()\-]/g, ''), partySize: Number(formData.partySize) };
    try {
      const createdRecord = await adminStore.addReservationFromClient(submittedData, selectedBranch);
      setIsSample(false);
      setConfirmation({
        id: createdRecord.id,
        createdAt: new Date(createdRecord.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        data: { ...submittedData, ...createdRecord },
        branch: selectedBranch,
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể gửi yêu cầu đặt bàn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current || !confirmation) return;
    setIsDownloadingPdf(true);
    setPdfSuccessMessage(false);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

      const element = voucherRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFF8E9',
        logging: false,
        ignoreElements: (el) => {
          return el.classList.contains('action-bar-no-print');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      const yOffset = printHeight < pageHeight - margin * 2 
        ? Math.max(margin, (pageHeight - printHeight) / 2) 
        : margin;

      pdf.addImage(imgData, 'JPEG', margin, yOffset, printWidth, Math.min(printHeight, pageHeight - margin * 2));
      
      const cleanId = confirmation.id.toLowerCase().replace(/[^a-z0-9]/g, '-');
      pdf.save(`phieu-dat-ban-pho-thin-bo-ho-${cleanId}.pdf`);

      setPdfSuccessMessage(true);
      setTimeout(() => setPdfSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePreviewSample = () => {
    if (!selectedBranch || isSubmitting) return;
    setIsSample(true);
    const sampleRecord: ReservationRecord = {
      id: `PTBH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      data: {
        fullName: formData.fullName || (lang === 'vi' ? 'Nguyễn Hải Đăng' : 'John Smith'),
        email: formData.email || 'haidang.pho@example.com',
        phone: formData.phone || '0988686868',
        reservationDate: formData.reservationDate || todayStr,
        reservationTime: formData.reservationTime || '11:30',
        partySize: formData.partySize || 2,
        branchId: formData.branchId || 'cs1-dinh-tien-hoang',
        notes: formData.notes || (lang === 'vi' ? 'Bàn cạnh cửa sổ, 2 bát phở tái chín nước trong đậm đà' : 'Table near window, 2 bowls of signature pho'),
      },
      branch: selectedBranch,
    };
    setConfirmation(sampleRecord);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FFF8E9] min-h-screen text-[#68131C]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7A5A43] mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#68131C] transition-colors cursor-pointer font-medium"
          >
            {translations[lang].nav.home}
          </button>
          <span className="text-[#B88932]/50">/</span>
          <span className="text-[#68131C] font-bold">{t.title}</span>
        </nav>

        {/* STEP 6: SUCCESS CONFIRMATION VOUCHER */}
        {confirmation ? (
          <div 
            ref={voucherRef}
            className="reservation-voucher-container relative bg-[#F4E8D2] border-2 border-[#68131C] rounded-2xl p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-[#68131C] overflow-hidden"
          >
            {/* Heritage Ornate Corner Accents */}
            <span className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-[#D6A84F] pointer-events-none" />
            <span className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-[#D6A84F] pointer-events-none" />
            <span className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-[#D6A84F] pointer-events-none" />
            <span className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-[#D6A84F] pointer-events-none" />

            {/* Heritage Official Red Rubber Stamp */}
            <span className="absolute top-4 right-4 sm:top-6 sm:right-8 transform -rotate-12 pointer-events-none opacity-85 select-none z-10 inline-block">
              <span className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-3 border-[#A52B25] p-1.5 flex flex-col items-center justify-center text-[#A52B25] bg-[#FFF8E9]/75 backdrop-blur-[1px] shadow-xs">
                <span className="w-full h-full rounded-full border border-dashed border-[#A52B25] flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[9px] font-black uppercase tracking-wider block">
                    PHỞ THÌN BỜ HỒ
                  </span>
                  <span className="text-[7.5px] text-[#A52B25]/80 font-serif italic block">
                    Gia truyền từ 1955
                  </span>
                  <span className="my-0.5 px-1.5 py-0.5 bg-[#A52B25] text-[#FFF8E9] text-[9px] font-black tracking-widest uppercase rounded inline-block">
                    {isSample ? 'PHIẾU MẪU' : 'ĐÃ TIẾP NHẬN'}
                  </span>
                  <span className="text-[7.5px] font-bold tracking-tight block">
                    CHƯA XÁC NHẬN GIỮ BÀN
                  </span>
                  <span className="text-[7px] font-mono text-[#A52B25]/90 block">
                    HOÀN KIẾM • HÀ NỘI
                  </span>
                </span>
              </span>
            </span>

            {/* div:nth-of-type(1) - Header */}
            <div className="text-center pb-6 border-b border-[#B88932]/30 relative pr-20 sm:pr-0">
              <div className="flex items-center justify-center gap-3 mb-2">
                <PhoThinLogo size={66} withRing className="shadow-md" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#68131C] text-[#D6A84F] text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#D6A84F]" />
                <span>{isSample ? 'Phiếu mẫu — chưa gửi' : receiptTitle}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#68131C]">
                {isSample ? 'Phiếu minh họa đặt bàn' : receiptTitle}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#65452F] max-w-lg mx-auto">
                {isSample ? 'Thông tin mẫu chưa được gửi tới quán và không giữ bàn.' : receiptNotice}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="inline-block bg-[#FFF8E9] border-2 border-[#68131C] px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-[#A52B25] shadow-xs">
                  {t.bookingCode}: <span className="text-base sm:text-lg text-[#68131C] ml-1 font-black">{confirmation.id}</span>
                </div>
                <div className="inline-block bg-[#F4E8D2] border border-[#B88932]/40 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#65452F]">
                  <span>Thời điểm cấp phiếu: {confirmation.createdAt}</span>
                </div>
              </div>
            </div>

            {/* div:nth-of-type(2) - Summary Details Grid, QR Code & Notes */}
            <div className="py-6 border-b border-[#B88932]/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Customer details */}
                <div className="bg-[#FFF8E9] p-5 rounded-xl border border-[#B88932]/35 space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#68131C] flex items-center gap-2 border-b border-[#B88932]/25 pb-2">
                    <User className="w-4 h-4 text-[#D6A84F]" />
                    <span>{t.guestInfo}</span>
                  </h3>
                  <div className="text-sm space-y-2 text-[#3A281E]">
                    <p><span className="text-[#65452F]">Họ tên:</span> <strong className="text-[#68131C]">{confirmation.data.fullName}</strong></p>
                    <p><span className="text-[#65452F]">Số điện thoại:</span> <strong className="text-[#68131C]">{confirmation.data.phone}</strong></p>
                    {confirmation.data.email && (
                      <p><span className="text-[#65452F]">Email:</span> {confirmation.data.email}</p>
                    )}
                    <p><span className="text-[#65452F]">Ngày đến:</span> <strong className="text-[#A52B25]">{confirmation.data.reservationDate}</strong></p>
                    <p><span className="text-[#65452F]">Khung giờ:</span> <strong className="text-[#A52B25]">{confirmation.data.reservationTime}</strong></p>
                    <p><span className="text-[#65452F]">Số lượng khách:</span> <strong className="text-[#68131C]">{confirmation.data.partySize} người</strong></p>
                    {confirmation.data.notes && (
                      <p className="text-xs bg-[#F4E8D2] p-2.5 rounded border border-[#B88932]/30 italic text-[#65452F]">
                        Ghi chú: "{confirmation.data.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Branch Info & Hotline */}
                <div className="bg-[#FFF8E9] p-5 rounded-xl border border-[#B88932]/35 space-y-3 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#68131C] flex items-center gap-2 border-b border-[#B88932]/25 pb-2">
                      <MapPin className="w-4 h-4 text-[#D6A84F]" />
                      <span>{t.branchInfo}</span>
                    </h3>
                    <div className="text-sm space-y-2 text-[#3A281E] mt-3">
                      <p className="text-base font-serif font-bold text-[#68131C]">
                        {confirmation.branch.name[lang]} {confirmation.branch.isOriginal ? '★ [Bờ Hồ Gốc 1955]' : ''}
                      </p>
                      <p className="text-xs text-[#65452F] leading-relaxed">
                        {confirmation.branch.address}
                      </p>
                      <div className="pt-2">
                        <span className="text-xs text-[#65452F] block">{t.hotlineNotice}:</span>
                        <a 
                          href={`tel:${confirmation.branch.phone.replace(/[^0-9+]/g, '')}`}
                          className="text-lg font-mono font-bold text-[#A52B25] hover:underline flex items-center gap-1.5 mt-1"
                        >
                          <Phone className="w-4 h-4 text-[#D6A84F]" />
                          <span>{confirmation.branch.phone}</span>
                        </a>
                      </div>
                      <div className="text-xs text-[#65452F] mt-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D6A84F] shrink-0" />
                        <span>{t.noticeTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#B88932]/25 text-[11px] text-[#A52B25] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#68131C]" />
                    <span>Vui lòng chờ cơ sở liên hệ xác nhận trước khi đến.</span>
                  </div>
                </div>
              </div>

              {/* QR Code & Barcode verification strip */}
              <div className="bg-[#FFF8E9] p-4 rounded-xl border border-[#B88932]/35 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* SVG QR Code */}
                  <div className="w-16 h-16 bg-white p-1.5 rounded-lg border border-[#B88932]/40 shadow-xs flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-[#68131C]">
                      <rect x="5" y="5" width="28" height="28" fill="#68131C" rx="3" />
                      <rect x="11" y="11" width="16" height="16" fill="#FFF8E9" rx="1.5" />
                      <rect x="15" y="15" width="8" height="8" fill="#68131C" rx="1" />
                      <rect x="67" y="5" width="28" height="28" fill="#68131C" rx="3" />
                      <rect x="73" y="11" width="16" height="16" fill="#FFF8E9" rx="1.5" />
                      <rect x="77" y="15" width="8" height="8" fill="#68131C" rx="1" />
                      <rect x="5" y="67" width="28" height="28" fill="#68131C" rx="3" />
                      <rect x="11" y="73" width="16" height="16" fill="#FFF8E9" rx="1.5" />
                      <rect x="15" y="77" width="8" height="8" fill="#68131C" rx="1" />
                      <rect x="42" y="42" width="16" height="16" fill="#A52B25" rx="2" />
                      <circle cx="50" cy="50" r="4" fill="#D6A84F" />
                      <rect x="38" y="8" width="5" height="5" />
                      <rect x="48" y="8" width="5" height="5" />
                      <rect x="58" y="8" width="5" height="5" />
                      <rect x="38" y="18" width="5" height="5" />
                      <rect x="48" y="24" width="5" height="5" />
                      <rect x="58" y="18" width="5" height="5" />
                      <rect x="38" y="72" width="5" height="5" />
                      <rect x="48" y="68" width="5" height="5" />
                      <rect x="58" y="76" width="5" height="5" />
                      <rect x="68" y="42" width="5" height="5" />
                      <rect x="76" y="52" width="5" height="5" />
                      <rect x="84" y="42" width="5" height="5" />
                      <rect x="68" y="62" width="5" height="5" />
                      <rect x="80" y="70" width="5" height="5" />
                      <rect x="88" y="80" width="5" height="5" />
                      <rect x="8" y="42" width="5" height="5" />
                      <rect x="18" y="52" width="5" height="5" />
                      <rect x="26" y="42" width="5" height="5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#68131C] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Mã QR minh họa</span>
                    </span>
                    <p className="text-[11px] text-[#65452F] mt-0.5 leading-tight">
                      Hình minh họa, không dùng để quét hoặc xác thực đặt chỗ.
                    </p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="flex flex-col items-center sm:items-end">
                  <div className="flex items-center gap-[2px] h-9 px-2 bg-white rounded border border-[#B88932]/30 py-1">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                      <div 
                        key={idx} 
                        className="h-full bg-[#68131C]" 
                        style={{ width: `${w * 1.5}px` }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#65452F] tracking-widest mt-1">
                    *{confirmation.id}*
                  </span>
                </div>
              </div>

              {/* Antifraud Guarantee Notice */}
              <div className="text-[11px] text-[#65452F] bg-[#FFF8E9] p-3 rounded-lg border border-[#B88932]/30 text-center leading-relaxed">
                <strong className="text-[#68131C]">Lưu ý bảo chứng:</strong> Phở Thìn Bờ Hồ thành lập từ 1955 bên hồ Hoàn Kiếm, hiện chỉ có <strong>4 cơ sở chính thức</strong> tại Hà Nội. Quý khách vui lòng xuất trình phiếu đặt bàn này hoặc đọc mã đặt chỗ khi tới quán để được phục vụ chu đáo nhất.
              </div>

              {/* Notification when PDF is downloaded */}
              {pdfSuccessMessage && (
                <div className="p-3 bg-[#68131C] text-[#D6A84F] border border-[#D6A84F]/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D6A84F]" />
                  <span>{t.pdfSuccess}</span>
                </div>
              )}
            </div>

            {/* div:nth-of-type(3) - Bottom Actions Bar */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 action-bar-no-print">
              {/* button:nth-of-type(1) - TARGET ELEMENT: Download PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full sm:w-auto px-6 py-3 bg-[#A52B25] hover:bg-[#831F1A] text-[#FFF8E9] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-60 border border-[#B88932]/40"
                title="Lưu file PDF về máy"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                    <span>{t.pdfDownloading}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#D6A84F]" />
                    <span>{t.btnDownloadPdf}</span>
                  </>
                )}
              </button>

              {/* button:nth-of-type(2) - Print / Browser PDF */}
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-3 bg-[#FFF8E9] hover:bg-[#F4E8D2] border border-[#B88932]/50 text-[#68131C] font-semibold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                title="In phiếu hoặc lưu file PDF qua trình duyệt"
              >
                <Printer className="w-4 h-4 text-[#D6A84F]" />
                <span>{t.btnPrint}</span>
              </button>

              {/* button:nth-of-type(3) - Back to Home */}
              <button
                onClick={() => {
                  setConfirmation(null);
                  onNavigate('home');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#68131C] text-[#F4E8D2] hover:bg-[#560F16] border border-[#B88932]/40 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4 text-[#D6A84F]" />
                <span>{t.btnBackHome}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 4 & 5: RESERVATION FORM */
          <div className="bg-[#F4E8D2]/90 border border-[#B88932]/35 rounded-2xl shadow-xl p-6 sm:p-10 text-[#68131C]">
            {/* Unified Page Header */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#68131C]/10 border border-[#B88932]/40 text-[#68131C] text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
                <CalendarCheck className="w-3.5 h-3.5 text-[#8C1D24]" />
                <span>Đặt Chỗ Trực Tiếp • Không Qua Trung Gian</span>
              </div>
              <h1
                onClick={onHeadingClick}
                className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-[#68131C] tracking-tight leading-tight cursor-pointer hover:opacity-95 transition-opacity"
                title="Bấm để xem cảnh báo giả mạo bản đồ"
              >
                {t.title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#65452F] max-w-2xl mx-auto leading-relaxed">
                {t.subtitle}
              </p>
              {/* Heritage Accent Divider */}
              <div className="flex items-center justify-center gap-2 mt-4 mb-4 text-[#B88932]/60 select-none pointer-events-none">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#B88932]/50" />
                <span className="text-[10px] text-[#D6A84F]">❖</span>
                <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#B88932]/50" />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FFF8E9] border border-[#B88932]/35 text-xs text-[#68131C] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#8C1D24]" />
                <span className="font-medium">{t.noticeTime}</span>
              </div>
            </div>

            {/* If dish was pre-selected, show notice */}
            {preselectedDish && (
              <div className="mb-6 p-4 rounded-xl bg-[#FFF8E9] border border-[#B88932]/40 flex items-center gap-3 shadow-xs">
                <img
                  src={preselectedDish.image}
                  alt={preselectedDish.name[lang]}
                  className="w-12 h-12 rounded object-cover border border-[#B88932]/40"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#A52B25] font-bold block">
                    {lang === 'vi' ? 'Món ăn đã chọn thưởng thức:' : 'Selected Dish to Enjoy:'}
                  </span>
                  <span className="text-sm font-serif font-bold text-[#68131C]">
                    {preselectedDish.name[lang]} ({preselectedDish.formattedPrice}đ)
                  </span>
                </div>
              </div>
            )}

            {/* The 8 Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Họ và tên * (Bắt buộc) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldName} <span className="text-[#A52B25]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t.placeholderName}
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] placeholder-[#65452F]/60 focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                        errors.fullName ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#A52B25] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* 2. Số điện thoại * (Bắt buộc & Validate định dạng VN) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldPhone} <span className="text-[#A52B25]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t.placeholderPhone}
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] placeholder-[#65452F]/60 focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                        errors.phone ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#A52B25] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* 3. Email (Không bắt buộc) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldEmail} <span className="text-[#65452F] text-[10px] font-normal">({lang === 'vi' ? 'không bắt buộc' : 'optional'})</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.placeholderEmail}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border border-[#B88932]/40 rounded-lg text-sm text-[#68131C] placeholder-[#65452F]/60 focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all"
                    />
                  </div>
                </div>

                {/* 4. Số lượng người * (Bắt buộc, nguyên dương) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldPartySize} <span className="text-[#A52B25]">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="number"
                      name="partySize"
                      min="1"
                      max="50"
                      value={formData.partySize}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                        errors.partySize ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                      }`}
                    />
                  </div>
                  {errors.partySize && (
                    <p className="mt-1 text-xs text-[#A52B25] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.partySize}</span>
                    </p>
                  )}
                </div>

                {/* 5. Ngày đặt bàn * (Bắt buộc, không quá khứ) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldDate} <span className="text-[#A52B25]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      name="reservationDate"
                      min={todayStr}
                      value={formData.reservationDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                        errors.reservationDate ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                      }`}
                    />
                  </div>
                  {errors.reservationDate && (
                    <p className="mt-1 text-xs text-[#A52B25] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.reservationDate}</span>
                    </p>
                  )}
                </div>

                {/* 6. Thời gian đến * (Bắt buộc, trong giờ mở cửa 06-13 & 17-22) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                    {t.fieldTime} <span className="text-[#A52B25]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      name="reservationTime"
                      value={formData.reservationTime}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                        errors.reservationTime ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                      }`}
                    >
                      <optgroup label="Khung Giờ Sáng (06:00 – 13:00)">
                        {timeSlots.slice(0, 13).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Khung Giờ Chiều (17:00 – 22:00)">
                        {timeSlots.slice(13).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  {errors.reservationTime && (
                    <p className="mt-1 text-xs text-[#A52B25] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.reservationTime}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 7. Chọn cơ sở * (Bắt buộc, 4 cơ sở) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                  {t.fieldBranch} <span className="text-[#A52B25]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border rounded-lg text-sm text-[#68131C] focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all ${
                      errors.branchId ? 'border-[#A52B25] ring-1 ring-[#A52B25]' : 'border-[#B88932]/40'
                    }`}
                  >
                    {branchesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code}: {b.name[lang]} {b.isOriginal ? '★ [Bờ Hồ Gốc 1955]' : ''}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Instant preview of selected branch address & phone as instructed in brief */}
                {selectedBranch && (
                  <div className="mt-3 p-3.5 rounded-lg bg-[#FFF8E9] border border-[#B88932]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
                    <div>
                      <span className="text-[#65452F] block">Địa chỉ phục vụ:</span>
                      <strong className="text-[#68131C]">{selectedBranch.address}</strong>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 text-[#A52B25] font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <a href={`tel:${selectedBranch.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                        {selectedBranch.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 8. Lời nhắn / Ghi chú (Không bắt buộc) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#68131C] mb-2">
                  {t.fieldNotes}
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-[#65452F] absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t.placeholderNotes}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8E9] border border-[#B88932]/40 rounded-lg text-sm text-[#68131C] placeholder-[#65452F]/60 focus:bg-[#FFF8E9] focus:outline-none focus:ring-2 focus:ring-[#68131C]/20 focus:border-[#68131C] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Submit Button [Gửi thông tin] - Heritage red #A52B25 with warm cream text */}
              <div className="pt-4 space-y-3">
                {submitError && <p role="alert" className="text-sm text-[#A52B25]">{submitError}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#68131C] hover:bg-[#560F16] border border-[#B88932]/40 text-[#F4E8D2] font-bold text-sm uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{t.btnSubmitting}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#D6A84F]" />
                      <span>{t.btnSubmit}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handlePreviewSample}
                    className="inline-flex items-center gap-1.5 text-xs text-[#65452F] hover:text-[#68131C] font-medium underline decoration-dotted underline-offset-4 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D6A84F]" />
                    <span>{t.btnPreviewSample} (Tạo phiếu & xem xuất PDF)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
