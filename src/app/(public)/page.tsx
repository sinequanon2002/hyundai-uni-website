import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WhyUsSection } from "@/components/sections/WhyUsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { CtaSection } from "@/components/sections/CtaSection";

import { StructuredData } from "@/components/seo/StructuredData";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-pretendard pt-16">
      <StructuredData />
      {/* Header가 상단에 fixed 되어 있다고 가정하고, pt-16 혹시 모르니 부여 
          (여기서는 페이지 전체 구조에서 Header가 밖에 있다고 전제) */}
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ProcessSection />
      <CtaSection />
    </main>
  );
}


export const metadata = {
  title: "현대유앤아이환경 | 지정폐기물 수거·운반업 전문",
  description: "안전하고 적법한 지정폐기물 수거/운반 처리 전문 업체 현대유앤아이환경입니다. 올바로시스템 대행, 폐산, 폐유 등 전 품목 무료 방문 견적.",
  alternates: { canonical: '/' }
};
