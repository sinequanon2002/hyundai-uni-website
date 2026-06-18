import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@/components/analytics/Analytics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hyundaiuni.kr";

// LocalBusiness + Organization 구조화 데이터 — AI 엔진에 사업자 정보를 명확히 전달
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "EnvironmentalBusiness"],
      "@id": `${SITE_URL}/#business`,
      name: "주식회사 현대유앤아이",
      alternateName: "현대유앤아이",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      image: `${SITE_URL}/images/og-image.jpg`,
      description:
        "지정폐기물 수거·운반업 전문. 폐유·폐산·폐알칼리·폐유기용제·폐석면 등 지정폐기물 처리. 경상북도·대구 기반 전국 서비스.",
      telephone: "010-9084-9480",
      email: "hduni3973@naver.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "하양읍 하양로 34, 2층 비-04호",
        addressLocality: "경산시",
        addressRegion: "경상북도",
        postalCode: "38540",
        addressCountry: "KR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.9259,
        longitude: 128.8223,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      areaServed: {
        "@type": "Country",
        name: "대한민국",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "지정폐기물 수거·운반 서비스",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "폐유 수거·운반" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "폐산·폐알칼리 수거·운반" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "폐유기용제 수거·운반" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "폐석면 수거·운반" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "의료폐기물 수거·운반" } },
        ],
      },
      foundingDate: "2024-02-14",
      legalName: "주식회사 현대유앤아이",
      taxID: "857-87-03200",
      sameAs: [SITE_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "현대유앤아이",
      publisher: { "@id": `${SITE_URL}/#business` },
      inLanguage: "ko-KR",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | 현대유앤아이",
    default: "현대유앤아이 | 지정폐기물 수거·운반업 전문",
  },
  description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다. 폐산, 폐유, 폐알칼리 등 안전한 처리 보장.",
  keywords: [
    "지정폐기물", "지정폐기물 수거", "지정폐기물 운반",
    "폐유 수거", "폐산 처리", "폐알칼리", "폐유기용제",
    "올바로시스템", "사업장폐기물", "폐기물처리업체",
    "대구 지정폐기물", "경북 지정폐기물", "경산 폐기물",
    "경상북도 폐기물 수거", "대구 폐유 수거"
  ],
  openGraph: {
    title: "현대유앤아이 | 지정폐기물 수거·운반업 전문",
    description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다.",
    url: SITE_URL,
    siteName: "현대유앤아이",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "현대유앤아이 대표 이미지" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "현대유앤아이 | 지정폐기물 수거·운반업 전문",
    description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Google Search Console: https://search.google.com/search-console
    // → 속성 추가 → URL 접두사 → HTML 태그 방식 → content 값 입력
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
    other: {
      // 네이버 서치어드바이저: https://searchadvisor.naver.com
      // → 사이트 등록 → HTML 태그 방식 → content 값 입력
      "naver-site-verification": [process.env.NEXT_PUBLIC_NAVER_VERIFICATION || ""],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Microsoft 스타일: Segoe UI는 시스템 서체로 사용 (웹폰트 불필요). 숫자용 JetBrains Mono만 로드 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        {/* Pretendard Variable — 한글 (dynamic subset, 성능 최적화) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={cn(
          "min-h-dvh bg-background font-pretendard antialiased flex flex-col"
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
