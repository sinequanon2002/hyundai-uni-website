"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

export function CtaSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 md:px-8">
        <div
          {...fadeIn}
          className={`flex flex-col lg:flex-row items-center justify-between gap-10 ${fadeIn.className}`}
        >
          {/* 텍스트 */}
          <div className="text-center lg:text-left text-white max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              지정폐기물 처리, <br className="lg:hidden" />
              더 이상 고민하지 마세요
            </h2>
            <p className="text-white/80 leading-relaxed">
              수거부터 올바로시스템 신고, 처리 증빙 서류까지 — 현대유앤아이가 모든 과정을 대행합니다.
            </p>
          </div>

          {/* 이중 CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
            <Link
              href="/support/inquiry"
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-primary px-7 py-4 rounded-xl font-bold text-base shadow-xl hover:bg-neutral-100 hover:scale-105 transition-all duration-300"
            >
              무료 방문 견적 신청하기
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/company/profile"
              className="inline-flex items-center justify-center gap-2.5 bg-white/10 border border-white/40 text-white px-7 py-4 rounded-xl font-semibold text-base hover:bg-white/20 transition-colors"
            >
              <FileText size={18} />
              서비스 소개서 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
