import Link from "next/link";
import { getCustomers } from "@/lib/actions/customers";
import { Building2, Plus, Search, Users } from "lucide-react";

interface PageProps {
  searchParams: { q?: string; page?: string };
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const search = searchParams.q ?? "";
  const page   = Number(searchParams.page ?? 1);

  const result = await getCustomers({ search, page, pageSize: 20 });
  const { customers = [], total = 0, totalPages = 1 } = result.success ? result.data! : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">고객 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">등록된 배출 사업장 {total}곳</p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          고객 등록
        </Link>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <form method="get" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={search}
            placeholder="사업장명, 담당자명, 사업자번호 검색"
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
      </div>

      {/* 리스트 */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 고객이 없습니다</p>
          <Link href="/admin/customers/new" className="mt-3 inline-block text-sm text-primary hover:underline">
            첫 고객 등록하기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">사업장명</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">사업자번호</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">담당자</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">연락처</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">수거 건수</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">누적 매출</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">등록일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {c.company_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.company_name}</p>
                          {c.waste_types.length > 0 && (
                            <p className="text-xs text-gray-400">{c.waste_types.slice(0, 2).join(", ")}{c.waste_types.length > 2 ? ` 외 ${c.waste_types.length - 2}종` : ""}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.business_number ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{c.contact_name ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.contact_phone ?? "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold bg-primary/10 text-primary rounded-full">
                        {c.dispatch_count ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {c.total_revenue ? fmt(c.total_revenue) : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="sm:hidden divide-y divide-gray-100">
            {customers.map((c) => (
              <Link key={c.id} href={`/admin/customers/${c.id}`} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {c.company_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.company_name}</p>
                  {c.contact_name && <p className="text-xs text-gray-500 mt-0.5">{c.contact_name} {c.contact_phone ? `· ${c.contact_phone}` : ""}</p>}
                  {c.waste_types.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{c.waste_types.slice(0, 2).join(", ")}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">수거 {c.dispatch_count ?? 0}건</p>
                  {(c.total_revenue ?? 0) > 0 && (
                    <p className="text-sm font-semibold text-primary mt-0.5">{fmt(c.total_revenue!)}</p>
                  )}
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
              href={`/admin/customers?q=${search}&page=${p}`}
              className={[
                "w-8 h-8 flex items-center justify-center text-xs rounded-lg border transition-colors",
                p === page ? "bg-primary text-white border-primary" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
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
