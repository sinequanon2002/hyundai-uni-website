"use client";

interface Props {
  category: string;
  region: string;
  year: string;
  availableYears: string[];
  regions: readonly string[];
}

export function GalleryFilters({ category, region, year, availableYears, regions }: Props) {
  function navigate(newRegion: string, newYear: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (newRegion) params.set("region", newRegion);
    if (newYear) params.set("year", newYear);
    const qs = params.toString();
    window.location.href = `/gallery${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* 지역 */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          지역
        </label>
        <select
          value={region}
          onChange={(e) => navigate(e.target.value, year)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600/30 focus:border-cobalt-600"
        >
          <option value="">전체 지역</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* 연도 */}
      {availableYears.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            연도
          </label>
          <select
            value={year}
            onChange={(e) => navigate(region, e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600/30 focus:border-cobalt-600"
          >
            <option value="">전체 연도</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
