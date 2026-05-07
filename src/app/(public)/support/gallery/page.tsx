import Link from "next/link";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
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
      title: `${region} ${category} 수거·운반 현장 | 현대유앤아이`,
      description: `${region} 지역 ${category} 수거·운반 실제 현장 사진. 현대유앤아이의 ${region} 지정폐기물 처리 실적을 확인하세요.`,
    };
  }
  if (region) {
    return {
      title: `${region} 지정폐기물 수거·운반 현장 | 현대유앤아이`,
      description: `${region} 지역 지정폐기물 수거·운반 실제 현장 사진. 경상북도·대구 기반 전국 서비스를 제공하는 현대유앤아이의 처리 실적을 확인하세요.`,
    };
  }
  if (category) {
    return {
      title: `${category} 수거·운반 현장 | 현대유앤아이`,
      description: `${category} 수거·운반 실제 현장 사진. 현대유앤아이의 전문 지정폐기물 처리 실적과 보유 장비를 확인하세요.`,
    };
  }
  return {
    title: "현장갤러리 | 현대유앤아이",
    description:
      "현대유앤아이의 지정폐기물 수거·운반 현장을 확인하세요. 폐유, 폐산, 폐유기용제, 폐석면 등 다양한 지정폐기물 처리 실적과 보유 장비를 소개합니다.",
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

  // Link용 URL 빌더 (서버에서만 사용 — 이벤트 핸들러 없음)
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
    return `/support/gallery${qs ? `?${qs}` : ""}`;
  }

  // 동적 헤딩 텍스트
  const headingTitle =
    region && category
      ? `${region} ${category} 현장`
      : region
      ? `${region} 현장갤러리`
      : category
      ? `${category} 현장갤러리`
      : "현장갤러리";

  const headingDesc =
    region || category
      ? `${[region, category].filter(Boolean).join(" ")} 지정폐기물 수거·운반 실제 작업 현장을 확인하세요.`
      : "지정폐기물 수거·운반 현장 사진과 보유 장비를 확인하세요.";

  return (
    <main className="min-h-screen bg-neutral-50">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      {/* 히어로 */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">GALLERY</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">{headingTitle}</h2>
              <p className="text-neutral-500 text-sm mt-2">{headingDesc}</p>
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
        {/* ── 필터 바 ── */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            {/* 폐기물 종류: Link 탭 (Server) */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wide">
                폐기물 종류
              </label>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={buildUrl({ category: "", page: 1 })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    !category
                      ? "bg-primary text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  전체
                </Link>
                {PORTFOLIO_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl({ category: cat, page: 1 })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
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

            {/* 지역·연도: Client Component (onChange 필요) */}
            <GalleryFilters
              category={category}
              region={region}
              year={year}
              availableYears={availableYears}
              regions={PORTFOLIO_REGIONS}
            />

            {/* 필터 초기화 */}
            {(category || region || year) && (
              <Link
                href="/support/gallery"
                className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline self-end pb-1.5"
              >
                필터 초기화
              </Link>
            )}
          </div>

          {/* 활성 필터 배지 */}
          {(category || region || year) && (
            <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
              {category && (
                <Link
                  href={buildUrl({ category: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {category} ×
                </Link>
              )}
              {region && (
                <Link
                  href={buildUrl({ region: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full hover:bg-secondary/20 transition-colors"
                >
                  {region} ×
                </Link>
              )}
              {year && (
                <Link
                  href={buildUrl({ year: "", page: 1 })}
                  className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full hover:bg-accent/20 transition-colors"
                >
                  {year}년 ×
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── 갤러리 그리드 ── */}
        {items.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-medium">해당 조건의 갤러리 항목이 없습니다.</p>
            <Link href="/support/gallery" className="mt-4 inline-block text-sm text-primary hover:underline">
              전체 보기
            </Link>
          </div>
        ) : (
          <GalleryGrid items={items} />
        )}

        {/* ── 페이지네이션 ── */}
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

        {/* ── 지역별 현장 링크 허브 ── */}
        <section className="mt-16 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-neutral-800 mb-1">지역별 현장 현황</h3>
          <p className="text-xs text-neutral-500 mb-4">
            경상북도·대구 기반으로 전국 지정폐기물 수거·운반 서비스를 제공합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_REGIONS.map((r) => (
              <Link
                key={r}
                href={buildUrl({ region: r, page: 1 })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  region === r
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-primary hover:text-primary"
                )}
              >
                {r} 현장
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
