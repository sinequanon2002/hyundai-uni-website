import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "마이페이지 | 현대유앤아이",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/my", label: "대시보드" },
  { href: "/my/inquiries", label: "나의 문의 내역" },
  { href: "/my/profile", label: "프로필 설정" },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1) 인증 확인 — 미들웨어에서 처리하지만 레이아웃에서도 이중 검증
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/my");
  }

  // 2) 역할 확인 — 스태프는 관리자 백오피스로 리다이렉트
  let profile: { role: string; full_name: string | null; company_name: string | null } | null = null;
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("profiles")
      .select("role, full_name, company_name")
      .eq("id", user.id)
      .single();
    profile = data;
  } catch {
    // DB 오류 시 고객으로 처리 (접근 차단하지 않음)
  }

  if (profile && isStaff(profile.role)) {
    redirect("/inquiries");
  }

  const displayName = profile?.full_name ?? user.email ?? "고객";
  const companyName = profile?.company_name;

  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-primary font-bold text-base">
            현대유앤아이
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-neutral-dark leading-none">{displayName}</p>
              {companyName && (
                <p className="text-xs text-neutral-mid mt-0.5">{companyName}</p>
              )}
            </div>
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

          {/* 새 문의 버튼 */}
          <Link
            href="/support/inquiry"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
          >
            새 견적 문의
          </Link>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
