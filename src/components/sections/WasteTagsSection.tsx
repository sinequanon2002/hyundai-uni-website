"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/useFadeIn";
import { WASTE_CATEGORIES } from "@/lib/schemas/inquiry";
import { ArrowRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "⭐ 그 밖의 폐산 (혼합·미상 성분)": "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  "폐유류": "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
  "폐유기용제류": "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100",
  "폐산류 (특정 성분)": "bg-red-50 text-red-800 border-red-200 hover:bg-red-100",
  "폐알칼리류": "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100",
  "폐화학물질·시약류": "bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100",
  "폐슬러지·오염토사 처리": "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100",
  "집수정·배수로 슬러지 수거": "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100",
  "탱크 클리닝·슬러지 처리": "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100",
  "탱크·배관·설비 철거": "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100",
  "지정폐기물 종합 처리": "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10",
  "기타": "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100",
};

const CATEGORY_DISPLAY = Object.entries(WASTE_CATEGORIES).filter(([key]) => key !== "기타");

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

        {/* 카테고리 태그 */}
        <div {...fadeInContent} className={`max-w-3xl mx-auto space-y-5 ${fadeInContent.className}`}>
          {CATEGORY_DISPLAY.map(([category, items]) => {
            const tagClass = CATEGORY_COLORS[category] ?? "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100";
            return (
              <div key={category}>
                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  {category.replace("⭐ ", "")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(items as readonly string[]).map((item) => (
                    <Link
                      key={item}
                      href={`/support/inquiry?waste=${encodeURIComponent(item)}`}
                      className={`px-3 py-1 text-xs font-medium border rounded-full transition-colors cursor-pointer ${tagClass}`}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 mb-3">
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
