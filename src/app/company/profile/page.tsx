import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { COMPANY } from '@/lib/constants';
import { Award, ShieldCheck, Leaf } from 'lucide-react';

export const metadata = {
  title: `기업개요 | ${COMPANY.shortName}`,
};

const VISIONS = [
  {
    icon: Award,
    title: "전문성",
    description: "다년간의 경험과 노하우를 바탕으로 한 전문적인 폐기물 수집·운반"
  },
  {
    icon: ShieldCheck,
    title: "신뢰성",
    description: "관련 법규의 철저한 준수와 투명한 처리 과정으로 높은 고객 신뢰 확보"
  },
  {
    icon: Leaf,
    title: "친환경",
    description: "지속가능한 미래와 환경 보전을 최우선으로 생각하는 친환경 경영"
  }
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="회사소개" subtitle="Company Profile" />
      <SubNav />
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-24">
        
        {/* Vision Section */}
        <div>
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider text-sm mb-2 block">CORE VALUES</span>
            <h2 className="text-3xl font-bold text-neutral-900">우리의 핵심 가치</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VISIONS.map((vision, idx) => {
              const Icon = vision.icon;
              return (
                <div key={idx} className="bg-neutral-100/50 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100">
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

        {/* Company Info Section */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 border-b-2 border-primary pb-4 inline-block">기업 개요</h2>
          </div>
          <div className="bg-white border-t-2 border-primary shadow-sm rounded-sm">
            <dl className="grid grid-cols-1 md:grid-cols-2">
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">회사명</dt>
                <dd className="text-neutral-600">{COMPANY.name}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">대표이사</dt>
                <dd className="text-neutral-600">{COMPANY.ceo}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">설립일</dt>
                <dd className="text-neutral-600">{COMPANY.established}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">사업분야</dt>
                <dd className="text-neutral-600">지정폐기물 / 사업장 일반폐기물 수집·운반업</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">허가번호</dt>
                <dd className="text-neutral-600">{COMPANY.licenseNumber}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">사업자등록번호</dt>
                <dd className="text-neutral-600">{COMPANY.businessNumber}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 md:col-span-2 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">소재지</dt>
                <dd className="text-neutral-600">{COMPANY.address}</dd>
              </div>
              <div className="flex border-b border-gray-200 p-4 md:col-span-2 hover:bg-neutral-50 transition-colors">
                <dt className="w-32 flex-shrink-0 font-bold text-neutral-900">연락처</dt>
                <dd className="text-neutral-600">TEL: {COMPANY.tel} / FAX: {COMPANY.fax}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Vehicles Table */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 border-b-2 border-primary pb-4 inline-block">보유 차량 현황</h2>
          </div>
          <div className="overflow-x-auto shadow-sm rounded-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-neutral-100 border-t-2 border-primary border-b border-gray-300">
                  <th className="py-4 px-6 font-bold text-neutral-900 w-1/4">차량 종류</th>
                  <th className="py-4 px-6 font-bold text-neutral-900 w-1/4">적재 중량</th>
                  <th className="py-4 px-6 font-bold text-neutral-900 w-1/4">보유 대수</th>
                  <th className="py-4 px-6 font-bold text-neutral-900 w-1/4">용도</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-neutral-50 transition-colors bg-white">
                  <td className="py-4 px-6 font-medium text-neutral-900">탱크로리</td>
                  <td className="py-4 px-6 text-neutral-600">XX 톤</td>
                  <td className="py-4 px-6 text-neutral-600">O 대</td>
                  <td className="py-4 px-6 text-neutral-600">액상 폐기물 수집·운반</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-neutral-50 transition-colors bg-white">
                  <td className="py-4 px-6 font-medium text-neutral-900">밀폐형 차량</td>
                  <td className="py-4 px-6 text-neutral-600">XX 톤</td>
                  <td className="py-4 px-6 text-neutral-600">O 대</td>
                  <td className="py-4 px-6 text-neutral-600">고상 폐기물 낙하 방지</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-neutral-50 transition-colors bg-white">
                  <td className="py-4 px-6 font-medium text-neutral-900">덮개설치 차량</td>
                  <td className="py-4 px-6 text-neutral-600">XX 톤</td>
                  <td className="py-4 px-6 text-neutral-600">O 대</td>
                  <td className="py-4 px-6 text-neutral-600">대형/벌크 폐기물 운반</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
