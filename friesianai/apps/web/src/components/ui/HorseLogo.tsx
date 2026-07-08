import { cn } from '@/utils/cn';

interface HorseLogoProps {
  /** Pixel size (square). */
  size?: number;
  /** Stroke weight in viewBox units — lower reads lighter at large sizes. */
  strokeWidth?: number;
  className?: string;
}

/**
 * FriesianAI mark — a minimal horse-head line drawing.
 * Inherits `currentColor`, so tint it via text color utilities.
 */
export function HorseLogo({ size = 24, strokeWidth = 2.2, className }: HorseLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="FriesianAI"
      className={cn('shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ear */}
      <path d="M33 15 C34 11 36 7 38.6 4.6 C40.8 6 42.2 8.2 42.6 10.8 L44 12.4" />
      {/* Neck crest */}
      <path d="M44 12.4 C49.6 17.8 53.4 25.5 54 34.5 C54.6 42 54.4 50 54.4 58" />
      {/* Face, muzzle, jaw, chest */}
      <path d="M33 15 C24.5 20 15.5 25.5 9.6 33 C7.8 35.3 7.4 37.8 8.9 39.4 C10.2 40.8 12 40.4 13.4 39.6 C17.4 41.2 21.8 42.2 25.4 44.4 C28.6 46.4 30.6 49.6 31.4 53 C31.8 54.6 32 56.3 32 58" />
      {/* Eye */}
      <circle cx="28.5" cy="22.5" r="1.5" fill="currentColor" stroke="none" />
      {/* Nostril */}
      <path d="M11 36.2 L12.2 36.8" />
      {/* Mane */}
      <path d="M40 14.5 C44.4 21 46.6 29 46.9 37.5 C47.1 44.5 46.4 51.5 47.2 58" />
    </svg>
  );
}
