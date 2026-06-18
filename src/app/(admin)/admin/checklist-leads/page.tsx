import { getChecklistLeads } from "@/lib/actions/checklist";
import { Phone, Building2, Calendar } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ChecklistLeadsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const result = await getChecklistLeads({ page, pageSize: 30 });

  if (!result.success) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{result.error ?? "접근 권한이 없습니다"}</p>
      </div>
    );
  }

  const { leads, total, totalPages } = result.data!;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-900">체크리스트 리드</h1>
        <p className="text-sm text-slate-500 mt-1">
          올바로시스템 체크리스트 무료 다운로드 신청자 목록 · 총 <strong>{total}</strong>명
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">아직 신청자가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-ds-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">연락처</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">회사명</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">신청일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead, idx) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 tabular-nums">
                    {(page - 1) * 30 + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 font-medium text-navy-900 hover:text-cobalt-600 transition-colors"
                    >
                      <Phone size={13} className="text-cobalt-500 shrink-0" />
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.company_name ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        {lead.company_name}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 tabular-nums text-xs whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(lead.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-cobalt-600 text-white font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
