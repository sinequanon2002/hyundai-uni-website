import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { getNoticeById } from "@/lib/actions/notices";
import { getNoticeWriteRoles } from "@/lib/actions/settings";
import { NoticeForm } from "@/components/admin/NoticeForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "공지 수정" };

interface Props {
  params: { id: string };
}

export default async function EditNoticePage({ params }: Props) {
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

  const result = await getNoticeById(params.id);
  if (!result.success || !result.data) notFound();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">공지 수정</h1>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <NoticeForm notice={result.data} />
      </div>
    </div>
  );
}
