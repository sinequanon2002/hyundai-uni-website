import Link from 'next/link';
import { COMPANY } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">{COMPANY.shortName}</h2>
          <p className="text-sm leading-relaxed max-w-sm mb-6">
            신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다. 
            환경과 미래를 생각하는 안전한 폐기물 처리를 약속드립니다.
          </p>
          <div className="text-sm text-neutral-400 space-y-1">
            <p><span className="text-neutral-500 mr-2">주소</span> {COMPANY.address}</p>
            <p><span className="text-neutral-500 mr-2">연락처</span> {COMPANY.tel}</p>
            <p><span className="text-neutral-500 mr-2">이메일</span> {COMPANY.email}</p>
            <p><span className="text-neutral-500 mr-2">업무시간</span> {COMPANY.businessHours}</p>
          </div>

          {/* SNS 링크 */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs text-neutral-500">SNS</span>
            <a
              href="https://blog.naver.com/hduni2020"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="네이버 블로그 바로가기"
              className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              {/* 네이버 로고 */}
              <span className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center bg-neutral-700 group-hover:bg-[#03C75A] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M13.527 7.2v5.046L10.473 7.2H7.2v9.6h3.073v-5.046l3.054 5.046H16.8V7.2z" />
                </svg>
              </span>
              <span className="text-xs">네이버 블로그</span>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">빠른 이동</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/company" className="hover:text-white transition-colors">회사 소개</Link></li>
            <li><Link href="/waste/types" className="hover:text-white transition-colors">수거 대상 폐기물</Link></li>
            <li><Link href="/allbaro/about" className="hover:text-white transition-colors">올바로시스템</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">고객지원</h3>
           <ul className="space-y-2 text-sm">
            <li><Link href="/support/inquiry" className="hover:text-white transition-colors">온라인 견적문의</Link></li>
            <li><Link href="/support/notice" className="hover:text-white transition-colors">공지사항</Link></li>
            <li><Link href="/support/gallery" className="hover:text-white transition-colors">현장갤러리</Link></li>
            <li><Link href="/company#location" className="hover:text-white transition-colors">오시는 길</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-neutral-800 text-xs text-neutral-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.<br className="md:hidden" />
          <span className="hidden md:inline"> | </span>대표이사: {COMPANY.ceo} | 사업자등록번호: {COMPANY.businessNumber} | {COMPANY.licenseNumber}
        </p>
        <Link
          href="/login"
          className="text-neutral-700 hover:text-neutral-500 transition-colors shrink-0"
        >
          직원 로그인
        </Link>
      </div>
    </footer>
  );
}
