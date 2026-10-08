import React, { useState, useEffect } from 'react';
import { Language, PageView } from '../types';
import { translations } from '../data/translations';
import { adminStore } from '../services/adminStore';
import { AlertTriangle, X, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { PhoThinLogo } from './PhoThinLogo';

interface FakeMapWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (view: PageView) => void;
}

export const FakeMapWarningModal: React.FC<FakeMapWarningModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigate,
}) => {
  const [branchesList, setBranchesList] = useState(() => adminStore.getBranches());

  useEffect(() => {
    const handleUpdate = () => {
      setBranchesList([...adminStore.getBranches()]);
    };
    window.addEventListener('phothin_store_updated', handleUpdate);
    return () => window.removeEventListener('phothin_store_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const t = translations[lang].warningModal;

  const handleGoToBranches = () => {
    onClose();
    onNavigate('contact');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FFF8E9] border-2 border-[#B88932] rounded-xl shadow-2xl text-[#68131C] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top gold bar */}
        <div className="bg-[#560F16] text-[#D6A84F] px-6 py-2.5 flex items-center justify-between border-b border-[#B88932]/30">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-[#D6A84F]" />
            <span>{t.badge}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-[#F4E8D2]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start gap-3.5 mb-4">
            <PhoThinLogo size={54} withRing className="shrink-0" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#68131C]/10 text-[#68131C] text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A52B25]" />
                <span>Thương hiệu chính gốc xác thực</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#68131C] leading-snug">
                {t.title}
              </h3>
              <p className="text-xs text-[#65452F] mt-1">
                {lang === 'vi' ? 'Thông báo chính thức bảo vệ quyền lợi thực khách của Gia tộc Phở Thìn (1955)' : 'Official Notice by the 1955 Pho Thin Bo Ho Family Heritage'}
              </p>
            </div>
          </div>

          <div className="bg-[#F4E8D2] border-l-4 border-[#A52B25] p-4 mb-4 text-xs sm:text-sm text-[#68131C] space-y-2 rounded-r-lg border-y border-r border-[#B88932]/25">
            <p className="leading-relaxed">{t.intro}</p>
            <p className="leading-relaxed font-semibold text-[#A52B25]">
              • {t.rule1}
            </p>
            <p className="leading-relaxed font-semibold text-[#A52B25]">
              • {t.rule2}
            </p>
          </div>

          {/* 4 Official Verified Branches List */}
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#68131C] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#A52B25]" />
              <span>
                {lang === 'vi' ? 'DANH SÁCH 4 CƠ SỞ CHÍNH THỨC TẠI HÀ NỘI:' : 'VERIFIED 4 OFFICIAL HANOI LOCATIONS:'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branchesList.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-lg border ${
                    b.isOriginal 
                      ? 'border-[#A52B25] bg-[#F4E8D2] ring-1 ring-[#A52B25]/20' 
                      : 'border-[#B88932]/30 bg-[#F4E8D2]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#68131C]">
                      {b.code}: {b.name[lang]}
                    </span>
                    {b.isOriginal && (
                      <span className="text-[10px] bg-[#A52B25] text-[#FFF8E9] font-bold px-1.5 py-0.5 rounded border border-[#D6A84F]/40">
                        GỐC 1955
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#65452F] line-clamp-2">
                    {b.address}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#A52B25] font-medium mt-2">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline font-bold font-mono">
                      {b.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-[#B88932]/30 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={handleGoToBranches}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#68131C] text-[#F4E8D2] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#560F16] border border-[#B88932]/40 transition-colors cursor-pointer shadow-sm"
            >
              {t.understood}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-[#B88932]/40 bg-[#F4E8D2] text-[#68131C] font-medium text-xs rounded-lg hover:bg-[#B88932]/20 transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
