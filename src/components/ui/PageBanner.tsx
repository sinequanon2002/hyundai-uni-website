import React from 'react';
import { cn } from '@/lib/utils';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  /** 전환 페이지(견적문의 등)에서 본문을 첫 화면에 노출하기 위한 낮은 배너 */
  compact?: boolean;
}

export function PageBanner({ title, subtitle, backgroundImage, compact }: PageBannerProps) {
  return (
    <div
      className={cn(
        "relative w-full bg-primary flex items-center justify-center overflow-hidden",
        compact ? "h-[130px] md:h-[160px]" : "h-[240px] md:h-[320px]"
      )}
    >
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary z-0" />
      )}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="z-20 text-center px-4">
        <h1
          className={cn(
            "font-bold text-white drop-shadow-md",
            compact ? "text-2xl md:text-3xl mb-1.5" : "text-3xl md:text-5xl mb-4"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "text-neutral-100 font-light drop-shadow",
              compact ? "text-sm md:text-base" : "text-lg md:text-xl"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
