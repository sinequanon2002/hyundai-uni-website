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
  rejected: { label: "반려",     cls: "bg-gray-100   text-gray-500"   },
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
    return `/admin/brochures?${base.toString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">소개서 신청 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">전체 {total}건</p>
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: "1" })}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors",
                isActive
                  ? "border-[#0C5F6B] text-[#0C5F6B]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 목록 */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center text-gray-400 text-sm">신청 내역이 없습니다.</div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <ul className="md:hidden space-y-3">
            {requests.map((req) => {
              const badge = STATUS_BADGE[req.status];
              return (
                <li key={req.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-[15px] leading-tight">{req.name}</p>
                      <p className="text-[13px] text-gray-500 mt-0.5 truncate">{req.company_name}</p>
                    </div>
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0", badge.cls)}>
                      {badge.label}
                    </span>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                    <dt className="text-gray-400">이메일</dt>
                    <dd className="text-gray-700 break-all">{req.email}</dd>
                    <dt className="text-gray-400">연락처</dt>
                    <dd className="text-gray-700 tabular-nums">{req.phone}</dd>
                    <dt className="text-gray-400">마케팅</dt>
                    <dd className="text-gray-700">{req.marketing_consent ? "동의" : "미동의"}</dd>
                  </dl>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </span>
                    <BrochureApproveButton
                      id={req.id}
                      status={req.status}
                      approvedAt={req.approved_at}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32">신청일</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">이름</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">회사명</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">이메일</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">연락처</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-20">마케팅</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-24">상태</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => {
                    const badge = STATUS_BADGE[req.status];
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(req.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{req.name}</td>
                        <td className="px-4 py-3 text-gray-600">{req.company_name}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.email}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{req.phone}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", req.marketing_consent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400")}>
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
            </div>
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1.5 mt-6">
          <Link
            href={buildHref({ page: String(page - 1) })}
            className={cn("p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600", page === 1 && "opacity-30 pointer-events-none")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                p === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {p}
            </Link>
          ))}
          <Link
            href={buildHref({ page: String(page + 1) })}
            className={cn("p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600", page === totalPages && "opacity-30 pointer-events-none")}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
