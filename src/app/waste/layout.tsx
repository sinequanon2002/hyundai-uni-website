import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav, WASTE_SUBNAV_ITEMS } from '@/components/ui/SubNav';

export default function WasteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageBanner 
        title="지정폐기물 처리 안내" 
        subtitle="신뢰와 책임을 바탕으로 안전하게 처리합니다"
      />
      <SubNav items={WASTE_SUBNAV_ITEMS} />
      <div className="bg-gray-50/30 min-h-screen">
        {children}
      </div>
    </>
  );
}
