"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, USER_ROLES, type UserRole } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
}

// ─── 권한 검증 헬퍼 ──────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) {
    throw new Error("최고 관리자(admin) 권한이 필요합니다");
  }
}

// ─── 사용자 목록 조회 ─────────────────────────────────────────────────────────────

export async function getStaffUsers(): Promise<ActionResult<StaffUser[]>> {
  try {
    await requireAdmin();

    const adminClient = createAdminClient();

    // profiles 테이블에서 customer 제외한 직원 목록 조회
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .neq("role", "customer")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return { success: false, error: "사용자 목록을 불러오는 중 오류가 발생했습니다" };
    }

    // Auth 정보에서 마지막 로그인 시간 가져오기
    const { data: authUsers, error: authError } =
      await adminClient.auth.admin.listUsers();

    if (authError) {
      // 실패해도 profiles 데이터는 반환
      return {
        success: true,
        data: (profiles ?? []).map((p) => ({
          ...p,
          last_sign_in_at: null,
        })) as StaffUser[],
      };
    }

    const authMap = new Map(
      authUsers.users.map((u) => [u.id, u.last_sign_in_at ?? null])
    );

    const users: StaffUser[] = (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role as UserRole,
      created_at: p.created_at,
      last_sign_in_at: authMap.get(p.id) ?? null,
    }));

    return { success: true, data: users };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "오류가 발생했습니다";
    return { success: false, error: msg };
  }
}

// ─── 역할 변경 ────────────────────────────────────────────────────────────────────

export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!USER_ROLES.includes(newRole)) {
      return { success: false, error: "유효하지 않은 역할입니다" };
    }

    const supabase = createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // 자기 자신의 역할은 변경 불가
    if (currentUser?.id === targetUserId) {
      return { success: false, error: "자신의 역할은 변경할 수 없습니다" };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (error) {
      return { success: false, error: "역할 변경 중 오류가 발생했습니다" };
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "오류가 발생했습니다";
    return { success: false, error: msg };
  }
}

// ─── 직원 계정 생성 ───────────────────────────────────────────────────────────────

export async function createStaffUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!email || !password || password.length < 8) {
      return { success: false, error: "이메일과 비밀번호(8자 이상)를 입력하세요" };
    }

    if (!USER_ROLES.includes(role) || role === "customer") {
      return { success: false, error: "유효한 직원 역할을 선택하세요" };
    }

    const adminClient = createAdminClient();

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { success: false, error: "이미 등록된 이메일입니다" };
      }
      return { success: false, error: "계정 생성 중 오류가 발생했습니다" };
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role, full_name: fullName || null })
      .eq("id", authData.user.id);

    if (profileError) {
      // Auth 계정은 생성됐으나 역할 설정 실패 — 부분 성공
      console.error("[createStaffUser] profile update error:", profileError);
      return {
        success: true,
        data: { id: authData.user.id },
        error: "계정은 생성됐으나 역할 설정에 실패했습니다. 역할을 수동으로 변경하세요.",
      };
    }

    revalidatePath("/users");
    return { success: true, data: { id: authData.user.id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "오류가 발생했습니다";
    return { success: false, error: msg };
  }
}

// ─── 계정 삭제 ────────────────────────────────────────────────────────────────────

export async function deleteStaffUser(targetUserId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser?.id === targetUserId) {
      return { success: false, error: "자신의 계정은 삭제할 수 없습니다" };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (error) {
      return { success: false, error: "계정 삭제 중 오류가 발생했습니다" };
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "오류가 발생했습니다";
    return { success: false, error: msg };
  }
}
