import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, USER_ROLES, ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import {
  getNoticeWriteRoles,
  updateNoticeWriteRoles,
  getPortfolioWriteRoles,
  updatePortfolioWriteRoles,
} from "@/lib/actions/settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "설정 | 현대유앤아이" };

const STAFF_ROLE_OPTIONS: UserRole[] = USER_ROLES.filter((r) => r !== "customer");

function RoleCheckboxGroup({
  name,
  current,
  options,
}: {
  name: string;
  current: UserRole[];
  options: UserRole[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((role) => (
        <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name={name}
            value={role}
            defaultChecked={current.includes(role)}
            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-neutral-700">
            {ROLE_LABELS[role]}
            <span className="text-neutral-400 ml-1 text-xs">({role})</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isAdmin(profile.role)) redirect("/inquiries");

  const [noticeRolesResult, portfolioRolesResult] = await Promise.all([
    getNoticeWriteRoles(),
    getPortfolioWriteRoles(),
  ]);
  const noticeRoles = noticeRolesResult.data ?? ["admin", "super_admin"];
  const portfolioRoles = portfolioRolesResult.data ?? ["admin", "super_admin"];

  async function handleNoticeUpdate(formData: FormData) {
    "use server";
    const selected = formData.getAll("roles") as UserRole[];
    await updateNoticeWriteRoles(selected);
    redirect("/settings");
  }

  async function handlePortfolioUpdate(formData: FormData) {
    "use server";
    const selected = formData.getAll("roles") as UserRole[];
    await updatePortfolioWriteRoles(selected);
    redirect("/settings");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-neutral-900">사이트 설정</h1>

      {/* ── 공지사항 작성 권한 ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-1">공지사항 작성 권한</h2>
        <p className="text-sm text-neutral-500 mb-4">
          선택된 역할의 직원만 공지사항을 작성·수정·삭제할 수 있습니다.
        </p>
        <form action={handleNoticeUpdate} className="space-y-4">
          <RoleCheckboxGroup name="roles" current={noticeRoles} options={STAFF_ROLE_OPTIONS} />
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            저장
          </button>
        </form>
      </div>

      {/* ── 현장갤러리 작성 권한 ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-1">현장갤러리 작성 권한</h2>
        <p className="text-sm text-neutral-500 mb-4">
          선택된 역할의 직원만 현장갤러리를 등록·수정·삭제할 수 있습니다.
        </p>
        <form action={handlePortfolioUpdate} className="space-y-4">
          <RoleCheckboxGroup name="roles" current={portfolioRoles} options={STAFF_ROLE_OPTIONS} />
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            저장
          </button>
        </form>
      </div>
    </div>
  );
}
