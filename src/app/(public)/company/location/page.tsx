import { PageBanner } from '@/components/ui/PageBanner';
import { SubNav } from '@/components/ui/SubNav';
import { COMPANY } from '@/lib/constants';
import { MapPin, Phone, Car, ExternalLink } from 'lucide-react';

export const metadata = {
  title: `오시는 길 | ${COMPANY.shortName}`,
};

// 네이버지도: 경상북도 경산시 하양읍 하양로 34 검색 링크
const NAVER_MAP_URL =
  'https://map.naver.com/p/search/%EA%B2%BD%EC%83%81%EB%B6%81%EB%8F%84%20%EA%B2%BD%EC%82%B0%EC%8B%9C%20%ED%95%98%EC%96%91%EC%9D%8D%20%ED%95%98%EC%96%91%EB%A1%9C%2034';

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
              <path d="M13.74 12.4L8 3H3v18h6.26L15 12.4h-1.26zM10.26 11.6L5 20.4V4.6l5.26 7z"/>
            </svg>
            네이버지도에서 보기
            <ExternalLink size={16} />
          </a>
          <p className="text-sm text-neutral-400">지도를 클릭하면 네이버지도에서 길찾기를 이용하실 수 있습니다.</p>
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

          {/* 2. 대중교통 */}
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
