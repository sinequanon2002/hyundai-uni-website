import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/my", label: "대시보드", exact: true },
  { href: "/my/inquiries", label: "나의 문의 내역" },
  { href: "/my/profile", label: "프로필 설정" },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-primary font-bold text-base">
            현대유앤아이
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-neutral-mid hover:text-primary transition-colors">
              홈으로
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-neutral-mid hover:text-red-500 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex gap-8">
        {/* 사이드 네비게이션 */}
        <aside className="hidden md:block w-48 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-neutral-mid uppercase tracking-wide">마이페이지</p>
            </div>
            <ul className="py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-neutral-light hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
