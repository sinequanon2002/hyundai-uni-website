import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, Calendar, MapPin, User, FileText } from "lucide-react";
import { getDispatchById } from "@/lib/actions/dispatches";
import { DispatchStatusButton } from "@/components/admin/DispatchStatusButton";

const STATUS_LABELS: Record<string, string> = {
  pending:    "대기",
  scheduled:  "예정",
  in_transit: "수거중",
  completed:  "완료",
  cancelled:  "취소",
};

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border border-yellow-200",
  scheduled:  "bg-blue-50 text-blue-700 border border-blue-200",
  in_transit: "bg-orange-50 text-orange-600 border border-orange-200",
  completed:  "bg-green-50 text-green-700 border border-green-200",
  cancelled:  "bg-gray-100 text-gray-500 border border-gray-200",
};

function fmt(n: number) { return n.toLocaleString("ko-KR") + "원"; }

interface PageProps { params: { id: string } }

export default async function DispatchDetailPage({ params }: PageProps) {
  const result = await getDispatchById(params.id);
  if (!result.success || !result.data) notFound();

  const d = result.data;

  return (
    <div>
      <Link href="/admin/dispatches" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        수거 건 목록
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-primary">{d.dispatch_number}</span>
            <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[d.status]}`}>
              {STATUS_LABELS[d.status]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {d.customer_name ?? "사업장 미지정"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DispatchStatusButton dispatchId={d.id} currentStatus={d.status} />
          <Link
            href={`/admin/dispatches/${d.id}/edit`}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            수정
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 기본 정보 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">수거 정보</h2>
            <div className="space-y-3">
              {d.customer_name && (
                <InfoRow icon={Truck} label="배출 사업장">
                  {d.customer_id
                    ? <Link href={`/admin/customers/${d.customer_id}`} className="text-primary hover:underline font-medium">{d.customer_name}</Link>
                    : <span>{d.customer_name}</span>
                  }
                </InfoRow>
              )}
              <InfoRow icon={Calendar} label="수거 예정일">
                <span>{d.scheduled_date ? new Date(d.scheduled_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"}</span>
              </InfoRow>
              {d.actual_date && (
                <InfoRow icon={Calendar} label="실제 수거일">
                  <span>{new Date(d.actual_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                </InfoRow>
              )}
              {d.collection_address && (
                <InfoRow icon={MapPin} label="수거 주소">
                  <span>{d.collection_address}</span>
                </InfoRow>
              )}
              {d.assigned_name && (
                <InfoRow icon={User} label="담당자">
                  <span>{d.assigned_name}</span>
                </InfoRow>
              )}
              {d.created_by_name && (
                <InfoRow icon={User} label="등록자">
                  <span className="text-gray-500">{d.created_by_name}</span>
                </InfoRow>
              )}
            </div>
          </div>

          {d.quotation_id && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">연결된 견적서</h2>
              <Link href={`/admin/quotes/${d.quotation_id}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <FileText className="w-4 h-4" />
                견적서 보기
              </Link>
            </div>
          )}

          {d.notes && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">메모</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{d.notes}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
            <p>등록일: {new Date(d.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
          </div>
        </div>

        {/* 우측: 폐기물 항목 + 금액 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">폐기물 항목</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">폐기물 종류</th>
                    <th className="text-center px-4 py-2.5 text-xs text-gray-500 font-medium">단위</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">예상 수량</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">단가</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.waste_items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.waste_type}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.estimated_qty}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>공급가액</span><span>{fmt(d.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>부가세 (10%)</span><span>{fmt(d.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>합계</span>
                <span className="text-primary">{fmt(d.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <div className="text-sm text-gray-800">{children}</div>
      </div>
    </div>
  );
}
