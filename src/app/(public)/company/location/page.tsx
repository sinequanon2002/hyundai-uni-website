import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { COMPANY } from '@/lib/constants';
import { MapPin, Bus, Car } from 'lucide-react';

export const metadata = {
  title: `오시는 길 | ${COMPANY.shortName}`,
};

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="회사소개" subtitle="Location" />
      <SubNav />
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        
        <div className="text-center mb-12">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">LOCATION</span>
          <h2 className="text-3xl font-bold text-neutral-900">오시는 길</h2>
        </div>

        {/* 맵 영역 */}
        <div className="w-full h-[400px] md:h-[500px] bg-neutral-200 rounded-xl overflow-hidden shadow-default mb-16 relative shadow-md">
          {/* TODO: 실제 카카오맵 URL로 교체 필요 */}
          {/* 
            실제 연동 시 
            <iframe src="카카오맵_공유_URL" width="100%" height="100%" /> 
            형태로 구현 
          */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
            <MapPin size={48} className="mb-4 opacity-50" />
            <p className="font-medium text-lg">카카오맵 지도 영역</p>
            <p className="text-sm mt-2 opacity-80">(실제 카카오맵 URL 연동 필요)</p>
          </div>
        </div>

        {/* 3컬럼 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. 주소 및 연락처 */}
          <div className="bg-neutral-50 p-8 rounded-xl border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">주소 / 연락처</h3>
            </div>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <p>
                <strong className="text-neutral-900 block mb-1">주소</strong>
                {COMPANY.address}
              </p>
              <p>
                <strong className="text-neutral-900 block mb-1">연락처</strong>
                TEL: {COMPANY.tel}<br/>
                FAX: {COMPANY.fax}<br />
                E-mail: {COMPANY.email}
              </p>
            </div>
          </div>

          {/* 2. 대중교통 */}
          <div className="bg-neutral-50 p-8 rounded-xl border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bus size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">대중교통</h3>
            </div>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <div>
                <strong className="text-neutral-900 block mb-1">버스</strong>
                <p>일반: 10, 11, 12번 탑승 후 'OO공단 입구' 하차</p>
                <p>좌석: 100, 101번 탑승</p>
              </div>
              <div className="pt-2">
                <strong className="text-neutral-900 block mb-1">지하철</strong>
                <p>O호선 OO역 하차 후 X번 출구로 나와 도보 10분</p>
              </div>
            </div>
          </div>

          {/* 3. 자가용 */}
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
                  <p>'{COMPANY.shortName}' 또는 주소({COMPANY.address.substring(0, 15)}...) 검색</p>
               </div>
               <div className="pt-2">
                  <strong className="text-neutral-900 block mb-1">주차 안내</strong>
                  <p>본사 건물 뒷편 방문객 전용 주차장 이용 가능 (무료)</p>
               </div>
            </div>
          </div>
        </div>
        
      </section>
    </main>
  );
}
