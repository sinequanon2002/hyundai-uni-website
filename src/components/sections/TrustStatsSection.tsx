"use client";

import { useRef, useState, useEffect } from "react";
import { useCounter } from "@/hooks/useCounter";

const STATS = [
  { end: 300,  suffix: "+",  label: "누적 거래처",    sub: "대구·경북 전 지역" },
  { end: 5000, suffix: "t+", label: "연간 처리량",    sub: "지정폐기물 전 품목" },
  { end: 998,  suffix: "",   label: "고객 재계약률",  sub: "높은 서비스 만족도", format: (v: number) => `${(v / 10).toFixed(1)}%` },
  { end: 2,    suffix: "일", label: "영업일 내 견적 회신", sub: "정확한 견적서 제공" },
];

function StatItem({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const count = useCounter(stat.end, 1400, active);
  const display = stat.format
    ? stat.format(count)
    : `${count.toLocaleString()}${stat.suffix}`;

  return (
    <div className="text-center px-2 sm:px-4 md:px-8">
      <div
        className={`text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums font-mono transition-all duration-700 ${
          active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {display}
      </div>
      <div className="text-sm sm:text-[15px] font-semibold text-white/85 mb-0.5">{stat.label}</div>
      <div className="text-xs text-white/50">{stat.sub}</div>
    </div>
  );
}

export function TrustStatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <section ref={ref} className="bg-navy-900 py-10 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x md:divide-white/10">
          {STATS.map((stat, i) => (
            <StatItem key={i} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
