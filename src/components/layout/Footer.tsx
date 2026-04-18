import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">현대유앤아이</h2>
          <p className="text-sm leading-relaxed max-w-sm mb-4">
            신뢰성과 전문성을 최우선으로 하는 지정폐기물 수거·운반업 전문 기업입니다. 
            환경과 미래를 생각하는 안전한 폐기물 처리를 약속드립니다.
          </p>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">빠른 이동</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/company/greeting" className="hover:text-white transition-colors">회사소개</Link></li>
            <li><Link href="/waste/types" className="hover:text-white transition-colors">수거 대상 폐기물</Link></li>
            <li><Link href="/support/notice" className="hover:text-white transition-colors">공지사항</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">고객지원</h3>
           <ul className="space-y-2 text-sm">
            <li><Link href="/support/inquiry" className="hover:text-white transition-colors">온라인 견적문의</Link></li>
            <li><Link href="/company/location" className="hover:text-white transition-colors">오시는 길</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-neutral-800 text-xs text-neutral-500 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Hyundai U&I. All rights reserved.</p>
        <p className="mt-2 md:mt-0">대표이사: 김현대 | 사업자등록번호: 123-45-67890</p>
      </div>
    </footer>
  );
}
