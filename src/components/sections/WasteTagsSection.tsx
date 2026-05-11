"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/useFadeIn";
import { WASTE_TYPES } from "@/lib/schemas/inquiry";
import { ArrowRight } from "lucide-react";

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
