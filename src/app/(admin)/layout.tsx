import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff, isAdmin, ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import { logout } from "@/lib/actions/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 | 현대유앤아이",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1) 세션 확인 (미들웨어에서 이미 처리하지만, 레이아웃에서 이중 검증)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2) 역할 확인 (profiles 테이블에서 조회 — admin client로 RLS 우회)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) {
    // 고객(customer) 또는 profiles 미존재 시 접근 거부
    redirect("/");
  }

  const displayName = profile.full_name ?? user.email ?? "관리자";
  const roleLabel   = ROLE_LABELS[profile.role as UserRole] ?? profile.role;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 관리자 헤더 */}
      <header className="bg-primary text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <a href="/inquiries" className="font-bold text-sm tracking-tight hover:opacity-80 transition-opacity">
            현대유앤아이 · 관리자
          </a>
          <nav className="hidden sm:flex items-center gap-4 text-xs text-white/70">
            <a href="/inquiries" className="hover:text-white transition-colors">견적 문의</a>
            <a href="/notices" className="hover:text-white transition-colors">공지사항</a>
            <a href="/gallery" className="hover:text-white transition-colors">현장갤러리</a>
            {isAdmin(profile.role) && (
              <>
                <a href="/users" className="hover:text-white transition-colors">사용자 관리</a>
                <a href="/settings" className="hover:text-white transition-colors">설정</a>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-white transition-colors hidden sm:block"
            title="홈페이지 새 탭으로 열기"
          >
            홈페이지 ↗
          </a>
          <span className="text-xs text-white/70 hidden sm:block">
            <span className="text-white/50 mr-1">[{roleLabel}]</span>
            {displayName}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 rounded px-2.5 py-1 transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {/* 컨텐츠 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
