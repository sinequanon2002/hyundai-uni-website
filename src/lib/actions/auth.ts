"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";

export async function login(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const next     = formData.get("next")     as string | null;

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error("[login] Supabase auth error:", error?.message);
    redirect("/login?error=invalid_credentials");
  }

  // 역할 조회 — customer vs staff 분기
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role ?? "customer";

  // next 파라미터가 명시된 경우 우선 적용 (open redirect 방지)
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }

  // 역할별 기본 리다이렉트
  redirect(isStaff(role) ? "/admin/inquiries" : "/my");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
