import Link from "next/link";
import { getInvoices } from "@/lib/actions/dispatches";
import { InvoiceStatusButton } from "@/components/admin/InvoiceStatusButton";
import { FileText } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  all:       "전체",
  pending:   "발행 대기",
  issued:    "발행 완료",
  paid:      "수납 완료",
  cancelled: "취소",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700",
  issued:    "bg-blue-50 text-blue-700",
  paid:      "bg-green-50 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
};

function fmt(n: number) { return n.toLocaleString("ko-KR") + "원"; }

interface PageProps {
  searchParams: { status?: string; page?: string };
}

export default async function AdminInvoicesPage({ searchParams }: PageProps) {
  const status   = (searchParams.status as "pending" | "issued" | "paid" | "cancelled" | "all") ?? "all";
  const page     = Number(searchParams.page ?? 1);

  const result = await getInvoices({ status, page, pageSize: 20 });
  const { invoices = [], total = 0, totalPages = 1 } = result.success ? result.data! : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900">세금계산서 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">수거 완료 시 자동 생성 · 총 {total}건</p>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="bg-white rounded-xl shadow-ds-sm p-4 mb-4">
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(STATUS_LABELS) as Array<"all" | "pending" | "issued" | "paid" | "cancelled">).map((s) => (
            <Link
              key={s}
              href={`/admin/invoices?status=${s}`}
              className={[
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                status === s
                  ? "bg-cobalt-600 text-white border-cobalt-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-ds-sm p-16 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">세금계산서가 없습니다</p>
          <p className="text-xs mt-1">수거 건이 완료 처리되면 자동으로 생성됩니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-ds-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">계산서 번호</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">수거 번호</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">사업장명</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">상태</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">금액</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">발행일</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">납부기한</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-cobalt-600 font-medium">{inv.invoice_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.dispatch_number
                        ? <Link href={`/admin/dispatches/${(inv as Record<string,unknown>).dispatch_id as string ?? ""}`} className="font-mono text-xs text-slate-500 hover:text-cobalt-600">{inv.dispatch_number}</Link>
                        : <span className="text-slate-400">-</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{inv.customer_name ?? "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-navy-900">{fmt(inv.total)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusButton invoiceId={inv.id} currentStatus={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="sm:hidden divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs text-cobalt-600">{inv.invoice_number}</span>
                    <p className="font-semibold text-navy-900 text-sm mt-0.5">{inv.customer_name ?? "-"}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[inv.status]}`}>
                    {STATUS_LABELS[inv.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-navy-900">{fmt(inv.total)}</p>
                  <InvoiceStatusButton invoiceId={inv.id} currentStatus={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/invoices?status=${status}&page=${p}`}
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
