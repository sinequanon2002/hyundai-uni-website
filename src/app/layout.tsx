import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hyundaiuni.kr";

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
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-pretendard antialiased flex flex-col"
        )}
      >
        {children}
      </body>
    </html>
  );
}
