"use client";

import React, { useState } from 'react';
import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ALLBARO_SUBNAV_ITEMS = [
  { label: "올바로시스템이란", href: "/allbaro/about" },
  { label: "전자인계서 작성방법", href: "/allbaro/guide" }
];

const STEPS = [
  {
    title: "올바로시스템 접속 및 로그인",
    desc: "공동인증서 또는 아이디/비밀번호를 사용하여 올바로시스템(www.allbaro.or.kr)에 로그인합니다."
  },
  {
    title: "폐기물인계정보관리 메뉴 선택",
    desc: "상단 대메뉴에서 '전자인계서관리' > '폐기물인계정보관리'를 클릭합니다."
  },
  {
    title: "인계서 작성 화면 진입",
    desc: "배출자용 인계서 작성 버튼을 클릭하여 신규 작성 화면으로 이동합니다."
  },
  {
    title: "폐기물 정보 입력",
    desc: "배출하는 폐기물의 종류, 성상, 위탁량 등을 정확하게 입력합니다."
  },
  {
    title: "운반/처리업체 선택",
    desc: "계약된 수거·운반업체 및 최종 처리업체를 목록에서 조회하여 지정합니다."
  },
  {
    title: "운반 예정일 지정 및 전송",
    desc: "차량이 방문할 예정일을 달력에서 선택한 후 '저장 및 전송'을 완료합니다."
  },
  {
    title: "수거 완료 및 확인",
    desc: "운반자가 수거해 가면 상태가 변경되며, 이후 처리장 도착/처리완료 결과를 시스템에서 실시간으로 확인할 수 있습니다."
  }
];

const FAQS = [
  {
    q: "공동인증서가 없으면 어떻게 하나요?",
    a: "올바로시스템을 통한 전자인계서 확정 및 실적보고를 위해서는 범용 또는 관세청/환경부 용도의 사업자 범용 공동인증서가 필수입니다. 거래 은행이나 인증기관을 통해 발급받으셔야 합니다."
  },
  {
    q: "작성 중 오류가 발생했을 때는?",
    a: "아직 전송하지 않은 임시저장 상태라면 삭제 후 재작성이 가능합니다. 이미 전송을 완료하였으나 운반자가 인수하기 전이라면 '취소요청' 기능을 활용할 수 있습니다. 이미 운반이 시작된 후라면 수정이 제한적일 수 있으므로 관할 기관 문의가 필요합니다."
  },
  {
    q: "인계서 수정이 가능한가요?",
    a: "운반자가 폐기물을 인수하고 시스템상에서 '운반자인수' 처리를 하기 전까지는 배출자가 수정 및 취소할 수 있습니다. 단, 인수 이후에는 확정되므로 배출량 등의 수정은 한국환경공단에 별도 문의 및 사유서 제출이 필요할 수 있습니다."
  },
  {
    q: "처리결과 확인은 어디서 하나요?",
    a: "올바로시스템의 '전자인계서관리 > 인계정보조회' 메뉴에서 작성된 인계서별로 현재 운반 중인지, 처리 완료되었는지 상태를 실시간으로 조회 가능합니다."
  },
  {
    q: "실적보고는 어떻게 하나요?",
    a: "올바로시스템에 전자인계서를 누락 없이 작성하셨다면, 매년 초(보통 2월 말경까지) 전년도 폐기물 발생 및 처리 실적보고 기간에 시스템 연동을 통해 손쉽게 기초 데이터를 불러와 보고서를 제출할 수 있습니다."
  }
];

export default function AllbaroGuidePage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
      <PageBanner
        title="전자인계서 작성방법"
        subtitle="올바로시스템을 이용한 정확하고 안전한 인계서 작성 안내"
      />
      <SubNav items={ALLBARO_SUBNAV_ITEMS} />

      <div className="max-w-4xl mx-auto px-4 mt-12 md:mt-20 space-y-20">

        {/* Section A: 사전 준비사항 체크리스트 박스 */}
        <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            사전 준비사항 <span className="text-primary">Checklist</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "올바로시스템 회원가입 완료",
              "사업자 범용 공동인증서 준비",
              "당사와 위·수탁 계약 체결"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: 7단계 작성 절차 (세로 타임라인) */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">작성 절차 안내</h2>
            <p className="text-gray-600">순서대로 따라하시면 누구나 쉽게 전자인계서를 작성할 수 있습니다.</p>
          </div>

          <div className="relative">
            {/* 타임라인 세로 선 */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden md:block" />

            <div className="space-y-8">
              {STEPS.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-6 group">
                  {/* 번호 원형 */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-primary text-white text-lg font-bold shadow-md shrink-0 z-10 transition-transform group-hover:scale-110">
                    {idx + 1}
                  </div>
                  {/* 카드 */}
                  <div className="flex-1 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      STEP {idx + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-4">{step.desc}</p>
                    <div className="w-full aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm max-w-md">
                      스크린샷 예시
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section C: FAQ 아코디언 */}
        <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <p className="text-gray-600">올바로시스템 사용 시 배출자분들이 가장 많이 물어보시는 질문입니다.</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <FaqItem key={idx} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* Section D: 하단 CTA */}
        <section className="text-center py-16 px-6 bg-blue-50 rounded-3xl border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">작성이 어려우신가요?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            당사와 위·수탁 계약을 체결하신 경우, 처음 작성하실 때 원격 지원이나 방문을 통해 상세히 안내해 드립니다.
          </p>
          <Link
            href="/support/inquiry"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            저희가 도와드립니다 <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </div>
    </main>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <span className="font-semibold text-gray-900 text-lg flex items-start gap-4">
          <span className="text-primary font-bold">Q.</span>
          {q}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4", isOpen && "rotate-180")} />
      </button>
      <div
        className={cn(
          "px-6 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-9 text-gray-600 leading-relaxed border-t border-gray-50 pt-4 mt-2">
          {a}
        </div>
      </div>
    </div>
  );
}



