import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { getNoticeWriteRoles } from "@/lib/actions/settings";
import { NoticeForm } from "@/components/admin/NoticeForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "공지 작성" };

export default async function NewNoticePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) redirect("/login");

  const rolesResult = await getNoticeWriteRoles();
  const allowedRoles = rolesResult.data ?? ["admin", "super_admin"];
  if (!allowedRoles.includes(profile.role as (typeof allowedRoles)[number])) {
    redirect("/admin/notices");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">새 공지 작성</h1>
      </div>
      <div className="bg-white rounded-sm border border-neutral-200 p-6">
        <NoticeForm />
      </div>
    </div>
  );
}
