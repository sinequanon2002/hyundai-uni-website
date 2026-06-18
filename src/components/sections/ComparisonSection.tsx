"use client";

import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

const ROWS = [
  { item: "지정폐기물 수집·운반 허가",    others: "미허가 업체 다수",              us: "정식 허가 (제 대구수집 130호)" },
  { item: "올바로시스템 전자인계서",       others: "고객이 직접 작성",              us: "전담 대행 처리" },
  { item: "처리 완료 증빙 서류",          others: "미제공 또는 지연",              us: "처리 확인서 + 인계서 사본 즉시 제공" },
  { item: "지정폐기물 전 품목 처리",       others: "일부 품목만 가능",              us: "폐산·폐알칼리·폐유 등 전 품목" },
  { item: "견적 회신 속도",               others: "수일 소요",                    us: "영업일 2일 이내 정확한 견적서 제공" },
  { item: "지역 밀착 대응",               others: "광역 운영, 느린 응대",          us: "대구·경북 전 지역 전담" },
  { item: "보관 기준 현장 점검",          others: "별도 비용 발생",                us: "방문 시 무료 제공" },
  { item: "배출자 법적 리스크",           others: "미허가 위탁 시 연대책임 가능",   us: "적법 처리로 배출자 완전 보호" },
];

export function ComparisonSection() {
  const fadeInHeader = useFadeIn();
  const fadeInTable = useFadeIn(0.08, 100);
  const fadeInCta = useFadeIn(0.08, 200);

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* 헤더 */}
        <div {...fadeInHeader} className={`text-center mb-10 ${fadeInHeader.className}`}>
          <h3 className="text-xs font-bold text-cobalt-600 tracking-widest uppercase mb-2">
            현대유앤아이를 선택해야 하는 이유
          </h3>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight mb-3">
            지정폐기물은 아무 업체에나<br className="hidden md:inline" /> 맡길 수 없습니다
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
            허가 여부부터 처리 증빙까지 — 위탁 업체를 선택하기 전 반드시 확인하세요.
          </p>
        </div>

        {/* 비교표 — 디자인 시스템 카드 스타일 */}
        <div {...fadeInTable} className={`max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-ds-md ${fadeInTable.className}`}>
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-navy-900 text-white text-xs font-semibold">
            <div className="px-2.5 sm:px-4 py-3 text-slate-400">확인 항목</div>
            <div className="px-2.5 sm:px-4 py-3 text-center border-l border-white/10 text-slate-300">일반 업체</div>
            <div className="px-2.5 sm:px-4 py-3 text-center border-l border-white/10 text-white">현대유앤아이</div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_1fr_1fr] text-[13px] leading-snug border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}`}
            >
              <div className="px-2.5 sm:px-4 py-3 font-medium text-navy-700 flex items-center">{row.item}</div>
              <div className="px-2.5 sm:px-4 py-3 border-l border-slate-100 flex items-center gap-1.5 text-slate-500">
                <X size={14} className="shrink-0 text-rose-400" strokeWidth={2.5} />
                <span>{row.others}</span>
              </div>
              <div className="px-2.5 sm:px-4 py-3 border-l border-slate-100 flex items-center gap-1.5 text-cobalt-700 font-medium bg-cobalt-50/60">
                <Check size={14} className="shrink-0 text-mint-500" strokeWidth={2.5} />
                <span>{row.us}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div {...fadeInCta} className={`mt-8 text-center ${fadeInCta.className}`}>
          <p className="text-slate-500 text-sm mb-4">
            지금 신청하시면 <span className="font-semibold text-cobalt-600">영업일 2일 이내</span>에 정확한 견적서를 보내드립니다.
          </p>
          <Link
            href="/support/inquiry"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-mint-500 text-white text-sm font-semibold rounded-pill hover:bg-mint-600 transition-colors shadow-glow-cta"
          >
            <ArrowRight size={15} />
            견적 문의
          </Link>
        </div>
      </div>
    </section>
  );
}
