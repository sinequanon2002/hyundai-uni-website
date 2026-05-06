import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, USER_ROLES, ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import { getNoticeWriteRoles, updateNoticeWriteRoles } from "@/lib/actions/settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "설정 | 현대유앤아이" };

// 고객 역할은 설정에서 제외
const STAFF_ROLE_OPTIONS: UserRole[] = USER_ROLES.filter((r) => r !== "customer");

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) redirect("/inquiries");

  const rolesResult = await getNoticeWriteRoles();
  const currentRoles = rolesResult.data ?? ["admin", "super_admin"];

  async function handleUpdate(formData: FormData) {
    "use server";
    const selected = formData.getAll("roles") as UserRole[];
    const result = await updateNoticeWriteRoles(selected);
    if (!result.success) {
      // 에러는 redirect 전에 처리하기 어려우므로 그냥 리다이렉트
      console.error("[settings] updateNoticeWriteRoles failed:", result.error);
    }
    redirect("/settings");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">사이트 설정</h1>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
        {/* 공지사항 작성 권한 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-1">공지사항 작성 권한</h2>
          <p className="text-sm text-neutral-500 mb-4">
            선택된 역할의 직원만 공지사항을 작성·수정·삭제할 수 있습니다.
          </p>
          <form action={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {STAFF_ROLE_OPTIONS.map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    defaultChecked={currentRoles.includes(role)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">
                    {ROLE_LABELS[role]}
                    <span className="text-neutral-400 ml-1 text-xs">({role})</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                저장
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
