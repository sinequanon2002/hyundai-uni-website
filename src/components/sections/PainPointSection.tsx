"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/useFadeIn";
import { ClipboardList, BookOpen, ShieldCheck, FileCheck, AlertCircle, ArrowRight } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: ClipboardList,
    title: "올바로시스템 전자인계서, 익숙하지 않으신가요?",
    desc: "법정 전자 인계서 작성 절차가 복잡하게 느껴지신다면, 저희가 처음부터 끝까지 함께합니다.",
  },
  {
    icon: BookOpen,
    title: "폐기물 종류마다 다른 보관 기준, 다 파악하기 어렵죠?",
    desc: "품목별로 보관 용기·기간·장소 기준이 다릅니다. 현장 방문 시 무료로 확인해 드립니다.",
  },
  {
    icon: ShieldCheck,
    title: "위탁업체 자격 요건, 꼼꼼히 확인하고 계신가요?",
    desc: "허가받지 않은 업체에 위탁하면 배출자도 책임을 집니다. 모든 허가 서류를 투명하게 제공합니다.",
  },
  {
    icon: FileCheck,
    title: "처리 이력과 증빙 서류, 체계적으로 관리되고 있나요?",
    desc: "환경부 점검이나 감사 시 처리 이력 서류가 필요합니다. 수거 후 처리 확인서를 즉시 제공합니다.",
  },
  {
    icon: AlertCircle,
    title: "정기 점검·감사 시 3년치 이력, 바로 제출 가능한가요?",
    desc: "환경부 지도·점검이나 ISO 감사에서 즉시 제출이 필요합니다. 연도별 실적 자료를 언제든 재발급합니다.",
  },
];

export function PainPointSection() {
  const fadeInHeader = useFadeIn();
  const fadeInGrid = useFadeIn(0.1, 100);
  const fadeInCta = useFadeIn(0.1, 200);

  return (
    <section className="py-14 md:py-20 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-8">
        {/* 헤더 */}
        <div {...fadeInHeader} className={`text-center mb-10 ${fadeInHeader.className}`}>
          <h3 className="text-xs font-bold text-accent tracking-widest uppercase mb-2">
            담당자 주요 고민
          </h3>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-3">
            지정폐기물 관리, 혼자 감당하기엔<br className="hidden md:inline" /> 놓치는 부분이 생깁니다
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
            복잡한 규정과 서류 절차로 어려움을 겪는 담당자분들을 위해 현대유앤아이가 돕습니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div {...fadeInGrid} className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto ${fadeInGrid.className}`}>
          {PAIN_POINTS.map((point, i) => {
            const Icon = point.icon;
            const isLast = i === PAIN_POINTS.length - 1;
            const isOdd = PAIN_POINTS.length % 2 !== 0;
            return (
              <div
                key={i}
                className={`flex gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 ${isLast && isOdd ? "md:col-span-2 md:max-w-[calc(50%-8px)] md:mx-auto" : ""}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 mb-1 leading-snug">{point.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{point.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div {...fadeInCta} className={`mt-8 text-center ${fadeInCta.className}`}>
          <p className="text-neutral-600 text-sm mb-4">
            전자인계서 대행부터 처리 이력 관리까지 —{" "}
            <span className="font-semibold text-primary">현대유앤아이</span>가 모든 과정을 함께합니다.
          </p>
          <Link
            href="/support/inquiry"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <ArrowRight size={15} />
            견적 문의
          </Link>
        </div>
      </div>
    </section>
  );
}
