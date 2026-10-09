import React, { useState, useEffect } from 'react';
import { adminStore } from '../../services/adminStore';
import { ShieldCheck, Lock, Key, AlertTriangle, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { PhoThinLogo } from '../PhoThinLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const success = await adminStore.authenticate(email.trim(), password);
      if (!success) throw new Error('Email hoặc mật khẩu không chính xác.');
      setPassword('');
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <div className="w-full max-w-md bg-[#180406] border-2 border-[#D6A84F]/60 rounded-2xl shadow-2xl overflow-hidden text-[#FFF8E9] relative">
        <div className="h-1.5 bg-gradient-to-r from-[#B88932] via-[#F4D068] to-[#B88932]" />
        <button onClick={onClose} disabled={isSubmitting} className="absolute top-4 right-4 p-2 text-[#D6A84F]/70 hover:text-[#FFF8E9] hover:bg-[#3B0B10] rounded-full transition-colors cursor-pointer" aria-label="Đóng đăng nhập">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-[#200609] border border-[#D6A84F]/50 shadow-inner mb-3"><PhoThinLogo size={44} withRing /></div>
            <div className="flex items-center justify-center gap-1.5 text-[#D6A84F] text-xs font-mono tracking-widest uppercase mb-1"><ShieldCheck className="w-4 h-4" /><span>Cổng Quản Trị</span></div>
            <h2 id="admin-login-title" className="text-xl sm:text-2xl font-serif font-black text-[#FFF8E9]">Phở Thìn Bờ Hồ - 1955</h2>
            <p className="text-xs text-[#F4E8D2]/70 mt-1">Đăng nhập bằng tài khoản quản trị đã được cấp quyền.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[#D6A84F] mb-1.5 uppercase tracking-wider">Email quản trị</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#D6A84F]/70" />
                <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} placeholder="Nhập email quản trị..." className="w-full pl-9 pr-3 py-2.5 bg-[#200609] border border-[#B88932]/40 rounded-xl text-sm text-[#FFF8E9] focus:outline-none focus:border-[#D6A84F] focus:ring-1 focus:ring-[#D6A84F] transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[#D6A84F] mb-1.5 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-[#D6A84F]/70" />
                <input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} className="w-full pl-9 pr-10 py-2.5 bg-[#200609] border border-[#B88932]/40 rounded-xl text-sm text-[#FFF8E9] focus:outline-none focus:border-[#D6A84F] focus:ring-1 focus:ring-[#D6A84F] transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#F4E8D2]/60 hover:text-[#FFF8E9]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {errorMessage && <div role="alert" className="p-3 bg-[#A52B25]/20 border border-[#A52B25]/50 rounded-xl text-xs text-[#FF8B8B] flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{errorMessage}</span></div>}
            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-gradient-to-r from-[#B88932] via-[#D6A84F] to-[#B88932] hover:brightness-110 text-[#180406] font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}<span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span></button>
          </form>
        </div>
        <div className="bg-[#05140F] py-2.5 px-6 border-t border-[#B88932]/20 text-[11px] text-[#F4E8D2]/60">Tài khoản và quyền truy cập được quản lý trên máy chủ.</div>
      </div>
    </div>
  );
};
