"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, FileText } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";
import { COMPANY } from "@/lib/constants";

export function HeroSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div
          {...fadeIn}
          className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 md:py-24 lg:py-28 ${fadeIn.className}`}
        >
          {/* 좌측: 텍스트 콘텐츠 */}
          <div className="flex-1 flex flex-col items-start text-left order-2 lg:order-1">
            {/* 상단 배지 */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full bg-cobalt-50 border border-cobalt-100 text-cobalt-700 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-600 shrink-0" />
              지정폐기물 수집·운반 전문기업
            </div>

            <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-navy-900 mb-6">
              환경을 지키는<br />
              책임, 신뢰를<br />
              운반합니다.
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-slate-600 mb-7 leading-relaxed">
              지정폐기물 수집·운반 전문 기업으로서, 엄격한 법규 준수와 축적된 노하우로
              고객사의 환경 책임을 완벽하게 대행합니다.
            </p>

            {/* 2영업일 강조 배지 */}
            <div className="inline-flex items-center gap-2 bg-cobalt-50 border border-cobalt-100 text-cobalt-700 rounded-[9px] px-4 py-2.5 mb-7 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-cobalt-600 shrink-0" />
              별도 비용 없이 &nbsp;·&nbsp; 영업일 2일 이내 정확한 견적서 회신
            </div>

            {/* 기능 배지 */}
            <div className="flex flex-wrap gap-2 mb-10">
              {[
                "정식 허가 업체",
                "올바로시스템 대행",
                "영업일 2일 이내 견적",
                "처리 증빙 즉시 제공",
              ].map((badge) => (
                <span
                  key={badge}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-full text-slate-600 tracking-wide"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>

            {/* CTA 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/support/inquiry"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#202023] text-white font-bold rounded-[9px] hover:opacity-90 transition-opacity shadow-ds-md"
              >
                <FileText size={18} />
                견적 요청하기
              </Link>
              <a
                href={`tel:${COMPANY.tel}`}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white border border-slate-200 text-navy-900 font-semibold rounded-[9px] hover:border-cobalt-200 hover:text-cobalt-600 transition-colors shadow-ds-xs"
              >
                <Phone size={17} />
                전화 문의 바로하기
              </a>
            </div>
          </div>

          {/* 우측: 현장 이미지 카드 */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-ds-xl aspect-[4/3]">
              <Image
                src="/images/hero-site.jpg"
                alt="현대유앤아이 지정폐기물 보관 용기(IBC) 현장"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
