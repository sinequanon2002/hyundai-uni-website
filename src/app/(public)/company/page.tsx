import { PageBanner } from '@/components/ui/PageBanner';
import { COMPANY } from '@/lib/constants';
import { Award, ShieldCheck, Leaf, MapPin, Phone, Car, ExternalLink } from 'lucide-react';
import { CertificationCards } from '@/components/company/CertificationCards';

export const metadata = {
  title: `회사 소개 | ${COMPANY.shortName}`,
  description: `${COMPANY.name} 회사 소개 — 인사말, 핵심가치, 연혁, 인허가현황, 오시는 길`,
};

const VISIONS = [
  {
    icon: Award,
    title: "전문성",
    description: "다년간의 경험과 노하우를 바탕으로 한 전문적인 폐기물 수집·운반",
  },
  {
    icon: ShieldCheck,
    title: "신뢰성",
    description: "관련 법규의 철저한 준수와 투명한 처리 과정으로 높은 고객 신뢰 확보",
  },
  {
    icon: Leaf,
    title: "친환경",
    description: "지속가능한 미래와 환경 보전을 최우선으로 생각하는 친환경 경영",
  },
];

const VEHICLES = [
  { plate: "82라 6276", licenseNo: "2025-전-042", tons: "11.8톤" },
  { plate: "92마 3973", licenseNo: "2025-전-043", tons: "3.7톤" },
  { plate: "81다 7183", licenseNo: "2026-전-007", tons: "0.9톤" },
];

const HISTORY_DATA = [
  {
    year: "2026",
    events: [
      "폐기물 수집·운반업 허가증 갱신 (대구지방환경청, 제 대구수집 130호)",
      "차량 증차 — 81다 7183 (0.9톤) 추가 등록",
    ],
  },
  {
    year: "2025",
    events: [
      "폐기물 수집·운반업 최초 허가 취득 (허가일 2025. 07. 21)",
      "수집·운반 차량 2대 등록 (82라 6276 · 92마 3973)",
    ],
  },
  {
    year: "2024",
    events: [`${COMPANY.name} 법인 설립 (2024. 02. 14)`],
  },
];

const NAVER_MAP_URL =
  'https://map.naver.com/p/search/%EA%B2%BD%EC%83%81%EB%B6%81%EB%8F%84%20%EA%B2%BD%EC%82%B0%EC%8B%9C%20%ED%95%98%EC%96%91%EC%9D%8D%20%ED%95%98%EC%96%91%EB%A1%9C%2034';

const ANCHORS = [
  { label: '인사말', href: '#greeting' },
  { label: '회사개요', href: '#overview' },
  { label: '연혁', href: '#history' },
  { label: '인허가현황', href: '#certifications' },
  { label: '오시는 길', href: '#location' },
];

function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div className="text-center mb-12">
      <span className="text-primary font-bold tracking-wider text-sm mb-2 block">{tag}</span>
      <h2 className="text-3xl font-bold text-neutral-900">{title}</h2>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="회사 소개" subtitle="About Us" />

      {/* 인페이지 앵커 내비게이션 */}
      <div className="sticky top-16 z-40 bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center overflow-x-auto no-scrollbar">
            {ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 px-5 py-4 text-sm font-medium text-neutral-600 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* 인사말 */}
      <section id="greeting" className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">GREETING</span>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            고객과 환경을 먼저 생각합니다
          </h2>
          <div className="w-12 h-1 bg-accent mt-6" />
        </div>
        <div className="space-y-7 text-neutral-700 leading-[1.9] text-[1.05rem] break-keep">
          <p>안녕하십니까. 저희 {COMPANY.shortName}을 찾아주신 모든 분들께 진심으로 감사드립니다.</p>
          <p>
            현대 산업사회에서 필연적으로 발생하는 지정폐기물은 그 유해성으로 인해 반드시 전문적이고
            책임 있는 관리가 요구됩니다. 저희는{' '}
            <strong className="text-neutral-900 font-semibold">
              환경보전은 기업의 사회적 책임이며, 인류의 미래를 위한 투자
            </strong>
            라는 경영철학 아래, 지정폐기물의 수집·운반 업무를 전문적으로 수행해왔습니다.
          </p>
          <p>
            관련 법규의 엄격한 준수를 기본으로, 배출자이신 고객사의 소중한 시간과 책임을 덜어드리기
            위해 최선을 다하고 있습니다. 앞으로도 신뢰와 전문성을 바탕으로 깨끗하고 지속가능한
            환경을 만드는 일에 앞장서겠습니다.
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

      <div className="border-t border-neutral-100" />

      {/* 회사개요 */}
      <section id="overview" className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-20">
        {/* 핵심 가치 */}
        <div>
          <SectionHeader tag="CORE VALUES" title="우리의 핵심 가치" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VISIONS.map((vision, idx) => {
              const Icon = vision.icon;
              return (
                <div
                  key={idx}
                  className="bg-neutral-100/50 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">{vision.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{vision.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 기업 개요 */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 border-b-2 border-primary pb-4 inline-block mb-8">
            기업 개요
          </h2>
          <div className="bg-white border-t-2 border-primary shadow-sm rounded-sm">
            <dl className="grid grid-cols-1 md:grid-cols-2">
              {[
                { dt: '회사명', dd: COMPANY.name },
                { dt: '대표이사', dd: COMPANY.ceo },
                { dt: '설립일', dd: '2024년 02월 14일' },
                { dt: '사업분야', dd: '지정폐기물 수집·운반업' },
                { dt: '허가번호', dd: COMPANY.licenseNumber },
                { dt: '사업자등록번호', dd: COMPANY.businessNumber },
              ].map(({ dt, dd }) => (
                <div key={dt} className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                  <dt className="w-36 flex-shrink-0 font-bold text-neutral-900">{dt}</dt>
                  <dd className="text-neutral-600">{dd}</dd>
                </div>
              ))}
              <div className="flex border-b border-gray-200 p-4 md:col-span-2 hover:bg-neutral-50 transition-colors">
                <dt className="w-36 flex-shrink-0 font-bold text-neutral-900">소재지</dt>
                <dd className="text-neutral-600">{COMPANY.address}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 md:col-span-2 hover:bg-neutral-50 transition-colors">
                <dt className="w-36 flex-shrink-0 font-bold text-neutral-900">연락처</dt>
                <dd className="text-neutral-600">
                  TEL: {COMPANY.tel}&nbsp;&nbsp;|&nbsp;&nbsp;Mobile: {COMPANY.mobile}&nbsp;&nbsp;|&nbsp;&nbsp;E-mail: {COMPANY.email}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 보유 차량 현황 */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 border-b-2 border-primary pb-4 inline-block mb-8">
            보유 차량 현황
          </h2>
          <div className="overflow-x-auto shadow-sm rounded-sm">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-neutral-100 border-t-2 border-primary border-b border-gray-300">
                  <th className="py-4 px-6 font-bold text-neutral-900">차량번호</th>
                  <th className="py-4 px-6 font-bold text-neutral-900">허가번호</th>
                  <th className="py-4 px-6 font-bold text-neutral-900">적재중량</th>
                  <th className="py-4 px-6 font-bold text-neutral-900">용도</th>
                </tr>
              </thead>
              <tbody>
                {VEHICLES.map((v) => (
                  <tr key={v.plate} className="border-b border-gray-200 hover:bg-neutral-50 transition-colors bg-white">
                    <td className="py-4 px-6 font-medium text-neutral-900">{v.plate}</td>
                    <td className="py-4 px-6 text-neutral-600">{v.licenseNo}</td>
                    <td className="py-4 px-6 text-neutral-600">{v.tons}</td>
                    <td className="py-4 px-6 text-neutral-600">액상 폐기물 수집·운반</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="border-t border-neutral-100" />

      {/* 연혁 */}
      <section id="history" className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <SectionHeader tag="HISTORY" title="지나온 발자취" />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2" />
          <div className="space-y-12 md:space-y-6">
            {HISTORY_DATA.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary transform -translate-x-[7px] md:-translate-x-1/2 mt-2 md:mt-0 ring-4 ring-white z-10 shadow-sm" />
                  <div className={`ml-12 md:ml-0 md:w-1/2 w-full pt-0.5 md:pt-4 pb-4 ${isEven ? 'md:pl-16' : 'md:pr-16 md:text-right'}`}>
                    <h3 className="text-4xl font-extrabold text-primary mb-4 tracking-tighter opacity-90">
                      {item.year}
                    </h3>
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

      <div className="border-t border-neutral-100" />

      {/* 인허가현황 */}
      <section id="certifications" className="bg-neutral-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader tag="CERTIFICATIONS" title="허가 및 인증 현황" />
          <CertificationCards />
        </div>
      </section>

      <div className="border-t border-neutral-100" />

      {/* 오시는 길 */}
      <section id="location" className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <SectionHeader tag="LOCATION" title="오시는 길" />

        {/* 지도 영역 */}
        <div className="w-full h-[400px] md:h-[480px] rounded-xl overflow-hidden shadow-md mb-16 relative bg-neutral-100 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <MapPin size={48} className="text-primary opacity-70" />
            <p className="font-semibold text-lg text-neutral-700">{COMPANY.address}</p>
          </div>
          <a
            href={NAVER_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-bold px-8 py-3 rounded-full transition-colors shadow-md text-base"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.74 12.4L8 3H3v18h6.26L15 12.4h-1.26zM10.26 11.6L5 20.4V4.6l5.26 7z" />
            </svg>
            네이버지도에서 보기
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-neutral-400">지도를 클릭하면 네이버지도에서 길찾기를 이용하실 수 있습니다.</p>
        </div>

        {/* 3컬럼 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-neutral-50 p-8 rounded-xl border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">주소 / 연락처</h3>
            </div>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <div>
                <strong className="text-neutral-900 block mb-1">주소</strong>
                {COMPANY.address}
              </div>
              <div>
                <strong className="text-neutral-900 block mb-1">연락처</strong>
                TEL: {COMPANY.tel}<br />
                Mobile: {COMPANY.mobile}<br />
                E-mail: {COMPANY.email}
              </div>
              <div>
                <strong className="text-neutral-900 block mb-1">운영시간</strong>
                {COMPANY.businessHours}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-8 rounded-xl border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Phone size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">대중교통</h3>
            </div>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <div>
                <strong className="text-neutral-900 block mb-1">버스</strong>
                <p>경산시 하양읍 하양로 34 인근 정류장 하차 후 도보 이동</p>
              </div>
              <div>
                <strong className="text-neutral-900 block mb-1">기차</strong>
                <p>경부선 하양역 하차 후 택시 또는 버스 이용</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-8 rounded-xl border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Car size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">자가용 / 주차</h3>
            </div>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <div>
                <strong className="text-neutral-900 block mb-1">네비게이션</strong>
                <p>'{COMPANY.shortName}' 또는 '하양로 34' 검색</p>
              </div>
              <div>
                <strong className="text-neutral-900 block mb-1">고속도로</strong>
                <p>경부고속도로 경산IC 진출 후 하양 방면 약 15분</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
