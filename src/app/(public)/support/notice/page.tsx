import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { getNotices } from "@/lib/actions/notices";
import { cn } from "@/lib/utils";
import { Pin, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
};

const categoryColorMap: Record<string, string> = {
  "공지": "bg-red-100 text-red-700",
  "법령안내": "bg-blue-100 text-blue-700",
  "회사소식": "bg-green-100 text-green-700",
  "시스템점검": "bg-yellow-100 text-yellow-700",
};

const ITEMS_PER_PAGE = 10;

interface Props {
  searchParams: { page?: string; search?: string; category?: string };
}

export default async function NoticePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";
  const category = searchParams.category ?? "";

  const result = await getNotices({
    page,
    search: search || undefined,
    category: category || undefined,
    pageSize: ITEMS_PER_PAGE,
  });

  const notices = result.success ? result.data!.notices : [];
  const total = result.success ? result.data!.total : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;
  const categories = result.success ? result.data!.categories : [];

  function buildUrl(params: Record<string, string | number | undefined>) {
    const merged = { page: "1", search, category, ...params };
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== "" && v !== "1" || (v === "1" && merged.page !== "1"))
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    return `/support/notice${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">NOTICE</span>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">공지사항</h2>
          <div className="w-12 h-1 bg-accent mt-4" />
        </div>

        {/* 검색 + 카테고리 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* 카테고리 탭 */}
          <div className="flex gap-2 flex-wrap">
            {["전체", ...categories].map((cat) => (
              <Link
                key={cat}
                href={`/support/notice?category=${encodeURIComponent(cat === "전체" ? "" : cat)}`}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  (cat === "전체" ? !category : category === cat)
                    ? "bg-primary text-white shadow-md"
                    : "bg-neutral-100 text-neutral-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* 검색 */}
          <form method="GET" action="/support/notice" className="relative w-full md:w-72">
            {category && <input type="hidden" name="category" value={category} />}
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="제목 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </form>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t-2 border-primary border-b border-gray-200">
                <th className="py-3 px-3 text-center w-16 font-semibold text-neutral-900">번호</th>
                <th className="py-3 px-3 text-center w-24 font-semibold text-neutral-900">분류</th>
                <th className="py-3 px-3 text-left font-semibold text-neutral-900">제목</th>
                <th className="py-3 px-3 text-center w-28 font-semibold text-neutral-900 hidden md:table-cell">작성일</th>
                <th className="py-3 px-3 text-center w-20 font-semibold text-neutral-900 hidden md:table-cell">조회수</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                notices.map((notice, idx) => (
                  <tr
                    key={notice.id}
                    className={cn(
                      "border-b border-gray-100 hover:bg-blue-50/50 transition-colors",
                      notice.is_pinned && "bg-primary/5"
                    )}
                  >
                    <td className="py-3.5 px-3 text-center text-gray-500">
                      {notice.is_pinned ? (
                        <Pin className="w-4 h-4 mx-auto text-primary fill-primary" />
                      ) : (
                        total - (page - 1) * ITEMS_PER_PAGE - idx
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-xs font-medium",
                          categoryColorMap[notice.category] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {notice.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Link
                        href={`/support/notice/${notice.id}`}
                        className="text-neutral-900 hover:text-primary font-medium transition-colors hover:underline"
                      >
                        {notice.is_pinned && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded mr-2 font-bold">공지</span>
                        )}
                        {notice.title}
                      </Link>
                      <span className="block md:hidden text-xs text-gray-400 mt-1">
                        {new Date(notice.created_at).toLocaleDateString("ko-KR")} · 조회 {notice.views}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-500 hidden md:table-cell">
                      {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-500 hidden md:table-cell">
                      {notice.views.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Link
              href={buildUrl({ page: page - 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 transition-colors",
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
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildUrl({ page: page + 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 transition-colors",
                page === totalPages && "opacity-30 pointer-events-none"
              )}
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
