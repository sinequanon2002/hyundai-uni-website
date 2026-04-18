import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageBanner({ title, subtitle, backgroundImage }: PageBannerProps) {
  return (
    <div className="relative w-full h-[240px] md:h-[320px] bg-primary flex items-center justify-center overflow-hidden">
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
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="text-neutral-100 text-lg md:text-xl font-light drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
