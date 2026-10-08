import React from 'react';

interface PhoThinLogoProps {
  className?: string;
  size?: number | string;
  withRing?: boolean;
  alt?: string;
}

export const PhoThinLogo: React.FC<PhoThinLogoProps> = ({
  className = '',
  size = 48,
  withRing = false,
  alt = 'Phở Thìn Bờ Hồ - Tinh Hoa Ẩm Thực Hà Nội Từ 1955',
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none overflow-hidden ${
        withRing ? 'ring-2 ring-[#D6A84F] shadow-sm bg-white' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension, minWidth: dimension, minHeight: dimension }}
    >
      <img
        src="/logo-pho-thin.svg"
        alt={alt}
        className="w-full h-full object-contain shrink-0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
