"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { notices, type Notice } from "@/lib/notices";
import { Search, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["전체", "공지", "법령안내", "회사소식", "시스템점검"] as const;
const ITEMS_PER_PAGE = 10;

const categoryColorMap: Record<string, string> = {
  "공지": "bg-red-100 text-red-700",
  "법령안내": "bg-blue-100 text-blue-700",
  "회사소식": "bg-green-100 text-green-700",
  "시스템점검": "bg-yellow-100 text-yellow-700",
};

export default function NoticePage() {
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...notices];
    if (activeCategory !== "전체") {
      list = list.filter((n) => n.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q));
    }
    // 상단 고정 먼저, 그 다음 날짜 내림차순
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return list;
  }, [activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* 섹션 타이틀 */}
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">NOTICE</span>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">공지사항</h2>
          <div className="w-12 h-1 bg-accent mt-4"></div>
        </div>

        {/* 검색 + 카테고리 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* 카테고리 탭 */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-neutral-100 text-neutral-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 검색바 */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="제목 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" id="notice-table">
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                paginated.map((notice) => (
                  <tr
                    key={notice.id}
                    className={cn(
                      "border-b border-gray-100 hover:bg-blue-50/50 transition-colors",
                      notice.isPinned && "bg-primary/5"
                    )}
                  >
                    <td className="py-3.5 px-3 text-center text-gray-500">
                      {notice.isPinned ? (
                        <Pin className="w-4 h-4 mx-auto text-primary fill-primary" />
                      ) : (
                        notice.id
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-xs font-medium",
                          categoryColorMap[notice.category] || "bg-gray-100 text-gray-600"
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
                        {notice.isPinned && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded mr-2 font-bold">공지</span>
                        )}
                        {notice.title}
                      </Link>
                      <span className="block md:hidden text-xs text-gray-400 mt-1">{notice.date} · 조회 {notice.views}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-500 hidden md:table-cell">{notice.date}</td>
                    <td className="py-3.5 px-3 text-center text-gray-500 hidden md:table-cell">{notice.views.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                  currentPage === page
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}



