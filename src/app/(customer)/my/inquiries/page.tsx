import type { Metadata } from "next";
import Link from "next/link";
import { getMyInquiries } from "@/lib/actions/customer";

export const metadata: Metadata = {
  title: "문의 내역 | 마이페이지",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  all:       "전체",
  pending:   "접수 완료",
  reviewing: "검토 중",
  quoted:    "견적 발송",
  completed: "처리 완료",
  cancelled: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  quoted:    "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_TABS = ["all", "pending", "reviewing", "quoted", "completed", "cancelled"] as const;

interface PageProps {
  searchParams: { status?: string; page?: string };
}

export default async function MyInquiriesPage({ searchParams }: PageProps) {
  const status = searchParams.status ?? "all";
  const page = Number(searchParams.page ?? 1);
  const pageSize = 10;

  const result = await getMyInquiries({ status, page, pageSize });
  const inquiries = result.data?.inquiries ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = result.data?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-dark">문의 내역</h1>
        <Link
          href="/support/inquiry"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
        >
          새 문의
        </Link>
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={`/my/inquiries?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === s
                ? "bg-primary text-white"
                : "bg-white text-neutral-mid border border-gray-200 hover:border-primary/40"
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {inquiries.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-neutral-mid">해당하는 문의 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {inquiries.map((inq) => (
              <li key={inq.id}>
                <Link
                  href={`/my/inquiries/${inq.id}`}
                  className="flex items-start justify-between px-5 py-4 hover:bg-neutral-light transition-colors gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[inq.status] ?? ""}`}>
                        {STATUS_LABEL[inq.status] ?? inq.status}
                      </span>
                      <span className="text-xs text-neutral-mid">
                        {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-dark mt-1.5 truncate">
                      {inq.waste_types.join(", ")}
                    </p>
                    {inq.message && (
                      <p className="text-xs text-neutral-mid mt-1 truncate">{inq.message}</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/my/inquiries?status=${status}&page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-neutral-mid hover:border-primary/40"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-mid text-right">총 {total}건</p>
    </div>
  );
}
