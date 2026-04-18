"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const REASONS = [
  {
    num: "01",
    title: "법적 허가 완비",
    description: "환경청의 정식 허가를 받은 지정폐기물 수집·운반업체입니다.",
  },
  {
    num: "02",
    title: "전문 장비 보유",
    description: "다양한 성상의 폐기물 처리를 위한 전문 운반 차량을 완비했습니다.",
  },
  {
    num: "03",
    title: "숙련된 전문인력",
    description: "다년간의 현장 경험과 전문 교육을 이수한 전문가가 투입됩니다.",
  },
  {
    num: "04",
    title: "투명한 처리이력",
    description: "올바로시스템(Allbaro)을 통한 신속하고 투명한 실시간 내역 관리를 제공합니다.",
  },
];

export function WhyUsSection() {
  const fadeInHeader = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-[#F5F8FB]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div {...fadeInHeader} className={`lg:w-1/3 flex flex-col justify-center ${fadeInHeader.className}`}>
            <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
              Why Choose Us
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-6">
              왜 저희를
              <br />
              선택해야 할까요?
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {REASONS.map((reason, index) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fadeCard = useFadeIn(0.1, index * 100);
              return (
                <div key={index} {...fadeCard} className={`${fadeCard.className}`}>
                  <div className="text-5xl md:text-6xl font-black text-primary/10 mb-4 font-[family-name:var(--font-geist-mono)]">
                    {reason.num}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900">
                    {reason.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
