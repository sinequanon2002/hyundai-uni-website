import Link from "next/link";
import { getDispatches } from "@/lib/actions/dispatches";
import type { DispatchStatus } from "@/lib/actions/dispatches";
import { Truck, Plus, Search } from "lucide-react";

const STATUS_LABELS: Record<DispatchStatus | "all", string> = {
  all:        "전체",
  pending:    "대기",
  scheduled:  "예정",
  in_transit: "수거중",
  completed:  "완료",
  cancelled:  "취소",
};

const STATUS_COLORS: Record<DispatchStatus, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  scheduled:  "bg-blue-50 text-blue-700",
  in_transit: "bg-orange-50 text-orange-600",
  completed:  "bg-green-50 text-green-700",
  cancelled:  "bg-slate-100 text-slate-500",
};

interface PageProps {
  searchParams: { status?: string; q?: string; page?: string };
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default async function AdminDispatchesPage({ searchParams }: PageProps) {
  const status  = (searchParams.status as DispatchStatus | "all") ?? "all";
  const search  = searchParams.q ?? "";
  const page    = Number(searchParams.page ?? 1);

  const result = await getDispatches({ status, search, page, pageSize: 20 });
  const { dispatches = [], total = 0, totalPages = 1, counts = {} } = result.success ? result.data! : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900">수거 건 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">총 {total}건</p>
        </div>
        <Link
          href="/admin/dispatches/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          수거 건 등록
        </Link>
      </div>

      {/* 필터 + 검색 */}
      <div className="bg-white rounded-sm shadow-ds-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(STATUS_LABELS) as Array<DispatchStatus | "all">).map((s) => (
            <Link
              key={s}
              href={`/admin/dispatches?status=${s}${search ? `&q=${search}` : ""}`}
              className={[
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                status === s
                  ? "bg-cobalt-600 text-white border-cobalt-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
              {counts[s] !== undefined && (
                <span className="ml-1 opacity-70">({counts[s]})</span>
              )}
            </Link>
          ))}
        </div>
        <form className="flex-1 relative" method="get">
          <input type="hidden" name="status" value={status} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="수거번호, 담당자 검색"
            className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          />
        </form>
      </div>

      {dispatches.length === 0 ? (
        <div className="bg-white rounded-sm shadow-ds-sm p-16 text-center text-slate-400">
          <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">수거 건이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-ds-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">수거번호</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">사업장명</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">상태</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">예정일</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">담당자</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">폐기물</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/dispatches/${d.id}`} className="font-mono text-xs text-cobalt-600 hover:text-mint-600 font-medium">
                        {d.dispatch_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/dispatches/${d.id}`} className="font-medium text-navy-900 hover:text-cobalt-600">
                        {d.customer_name ?? <span className="text-slate-400 italic">미지정</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[d.status]}`}>
                        {STATUS_LABELS[d.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {d.scheduled_date ? new Date(d.scheduled_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.assigned_name ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[140px]">
                      {d.waste_items.map(w => w.waste_type).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-navy-900">{fmt(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="sm:hidden divide-y divide-slate-100">
            {dispatches.map((d) => (
              <Link key={d.id} href={`/admin/dispatches/${d.id}`} className="flex items-start justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cobalt-600">{d.dispatch_number}</span>
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[d.status]}`}>
                      {STATUS_LABELS[d.status]}
                    </span>
                  </div>
                  <p className="font-semibold text-navy-900 text-sm truncate">{d.customer_name ?? "사업장 미지정"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {d.scheduled_date ? new Date(d.scheduled_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "날짜 미정"}
                    {d.assigned_name ? ` · ${d.assigned_name}` : ""}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-bold text-sm text-navy-900">{fmt(d.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/dispatches?status=${status}&q=${search}&page=${p}`}
              className={[
                "w-8 h-8 flex items-center justify-center text-xs rounded-lg border transition-colors",
                p === page ? "bg-cobalt-600 text-white border-cobalt-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
