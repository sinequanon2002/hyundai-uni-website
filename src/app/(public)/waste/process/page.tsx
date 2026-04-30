"use client";

import React, { useState } from 'react';
import { PhoneCall, FileSignature, MonitorUp, Truck, Factory, BellRing, ChevronDown } from 'lucide-react';

const processSteps = [
  {
    step: 1,
    title: "문의 및 상담",
    icon: PhoneCall,
    description: "방문, 유선, 온라인 등 다양한 채널을 통해 폐기물 처리 관련 초기 상담을 진행합니다.",
    details: "고객사의 사업장 특성과 발생되는 폐기물의 종류, 예상 발생량을 파악하여 최적의 처리 방안을 1차적으로 안내해 드립니다."
  },
  {
    step: 2,
    title: "견적 및 계약",
    icon: FileSignature,
    description: "현장 실사를 통한 종합적인 분석 후 합리적인 단가를 산출하여 적법한 위·수탁 계약을 체결합니다.",
    details: "담당자가 직접 사업장을 방문하여 폐기물 보관 상태, 상차 여건 등을 확인하고, 법적 기준에 부합하는 투명한 계약서를 작성 및 교부합니다."
  },
  {
    step: 3,
    title: "전자인계서 작성",
    icon: MonitorUp,
    description: "폐기물 배출 전, 한국환경공단 올바로시스템에 접속하여 배출자 전자인계서를 사전에 작성합니다.",
    details: "올바로시스템을 통한 전자인계서(확정/예약) 작성은 법적 의무사항입니다. 시스템 사용이 익숙하지 않은 고객사를 위해 작성 가이드 및 행정 지원을 제공합니다."
  },
  {
    step: 4,
    title: "수거 및 운반",
    icon: Truck,
    description: "법정 기준을 완벽히 충족하는 전용 수거 차량과 전문 인력을 투입하여 안전하게 운반합니다.",
    details: "차량에 폐기물 종류별 명확한 표지판을 부착하고 결속을 단단하게 하여, 운행 중 낙하물이나 누출로 인한 2차 환경 오염을 철저하게 예방합니다."
  },
  {
    step: 5,
    title: "적정 처리",
    icon: Factory,
    description: "당사와 연계된 검증되고 신뢰할 수 있는 허가 처리업체(소각, 매립, 재활용 등)로 반입합니다.",
    details: "지정폐기물의 화학적, 물리적 특성에 맞는 최적화된 처분 시설에서 환경 관련 법령이 정한 규격과 기준에 따라 완벽하게 무해화 또는 재자원화합니다."
  },
  {
    step: 6,
    title: "처리결과 통보",
    icon: BellRing,
    description: "모든 적법한 처리가 완료되면, 올바로시스템을 통해 최종 처리 결과를 고객사에 통보합니다.",
    details: "계량 증명서, 수탁 처리 확인서 등 각종 증빙 서류를 제공하며, 행정 관청 신고 및 실적 보고 등에 필요한 데이터를 투명하게 지원합니다."
  }
];

export default function WasteProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">지정폐기물 처리절차</h2>
        <p className="text-lg text-gray-600">배출부터 최종 처리까지, 완벽한 적법 절차를 준수합니다.</p>
      </div>

      <div className="relative border-l-4 border-gray-200 ml-4 md:ml-12 pl-6 md:pl-16 space-y-12 pb-12">
        {processSteps.map((item) => {
          const isOpen = openStep === item.step;
          const Icon = item.icon;

          return (
            <div key={item.step} className="relative">
              {/* Step Number Badge */}
              <div className={`absolute -left-[56px] md:-left-[90px] top-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg md:text-xl border-4 border-gray-50 shadow-sm transition-colors duration-300 ${isOpen ? 'bg-primary text-white scale-110' : 'bg-white text-gray-400'}`}>
                {item.step}
              </div>

              {/* Main Card */}
              <div 
                className={`bg-white rounded-2xl shadow-sm border p-6 md:p-8 cursor-pointer transition-all duration-300 group ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50 hover:shadow-md'}`}
                onClick={() => setOpenStep(isOpen ? null : item.step)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 transition-colors ${isOpen ? 'text-primary' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className="text-gray-600 font-medium text-lg lg:pr-8">{item.description}</p>
                  </div>

                  <div className="hidden md:flex shrink-0">
                    <ChevronDown className={`w-8 h-8 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-gray-500'}`} />
                  </div>
                </div>

                {/* Details Panel */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100 mt-6 pt-6 border-t border-gray-100' : 'max-h-0 opacity-0 mt-0 pt-0 border-transparent'}`}>
                  <div className="bg-gray-50 rounded-xl p-5 md:p-6 text-gray-700 leading-relaxed border border-gray-100">
                    {item.details}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



