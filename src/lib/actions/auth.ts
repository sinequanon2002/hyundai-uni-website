"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const next     = formData.get("next")     as string | null;

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase auth error:", error.message);
    redirect("/login?error=invalid_credentials");
  }

  // open redirect 방지: 같은 origin의 절대 경로만 허용
  const safeNext = next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/inquiries";

  redirect(safeNext);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
