"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const STATS = [
  { value: "300+",    label: "누적 거래처",   sub: "대구·경북 전 지역" },
  { value: "5,000t+", label: "연간 처리량",   sub: "지정폐기물 전 품목" },
  { value: "99.8%",   label: "고객 재계약률", sub: "높은 서비스 만족도" },
  { value: "24h",     label: "견적 응답시간", sub: "신속 현장 방문 견적" },
];

export function TrustStatsSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="bg-primary py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div
          {...fadeIn}
          className={`grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x md:divide-white/15 ${fadeIn.className}`}
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center px-4 md:px-8">
              <div className="text-3xl md:text-4xl font-black text-white mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-white/85 mb-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-white/50">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
