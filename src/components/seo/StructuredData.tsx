import Script from 'next/script';

export function StructuredData() {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "현대유앤아이환경",
    "description": "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다.",
    "telephone": "02-1234-5678", // TODO: 실제 전화번호
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "TODO_STREET_ADDRESS",
      "addressLocality": "화성시",
      "addressRegion": "경기도",
      "postalCode": "12345",
      "addressCountry": "KR"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "areaServed": ["서울", "경기", "인천", "충청"],
    "url": "https://[도메인]", // TODO
    "image": "https://[도메인]/images/og-image.jpg" // TODO
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
    />
  );
}
