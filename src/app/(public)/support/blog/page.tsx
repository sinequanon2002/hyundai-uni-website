import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { getBlogPosts } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";
import { Calendar, Eye, Tag, ArrowRight, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "폐기물 정보 자료실 | 현대유앤아이",
  description:
    "지정폐기물 처리 방법, 법령 개정 안내, 올바로시스템 사용법, 업종별 폐기물 가이드 등 폐기물 관련 전문 정보를 제공합니다.",
};

const ITEMS_PER_PAGE = 9;

interface Props {
  searchParams: { category?: string; tag?: string; page?: string; q?: string };
}

const categoryColorMap: Record<string, string> = {
  "폐기물 정보":  "bg-blue-100 text-blue-700",
  "법규 안내":    "bg-red-100 text-red-700",
  "처리 사례":    "bg-green-100 text-green-700",
  "올바로시스템": "bg-purple-100 text-purple-700",
  "회사 소식":    "bg-yellow-100 text-yellow-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage({ searchParams }: Props) {
  const category = searchParams.category ?? "";
  const tag = searchParams.tag ?? "";
  const search = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const result = await getBlogPosts({
    category: category || undefined,
    tag: tag || undefined,
    search: search || undefined,
    page,
    pageSize: ITEMS_PER_PAGE,
  });

  const posts = result.success ? result.data!.posts : [];
  const total = result.success ? result.data!.total : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;
  const categories = result.success ? result.data!.categories : [];
  const allTags = result.success ? result.data!.allTags : [];

  function buildUrl(params: Record<string, string | number | undefined>) {
    const merged: Record<string, string> = {
      ...(category && { category }),
      ...(tag && { tag }),
      ...(search && { q: search }),
      page: "1",
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v ?? "")])
      ),
    };
    const clean = Object.entries(merged).filter(([, v]) => v !== "" && v !== "0");
    const qs = clean.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/support/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      {/* 히어로 */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">BLOG &amp; RESOURCES</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">폐기물 정보 자료실</h2>
              <p className="text-neutral-500 text-sm mt-2">
                지정폐기물 처리 방법 · 법령 안내 · 업종별 가이드 · 올바로시스템 활용법
              </p>
              <div className="w-12 h-1 bg-accent mt-4" />
            </div>
            {total > 0 && (
              <p className="text-sm text-neutral-400">
                총 <span className="font-semibold text-neutral-700">{total}</span>건
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* 필터 바 */}
        {(categories.length > 0 || allTags.length > 0) && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-8 shadow-sm space-y-3">
            {/* 카테고리 */}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">카테고리</label>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={buildUrl({ category: "", page: 1 })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    !category ? "bg-primary text-white shadow-sm" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  전체
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl({ category: cat, page: 1 })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      category === cat ? "bg-primary text-white shadow-sm" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* 태그 */}
            {allTags.length > 0 && (
              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">태그</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((t) => (
                    <Link
                      key={t}
                      href={buildUrl({ tag: tag === t ? "" : t, page: 1 })}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs border transition-all",
                        tag === t
                          ? "bg-accent/20 border-accent text-accent font-semibold"
                          : "border-neutral-200 text-neutral-500 hover:border-accent hover:text-accent"
                      )}
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 필터 초기화 */}
            {(category || tag) && (
              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <Link href="/support/blog" className="text-xs text-neutral-400 hover:text-neutral-700 underline">
                  필터 초기화
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-32 text-neutral-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">아직 등록된 글이 없습니다.</p>
            <p className="text-sm mt-2">폐기물 정보·법령 안내·처리 사례 등 유용한 자료를 곧 업로드할 예정입니다.</p>
            <Link href="/support/notice" className="mt-6 inline-block text-sm text-primary hover:underline">
              공지사항 보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/support/blog/${post.id}`}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
              >
                {/* 썸네일 */}
                {post.thumbnail_url ? (
                  <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary/30" />
                  </div>
                )}

                <div className="p-5">
                  {/* 카테고리 배지 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold",
                      categoryColorMap[post.category] ?? "bg-gray-100 text-gray-600"
                    )}>
                      {post.category}
                    </span>
                    {post.is_pinned && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent">추천</span>
                    )}
                  </div>

                  <h3 className="font-bold text-neutral-900 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  )}

                  {/* 태그 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">#{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-auto pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Link
              href={buildUrl({ page: page - 1 })}
              className={cn("p-2 rounded-lg hover:bg-neutral-200 transition-colors", page === 1 && "opacity-30 pointer-events-none")}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl({ page: p })}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                  p === page ? "bg-primary text-white shadow-md" : "text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildUrl({ page: page + 1 })}
              className={cn("p-2 rounded-lg hover:bg-neutral-200 transition-colors", page === totalPages && "opacity-30 pointer-events-none")}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
