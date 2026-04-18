import React from 'react';
import { Warehouse, Package, Calendar } from 'lucide-react';

export default function WasteStoragePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">지정폐기물 보관방법</h2>
        <p className="text-lg text-gray-600">안전하고 적법한 보관은 사고 예방의 첫걸음입니다.</p>
      </div>

      {/* Section A: 3개 카테고리 카드 */}
      <div className="flex flex-col gap-8 mb-20">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
          <div className="bg-blue-50/50 md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <Warehouse className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">보관장소 기준</h3>
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <ul className="space-y-4 text-gray-600 text-lg">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl font-bold">•</span>
                폐기물이 흩날리거나 누출되지 않도록 전용 보관 시설(창고 등)을 갖출 것
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl font-bold">•</span>
                바닥은 시멘트, 아스팔트 등으로 포장하여 지하수 오염을 방지할 것 (침투 방지)
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 text-xl font-bold">•</span>
                빗물 등의 유입을 막을 수 있는 지붕이나 덮개를 반드시 설치할 것
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
          <div className="bg-emerald-50/50 md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">보관용기 기준</h3>
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <ul className="space-y-4 text-gray-600 text-lg">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 text-xl font-bold">•</span>
                폐기물의 성상(액체, 고체 등)에 따라 부식되거나 파손되지 않는 재질을 사용할 것
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 text-xl font-bold">•</span>
                특히 휘발성이 있는 폐유기용제 등의 경우 가스가 새어나오지 않도록 밀폐할 것
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 text-xl font-bold">•</span>
                서로 섞여 화학 반응을 일으킬 수 있는 폐기물은 반드시 용기를 분리할 것
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
          <div className="bg-orange-50/50 md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">보관기간 기준</h3>
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <ul className="space-y-4 text-gray-600 text-lg">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl font-bold">•</span>
                <div>
                  <strong>일반적인 지정폐기물:</strong> 발생일로부터 <strong className="text-orange-600">45일 이내</strong> 처리 필수
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl font-bold">•</span>
                <div>
                  <strong>의료폐기물:</strong> 종류에 따라 <strong className="text-orange-600">7일 ~ 최대 60일 이내</strong> 처리 (격리의료 7일, 그외 위해의료 15일 등)
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl font-bold">•</span>
                단, 천재지변이나 휴폐업 등 정당한 사유로 시·도지사의 승인을 받은 경우 예외 적용
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Section B: 보관표지판 예시 */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center md:text-left">보관표지판 설치 예시</h2>
      <div className="bg-yellow-400 p-2 md:p-4 rounded-xl shadow-lg max-w-3xl mx-auto rotate-1 hover:rotate-0 transition-transform duration-300">
        <div className="bg-white border-4 border-black p-6 md:p-10 rounded">
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <h3 className="text-3xl md:text-4xl font-black tracking-widest">지 정 폐 기 물</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg font-bold text-gray-800">
            <div className="flex flex-col border-b border-gray-300 pb-2">
              <span className="text-sm text-gray-500 mb-1">폐기물의 종류</span>
              <span>폐유 (기계유)</span>
            </div>
            <div className="flex flex-col border-b border-gray-300 pb-2">
              <span className="text-sm text-gray-500 mb-1">취급시 주의사항</span>
              <span className="text-red-600">인화성 물질 접근 금지</span>
            </div>
            <div className="flex flex-col border-b border-gray-300 pb-2">
              <span className="text-sm text-gray-500 mb-1">보관가능 용량</span>
              <span>5.0 톤</span>
            </div>
            <div className="flex flex-col border-b border-gray-300 pb-2">
              <span className="text-sm text-gray-500 mb-1">보관기간</span>
              <span>2024.01.01 ~ 2024.02.14 (45일)</span>
            </div>
            <div className="flex flex-col border-b border-gray-300 pb-2 md:col-span-2">
              <span className="text-sm text-gray-500 mb-1">관리책임자</span>
              <span>환경안전팀 홍길동 (010-1234-5678)</span>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t-2 border-black border-dashed text-center text-sm text-gray-500 font-medium">
            * 표지판 규격: 가로 60cm 이상 × 세로 40cm 이상 (노란색 바탕에 검은색 글자)
          </div>
        </div>
      </div>
    </div>
  );
}


export const metadata = {
  title: "보관 및 표지 방법",
  description: "지정폐기물 종류별 보관 기간, 보관 창고 규격, 안전 표지판 부착 방법 등에 대한 법적 기준 안내."
};
