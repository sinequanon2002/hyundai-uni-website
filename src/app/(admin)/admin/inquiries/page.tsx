import Link from "next/link";
import { getInquiries, getAssignableStaff, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquirySearchInput } from "@/components/admin/InquirySearchInput";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

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

  const [result, staffResult] = await Promise.all([
    getInquiries({ status, page, search, pageSize: 20 }),
    getAssignableStaff(),
  ]);
  const { inquiries = [], total = 0, totalPages = 1 } =
    result.success && result.data ? result.data : {};
  const staffMap = Object.fromEntries(
    (staffResult.data ?? []).map((s) => [s.id, s.full_name ?? "이름없음"])
  );

  const buildHref = (params: Record<string, string>) => {
    const base = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(params).forEach(([k, v]) => base.set(k, v));
    return `/admin/inquiries?${base.toString()}`;
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">견적 문의 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {total}건</p>
        </div>
        <InquirySearchInput basePath="/admin/inquiries" />
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: "1" })}
              className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
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

      {/* 목록 */}
      {!result.success ? (
        <div className="bg-white rounded-xl shadow-ds-sm py-16 text-center text-red-400 text-sm">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-ds-sm py-16 text-center text-slate-400 text-sm">
          문의 내역이 없습니다.
        </div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <ul className="md:hidden space-y-3">
            {inquiries.map((inq) => (
              <li key={inq.id}>
                <Link
                  href={`/admin/inquiries/${inq.id}`}
                  className="block bg-white rounded-xl shadow-ds-sm p-4 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="font-bold text-navy-900 text-[15px] leading-tight">
                      {inq.company_name}
                    </span>
                    <InquiryStatusBadge status={inq.status as InquiryStatus} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                    <dt className="text-slate-400">고객사 담당</dt>
                    <dd className="text-slate-700">
                      {inq.contact_name}
                      {inq.department ? ` · ${inq.department}` : ""}
                    </dd>
                    <dt className="text-slate-400">연락처</dt>
                    <dd className="text-slate-700 tabular-nums">{inq.phone}</dd>
                    <dt className="text-slate-400">폐기물</dt>
                    <dd className="text-slate-700">
                      {inq.waste_types[0]}
                      {inq.waste_types.length > 1 && (
                        <span className="text-slate-400"> +{inq.waste_types.length - 1}</span>
                      )}
                    </dd>
                    <dt className="text-slate-400">배정</dt>
                    <dd className={inq.assigned_to ? "text-cobalt-600 font-medium" : "text-slate-400 italic"}>
                      {inq.assigned_to ? (staffMap[inq.assigned_to] ?? "알수없음") : "미배정"}
                    </dd>
                  </dl>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(inq.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </span>
                    <span className="text-xs font-medium text-mint-600">상세 보기 →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block bg-white rounded-xl shadow-ds-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-36">접수일</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">사업장명</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">소속팀</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">고객사 담당</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">연락처</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden xl:table-cell">폐기물</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">
                      <span className="flex items-center gap-1"><UserCircle className="w-3.5 h-3.5" />배정</span>
                    </th>
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
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {inq.department ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{inq.contact_name}</td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{inq.phone}</td>
                      <td className="px-4 py-3 text-slate-600 hidden xl:table-cell">
                        {inq.waste_types[0]}
                        {inq.waste_types.length > 1 && (
                          <span className="text-slate-400 text-xs ml-1">
                            +{inq.waste_types.length - 1}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {inq.assigned_to ? (
                          <span className="text-xs font-medium text-cobalt-600">
                            {staffMap[inq.assigned_to] ?? "알수없음"}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">미배정</span>
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
            </div>
          </div>
        </>
      )}

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
