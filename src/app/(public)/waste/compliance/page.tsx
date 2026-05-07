import type { Metadata } from "next";
import { ComplianceClient } from "./ComplianceClient";

export const metadata: Metadata = {
  title: "지정폐기물 자가점검·벌칙 | 현대유앤아이",
  description:
    "지정폐기물 배출자 필수 자가점검 체크리스트와 폐기물관리법 위반 시 벌칙 안내. 무단투기 7년 이하 징역, 전자인계서 미작성 2년 이하 징역 등 주요 처벌 기준을 확인하세요.",
};

// FAQPage 구조화 데이터 — Google 리치 스니펫(FAQ 패널) 노출용
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "지정폐기물을 무단으로 투기·매립·소각하면 어떤 처벌을 받나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "「폐기물관리법」 제63조에 따라 7년 이하 징역 또는 7천만원 이하 벌금에 처할 수 있습니다. 투기·매립·소각은 가장 중한 위반 행위로 형사처벌 대상입니다.",
      },
    },
    {
      "@type": "Question",
      name: "무허가 업자에게 지정폐기물 처리를 위탁하면 어떤 처벌이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "「폐기물관리법」 제64조에 따라 5년 이하 징역 또는 5천만원 이하 벌금에 처할 수 있습니다. 반드시 환경부 허가를 받은 수집·운반·처리 업체에 위탁해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 전자인계서(올바로시스템)를 작성하지 않으면 어떤 처벌이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "전자인계서 미작성 또는 허위 작성 시 2년 이하 징역 또는 2천만원 이하 벌금에 처할 수 있습니다. 지정폐기물 배출 전 올바로시스템에 인계 정보를 반드시 등록해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 보관기간은 얼마나 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "일반 지정폐기물은 45일, 의료폐기물은 종류에 따라 7~60일이 법정 보관기간입니다. 보관기간을 초과하면 1천만원 이하 과태료 및 행정처분을 받을 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 관리대장을 작성하지 않으면 과태료가 얼마인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "폐기물 관리대장 미작성 또는 법정 보존기간(3년) 미준수 시 300만원 이하 과태료가 부과됩니다. 배출부터 처리 완결까지 모든 이력을 기록·보관해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 배출자가 지켜야 할 핵심 의무 사항은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "① 올바로시스템 사전 등록, ② 허가 업체와 계약, ③ 법정 보관시설 기준 준수, ④ 보관기간(45일 이내) 준수, ⑤ 배출 전 전자인계서 작성, ⑥ 성상별 분리 보관, ⑦ 관리대장 3년 보존의 7가지입니다.",
      },
    },
  ],
};

export default function WasteCompliancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ComplianceClient />
    </>
  );
}
