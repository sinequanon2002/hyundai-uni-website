import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { COMPANY } from "@/lib/constants";
import { ChevronDown, ArrowRight, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description:
    "지정폐기물 수거·운반 관련 자주 묻는 질문 — 견적 절차, 처리 가능 품목, 비용 산정 기준, 올바로시스템 전자인계서, 처리 증빙 서류, 서비스 지역 안내.",
  alternates: { canonical: "/support/faq" },
};

interface FaqItem {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "견적 문의 후 얼마나 빨리 연락을 받을 수 있나요?",
    a: "영업일 기준 24시간 내에 담당자가 직접 연락드립니다. 정확한 견적이 필요한 경우 일정을 협의해 현장 방문 견적을 진행하며, 방문 견적은 무료입니다.",
  },
  {
    q: "어떤 폐기물을 처리할 수 있나요?",
    a: "폐산(폐황산·폐불산·폐질산 등), 폐알칼리, 폐유독물, 폐윤활유, 폐페인트, 폐시약, 폐유해화학물질 등 지정폐기물 수집·운반을 전문으로 합니다. 목록에 없는 품목도 문의 주시면 처리 가능 여부를 확인해 드립니다.",
    link: { label: "수거 대상 폐기물 상세 보기", href: "/waste/types" },
  },
  {
    q: "소량(드럼 1~2통)도 수거 가능한가요?",
    a: "소량 배출도 상담 가능합니다. 수거 일정과 조건은 품목·수량·지역에 따라 달라지므로 먼저 문의해 주세요. 소량을 주기적으로 배출하는 사업장이라면 정기 수거 계약으로 더 효율적으로 처리할 수 있습니다.",
  },
  {
    q: "비용은 어떻게 산정되나요?",
    a: "폐기물의 품목·성상, 수량과 보관 용기, 보관 상태, 운반 거리, 수거 빈도(1회성/정기)에 따라 산정됩니다. 동일 품목이라도 현장 조건에 따라 달라질 수 있어 무료 방문 견적으로 정확한 금액을 안내해 드립니다.",
    link: { label: "비용 결정 요인 자세히 보기", href: "/waste/pricing" },
  },
  {
    q: "올바로시스템 전자인계서는 누가 작성하나요?",
    a: "당사가 전담 대행합니다. 배출자 인계 확인 등 배출 사업장에서 필요한 절차는 담당자가 처음부터 끝까지 안내해 드리므로, 올바로시스템이 처음이어도 걱정하지 않으셔도 됩니다.",
    link: { label: "올바로시스템 안내 보기", href: "/allbaro/about" },
  },
  {
    q: "처리 후 어떤 증빙 서류를 받을 수 있나요?",
    a: "수거 완료 후 전자인계서 사본과 처리 확인 서류를 제공해 드립니다. 환경부 지도·점검이나 ISO 감사 등에 대비한 연도별 실적 자료도 필요 시 재발급해 드립니다.",
  },
  {
    q: "서비스 가능 지역은 어디인가요?",
    a: "대구·경북 전 지역을 전담 대응하며, 그 외 지역도 문의 주시면 일정을 협의해 서비스 가능 여부를 안내해 드립니다.",
  },
  {
    q: "위탁 계약 시 어떤 서류가 필요한가요?",
    a: "일반적으로 사업자등록증, 폐기물 성상 정보(MSDS 등), 배출자 신고 관련 정보가 필요합니다. 처음 위탁하는 사업장도 필요한 서류와 절차를 단계별로 안내해 드립니다.",
  },
  {
    q: "폐기물 보관 기준도 확인해 주나요?",
    a: "네. 방문 견적 시 품목별 보관 용기·보관 기간·보관 장소 기준을 무료로 점검해 드립니다. 보관 기준 위반은 배출자에게 과태료가 부과될 수 있는 부분이므로 함께 확인하는 것을 권장합니다.",
    link: { label: "보관·법적 의무 안내 보기", href: "/waste/storage" },
  },
  {
    q: "허가받은 업체인지 어떻게 확인할 수 있나요?",
    a: `당사는 지정폐기물 수집·운반업 정식 허가 업체(${COMPANY.licenseNumber})입니다. 계약 전 허가증 사본을 투명하게 제공해 드립니다. 미허가 업체에 위탁하면 배출자도 법적 책임을 질 수 있으므로 반드시 허가 여부를 확인하세요.`,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageBanner
        title="자주 묻는 질문"
        subtitle="견적, 처리 절차, 서류에 대해 궁금하신 점을 확인하세요"
      />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm open:shadow-md open:border-cobalt-600/20 transition-shadow"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-[15px] font-bold text-navy-900 leading-snug">
                    <span className="text-cobalt-600 mr-2">Q.</span>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-slate-200">
                  <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-cobalt-600 hover:underline underline-offset-4"
                    >
                      {item.link.label}
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>

          {/* 하단 CTA */}
          <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-center">
            <h2 className="text-lg md:text-xl font-bold text-navy-900 mb-2">
              원하는 답변을 찾지 못하셨나요?
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              담당자가 직접 확인하고 답변드립니다. 부담 없이 문의해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/support/inquiry"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-mint-500 text-white text-sm font-bold rounded-lg hover:bg-mint-600 transition-colors shadow-md shadow-mint-500/20"
              >
                <ArrowRight size={15} />
                견적 문의하기
              </Link>
              <a
                href={`tel:${COMPANY.tel}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-navy-700 text-sm font-semibold rounded-lg hover:border-cobalt-600 hover:text-cobalt-600 transition-colors"
              >
                <Phone size={15} />
                {COMPANY.tel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
