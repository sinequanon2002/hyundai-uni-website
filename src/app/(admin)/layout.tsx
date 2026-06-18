import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff, isAdmin, ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import { AdminNav } from "@/components/admin/AdminNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자",
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
    <div className="min-h-dvh bg-gray-50 lg:flex">
      <AdminNav
        isAdmin={isAdmin(profile.role)}
        displayName={displayName}
        roleLabel={roleLabel}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
