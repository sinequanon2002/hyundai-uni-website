import { HeroSection } from "@/components/sections/HeroSection";
import { TrustStatsSection } from "@/components/sections/TrustStatsSection";
import { PainPointSection } from "@/components/sections/PainPointSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { WasteTagsSection } from "@/components/sections/WasteTagsSection";
import { BlogPreviewSection } from "@/components/sections/BlogPreviewSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { StructuredData } from "@/components/seo/StructuredData";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-pretendard pt-16">
      <StructuredData />
      {/* 1. 핵심 메시지 + 즉시 CTA */}
      <HeroSection />
      {/* 2. 신뢰 수치 (카운트업) */}
      <TrustStatsSection />
      {/* 3. 공감 — 담당자 고민 해소 */}
      <PainPointSection />
      {/* 4. 선택 이유 — 경쟁 비교 */}
      <ComparisonSection />
      {/* 5. 안심 — 처리 절차 */}
      <ProcessSection />
      {/* 6. 서비스 범위 — 처리 가능 품목 */}
      <WasteTagsSection />
      {/* 7. 신뢰 콘텐츠 — 정보 블로그 */}
      <BlogPreviewSection />
      {/* 8. 최종 전환 CTA */}
      <CtaSection />
    </main>
  );
}

export const metadata = {
  title: { absolute: "현대유앤아이 | 지정폐기물 수거·운반업 전문" },
  description: "안전하고 적법한 지정폐기물 수거/운반 처리 전문 업체 현대유앤아이입니다. 올바로시스템 대행, 폐산, 폐유 등 전 품목 견적 문의.",
  alternates: { canonical: '/' }
};
