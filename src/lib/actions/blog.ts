"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "./inquiry";

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  views: number;
  author_name: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  tags: string[];
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getBlogPosts(
  filters: BlogFilters = {}
): Promise<ActionResult<{ posts: BlogPost[]; total: number; totalPages: number; categories: string[]; allTags: string[] }>> {
  try {
    const { category, tag, search, page = 1, pageSize = 9 } = filters;
    const adminClient = createAdminClient();

    const { data: catData } = await adminClient
      .from("notices")
      .select("category, tags")
      .eq("post_type", "blog");

    const categories = Array.from(new Set((catData ?? []).map((r) => r.category as string))).sort();
    const allTags = Array.from(
      new Set((catData ?? []).flatMap((r) => (r.tags as string[]) ?? []))
    ).sort();

    let query = adminClient
      .from("notices")
      .select("id, created_at, updated_at, title, category, is_pinned, views, author_name, excerpt, thumbnail_url, tags", { count: "exact" })
      .eq("post_type", "blog")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "전체") query = query.eq("category", category);
    if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
    if (tag) query = (query as Parameters<typeof query.contains>[0] extends never ? never : typeof query).contains("tags", [tag]);

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error("[getBlogPosts]", error);
      return { success: false, error: "블로그 글을 불러오는 중 오류가 발생했습니다" };
    }

    return {
      success: true,
      data: {
        posts: (data ?? []) as BlogPost[],
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
        categories,
        allTags,
      },
    };
  } catch (err) {
    console.error("[getBlogPosts] unexpected:", err);
    return { success: false, error: "블로그 글을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function getBlogPostById(id: string): Promise<ActionResult<BlogPost & { content: string }>> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("notices")
      .select("*")
      .eq("id", id)
      .eq("post_type", "blog")
      .single();

    if (error || !data) return { success: false, error: "블로그 글을 찾을 수 없습니다" };
    return { success: true, data: data as BlogPost & { content: string } };
  } catch (err) {
    console.error("[getBlogPostById]", err);
    return { success: false, error: "블로그 글을 불러오는 중 오류가 발생했습니다" };
  }
}

export async function incrementBlogViews(id: string): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.rpc("increment_notice_views", { notice_id: id });
  } catch (err) {
    console.error("[incrementBlogViews]", err);
  }
}
