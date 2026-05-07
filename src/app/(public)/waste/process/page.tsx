import type { Metadata } from "next";
import { ProcessClient } from "./ProcessClient";
import { ContentMeta } from "@/components/ui/ContentMeta";
import { AuthorityLinks } from "@/components/ui/AuthorityLinks";

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

        <AuthorityLinks className="mt-4" />
        <ContentMeta
          reviewDate="2026-05"
          legalBasis="폐기물관리법 제18조 · 시행령 제7조"
        />
      </div>
    </>
  );
}
