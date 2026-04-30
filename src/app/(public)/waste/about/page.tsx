import { Activity, Monitor, AlertTriangle, UserCheck } from 'lucide-react';
import React from 'react';

export default function WasteAboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      {/* Section A: 정의 박스 */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">지정폐기물이란?</h2>
        <blockquote className="bg-primary/5 border-l-4 border-primary p-6 md:p-8 rounded-r-xl shadow-sm">
          <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed mb-4">
            "지정폐기물이란 사업장폐기물 중에서 폐유, 폐산 등 주변 환경을 오염시킬 수 있거나 인체에 위해를 줄 수 있는 유해물질을 포함한 폐기물을 말합니다."
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <span>법령 근거: 폐기물관리법 제2조 제4호 / 시행령 제3조</span>
          </div>
        </blockquote>
      </section>

      {/* Section B: 주요 특징 2x2 카드 */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">지정폐기물 관리 핵심 특징</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">전 과정 관리</h3>
            <p className="text-gray-600 leading-relaxed">
              발생 시점부터 운반, 최종 처리에 이르기까지 모든 과정을 투명하게 추적하고 관리하여 환경오염의 가능성을 차단합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Monitor className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">올바로시스템</h3>
            <p className="text-gray-600 leading-relaxed">
              모든 지정폐기물의 이동은 한국환경공단 '올바로시스템'을 통해 전자인계서를 의무적으로 작성하고 보고해야 합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">엄격한 제재</h3>
            <p className="text-gray-600 leading-relaxed">
              일반 폐기물 대비 강력한 법정 규제가 적용되며, 위반 시 높은 수위의 과태료, 영업정지 또는 형사처벌을 받을 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">배출자 책임 유지</h3>
            <p className="text-gray-600 leading-relaxed">
              처리업자에게 위탁한 이후에도 부적정 처리 여부에 따라 배출자가 공동의 법적인 연대 책임을 지게 되므로 신뢰할 수 있는 업체 선정이 필수입니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section C: 비교 테이블 */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">일반폐기물 vs 지정폐기물</h2>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-semibold text-gray-600 w-1/4">구분</th>
                <th className="py-4 px-6 font-semibold text-gray-600 w-1/4">일반폐기물</th>
                <th className="py-4 px-6 font-bold text-primary bg-primary/5 w-1/2 rounded-tr-2xl">지정폐기물</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 font-medium text-gray-800">관리 기준</td>
                <td className="py-4 px-6 text-gray-600">일반적인 환경 기준 적용</td>
                <td className="py-4 px-6 text-gray-900 font-medium bg-primary/5">주변 환경오염 및 인체 유해성을 고려한 <strong className="text-primary">가장 엄격한 기준</strong> 적용</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 font-medium text-gray-800">처리 방법</td>
                <td className="py-4 px-6 text-gray-600">소각, 매립, 재활용 등</td>
                <td className="py-4 px-6 text-gray-900 font-medium bg-primary/5">안정화, 고형화, 차단형 매립 등 <strong className="text-primary">특수 처분 기술과 전용 시설</strong> 필요</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 font-medium text-gray-800">법적 책임</td>
                <td className="py-4 px-6 text-gray-600">상대적으로 가벼운 과태료</td>
                <td className="py-4 px-6 text-gray-900 font-medium bg-primary/5">적발 시 즉각적인 영업정지 및 <strong className="text-red-600">높은 수준의 벌금/형사처벌</strong></td>
              </tr>
              <tr className="hover:bg-gray-50/50 border-b-0">
                <td className="py-4 px-6 font-medium text-gray-800 rounded-bl-2xl">신고 절차</td>
                <td className="py-4 px-6 text-gray-600">지자체 신고 및 일반 인계서 전송</td>
                <td className="py-4 px-6 text-gray-900 font-medium bg-primary/5 rounded-br-2xl">신고 및 증명서 의무 발급, <strong className="text-primary">올바로시스템을 통한 실시간 전자인계서</strong> 의무</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


export const metadata = {
  title: "지정폐기물이란?",
  description: "지정폐기물의 정의와 분리배출 필요성에 대해 알아봅니다. 유해성에 따른 엄격한 관리 체계를 안내합니다."
};
