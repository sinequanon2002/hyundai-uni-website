import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    template: "%s | 현대유앤아이환경",
    default: "현대유앤아이환경 | 지정폐기물 수거·운반업 전문",
  },
  description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다. 폐산, 폐유, 폐알칼리 등 안전한 처리 보장.",
  keywords: [
    "지정폐기물", "지정폐기물 수거", "지정폐기물 운반", 
    "폐유 수거", "폐산 처리", "폐알칼리", "폐유기용제", 
    "올바로시스템", "사업장폐기물", "폐기물처리업체", "수도권 지정폐기물"
  ],
  openGraph: {
    title: "현대유앤아이환경 | 지정폐기물 수거·운반업 전문",
    description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다.",
    url: "https://[도메인]", // TODO: 실제 도메인 교체
    siteName: "현대유앤아이환경",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "현대유앤아이환경 대표 이미지" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "현대유앤아이환경 | 지정폐기물 수거·운반업 전문",
    description: "신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // TODO: Google Search Console, Naver Webmaster 인증 코드 입력
    google: "TODO_GSC_VERIFICATION_CODE",
    other: {
      "naver-site-verification": ["TODO_NAVER_VERIFICATION_CODE"],
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
        <Header />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
