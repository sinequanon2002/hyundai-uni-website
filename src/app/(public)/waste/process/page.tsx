import type { Metadata } from "next";
import Link from "next/link";
import { ProcessClient } from "./ProcessClient";
import { ContentMeta } from "@/components/ui/ContentMeta";
import { AuthorityLinks } from "@/components/ui/AuthorityLinks";
import { Monitor, RefreshCw, FileText, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "지정폐기물 처리절차 6단계 | 현대유앤아이",
  description:
    "지정폐기물 처리 절차 6단계: 상담 → 견적·계약 → 전자인계서 작성(올바로시스템) → 수거·운반 → 적정 처리 → 결과 통보. 현대유앤아이가 법적 절차를 완벽하게 이행합니다.",
};

// HowTo 구조화 데이터 — AI가 단계별로 인용할 수 있도록 구조화
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "지정폐기물 수거·운반 처리 절차",
  description:
    "지정폐기물 배출자가 알아야 할 6단계 적법 처리 절차. 올바로시스템 전자인계서 작성부터 최종 처리 결과 통보까지.",
  totalTime: "P1D",
  supply: [
    { "@type": "HowToSupply", name: "올바로시스템 계정 (한국환경공단)" },
    { "@type": "HowToSupply", name: "사업자등록증 및 폐기물 발생 현황 자료" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "문의 및 상담",
      text: "방문·유선·온라인을 통해 발생 폐기물의 종류·수량을 상담하고 처리 방안을 안내받습니다.",
      url: "/waste/process#step-1",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "견적 및 위·수탁 계약 체결",
      text: "담당자 현장 방문 후 보관 상태·상차 여건 확인, 법적 기준에 부합하는 위·수탁 계약서를 작성합니다.",
      url: "/waste/process#step-2",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "전자인계서 작성 (올바로시스템)",
      text: "폐기물 배출 전 한국환경공단 올바로시스템에서 배출자 전자인계서(확정 또는 예약)를 사전 작성합니다. 이는 법적 의무사항입니다.",
      url: "/waste/process#step-3",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "허가 차량으로 수거·운반",
      text: "환경부 허가를 받은 전용 수거 차량과 전문 인력이 지정폐기물을 안전하게 수거·운반합니다.",
      url: "/waste/process#step-4",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "공인 처리시설 인계·적정 처리",
      text: "환경부 허가 처리업체(소각·매립·재활용 시설)에 인계하여 법적 기준에 따라 무해화 또는 재자원화합니다.",
      url: "/waste/process#step-5",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "처리 결과 통보 및 증빙 서류 제공",
      text: "올바로시스템을 통해 최종 처리 결과를 통보하고, 계량 증명서·수탁 처리 확인서 등 증빙 서류를 제공합니다.",
      url: "/waste/process#step-6",
    },
  ],
};

export default function WasteProcessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">지정폐기물 처리절차</h2>
          <p className="text-lg text-gray-600">배출부터 최종 처리까지, 완벽한 적법 절차를 준수합니다.</p>
        </div>

        <ProcessClient />

        {/* ── 올바로시스템 소개 ── */}
        <div className="mt-16 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="bg-secondary px-8 py-6">
            <span className="text-xs font-bold text-white/70 tracking-widest uppercase block mb-1">3단계 필수 도구</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">올바로시스템이란?</h2>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              한국환경공단이 운영하는 지정폐기물 전자 인계·관리 시스템으로, 배출부터 운반·처리까지 전 과정을 전산으로 추적합니다.
              지정폐기물 배출 전 <strong>전자인계서 작성은 법적 의무</strong>이며, 미작성 시 과태료 처분을 받습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Monitor,    label: "전자 인계서", desc: "종이 서류 없이 온라인으로 작성·제출" },
                { icon: RefreshCw,  label: "실시간 추적", desc: "배출→운반→처리 전 과정 현황 확인" },
                { icon: FileText,   label: "법적 증빙", desc: "처리 완료 증빙서류 자동 보관" },
                { icon: CheckCircle,label: "처리 결과", desc: "최종 처리 결과 통보 및 이력 관리" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-secondary/5 border border-secondary/15 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-xs font-bold text-neutral-800 mb-0.5">{label}</p>
                  <p className="text-[11px] text-neutral-500 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/support/blog?category=올바로시스템"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline underline-offset-4"
            >
              올바로시스템 작성 가이드 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <AuthorityLinks className="mt-4" />
        <ContentMeta
          reviewDate="2026-05"
          legalBasis="폐기물관리법 제18조 · 시행령 제7조"
        />
      </div>
    </>
  );
}
