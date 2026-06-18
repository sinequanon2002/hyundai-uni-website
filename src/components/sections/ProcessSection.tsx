"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { PhoneCall, FileText, Edit3, Truck, Recycle, CheckCircle2 } from "lucide-react";

const PROCESSES = [
  { icon: PhoneCall,     title: "문의 및 상담" },
  { icon: FileText,      title: "견적 및 계약" },
  { icon: Edit3,         title: "전자인계서 작성" },
  { icon: Truck,         title: "수거 및 운반" },
  { icon: Recycle,       title: "적정 처리" },
  { icon: CheckCircle2,  title: "결과 통보" },
];

export function ProcessSection() {
  const fadeInHeader = useFadeIn();
  const fadeInSteps = useFadeIn(0.08, 100);

  return (
    <section className="py-14 md:py-20 bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div {...fadeInHeader} className={`text-center mb-12 ${fadeInHeader.className}`}>
          <h3 className="text-xs font-bold text-cobalt-600 tracking-widest uppercase mb-2">처리 절차</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900">체계적인 6단계 처리 프로세스</h2>
        </div>

        <div {...fadeInSteps} className={`relative ${fadeInSteps.className}`}>
          {/* PC 연결선 */}
          <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] border-t-2 border-dashed border-neutral-300" />
          {/* 모바일 연결선 */}
          <div className="block lg:hidden absolute top-[10%] bottom-[10%] left-[35px] border-l-2 border-dashed border-neutral-300" />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-3 relative z-10">
            {PROCESSES.map((process, index) => {
              const Icon = process.icon;
              return (
                <div
                  key={index}
                  className="flex flex-row lg:flex-col items-center gap-4 lg:gap-5"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="w-[72px] h-[72px] shrink-0 rounded-full bg-cobalt-50 border-4 border-cobalt-100 shadow-ds-md flex items-center justify-center text-cobalt-600 relative">
                    <Icon size={28} strokeWidth={1.5} />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-mint-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold font-mono">
                      {index + 1}
                    </div>
                  </div>
                  <div className="text-left lg:text-center">
                    <p className="text-xs font-bold text-cobalt-600 mb-0.5">{index + 1}단계</p>
                    <h3 className="text-sm font-bold text-navy-900">{process.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
