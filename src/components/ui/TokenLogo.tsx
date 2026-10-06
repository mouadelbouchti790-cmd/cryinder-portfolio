import { useState } from 'react';

interface TokenLogoProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-16 w-16 rounded-2xl',
} as const;

const IMG_SIZES = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-11 w-11',
} as const;

const LETTER_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
} as const;

export default function TokenLogo({ src, alt, size = 'md', className = '' }: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] ${SIZES[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          className={`object-contain ${IMG_SIZES[size]}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`font-black text-[#E5E7EB] ${LETTER_SIZES[size]}`}>
          {(alt?.[0] || '?').toUpperCase()}
        </span>
      )}
    </div>
  );
}
