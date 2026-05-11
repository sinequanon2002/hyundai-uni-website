"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff, type UserRole } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_REGIONS } from "@/lib/constants/portfolio";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  region: string;
  work_date: string; // YYYY-MM-DD
  author_id: string | null;
  author_name: string | null;
}

export interface PortfolioFilters {
  category?: string;
  region?: string;
  year?: string;
  page?: number;
  pageSize?: number;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

async function requireStaff(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

async function getWriteRoles(): Promise<UserRole[]> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "portfolio_write_roles")
    .single();
  return (data?.value as UserRole[]) ?? ["admin", "super_admin"];
}

async function requireWritePermission(): Promise<{
  userId: string;
  authorName: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) throw new Error("접근 권한이 없습니다");

  const allowed = await getWriteRoles();
  if (!allowed.includes(profile.role as UserRole)) {
    throw new Error("갤러리 작성 권한이 없습니다");
  }

  return { userId: user.id, authorName: profile.full_name ?? user.email ?? "직원" };
}

// ─── 공개 조회 ─────────────────────────────────────────────────────────────────

export async function getPortfolioItems(
  filters: PortfolioFilters = {}
): Promise<
  ActionResult<{
    items: PortfolioItem[];
    total: number;
    totalPages: number;
    availableYears: string[];
  }>
> {
  try {
    const { category, region, year, page = 1, pageSize = 12 } = filters;
    const adminClient = createAdminClient();

    // 연도 목록 (필터 UI용)
    const { data: yearData } = await adminClient
      .from("portfolio_items")
      .select("work_date");
    const availableYears = Array.from(
      new Set(
        (yearData ?? [])
          .map((r) => r.work_date?.slice(0, 4))
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => b.localeCompare(a));

    let query = adminClient
      .from("portfolio_items")
      .select("*", { count: "exact" })
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "전체") query = query.eq("category", category);
    if (region && region !== "전체") query = query.eq("region", region);
    if (year) query = query.gte("work_date", `${year}-01-01`).lte("work_date", `${year}-12-31`);

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) return { success: false, error: "갤러리를 불러오는 중 오류가 발생했습니다" };

    const total = count ?? 0;
    return {
      success: true,
      data: {
        items: (data ?? []) as PortfolioItem[],
        total,
        totalPages: Math.ceil(total / pageSize),
        availableYears,
      },
    };
  } catch (err) {
    console.error("[getPortfolioItems]", err);
    return { success: false, error: "갤러리를 불러오는 중 오류가 발생했습니다" };
  }
}

export async function getPortfolioItemById(
  id: string
): Promise<ActionResult<PortfolioItem>> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("portfolio_items")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return { success: false, error: "항목을 찾을 수 없습니다" };
    return { success: true, data: data as PortfolioItem };
  } catch (err) {
    console.error("[getPortfolioItemById]", err);
    return { success: false, error: "항목을 불러오는 중 오류가 발생했습니다" };
  }
}

// ─── 관리자 조회 ──────────────────────────────────────────────────────────────

export async function getPortfolioItemsAdmin(
  filters: PortfolioFilters = {}
): Promise<ActionResult<{ items: PortfolioItem[]; total: number; totalPages: number }>> {
  try {
    await requireStaff();
    const { category, region, year, page = 1, pageSize = 20 } = filters;
    const adminClient = createAdminClient();

    let query = adminClient
      .from("portfolio_items")
      .select("*", { count: "exact" })
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "전체") query = query.eq("category", category);
    if (region && region !== "전체") query = query.eq("region", region);
    if (year) query = query.gte("work_date", `${year}-01-01`).lte("work_date", `${year}-12-31`);

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) return { success: false, error: "갤러리를 불러오는 중 오류가 발생했습니다" };

    const total = count ?? 0;
    return {
      success: true,
      data: {
        items: (data ?? []) as PortfolioItem[],
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    console.error("[getPortfolioItemsAdmin]", err);
    return { success: false, error: "갤러리를 불러오는 중 오류가 발생했습니다" };
  }
}

// ─── 작성 / 수정 / 삭제 ──────────────────────────────────────────────────────

export async function createPortfolioItem(payload: {
  title: string;
  description: string;
  image_url: string;
  category: string;
  region: string;
  work_date: string;
}): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  let authorName: string;
  try {
    ({ userId, authorName } = await requireWritePermission());
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  if (!payload.title.trim()) return { success: false, error: "제목을 입력해주세요" };
  if (!payload.image_url) return { success: false, error: "이미지를 업로드해주세요" };
  if (!payload.work_date) return { success: false, error: "작업일을 선택해주세요" };

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("portfolio_items")
    .insert({
      title: payload.title.trim(),
      description: payload.description.trim() || null,
      image_url: payload.image_url,
      category: payload.category,
      region: payload.region,
      work_date: payload.work_date,
      author_id: userId,
      author_name: authorName,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createPortfolioItem]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }

  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  return { success: true, data: { id: data.id } };
}

export async function updatePortfolioItem(
  id: string,
  payload: {
    title: string;
    description: string;
    image_url: string;
    category: string;
    region: string;
    work_date: string;
  }
): Promise<ActionResult> {
  try {
    await requireWritePermission();
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  if (!payload.title.trim()) return { success: false, error: "제목을 입력해주세요" };
  if (!payload.image_url) return { success: false, error: "이미지를 업로드해주세요" };
  if (!payload.work_date) return { success: false, error: "작업일을 선택해주세요" };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("portfolio_items")
    .update({
      title: payload.title.trim(),
      description: payload.description.trim() || null,
      image_url: payload.image_url,
      category: payload.category,
      region: payload.region,
      work_date: payload.work_date,
    })
    .eq("id", id);

  if (error) {
    console.error("[updatePortfolioItem]", error);
    return { success: false, error: "수정 중 오류가 발생했습니다" };
  }

  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  revalidatePath(`/gallery/${id}/edit`);
  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  return { success: true };
}

export async function deletePortfolioItem(id: string): Promise<ActionResult> {
  try {
    await requireWritePermission();
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "권한이 없습니다" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("portfolio_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deletePortfolioItem]", error);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }

  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  revalidatePath("/gallery"); revalidatePath("/admin/gallery");
  return { success: true };
}

export async function canWritePortfolio(): Promise<boolean> {
  try {
    await requireWritePermission();
    return true;
  } catch {
    return false;
  }
}
