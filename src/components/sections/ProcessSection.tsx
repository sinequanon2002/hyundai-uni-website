"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { PhoneCall, FileText, Edit3, Truck, Recycle, CheckCircle2 } from "lucide-react";

const PROCESSES = [
  { icon: PhoneCall, title: "문의 및 상담" },
  { icon: FileText, title: "견적 및 계약" },
  { icon: Edit3, title: "전자인계서 작성" },
  { icon: Truck, title: "수거 및 운반" },
  { icon: Recycle, title: "적정 처리" },
  { icon: CheckCircle2, title: "결과 통보" },
];

export function ProcessSection() {
  const fadeInHeader = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div {...fadeInHeader} className={`text-center mb-16 md:mb-24 ${fadeInHeader.className}`}>
          <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
            Process
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            체계적인 6단계 처리 프로세스
          </h2>
        </div>

        <div className="relative">
          {/* PC Line */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-neutral-200 border-t-2 border-dashed border-neutral-300" />
          
          {/* Mobile Line */}
          <div className="block lg:hidden absolute top-[10%] bottom-[10%] left-[48px] w-0.5 bg-neutral-200 border-l-2 border-dashed border-neutral-300" />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {PROCESSES.map((process, index) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fadeItem = useFadeIn(0.1, index * 100);
              return (
                <div
                  key={index}
                  {...fadeItem}
                  className={`flex flex-row lg:flex-col items-center gap-6 lg:gap-8 ${fadeItem.className}`}
                >
                  <div className="w-24 h-24 shrink-0 rounded-full bg-white border-4 border-neutral-100 shadow-md flex items-center justify-center text-secondary relative">
                    <process.icon size={36} strokeWidth={1.5} />
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold font-[family-name:var(--font-geist-mono)]">
                      {index + 1}
                    </div>
                  </div>
                  <div className="text-left lg:text-center">
                    <p className="text-sm font-bold text-primary mb-1">
                      STEP 0{index + 1}
                    </p>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {process.title}
                    </h3>
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
