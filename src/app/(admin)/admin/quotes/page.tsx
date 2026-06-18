import Link from "next/link";
import { getQuotations } from "@/lib/actions/quotes";
import type { QuoteStatus } from "@/lib/actions/quotes";
import { FileText, Plus, Search } from "lucide-react";

const STATUS_LABELS: Record<QuoteStatus | "all", string> = {
  all:      "전체",
  draft:    "작성중",
  sent:     "발송됨",
  accepted: "수락",
  rejected: "거절",
  expired:  "만료",
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft:    "bg-gray-100 text-gray-600",
  sent:     "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  expired:  "bg-orange-50 text-orange-600",
};

interface PageProps {
  searchParams: { status?: string; q?: string; page?: string };
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default async function AdminQuotesPage({ searchParams }: PageProps) {
  const status = (searchParams.status as QuoteStatus | "all") ?? "all";
  const search = searchParams.q ?? "";
  const page   = Number(searchParams.page ?? 1);

  const result = await getQuotations({ status, search, page, pageSize: 20 });
  const { quotations = [], total = 0, totalPages = 1 } = result.success ? result.data! : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">견적서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {total}건</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          견적서 작성
        </Link>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        {/* 상태 탭 */}
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(STATUS_LABELS) as Array<QuoteStatus | "all">).map((s) => (
            <Link
              key={s}
              href={`/admin/quotes?status=${s}${search ? `&q=${search}` : ""}`}
              className={[
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                status === s
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* 검색 */}
        <form className="flex-1 relative" method="get">
          <input type="hidden" name="status" value={status} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="견적번호, 사업장명 검색"
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
      </div>

      {/* 테이블 */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">견적서가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">견적번호</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">사업장명</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">담당자</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">합계금액</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">상태</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">유효기간</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="font-mono text-xs text-primary hover:text-secondary font-medium">
                        {q.quote_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {q.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{q.contact_name}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(q.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[q.status]}`}>
                        {STATUS_LABELS[q.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(q.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="sm:hidden divide-y divide-gray-100">
            {quotations.map((q) => (
              <Link key={q.id} href={`/admin/quotes/${q.id}`} className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-primary">{q.quote_number}</span>
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[q.status]}`}>
                      {STATUS_LABELS[q.status]}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">{q.company_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{q.contact_name}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-bold text-sm text-gray-900">{fmt(q.total)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(q.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/quotes?status=${status}&q=${search}&page=${p}`}
              className={[
                "w-8 h-8 flex items-center justify-center text-xs rounded-lg border transition-colors",
                p === page
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
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
