import Link from "next/link";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { getBlogPosts } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";
import {
  Calendar, Eye, ArrowRight, ChevronLeft, ChevronRight,
  BookOpen, ExternalLink,
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

const CATEGORY_COLOR: Record<string, string> = {
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
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

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
    const qs = clean.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/support/blog${qs ? `?${qs}` : ""}`;
  }

  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-neutral-50">
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      {/* ── 블로그 헤더 ── */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-2 block">
                폐기물 정보 블로그
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                담당자가 꼭 알아야 할<br className="hidden md:inline" /> 지정폐기물 정보
              </h1>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                처리 방법 · 법령 안내 · 올바로시스템 활용 · 업종별 가이드
              </p>
            </div>
            {total > 0 && (
              <p className="text-sm text-neutral-400 shrink-0">
                총 <span className="font-semibold text-neutral-700">{total}</span>건
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 카테고리 탭 ── */}
      <div className="bg-white border-b border-neutral-100 sticky top-[128px] z-30">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            <Link
              href={buildUrl({ category: "", page: 1 })}
              className={cn(
                "shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors",
                !category
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              )}
            >
              전체
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildUrl({ category: cat, page: 1 })}
                className={cn(
                  "shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors",
                  category === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                )}
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">

        {/* ── 빈 상태 ── */}
        {posts.length === 0 && (
          <div className="text-center py-28 text-neutral-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg text-neutral-500">아직 등록된 글이 없습니다.</p>
            <p className="text-sm mt-2 mb-8">
              지정폐기물 정보·법령 안내·처리 사례 등 유용한 자료를 곧 업로드할 예정입니다.
            </p>
            <Link
              href="https://blog.naver.com/hduni2020"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#03C75A] text-white text-sm font-bold rounded-full hover:bg-[#02b350] transition-colors shadow-md"
            >
              <ExternalLink size={15} />
              네이버 블로그에서 먼저 만나보기
            </Link>
          </div>
        )}

        {/* ── 피처드 포스트 ── */}
        {featuredPost && !category && page === 1 && (
          <Link
            href={`/support/blog/${featuredPost.id}`}
            className="group mb-8 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-0 bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 block"
          >
            {/* 이미지 */}
            <div className="aspect-[16/9] md:aspect-auto md:min-h-[260px] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative">
              {featuredPost.thumbnail_url ? (
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
              {/* 추천 배지 */}
              {featuredPost.is_pinned && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-accent text-white rounded-full shadow">
                  추천
                </span>
              )}
            </div>
            {/* 콘텐츠 */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className={cn(
                "self-start text-xs font-bold px-2.5 py-1 rounded-full mb-3",
                CATEGORY_COLOR[featuredPost.category] ?? "bg-gray-100 text-gray-600"
              )}>
                {featuredPost.category}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
                {featuredPost.title}
              </h2>
              {featuredPost.excerpt && (
                <p className="text-sm text-neutral-500 line-clamp-3 mb-5 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
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

        {/* ── 나머지 글 목록 ── */}
        {((!category && page === 1 ? restPosts : posts).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(!category && page === 1 ? restPosts : posts).map((post) => (
              <Link
                key={post.id}
                href={`/support/blog/${post.id}`}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                {/* 썸네일 */}
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                  {post.thumbnail_url ? (
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
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-accent text-white rounded-full">추천</span>
                  )}
                </div>

                <div className="p-5">
                  <span className={cn(
                    "inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2.5",
                    CATEGORY_COLOR[post.category] ?? "bg-gray-100 text-gray-600"
                  )}>
                    {post.category}
                  </span>

                  <h3 className="font-bold text-neutral-900 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 text-sm">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-100">
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
          <div className="flex justify-center items-center gap-1.5 mt-10">
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
                  p === page ? "bg-primary text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-200"
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

        {/* ── 네이버 블로그 CTA ── */}
        {posts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              더 많은 지정폐기물 정보는 네이버 블로그에서 확인하세요.
            </p>
            <Link
              href="https://blog.naver.com/hduni2020"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-primary hover:text-primary transition-colors"
            >
              <ExternalLink size={14} />
              네이버 블로그 바로가기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
