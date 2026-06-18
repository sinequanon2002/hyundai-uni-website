import Link from "next/link";
import { getBrochureRequests, type BrochureStatus } from "@/lib/actions/brochure";
import { BrochureApproveButton } from "@/components/admin/BrochureApproveButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: { status?: string; page?: string };
}

const STATUS_TABS = [
  { value: "all",      label: "전체" },
  { value: "pending",  label: "대기중" },
  { value: "approved", label: "발송완료" },
  { value: "rejected", label: "반려" },
];

const STATUS_BADGE: Record<BrochureStatus, { label: string; cls: string }> = {
  pending:  { label: "대기중",   cls: "bg-yellow-100 text-yellow-800" },
  approved: { label: "발송완료", cls: "bg-green-100  text-green-800"  },
  rejected: { label: "반려",     cls: "bg-slate-100  text-slate-500"  },
};

export default async function AdminBrochuresPage({ searchParams }: PageProps) {
  const status = (searchParams.status ?? "all") as BrochureStatus | "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const result = await getBrochureRequests({ status, page, pageSize: 20 });
  const { requests = [], total = 0, totalPages = 1 } =
    result.success && result.data ? result.data : {};

  const buildHref = (params: Record<string, string>) => {
    const base = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(params).forEach(([k, v]) => base.set(k, v));
    return `/brochures?${base.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">소개서 신청 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {total}건</p>
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: "1" })}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors",
                isActive
                  ? "border-cobalt-600 text-cobalt-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-ds-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">신청 내역이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-32">신청일</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">이름</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">회사명</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">이메일</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">연락처</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 w-20">마케팅</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-24">상태</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 w-28">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => {
                const badge = STATUS_BADGE[req.status];
                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(req.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{req.name}</td>
                    <td className="px-4 py-3 text-slate-600">{req.company_name}</td>
                    <td className="px-4 py-3 text-slate-600">{req.email}</td>
                    <td className="px-4 py-3 text-slate-600">{req.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", req.marketing_consent ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400")}>
                        {req.marketing_consent ? "동의" : "미동의"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", badge.cls)}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <BrochureApproveButton
                        id={req.id}
                        status={req.status}
                        approvedAt={req.approved_at}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-6">
          <Link
            href={buildHref({ page: String(page - 1) })}
            className={cn("p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600", page === 1 && "opacity-30 pointer-events-none")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                p === page ? "bg-cobalt-600 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {p}
            </Link>
          ))}
          <Link
            href={buildHref({ page: String(page + 1) })}
            className={cn("p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600", page === totalPages && "opacity-30 pointer-events-none")}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
