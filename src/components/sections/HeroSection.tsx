"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

export function HeroSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-primary/70" />
      </div>

      {/* Content */}
      <div
        {...fadeIn}
        className={`relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center text-center text-white ${fadeIn.className}`}
      >
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-medium tracking-wide">
          ENVIRONMENTAL WASTE MANAGEMENT
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6">
          환경을 지키는 책임,
          <br />
          신뢰를 운반합니다.
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-neutral-100/90 mb-10 leading-relaxed font-light">
          지정폐기물 수집·운반 전문 기업으로서, 엄격한 법규 준수와 축적된 노하우로
          고객사의 환경 책임을 완벽하게 대행합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/support/inquiry"
            className="px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            견적 문의하기
          </Link>
          <Link
            href="#services"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
          >
            서비스 알아보기
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center animate-bounce-slow">
        <span className="text-xs uppercase tracking-widest mb-2 opacity-80">
          Scroll Down
        </span>
        <ChevronDown size={24} className="opacity-80" />
      </div>
    </section>
  );
}
