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
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">GREETING</span>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            고객과 환경을 먼저 생각합니다
          </h2>
          <div className="w-12 h-1 bg-accent mt-6"></div>
        </div>

        <div className="space-y-7 text-neutral-700 leading-[1.9] text-[1.05rem] break-keep">
          <p>
            안녕하십니까. 저희 {COMPANY.shortName}을 찾아주신 모든 분들께 진심으로 감사드립니다.
          </p>
          <p>
            현대 산업사회에서 필연적으로 발생하는 지정폐기물은 그 유해성으로 인해 반드시 전문적이고
            책임 있는 관리가 요구됩니다. 저희는 <strong className="text-neutral-900 font-semibold">환경보전은
            기업의 사회적 책임이며, 인류의 미래를 위한 투자</strong>라는 경영철학 아래,
            지정폐기물의 수집·운반 업무를 전문적으로 수행해왔습니다.
          </p>
          <p>
            관련 법규의 엄격한 준수를 기본으로, 배출자이신 고객사의 소중한 시간과 책임을 덜어드리기 위해
            최선을 다하고 있습니다. 앞으로도 신뢰와 전문성을 바탕으로 깨끗하고 지속가능한 환경을
            만드는 일에 앞장서겠습니다.
          </p>
          <p>감사합니다.</p>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 text-right">
          <p className="text-neutral-500 text-sm mb-1">{COMPANY.name}</p>
          <p className="text-neutral-900 font-semibold text-lg">
            대표이사 <span className="text-2xl font-bold ml-2">{COMPANY.ceo}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
