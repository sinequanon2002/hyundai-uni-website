import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { COMPANY } from '@/lib/constants';

export const metadata = {
  title: `인사말 | ${COMPANY.shortName}`,
  description: `${COMPANY.name} 대표이사 인사말입니다.`,
};

export default function GreetingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="회사소개" subtitle="Customer & Environment First" />
      <SubNav />
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          <div className="w-full md:w-5/12">
            <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg">
              {/* Image Placeholder */}
              <div className="text-gray-400 flex flex-col items-center">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="text-sm font-medium">CEO Photo Placeholder</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-7/12 flex flex-col justify-center h-full">
            <div className="mb-8">
              <span className="text-primary font-bold tracking-wider text-sm mb-2 block">GREETING</span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                고객과 환경을<br className="hidden md:block" /> 먼저 생각합니다
              </h2>
              <div className="w-12 h-1 bg-accent mt-6"></div>
            </div>
            <div className="space-y-6 text-neutral-600 leading-relaxed text-lg break-keep">
              <p>
                "안녕하십니까. 저희 {COMPANY.shortName}을 찾아주신 모든 분들께 진심으로 감사드립니다."
              </p>
              <p>
                "현대 산업사회에서 필연적으로 발생하는 지정폐기물은 그 유해성으로 인해 반드시 전문적이고 책임 있는 관리가 요구됩니다. 저희는 환경보전은 기업의 사회적 책임이며, 인류의 미래를 위한 투자라는 경영철학 아래, 지정폐기물의 수집·운반 업무를 전문적으로 수행해왔습니다."
              </p>
              <p>
                "관련 법규의 엄격한 준수를 기본으로, 배출자이신 고객사의 소중한 시간과 책임을 덜어드리기 위해 최선을 다하고 있습니다. 앞으로도 신뢰와 전문성을 바탕으로 깨끗하고 지속가능한 환경을 만드는 일에 앞장서겠습니다."
              </p>
              <p>
                "감사합니다."
              </p>
            </div>
            <div className="mt-12 text-right">
              <p className="text-neutral-900 font-medium text-lg">
                대표이사 <span className="text-2xl italic font-serif ml-2">{COMPANY.ceo}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
