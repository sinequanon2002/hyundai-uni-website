import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { COMPANY } from '@/lib/constants';

export const metadata = {
  title: `연혁 | ${COMPANY.shortName}`,
};

const HISTORY_DATA = [
  {
    year: "2026",
    events: [
      "폐기물 수집·운반업 허가증 갱신 (대구지방환경청, 제 대구수집 130호)",
      "차량 증차 — 81다 7183 (0.9톤) 추가 등록"
    ]
  },
  {
    year: "2025",
    events: [
      "폐기물 수집·운반업 최초 허가 취득 (허가일 2025. 07. 21)",
      "수집·운반 차량 2대 등록 (82라 6276 · 92마 3973)"
    ]
  },
  {
    year: "2024",
    events: [
      `${COMPANY.name} 법인 설립 (2024. 02. 14)`
    ]
  }
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="회사소개" subtitle="Company History" />
      <SubNav />
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">HISTORY</span>
          <h2 className="text-3xl font-bold text-neutral-900">지나온 발자취</h2>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-6">
            {HISTORY_DATA.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={item.year} className={`relative flex flex-col md:flex-row items-start md:items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary transform -translate-x-[7px] md:-translate-x-1/2 mt-2 md:mt-0 ring-4 ring-white z-10 shadow-sm"></div>

                  {/* Content Container */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 w-full pt-0.5 md:pt-4 pb-4 ${isEven ? 'md:pl-16' : 'md:pr-16 md:text-right'}`}>
                    <h3 className="text-4xl font-extrabold text-primary mb-4 tracking-tighter opacity-90">{item.year}</h3>
                    <ul className="space-y-3 text-lg text-neutral-700">
                      {item.events.map((event, i) => (
                        <li
                          key={i}
                          className={`relative break-keep leading-relaxed
                            ${isEven ? 'pl-4 before:left-0' : 'pl-4 md:pr-4 md:pl-0 before:left-0 md:before:right-0 md:before:left-auto'}
                            before:absolute before:top-2.5 before:w-1.5 before:h-1.5 before:bg-accent before:rounded-full`}
                        >
                          {event}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
