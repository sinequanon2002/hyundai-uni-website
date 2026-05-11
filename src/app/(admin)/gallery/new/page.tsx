import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { getPortfolioWriteRoles } from "@/lib/actions/settings";
import { GalleryForm } from "@/components/admin/GalleryForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "갤러리 등록" };

export default async function NewGalleryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isStaff(profile.role)) redirect("/login");

  const rolesResult = await getPortfolioWriteRoles();
  const allowed = rolesResult.data ?? ["admin", "super_admin"];
  if (!allowed.includes(profile.role as (typeof allowed)[number])) redirect("/gallery");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">새 갤러리 항목 등록</h1>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <GalleryForm />
      </div>
    </div>
  );
}
