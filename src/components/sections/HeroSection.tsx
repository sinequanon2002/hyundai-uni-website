"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsDown, ArrowRight, FileText } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

export function HeroSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay — 실제 보관 현장 (IBC 용기) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-site.jpg"
          alt="현대유앤아이 지정폐기물 보관 용기(IBC) 현장"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-[#0A1B20]/75" />
      </div>

      {/* Content */}
      <div
        {...fadeIn}
        className={`relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center text-center text-white ${fadeIn.className}`}
      >
        {/* 상단 배지 */}
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-medium tracking-wide">
          지정폐기물 수집·운반 전문기업
        </div>

        <h1 className="text-[clamp(2rem,7vw,4.5rem)] font-bold leading-tight mb-6">
          환경을 지키는 책임,
          <br />
          신뢰를 운반합니다.
        </h1>
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-neutral-100/90 mb-7 leading-relaxed font-light">
          지정폐기물 수집·운반 전문 기업으로서, 엄격한 법규 준수와 축적된 노하우로
          고객사의 환경 책임을 완벽하게 대행합니다.
        </p>

        {/* 기능 배지 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            "정식 허가 업체",
            "올바로시스템 대행",
            "24시간 내 방문 견적",
            "처리 증빙 즉시 제공",
          ].map((badge) => (
            <span
              key={badge}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white/15 border border-white/30 rounded-full text-white/90 backdrop-blur-sm tracking-wide"
            >
              ✓ {badge}
            </span>
          ))}
        </div>

        {/* CTA 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/support/inquiry"
            className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-xl hover:bg-neutral-50 transition-colors flex items-center gap-2.5"
          >
            <ArrowRight size={18} />
            견적 문의
          </Link>

          {/* 보조 CTA */}
          <Link
            href="/resources/brochure"
            className="px-8 py-4 bg-transparent border-2 border-white/70 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2.5"
          >
            <FileText size={17} />
            서비스 소개서 보기
          </Link>
        </div>
      </div>

      {/* 스크롤 안내 */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center gap-1.5 cursor-pointer select-none"
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
      >
        <span className="text-xs tracking-widest opacity-70 font-medium">
          스크롤해서 자세히 보기
        </span>
        <ChevronsDown size={22} className="animate-scroll-arrow opacity-80" />
      </div>
    </section>
  );
}
