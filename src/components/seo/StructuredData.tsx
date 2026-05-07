/**
 * 메인 홈페이지 전용 WebPage 구조화 데이터
 *
 * LocalBusiness 스키마는 layout.tsx에서 전역 삽입되므로 여기서 중복 삽입하지 않음.
 * 이 컴포넌트는 홈페이지(WebPage) + BreadcrumbList 스키마만 담당.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hyundaiuni.kr";

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "현대유앤아이 | 지정폐기물 수거·운반업 전문",
  description:
    "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업. 폐유·폐산·폐알칼리·폐유기용제 등 전 품목 허가 처리.",
  inLanguage: "ko-KR",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#business` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: SITE_URL,
      },
    ],
  },
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
    />
  );
}
