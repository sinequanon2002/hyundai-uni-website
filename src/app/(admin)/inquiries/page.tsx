import Link from "next/link";
import { getInquiries, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquirySearchInput } from "@/components/admin/InquirySearchInput";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
  };
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all",       label: "전체" },
  { value: "pending",   label: "접수대기" },
  { value: "reviewing", label: "검토중" },
  { value: "quoted",    label: "견적발송" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
];

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const status = (searchParams.status ?? "all") as InquiryStatus | "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";

  const result = await getInquiries({ status, page, search, pageSize: 20 });
  const { inquiries = [], total = 0, totalPages = 1 } =
    result.success && result.data ? result.data : {};

  const buildHref = (params: Record<string, string>) => {
    const base = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(params).forEach(([k, v]) => base.set(k, v));
    return `/admin/inquiries?${base.toString()}`;
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">견적 문의 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {total}건</p>
        </div>
        <InquirySearchInput />
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: "1" })}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
                isActive
                  ? "border-cobalt-600 text-cobalt-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-sm shadow-ds-sm overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            문의 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-36">접수일</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">사업장명</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">소속팀</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">담당자</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">연락처</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">폐기물</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-24">상태</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 w-16">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(inq.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {inq.company_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inq.department ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inq.contact_name}</td>
                  <td className="px-4 py-3 text-slate-600">{inq.phone}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {inq.waste_types[0]}
                    {inq.waste_types.length > 1 && (
                      <span className="text-slate-400 text-xs ml-1">
                        +{inq.waste_types.length - 1}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <InquiryStatusBadge status={inq.status as InquiryStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="text-mint-600 hover:text-cobalt-600 font-medium text-xs"
                    >
                      보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href={buildHref({ page: String(page - 1) })}
            aria-disabled={page <= 1}
            className={`p-2 rounded-lg border transition-colors ${
              page <= 1
                ? "opacity-30 pointer-events-none border-slate-100"
                : "border-slate-200 hover:border-cobalt-600 hover:text-cobalt-600"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-slate-600 px-2">
            {page} / {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(page + 1) })}
            aria-disabled={page >= totalPages}
            className={`p-2 rounded-lg border transition-colors ${
              page >= totalPages
                ? "opacity-30 pointer-events-none border-slate-100"
                : "border-slate-200 hover:border-cobalt-600 hover:text-cobalt-600"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
