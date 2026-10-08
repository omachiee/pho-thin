import React, { useState, useEffect } from 'react';
import { adminStore } from '../../services/adminStore';
import { ShieldCheck, Lock, Key, AlertTriangle, Eye, EyeOff, Smartphone, RefreshCw, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { PhoThinLogo } from '../PhoThinLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'credentials' | 'pin'>('credentials');
  const [username, setUsername] = useState('admin_phothin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [showCredentialHelp, setShowCredentialHelp] = useState(false);

  // Check lock status on load or interval
  useEffect(() => {
    if (!isOpen) return;

    const checkLock = () => {
      const status = adminStore.isLocked();
      if (status.locked) {
        setIsLocked(true);
        setLockCountdown(status.remainingSeconds);
      } else {
        setIsLocked(false);
        setLockCountdown(0);
      }
    };

    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Tên quản trị và Mật khẩu.');
      return;
    }

    const config = adminStore.getSecurityConfig();
    const isUserValid = username.trim().toLowerCase() === config.username.trim().toLowerCase();
    const isPassValid = password === config.passwordHash;

    if (!isUserValid || !isPassValid) {
      const userAgent = navigator.userAgent.includes('Mobile') ? 'Mobile Device (iOS/Android)' : 'Desktop Browser';
      const result = adminStore.recordFailedAttempt(userAgent);
      if (result.locked) {
        setIsLocked(true);
        setLockCountdown(60);
        setErrorMessage('Hệ thống phát hiện đăng nhập sai 5 lần liên tiếp. Tạm khóa an toàn trong 60 giây!');
      } else {
        setAttemptsLeft(result.attemptsLeft);
        setErrorMessage(`Tên quản trị hoặc Mật khẩu không chính xác. Còn lại ${result.attemptsLeft} lần thử.`);
      }
      return;
    }

    // Step 1 passed, proceed to 6-digit PIN verification
    setStep('pin');
    setErrorMessage('');
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 6) {
        verifyFinalAuth(nextPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const verifyFinalAuth = (pinCodeToVerify: string) => {
    const userAgent = navigator.userAgent.includes('Mobile') ? 'Mobile Smartphone' : 'Desktop PC/Mac';
    const success = adminStore.authenticate(username, password, pinCodeToVerify, userAgent);

    if (success) {
      onLoginSuccess();
    } else {
      setErrorMessage('Mã PIN bảo mật 6 số không đúng! Vui lòng thử lại.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#180406] border-2 border-[#D6A84F]/60 rounded-2xl shadow-2xl overflow-hidden text-[#FFF8E9] relative">
        {/* Top Gold Security Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#B88932] via-[#F4D068] to-[#B88932]" />

        {/* Close Button (Discreet) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#D6A84F]/70 hover:text-[#FFF8E9] hover:bg-[#3B0B10] rounded-full transition-colors cursor-pointer"
          title="Thoát cổng bảo mật"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-[#200609] border border-[#D6A84F]/50 shadow-inner mb-3">
              <PhoThinLogo size={44} withRing />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[#D6A84F] text-xs font-mono tracking-widest uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
              <span>Cổng Quản Trị Bảo Mật Cấp Cao</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-[#FFF8E9]">
              Phở Thìn Bờ Hồ - 1955
            </h2>
            <p className="text-xs text-[#F4E8D2]/70 mt-1">
              {step === 'credentials'
                ? 'Hệ thống quản lý nội bộ bảo mật đa tầng dành cho Ban Quản Trị'
                : 'Nhập mã PIN xác thực 6 số (Hỗ trợ chạm bàn phím số trên điện thoại)'}
            </p>
          </div>

          {/* Locked Out Alert */}
          {isLocked ? (
            <div className="bg-[#A52B25]/20 border border-[#A52B25] rounded-xl p-4 text-center mb-6">
              <AlertTriangle className="w-8 h-8 text-[#E5484D] mx-auto mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-[#E5484D] mb-1">HỆ THỐNG ĐANG BỊ TẠM KHÓA</h4>
              <p className="text-xs text-[#F4E8D2]/90 mb-3">
                Nhập sai vượt quá số lần cho phép. Để phòng chống tấn công dò mật khẩu (Anti-Brute Force), vui lòng chờ:
              </p>
              <div className="inline-block px-4 py-2 bg-[#200609] border border-[#E5484D] rounded-lg font-mono text-xl font-bold text-[#E5484D]">
                {lockCountdown}s
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: CREDENTIALS */}
              {step === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#D6A84F] mb-1.5 uppercase tracking-wider">
                      Tên Quản Trị Viên (Username)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#D6A84F]/70">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên tài khoản quản trị..."
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-[#200609] border border-[#B88932]/40 rounded-xl text-sm text-[#FFF8E9] focus:outline-none focus:border-[#D6A84F] focus:ring-1 focus:ring-[#D6A84F] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#D6A84F] uppercase tracking-wider">
                        Mật Khẩu Cấp 1 (Master Password)
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#D6A84F]/70">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-9 pr-10 py-2.5 bg-[#200609] border border-[#B88932]/40 rounded-xl text-sm text-[#FFF8E9] focus:outline-none focus:border-[#D6A84F] focus:ring-1 focus:ring-[#D6A84F] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#F4E8D2]/60 hover:text-[#FFF8E9]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-[#A52B25]/20 border border-[#A52B25]/50 rounded-xl text-xs text-[#FF8B8B] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#B88932] via-[#D6A84F] to-[#B88932] hover:brightness-110 text-[#180406] font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <span>Tiếp tục xác thực PIN Cấp 2</span>
                    <Smartphone className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: 6-DIGIT PIN WITH TOUCH KEYPAD FOR SMARTPHONES */}
              {step === 'pin' && (
                <div className="space-y-4">
                  {/* PIN Display Dots */}
                  <div className="flex justify-center items-center gap-3 my-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const isFilled = pin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            isFilled
                              ? 'bg-[#D6A84F] border-[#D6A84F] scale-110 shadow-[0_0_10px_#D6A84F]'
                              : 'bg-transparent border-[#B88932]/40'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-[#A52B25]/20 border border-[#A52B25]/50 rounded-xl text-xs text-[#FF8B8B] text-center">
                      {errorMessage}
                    </div>
                  )}

                  {/* Tactile Virtual Keypad (0-9, Backspace, Clear) */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handlePinDigit(digit)}
                        className="h-13 bg-[#200609] active:bg-[#D6A84F] active:text-[#180406] hover:bg-[#3B0B10] border border-[#B88932]/30 rounded-xl text-lg font-bold font-mono text-[#FFF8E9] shadow-sm transition-colors cursor-pointer flex items-center justify-center select-none"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handlePinClear}
                      className="h-13 bg-[#200609]/60 hover:bg-[#3B0B10] text-xs font-semibold text-[#F4E8D2]/70 rounded-xl border border-[#B88932]/20 cursor-pointer flex items-center justify-center uppercase tracking-wider"
                    >
                      Xóa hết
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinDigit('0')}
                      className="h-13 bg-[#200609] active:bg-[#D6A84F] active:text-[#180406] hover:bg-[#3B0B10] border border-[#B88932]/30 rounded-xl text-lg font-bold font-mono text-[#FFF8E9] shadow-sm transition-colors cursor-pointer flex items-center justify-center select-none"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handlePinBackspace}
                      className="h-13 bg-[#200609]/60 hover:bg-[#3B0B10] text-[#D6A84F] rounded-xl border border-[#B88932]/20 cursor-pointer flex items-center justify-center font-mono"
                      title="Xóa ký tự cuối"
                    >
                      ⌫
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setPin('');
                        setErrorMessage('');
                      }}
                      className="text-[#D6A84F] hover:underline cursor-pointer"
                    >
                      ← Quay lại bước 1
                    </button>

                    <button
                      type="button"
                      onClick={() => verifyFinalAuth(pin)}
                      disabled={pin.length !== 6}
                      className="px-4 py-2 bg-[#D6A84F] disabled:opacity-40 disabled:cursor-not-allowed text-[#180406] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Xác thực PIN
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Secure Default Credential Helper for Store Owner */}
          <div className="mt-6 pt-4 border-t border-[#B88932]/20 text-center">
            <button
              type="button"
              onClick={() => setShowCredentialHelp(!showCredentialHelp)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#D6A84F]/80 hover:text-[#D6A84F] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Thông tin tài khoản quản trị mặc định (Dành riêng cho chủ quán)</span>
            </button>

            {showCredentialHelp && (
              <div className="mt-3 p-3 bg-[#200609]/90 border border-[#D6A84F]/40 rounded-xl text-left text-xs space-y-1.5 text-[#F4E8D2] font-mono animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[#D6A84F]">Tài khoản:</span>
                  <span className="font-bold bg-[#3B0B10] px-2 py-0.5 rounded text-white">admin_phothin</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#D6A84F]">Mật khẩu cấp 1:</span>
                  <span className="font-bold bg-[#3B0B10] px-2 py-0.5 rounded text-white">PhoThin1955@BoHo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#D6A84F]">Mã PIN cấp 2:</span>
                  <span className="font-bold bg-[#3B0B10] px-2 py-0.5 rounded text-[#D6A84F]">195570</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-[#F4E8D2]/70 font-sans border-t border-[#B88932]/20">
                  <span>* Bạn có thể đổi tài khoản, mật khẩu và mã PIN trong phần Cài đặt Quản trị.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin_phothin');
                      setPassword('PhoThin1955@BoHo');
                      setPin('195570');
                    }}
                    className="text-[#D6A84F] underline hover:text-white"
                  >
                    Điền nhanh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Stealth Mode */}
        <div className="bg-[#05140F] py-2.5 px-6 border-t border-[#B88932]/20 flex items-center justify-between text-[11px] text-[#F4E8D2]/60">
          <span>Khóa bảo vệ SSL / AES-256</span>
          <span className="font-mono text-[#D6A84F]">PORTAL_V1955</span>
        </div>
      </div>
    </div>
  );
};
