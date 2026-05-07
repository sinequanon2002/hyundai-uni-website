import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceClient } from "./ComplianceClient";
import { ContentMeta } from "@/components/ui/ContentMeta";

export const metadata: Metadata = {
  title: "지정폐기물 자가점검·벌칙 완전 가이드 | 현대유앤아이",
  description:
    "지정폐기물 무단투기 7년 이하 징역, 전자인계서 미작성 2년 이하 징역, 보관기간 초과 1천만원 이하 과태료 등 폐기물관리법 위반 처벌 기준과 배출자 필수 자가점검 7항목을 안내합니다.",
};

// FAQPage 구조화 데이터 — 아래 visible HTML Q&A와 반드시 일치해야 PAA 노출
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "지정폐기물을 무단으로 투기·매립·소각하면 벌금이 얼마인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "「폐기물관리법」 제63조에 따라 7년 이하 징역 또는 7천만원 이하 벌금에 처할 수 있습니다. 무단 투기·매립·소각은 지정폐기물 위반 행위 중 가장 중한 형사처벌 대상입니다.",
      },
    },
    {
      "@type": "Question",
      name: "무허가 업자에게 지정폐기물 처리를 위탁하면 어떤 처벌이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "「폐기물관리법」 제64조에 따라 5년 이하 징역 또는 5천만원 이하 벌금에 처할 수 있습니다. 지정폐기물은 반드시 환경부 허가를 받은 수집·운반·처리 업체에 위탁해야 합니다. 허가 여부는 올바로시스템(allbaro.or.kr)에서 확인할 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 전자인계서(올바로시스템)를 작성하지 않으면 어떻게 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "전자인계서 미작성 또는 허위 작성 시 2년 이하 징역 또는 2천만원 이하 벌금에 처할 수 있습니다. 지정폐기물 배출 전 한국환경공단 올바로시스템에 인계 정보를 사전 등록하는 것은 법적 의무사항입니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 법정 보관기간은 며칠인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "일반 지정폐기물은 발생일로부터 45일 이내에 처리해야 합니다. 의료폐기물은 종류에 따라 다르며, 격리의료폐기물 7일, 위해의료폐기물(조직물류) 15일, 일반의료폐기물 30일, 냉동 보관 시 최대 60일입니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 보관기간을 초과하면 과태료가 얼마인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "보관기간 위반 및 보관기준 미준수 시 1천만원 이하 과태료와 개선명령·영업정지 등 행정처분을 받을 수 있습니다. 「폐기물관리법 시행령」 별표5 기준이 적용됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 관리대장 보존기간은 몇 년인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "폐기물 관리대장은 최종 기재일로부터 3년간 보존해야 합니다. 미작성 또는 보존기간 미준수 시 300만원 이하 과태료가 부과됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "지정폐기물 배출자가 반드시 지켜야 할 의무 사항은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "① 올바로시스템 기초정보 사전 등록, ② 허가 업체와 위·수탁 계약 체결, ③ 법정 보관시설 기준 완비, ④ 보관기간(45일) 준수, ⑤ 배출 전 전자인계서 작성, ⑥ 성상별 분리 보관, ⑦ 관리대장 3년 보존 — 총 7가지입니다.",
      },
    },
  ],
};

// FAQ 데이터 (schema와 동일 내용 — visible HTML로 렌더링)
const faqItems = [
  {
    q: "지정폐기물을 무단으로 투기·매립·소각하면 벌금이 얼마인가요?",
    a: "「폐기물관리법」 제63조에 따라 7년 이하 징역 또는 7천만원 이하 벌금에 처할 수 있습니다. 무단 투기·매립·소각은 지정폐기물 위반 행위 중 가장 중한 형사처벌 대상입니다.",
    badge: "형사처벌",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    q: "무허가 업자에게 지정폐기물 처리를 위탁하면 어떤 처벌이 있나요?",
    a: "「폐기물관리법」 제64조에 따라 5년 이하 징역 또는 5천만원 이하 벌금에 처할 수 있습니다. 지정폐기물은 반드시 환경부 허가를 받은 수집·운반·처리 업체에 위탁해야 합니다. 허가 여부는 올바로시스템(allbaro.or.kr)에서 확인할 수 있습니다.",
    badge: "형사처벌",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    q: "지정폐기물 전자인계서(올바로시스템)를 작성하지 않으면 어떻게 되나요?",
    a: "전자인계서 미작성 또는 허위 작성 시 2년 이하 징역 또는 2천만원 이하 벌금에 처할 수 있습니다. 지정폐기물 배출 전 한국환경공단 올바로시스템에 인계 정보를 사전 등록하는 것은 법적 의무사항입니다.",
    badge: "형사처벌",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    q: "지정폐기물 법정 보관기간은 며칠인가요?",
    a: "일반 지정폐기물은 발생일로부터 45일 이내에 처리해야 합니다. 의료폐기물은 종류에 따라 다르며, 격리의료폐기물 7일, 위해의료폐기물(조직물류) 15일, 일반의료폐기물 30일, 냉동 보관 시 최대 60일입니다.",
    badge: "법정 기준",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    q: "지정폐기물 보관기간을 초과하면 과태료가 얼마인가요?",
    a: "보관기간 위반 및 보관기준 미준수 시 1천만원 이하 과태료와 개선명령·영업정지 등 행정처분을 받을 수 있습니다. 「폐기물관리법 시행령」 별표5 기준이 적용됩니다.",
    badge: "과태료",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    q: "지정폐기물 관리대장 보존기간은 몇 년인가요?",
    a: "폐기물 관리대장은 최종 기재일로부터 3년간 보존해야 합니다. 미작성 또는 보존기간 미준수 시 300만원 이하 과태료가 부과됩니다.",
    badge: "과태료",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    q: "지정폐기물 배출자가 반드시 지켜야 할 의무 사항은 무엇인가요?",
    a: "① 올바로시스템 기초정보 사전 등록, ② 허가 업체와 위·수탁 계약 체결, ③ 법정 보관시설 기준 완비, ④ 보관기간(45일) 준수, ⑤ 배출 전 전자인계서 작성, ⑥ 성상별 분리 보관, ⑦ 관리대장 3년 보존 — 총 7가지입니다.",
    badge: "배출자 의무",
    badgeColor: "bg-green-100 text-green-700",
  },
];

export default function WasteCompliancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">

        {/* ── 페이지 헤더 ── */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">
            지정폐기물 자가점검 &amp; 벌칙 안내
          </h1>
          <p className="text-lg text-gray-600">
            위반 시 강력한 처벌이 따르므로 주기적인 점검이 필수적입니다.
          </p>
        </div>

        {/* ══════════════════════════════════════════
            FAQ 섹션 — 서버 렌더링 (PAA·Featured Snippet 타겟)
            <details>/<summary> 네이티브 HTML: JS 없이 동작, Google이 닫힌 상태도 크롤링
        ════════════════════════════════════════════ */}
        <section aria-label="자주 묻는 질문" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-neutral-900">자주 묻는 질문 (FAQ)</h2>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
              「폐기물관리법」 기준
            </span>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/40 transition-colors"
              >
                <summary className="flex items-start justify-between gap-4 p-5 md:p-6 cursor-pointer list-none select-none">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h3 className="text-base font-semibold text-neutral-900 leading-snug">
                      {item.q}
                    </h3>
                  </div>
                  {/* 화살표 아이콘 — CSS group-open으로 회전 */}
                  <svg
                    className="shrink-0 w-5 h-5 text-neutral-400 mt-0.5 transition-transform duration-200 group-open:rotate-180"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <div className="px-5 md:px-6 pb-5 pt-0">
                  <div className="border-t border-neutral-100 pt-4">
                    <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
                      {item.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* 법적 면책 안내 */}
          <p className="mt-4 text-xs text-neutral-400 leading-relaxed px-1">
            ※ 위 내용은 「폐기물관리법」 기준을 요약한 것으로, 실제 양형·과태료 금액은 위반 요건 및 행정기관 판단에 따라 다를 수 있습니다.
            법적 구속력을 갖는 유권해석의 근거로 사용할 수 없습니다.
          </p>
        </section>

        {/* ── 견적 문의 CTA (FAQ와 도구 사이) ── */}
        <div className="mb-12 bg-primary/5 rounded-2xl border border-primary/15 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-neutral-900 mb-1">지정폐기물 처리 업체 선정이 고민이신가요?</p>
            <p className="text-sm text-neutral-500">환경부 허가 업체 현대유앤아이가 올바로시스템 인계까지 책임집니다.</p>
          </div>
          <Link
            href="/support/inquiry"
            className="shrink-0 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            무료 견적 문의
          </Link>
        </div>

        {/* ══════════════════════════════════════════
            인터랙티브 도구 — 자가점검 체크리스트 + 벌칙 테이블
        ════════════════════════════════════════════ */}
        <section aria-label="자가점검 체크리스트 및 벌칙 조회">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">자가점검 체크리스트 &amp; 벌칙 조회</h2>
            <p className="text-sm text-neutral-500 mt-1">직접 체크해보고 법규 준수 여부를 확인하세요.</p>
          </div>
          <ComplianceClient />
        </section>

        <ContentMeta
          reviewDate="2026-05"
          legalBasis="폐기물관리법 제63조·제64조·제68조 · 시행령 별표5"
        />
      </div>
    </>
  );
}
