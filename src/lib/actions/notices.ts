"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff, type UserRole } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notice {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  views: number;
  author_id: string | null;
  author_name: string | null;
}

export interface NoticeFilters {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

async function requireStaff(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) throw new Error("접근 권한이 없습니다");
  return profile.full_name ?? user.email ?? "직원";
}

/** site_settings에서 공지 작성 허용 역할 조회 */
async function getWriteRoles(): Promise<UserRole[]> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "notice_write_roles")
    .single();
  return (data?.value as UserRole[]) ?? ["admin", "super_admin"];
}

/** 현재 사용자가 공지 작성 권한이 있는지 확인 */
async function requireWritePermission(): Promise<{ userId: string; authorName: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) throw new Error("접근 권한이 없습니다");

  const allowedRoles = await getWriteRoles();
  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new Error("공지 작성 권한이 없습니다");
  }

  return { userId: user.id, authorName: profile.full_name ?? user.email ?? "직원" };
}

// ─── 공개 조회 ─────────────────────────────────────────────────────────────────

export async function getNotices(
  filters: NoticeFilters = {}
): Promise<ActionResult<{ notices: Notice[]; total: number; totalPages: number; categories: string[] }>> {
  try {
    const { category, search, page = 1, pageSize = 15 } = filters;
    const adminClient = createAdminClient();

    // 카테고리 목록 (UI 필터용)
    const { data: catData } = await adminClient
      .from("notices")
      .select("category");
    const categories = Array.from(new Set((catData ?? []).map((r) => r.category))).sort();

    let query = adminClient
      .from("notices")
      .select("*", { count: "exact" })
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "전체") {
      query = query.eq("category", category);
    }
    if (search?.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error("[getNotices]", error);
      return { success: false, error: "공지사항을 불러오는 중 오류가 발생했습니다" };
    }

    const total = count ?? 0;
    return {
      success: true,
      data: {
        notices: (data ?? []) as Notice[],
        total,
        totalPages: Math.ceil(total / pageSize),
        categories,
      },
    };
  } catch (err) {
    console.error("[getNotices] unexpected:", err);
    return { success: false, error: "공지사항을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function getNoticeById(id: string): Promise<ActionResult<Notice>> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return { success: false, error: "공지사항을 찾을 수 없습니다" };
    return { success: true, data: data as Notice };
  } catch (err) {
    console.error("[getNoticeById]", err);
    return { success: false, error: "공지사항을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function incrementNoticeViews(id: string): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.rpc("increment_notice_views", { notice_id: id });
  } catch (err) {
    console.error("[incrementNoticeViews]", err);
  }
}

// ─── 관리자 조회 ─────────────────────────────────────────────────────────────────

export async function getNoticesAdmin(
  filters: NoticeFilters = {}
): Promise<ActionResult<{ notices: Notice[]; total: number; totalPages: number }>> {
  try {
    await requireStaff();
    const { category, search, page = 1, pageSize = 20 } = filters;
    const adminClient = createAdminClient();

    let query = adminClient
      .from("notices")
      .select("*", { count: "exact" })
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "전체") query = query.eq("category", category);
    if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) return { success: false, error: "공지사항을 불러오는 중 오류가 발생했습니다" };

    const total = count ?? 0;
    return {
      success: true,
      data: { notices: (data ?? []) as Notice[], total, totalPages: Math.ceil(total / pageSize) },
    };
  } catch (err) {
    console.error("[getNoticesAdmin]", err);
    return { success: false, error: "공지사항을 불러오는 중 오류가 발생했습니다" };
  }
}

// ─── 작성 / 수정 / 삭제 ─────────────────────────────────────────────────────────

export async function createNotice(payload: {
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
}): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  let authorName: string;
  try {
    ({ userId, authorName } = await requireWritePermission());
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  if (!payload.title.trim()) return { success: false, error: "제목을 입력해주세요" };
  if (!payload.content.trim()) return { success: false, error: "내용을 입력해주세요" };

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("notices")
    .insert({
      title: payload.title.trim(),
      content: payload.content,
      category: payload.category || "공지",
      is_pinned: payload.is_pinned,
      author_id: userId,
      author_name: authorName,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createNotice]", error);
    return { success: false, error: "공지사항 저장 중 오류가 발생했습니다" };
  }

  revalidatePath("/notices");
  revalidatePath("/support/notice");
  return { success: true, data: { id: data.id } };
}

export async function updateNotice(
  id: string,
  payload: { title: string; content: string; category: string; is_pinned: boolean }
): Promise<ActionResult> {
  try {
    await requireWritePermission();
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  if (!payload.title.trim()) return { success: false, error: "제목을 입력해주세요" };
  if (!payload.content.trim()) return { success: false, error: "내용을 입력해주세요" };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("notices")
    .update({
      title: payload.title.trim(),
      content: payload.content,
      category: payload.category || "공지",
      is_pinned: payload.is_pinned,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateNotice]", error);
    return { success: false, error: "공지사항 수정 중 오류가 발생했습니다" };
  }

  revalidatePath("/notices");
  revalidatePath(`/notices/${id}/edit`);
  revalidatePath("/support/notice");
  revalidatePath(`/support/notice/${id}`);
  return { success: true };
}

export async function deleteNotice(id: string): Promise<ActionResult> {
  try {
    await requireWritePermission();
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("notices").delete().eq("id", id);

  if (error) {
    console.error("[deleteNotice]", error);
    return { success: false, error: "공지사항 삭제 중 오류가 발생했습니다" };
  }

  revalidatePath("/notices");
  revalidatePath("/support/notice");
  return { success: true };
}

/** 현재 사용자가 공지 작성 가능한지 확인 (클라이언트 표시용) */
export async function canWriteNotice(): Promise<boolean> {
  try {
    await requireWritePermission();
    return true;
  } catch {
    return false;
  }
}
