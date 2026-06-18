"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";
import { COMPANY } from "@/lib/constants";

export function CtaSection() {
  const fadeIn = useFadeIn();

  return (
    /* 디자인 시스템 CTA 밴드 — cobalt→mint 그라디언트 */
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div
          {...fadeIn}
          className={`rounded-xl md:rounded-[24px] overflow-hidden bg-gradient-to-r from-cobalt-600 to-mint-500 shadow-ds-xl px-8 md:px-14 py-14 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 ${fadeIn.className}`}
        >
          {/* 텍스트 */}
          <div className="text-center lg:text-left text-white max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
              영업일 2일 이내, <br className="lg:hidden" />
              투명한 견적을 받아보세요.
            </h2>
            <p className="text-white/90 leading-relaxed text-lg">
              폐기물 종류와 물량만 알려주시면 담당자가 빠르게 검토하여 정확한 견적서를 보내드립니다.
            </p>
          </div>

          {/* CTA 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/support/inquiry"
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-cobalt-700 px-8 py-4 rounded-md font-bold text-base shadow-ds-md hover:shadow-ds-lg hover:-translate-y-px transition-all duration-200"
            >
              빠른 견적 문의
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={`tel:${COMPANY.tel}`}
              className="inline-flex items-center justify-center gap-2.5 bg-white/15 border border-white/50 text-white px-8 py-4 rounded-md font-semibold text-base hover:bg-white/25 transition-colors"
            >
              <Phone size={18} />
              전화 상담
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
