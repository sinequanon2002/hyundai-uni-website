import React from 'react';
import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { FileText, Send, BarChart3, Search, UploadCloud, ArrowRight } from 'lucide-react';

const ALLBARO_SUBNAV_ITEMS = [
  { label: "올바로시스템이란", href: "/allbaro/about" },
  { label: "전자인계서 작성방법", href: "/allbaro/guide" }
];

export const metadata = {
  title: '올바로시스템이란 | 지정폐기물 수거·운반',
  description: '종이인계서 대신 인터넷 및 RFID를 이용하여 실시간으로 관리하는 폐기물 종합관리시스템입니다.',
};

export default function AllbaroAboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <PageBanner
        title="올바로시스템 안내"
        subtitle="투명하고 정확한 폐기물 처리의 시작"
      />
      <SubNav items={ALLBARO_SUBNAV_ITEMS} />

      <div className="max-w-6xl mx-auto px-4 mt-12 md:mt-20 space-y-24">
        {/* Section A: 시스템 소개 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-blue-50/50 p-8 md:p-12 flex items-center justify-center min-h-[300px]">
              <div className="w-full max-w-sm aspect-video bg-white rounded-xl shadow-md border border-blue-100 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                <span className="text-xl font-bold tracking-tight text-blue-900 z-10 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">All</span>
                  baro System
                </span>
              </div>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-6 w-max border border-green-200">
                운영기관: 한국환경공단
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                올바로시스템(Allbaro System)
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                사업장폐기물의 배출부터 운반·최종처리까지의 전 과정을, 종이인계서 대신 인터넷 및 RFID를 이용하여 실시간으로 관리하는 폐기물 종합관리시스템입니다.
              </p>
              <div>
                <a
                  href="https://www.allbaro.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                >
                  올바로시스템 바로가기 <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: 주요 기능 */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">주요 기능</h2>
            <p className="text-gray-600">올바로시스템을 통한 스마트한 폐기물 관리</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              title="폐기물 배출 정보 실시간 입력"
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<Send className="w-6 h-6 text-indigo-600" />}
              title="전자인계서 작성·전송·확인"
              color="bg-indigo-50"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-green-600" />}
              title="폐기물 통계 자동 제공"
              color="bg-green-50"
            />
            <FeatureCard
              icon={<Search className="w-6 h-6 text-amber-600" />}
              title="처리 이력 조회 및 증명서 발급"
              color="bg-amber-50"
            />
            <FeatureCard
              icon={<UploadCloud className="w-6 h-6 text-purple-600" />}
              title="실적보고 자동 연동"
              color="bg-purple-50"
            />
          </div>
        </section>

        {/* Section C: Before/After 비교 */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">도입 효과</h2>
            <p className="text-gray-600">수기 관리에서 디지털 전환으로</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 justify-center relative">
            {/* Before */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-red-500">Before</span> 종이 수기전표 시대
              </h3>
              <ul className="space-y-4">
                {[
                  "수기 작성 부담",
                  "서류 보관 필요 (장기 보관 공간)",
                  "불투명한 이력 및 추적 어려움",
                  "수동 통계 집계 및 오류 가능성"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">✕</span>
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow/Divider */}
            <div className="flex items-center justify-center py-4 md:py-0">
              <div className="w-12 h-12 rounded-full md:bg-primary/10 md:text-primary bg-transparent text-primary flex items-center justify-center rotate-90 md:rotate-0">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* After */}
            <div className="flex-1 bg-primary border border-blue-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-green-300">After</span> 올바로시스템 도입
              </h3>
              <ul className="space-y-4 relative z-10">
                {[
                  "간편한 전자인계서 작성",
                  "안전한 클라우드 영구 저장",
                  "투명하고 실시간인 이력 추적",
                  "자동 통계 제공 및 실적보고 연동"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</span>
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, color }: { icon: React.ReactNode, title: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="mt-1">
        <h3 className="font-semibold text-gray-900 leading-snug">{title}</h3>
      </div>
    </div>
  );
}
