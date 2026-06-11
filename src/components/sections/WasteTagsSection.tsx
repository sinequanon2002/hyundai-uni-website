"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/useFadeIn";
import { WASTE_TYPES } from "@/lib/schemas/inquiry";
import { ArrowRight, BookOpen } from "lucide-react";

/** 품목별 상세 가이드 페이지 (/waste/types/[slug]) — SEO 내부 링크 */
const DETAIL_GUIDES = [
  { name: "폐유", slug: "폐유" },
  { name: "폐산·폐알칼리", slug: "폐산" },
  { name: "폐유기용제", slug: "폐유기용제" },
  { name: "폐석면", slug: "폐석면" },
  { name: "폐페인트·폐락카", slug: "폐페인트" },
  { name: "폐유독물질", slug: "폐유독물질" },
  { name: "의료폐기물", slug: "의료폐기물" },
  { name: "특정시설 발생 폐기물", slug: "특정시설-폐기물" },
  { name: "유해물질 함유 폐기물", slug: "유해물질-폐기물" },
  { name: "PCBs 함유 폐기물", slug: "pcb-폐기물" },
];

export function WasteTagsSection() {
  const fadeInHeader = useFadeIn();
  const fadeInContent = useFadeIn(0.08, 100);

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* 헤더 */}
        <div {...fadeInHeader} className={`text-center mb-8 ${fadeInHeader.className}`}>
          <h3 className="text-xs font-bold text-accent tracking-widest uppercase mb-2">수거 대상 품목</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-3">
            이런 폐기물, 저희가 처리합니다
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
            지정폐기물 전 품목 수거·운반 가능합니다. 처리 가능 여부가 불확실하다면 먼저 문의해 주세요.
          </p>
        </div>

        {/* 태그 목록 */}
        <div {...fadeInContent} className={`max-w-3xl mx-auto ${fadeInContent.className}`}>
          <div className="flex flex-wrap gap-2 justify-center">
            {WASTE_TYPES.map((item) => (
              <Link
                key={item}
                href={`/support/inquiry?waste=${encodeURIComponent(item)}`}
                className="px-4 py-1.5 text-sm font-medium border rounded-full transition-colors bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* 품목별 상세 가이드 */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <BookOpen size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-neutral-700">품목별 상세 가이드</h3>
          </div>
          <p className="text-xs text-neutral-400 text-center mb-4">
            배출 업종, 보관 기준, 처리 절차를 품목별로 자세히 안내합니다.
          </p>
          <div className="flex flex-wrap gap-x-1 gap-y-2 justify-center text-sm">
            {DETAIL_GUIDES.map((guide, i) => (
              <span key={guide.slug} className="flex items-center">
                <Link
                  href={`/waste/types/${guide.slug}`}
                  className="px-2 py-0.5 text-neutral-600 hover:text-primary underline-offset-4 hover:underline transition-colors"
                >
                  {guide.name}
                </Link>
                {i < DETAIL_GUIDES.length - 1 && (
                  <span className="text-neutral-200">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 mb-3">
            목록에 없는 품목도 문의 주시면 처리 가능 여부를 확인해 드립니다.
          </p>
          <Link
            href="/waste/types"
            className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline underline-offset-4"
          >
            수거 대상 폐기물 상세 안내
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
