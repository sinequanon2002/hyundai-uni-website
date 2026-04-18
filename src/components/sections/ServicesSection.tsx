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
          <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
            Our Services
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            전문성으로 완성하는 지정폐기물 관리
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const fadeCard = useFadeIn(0.1, index * 100);
            return (
              <div
                key={index}
                {...fadeCard}
                className={`group bg-white rounded-2xl p-8 shadow-md border border-neutral-100 hover:shadow-xl hover:-translate-y-4 transition-all duration-300 ${fadeCard.className}`}
              >
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                  <service.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-neutral-900">
                  {service.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
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
