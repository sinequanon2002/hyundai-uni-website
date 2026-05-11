"use client";

import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

const ROWS = [
  {
    item: "지정폐기물 수집·운반 허가",
    others: "미허가 업체 다수",
    us: "정식 허가 (제 대구수집 130호)",
  },
  {
    item: "올바로시스템 전자인계서",
    others: "고객이 직접 작성",
    us: "전담 대행 처리",
  },
  {
    item: "처리 완료 증빙 서류",
    others: "미제공 또는 지연",
    us: "처리 확인서 + 인계서 사본 즉시 제공",
  },
  {
    item: "지정폐기물 전 품목 처리",
    others: "일부 품목만 가능",
    us: "폐산·폐알칼리·폐유 등 전 품목",
  },
  {
    item: "방문 견적 속도",
    others: "수일 소요",
    us: "24시간 내 현장 방문",
  },
  {
    item: "지역 밀착 대응",
    others: "광역 운영, 느린 응대",
    us: "대구·경북 전 지역 전담",
  },
  {
    item: "보관 기준 현장 점검",
    others: "별도 비용 발생",
    us: "방문 시 무료 제공",
  },
  {
    item: "배출자 법적 리스크",
    others: "미허가 위탁 시 연대책임 가능",
    us: "적법 처리로 배출자 완전 보호",
  },
];

export function ComparisonSection() {
  const fadeInHeader = useFadeIn();
  const fadeInTable = useFadeIn(0.1, 150);
  const fadeInCta = useFadeIn(0.1, 300);

  return (
    <section className="py-20 md:py-28 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div
          {...fadeInHeader}
          className={`text-center mb-12 ${fadeInHeader.className}`}
        >
          <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
            현대유앤아이를 선택해야 하는 이유
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-4">
            지정폐기물은 아무 업체에나<br className="hidden md:inline" /> 맡길 수 없습니다
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            허가 여부부터 처리 증빙까지 — 위탁 업체를 선택하기 전 반드시 확인하세요.
          </p>
        </div>

        {/* Table */}
        <div
          {...fadeInTable}
          className={`max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-200 shadow-sm ${fadeInTable.className}`}
        >
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-neutral-800 text-white text-sm font-semibold">
            <div className="px-5 py-4 text-neutral-400">확인 항목</div>
            <div className="px-5 py-4 text-center border-l border-neutral-700 text-neutral-300">
              일반 업체
            </div>
            <div className="px-5 py-4 text-center border-l border-neutral-700 text-primary-light">
              <span className="text-white">현대유앤아이</span>
            </div>
          </div>

          {/* Table Rows */}
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_1fr_1fr] text-sm border-t border-neutral-100 ${
                i % 2 === 0 ? "bg-white" : "bg-neutral-50/60"
              }`}
            >
              {/* Item */}
              <div className="px-5 py-4 font-medium text-neutral-700 flex items-center">
                {row.item}
              </div>

              {/* Others */}
              <div className="px-5 py-4 border-l border-neutral-100 flex items-center gap-2 text-neutral-500">
                <X
                  size={16}
                  className="shrink-0 text-rose-400"
                  strokeWidth={2.5}
                />
                <span>{row.others}</span>
              </div>

              {/* Us */}
              <div className="px-5 py-4 border-l border-neutral-100 flex items-center gap-2 text-primary font-medium bg-primary/[0.03]">
                <Check
                  size={16}
                  className="shrink-0 text-accent"
                  strokeWidth={2.5}
                />
                <span>{row.us}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          {...fadeInCta}
          className={`mt-10 text-center ${fadeInCta.className}`}
        >
          <p className="text-neutral-500 text-sm mb-5">
            지금 바로 현장 방문 견적을 신청하시면{" "}
            <span className="font-semibold text-primary">24시간 내</span>에
            담당자가 연락드립니다.
          </p>
          <Link
            href="/support/inquiry"
            className="cta-shimmer inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03]"
          >
            <ArrowRight size={16} />
            무료 방문 견적 신청하기
          </Link>
        </div>
      </div>
    </section>
  );
}
