"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, isStaff, type UserRole, USER_ROLES } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";

async function requireAdmin(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) throw new Error("접근 권한이 없습니다");
}

async function requireStaff(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) throw new Error("접근 권한이 없습니다");
}

export async function getNoticeWriteRoles(): Promise<ActionResult<UserRole[]>> {
  try {
    await requireStaff();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("site_settings")
      .select("value")
      .eq("key", "notice_write_roles")
      .single();

    if (error || !data) {
      return { success: true, data: ["admin", "super_admin"] };
    }

    return { success: true, data: data.value as UserRole[] };
  } catch (err) {
    console.error("[getNoticeWriteRoles]", err);
    return { success: false, error: "설정을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function updateNoticeWriteRoles(
  roles: UserRole[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  // 유효한 역할만 허용
  const valid = roles.filter((r) => USER_ROLES.includes(r));
  if (valid.length === 0) {
    return { success: false, error: "최소 1개의 역할을 선택해야 합니다" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("site_settings")
    .upsert({ key: "notice_write_roles", value: valid, updated_by: user?.id })
    .eq("key", "notice_write_roles");

  if (error) {
    console.error("[updateNoticeWriteRoles]", error);
    return { success: false, error: "설정 저장 중 오류가 발생했습니다" };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function getPortfolioWriteRoles(): Promise<ActionResult<UserRole[]>> {
  try {
    await requireStaff();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("site_settings")
      .select("value")
      .eq("key", "portfolio_write_roles")
      .single();

    if (error || !data) {
      return { success: true, data: ["admin", "super_admin"] };
    }

    return { success: true, data: data.value as UserRole[] };
  } catch (err) {
    console.error("[getPortfolioWriteRoles]", err);
    return { success: false, error: "설정을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function updatePortfolioWriteRoles(
  roles: UserRole[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const valid = roles.filter((r) => USER_ROLES.includes(r));
  if (valid.length === 0) {
    return { success: false, error: "최소 1개의 역할을 선택해야 합니다" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("site_settings")
    .upsert({ key: "portfolio_write_roles", value: valid, updated_by: user?.id })
    .eq("key", "portfolio_write_roles");

  if (error) {
    console.error("[updatePortfolioWriteRoles]", error);
    return { success: false, error: "설정 저장 중 오류가 발생했습니다" };
  }

  revalidatePath("/settings");
  return { success: true };
}
