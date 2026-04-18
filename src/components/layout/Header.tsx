import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary">현대유앤아이</Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/company/profile" className="hover:text-primary transition-colors">회사소개</Link>
          <Link href="/waste/types" className="hover:text-primary transition-colors">지정폐기물</Link>
          <Link href="/allbaro/about" className="hover:text-primary transition-colors">올바로시스템</Link>
          <Link href="/support/inquiry" className="hover:text-primary transition-colors">견적문의</Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu placeholder */}
          <button className="text-neutral-900" aria-label="메뉴 열기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
