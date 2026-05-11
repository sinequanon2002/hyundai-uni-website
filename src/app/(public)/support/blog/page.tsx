import Link from "next/link";
import { getBlogPosts } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";
import {
  Calendar, Eye, ArrowRight, ChevronLeft, ChevronRight, BookOpen,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "폐기물 정보 블로그 | 현대유앤아이",
  description:
    "지정폐기물 처리 방법, 법령 개정 안내, 올바로시스템 사용법, 업종별 폐기물 가이드 등 폐기물 관련 전문 정보를 제공합니다.",
};

const ITEMS_PER_PAGE = 9;

interface Props {
  searchParams: { category?: string; page?: string };
}

const CATEGORY_STYLE: Record<string, string> = {
  "폐기물 정보":  "bg-blue-100 text-blue-700",
  "법규 안내":    "bg-red-100 text-red-700",
  "처리 사례":    "bg-green-100 text-green-700",
  "올바로시스템": "bg-purple-100 text-purple-700",
  "회사 소식":    "bg-yellow-100 text-yellow-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const category = searchParams.category ?? "";
  const page     = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const result = await getBlogPosts({
    category: category || undefined,
    page,
    pageSize: ITEMS_PER_PAGE,
  });

  const posts      = result.success ? result.data!.posts      : [];
  const total      = result.success ? result.data!.total      : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;
  const categories = result.success ? result.data!.categories : [];

  function buildUrl(params: Record<string, string | number | undefined>) {
    const merged: Record<string, string> = {
      ...(category && { category }),
      page: "1",
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v ?? "")])
      ),
    };
    const clean = Object.entries(merged).filter(([, v]) => v !== "" && v !== "0");
    const qs    = clean.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/support/blog${qs ? `?${qs}` : ""}`;
  }

  const showFeatured = !category && page === 1 && posts.length > 0;
  const [featuredPost, ...restPosts] = posts;
  const gridPosts = showFeatured ? restPosts : posts;

  return (
    <main className="min-h-screen bg-neutral-50">

      {/* ── 히어로 헤더 ── */}
      <section className="bg-[#0C1F2E] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-accent mb-4">
            폐기물 정보 블로그
          </span>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            담당자가 꼭 알아야 할<br className="hidden md:inline" /> 지정폐기물 정보
          </h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
            처리 방법 · 법령 안내 · 올바로시스템 활용 · 업종별 가이드
          </p>
          {total > 0 && (
            <p className="mt-5 text-sm text-neutral-500">
              총 <span className="font-semibold text-neutral-300">{total}</span>건의 글
            </p>
          )}
        </div>
      </section>

      {/* ── 카테고리 탭 (sticky) ── */}
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href={buildUrl({ category: "", page: 1 })}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                !category
                  ? "bg-primary text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              전체
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildUrl({ category: cat, page: 1 })}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                  category === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

        {/* ── 빈 상태 ── */}
        {posts.length === 0 && (
          <div className="text-center py-28 text-neutral-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg text-neutral-500">아직 등록된 글이 없습니다.</p>
            <p className="text-sm mt-2">
              지정폐기물 정보·법령 안내·처리 사례 등 유용한 자료를 곧 업로드할 예정입니다.
            </p>
          </div>
        )}

        {/* ── 피처드 포스트 (전체·1페이지만) ── */}
        {showFeatured && (
          <Link
            href={`/support/blog/${featuredPost.id}`}
            className="group mb-10 flex flex-col md:flex-row bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
          >
            {/* 썸네일 */}
            <div className="md:w-[55%] aspect-[16/9] md:aspect-auto overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative shrink-0">
              {featuredPost.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredPost.thumbnail_url}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary/20" />
                </div>
              )}
              {featuredPost.is_pinned && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-accent text-white rounded-full shadow">
                  추천
                </span>
              )}
            </div>

            {/* 콘텐츠 */}
            <div className="flex flex-col justify-center p-7 md:p-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full",
                  CATEGORY_STYLE[featuredPost.category] ?? "bg-neutral-100 text-neutral-600"
                )}>
                  {featuredPost.category}
                </span>
                <span className="text-xs text-neutral-400 font-medium">최신 글</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
                {featuredPost.title}
              </h2>
              {featuredPost.excerpt && (
                <p className="text-sm text-neutral-500 line-clamp-3 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featuredPost.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {featuredPost.views.toLocaleString()}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-primary font-semibold text-xs group-hover:gap-2 transition-all">
                  읽기 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ── 글 목록 그리드 ── */}
        {gridPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <Link
                key={post.id}
                href={`/support/blog/${post.id}`}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* 썸네일 */}
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative shrink-0">
                  {post.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary/20" />
                    </div>
                  )}
                  {post.is_pinned && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-accent text-white rounded-full">
                      추천
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <span className={cn(
                    "self-start text-xs font-bold px-2.5 py-0.5 rounded-full mb-3",
                    CATEGORY_STYLE[post.category] ?? "bg-neutral-100 text-neutral-600"
                  )}>
                    {post.category}
                  </span>

                  <h3 className="font-bold text-neutral-900 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 text-sm flex-1">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-100 mt-auto">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-12">
            <Link
              href={buildUrl({ page: page - 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-neutral-200 transition-colors",
                page === 1 && "opacity-30 pointer-events-none"
              )}
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
                  p === page
                    ? "bg-primary text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildUrl({ page: page + 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-neutral-200 transition-colors",
                page === totalPages && "opacity-30 pointer-events-none"
              )}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
