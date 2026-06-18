"use client";

import { Truck, FileCheck, ShieldCheck, Clock } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

const SERVICES = [
  {
    icon: Truck,
    title: "지정폐기물 수집·운반",
    description: "안전 기준을 준수한 전용 차량으로 신속하고 정확하게 운송합니다.",
  },
  {
    icon: FileCheck,
    title: "올바로시스템 연동",
    description: "실시간 전자인계서 작성으로 법적 처리 절차를 대행합니다.",
  },
  {
    icon: ShieldCheck,
    title: "적법 처리 대행",
    description: "관련 법규를 철저히 준수하여 투명한 처리 과정을 보장합니다.",
  },
  {
    icon: Clock,
    title: "24시간 대응",
    description: "긴급 상황 발생 시 언제든 대비할 수 있는 체계를 갖추고 있습니다.",
  },
];

export function ServicesSection() {
  const fadeInHeader = useFadeIn();

  return (
    <section id="services" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div {...fadeInHeader} className={`text-center mb-16 md:mb-20 ${fadeInHeader.className}`}>
          <span className="inline-flex items-center bg-cobalt-50 text-cobalt-700 border border-cobalt-100 rounded-pill px-3 py-1 text-xs font-semibold tracking-wide mb-4">
            주요 서비스
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900">
            전문성으로 완성하는 지정폐기물 관리
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {SERVICES.map((service, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const fadeCard = useFadeIn(0.1, index * 100);
            return (
              <div
                key={index}
                {...fadeCard}
                className={`group bg-white rounded-2xl p-6 sm:p-8 shadow-ds-md border border-slate-200 hover:shadow-ds-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden ${fadeCard.className}`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cobalt-600 to-mint-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cobalt-50 border border-cobalt-100 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-cobalt-600 group-hover:border-cobalt-600 group-hover:text-white transition-colors duration-300 text-cobalt-600">
                  <service.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-navy-900">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
