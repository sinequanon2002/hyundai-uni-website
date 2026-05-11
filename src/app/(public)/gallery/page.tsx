import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { GalleryFilters } from "@/components/GalleryFilters";
import { getPortfolioItems } from "@/lib/actions/portfolio";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_REGIONS } from "@/lib/constants/portfolio";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

const ITEMS_PER_PAGE = 12;

interface Props {
  searchParams: { category?: string; region?: string; year?: string; page?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const region = searchParams.region ?? "";
  const category = searchParams.category ?? "";

  if (region && category) {
    return {
      title: `${region} ${category} 수거·운반 현장`,
      description: `${region} 지역 ${category} 수거·운반 실제 현장 사진. 현대유앤아이의 ${region} 지정폐기물 처리 실적을 확인하세요.`,
    };
  }
  if (region) {
    return {
      title: `${region} 지정폐기물 수거·운반 현장`,
      description: `${region} 지역 지정폐기물 수거·운반 실제 현장 사진. 경상북도·대구 기반 전국 서비스를 제공하는 현대유앤아이의 처리 실적을 확인하세요.`,
    };
  }
  if (category) {
    return {
      title: `${category} 수거·운반 현장`,
      description: `${category} 수거·운반 실제 현장 사진. 현대유앤아이의 전문 지정폐기물 처리 실적과 보유 장비를 확인하세요.`,
    };
  }
  return {
    title: "실적사례",
    description:
      "현대유앤아이의 지정폐기물 수거·운반 실제 현장을 확인하세요. 폐유, 폐산, 폐유기용제, 폐석면 등 다양한 지정폐기물 처리 실적과 보유 장비를 소개합니다.",
  };
}

export default async function GalleryPage({ searchParams }: Props) {
  const category = searchParams.category ?? "";
  const region = searchParams.region ?? "";
  const year = searchParams.year ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const result = await getPortfolioItems({
    category: category || undefined,
    region: region || undefined,
    year: year || undefined,
    page,
    pageSize: ITEMS_PER_PAGE,
  });

  const items = result.success ? result.data!.items : [];
  const total = result.success ? result.data!.total : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;
  const availableYears = result.success ? result.data!.availableYears : [];

  function buildUrl(params: Record<string, string | number | undefined>) {
    const merged: Record<string, string> = {
      ...(category && { category }),
      ...(region && { region }),
      ...(year && { year }),
      page: "1",
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v ?? "")])
      ),
    };
    const clean = Object.entries(merged).filter(([, v]) => v !== "" && v !== "0");
    const qs = clean.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/gallery${qs ? `?${qs}` : ""}`;
  }

  const headingTitle =
    region && category
      ? `${region} ${category} 실적사례`
      : region
      ? `${region} 실적사례`
      : category
      ? `${category} 실적사례`
      : "실적사례";

  return (
    <main className="min-h-screen bg-white">

      {/* ── 페이지 헤더 ── */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-sm font-semibold text-primary mb-3">현장 실적사례</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-3">
                {headingTitle}
              </h1>
              <p className="text-neutral-500 text-base leading-relaxed">
                지정폐기물 수거·운반 실제 현장 사진과 보유 장비를 확인하세요.
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

      {/* ── 카테고리 탭 (sticky) ── */}
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <Link
              href={buildUrl({ category: "", page: 1 })}
              className={cn(
                "shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all",
                !category
                  ? "bg-[#f3f4f6] text-neutral-900 font-semibold"
                  : "text-[#415160] hover:bg-neutral-100"
              )}
            >
              전체
            </Link>
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={buildUrl({ category: cat, page: 1 })}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  category === cat
                    ? "bg-[#f3f4f6] text-neutral-900 font-semibold"
                    : "text-[#415160] hover:bg-neutral-100"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">

        {/* ── 지역·연도 필터 ── */}
        <div className="flex flex-wrap items-end gap-4 mb-8">
          <GalleryFilters
            category={category}
            region={region}
            year={year}
            availableYears={availableYears}
            regions={PORTFOLIO_REGIONS}
          />
          {(category || region || year) && (
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  href={buildUrl({ category: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-[#f0f1f3] text-neutral-600 px-2.5 py-1 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  {category} ×
                </Link>
              )}
              {region && (
                <Link
                  href={buildUrl({ region: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-[#f0f1f3] text-neutral-600 px-2.5 py-1 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  {region} ×
                </Link>
              )}
              {year && (
                <Link
                  href={buildUrl({ year: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-[#f0f1f3] text-neutral-600 px-2.5 py-1 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  {year}년 ×
                </Link>
              )}
              <Link
                href="/gallery"
                className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline"
              >
                전체 초기화
              </Link>
            </div>
          )}
        </div>

        {/* ── 갤러리 그리드 ── */}
        {items.length === 0 ? (
          <div className="text-center py-28 text-neutral-400">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-semibold text-lg text-neutral-500">해당 조건의 실적사례가 없습니다.</p>
            <Link href="/gallery" className="mt-4 inline-block text-sm text-primary hover:underline">
              전체 보기
            </Link>
          </div>
        ) : (
          <GalleryGrid items={items} />
        )}

        {/* ── 페이지네이션 ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-16">
            <Link
              href={buildUrl({ page: page - 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600",
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
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildUrl({ page: page + 1 })}
              className={cn(
                "p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600",
                page === totalPages && "opacity-30 pointer-events-none"
              )}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── 지역별 현장 링크 허브 ── */}
        <section className="mt-16 border-t border-neutral-100 pt-10">
          <h3 className="text-base font-bold text-neutral-800 mb-1">지역별 현장 현황</h3>
          <p className="text-sm text-neutral-500 mb-4">
            경상북도·대구 기반으로 전국 지정폐기물 수거·운반 서비스를 제공합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_REGIONS.map((r) => (
              <Link
                key={r}
                href={buildUrl({ region: r, page: 1 })}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all border",
                  region === r
                    ? "bg-[#f3f4f6] text-neutral-900 font-semibold border-neutral-300"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                )}
              >
                {r} 현장
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
