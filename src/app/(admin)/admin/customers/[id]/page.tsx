import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin,
  Package, FileText, Plus, ChevronRight,
} from "lucide-react";
import { getCustomerById } from "@/lib/actions/customers";
import { getDispatches } from "@/lib/actions/dispatches";

const DISPATCH_STATUS_LABEL: Record<string, string> = {
  pending:    "대기",
  scheduled:  "예정",
  in_transit: "수거중",
  completed:  "완료",
  cancelled:  "취소",
};
const DISPATCH_STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  scheduled:  "bg-blue-50 text-blue-700",
  in_transit: "bg-orange-50 text-orange-600",
  completed:  "bg-green-50 text-green-700",
  cancelled:  "bg-slate-100 text-slate-500",
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

interface PageProps { params: { id: string } }

export default async function CustomerDetailPage({ params }: PageProps) {
  const [customerResult, dispatchResult] = await Promise.all([
    getCustomerById(params.id),
    getDispatches({ customer_id: params.id, pageSize: 50 }),
  ]);

  if (!customerResult.success || !customerResult.data) notFound();

  const c = customerResult.data;
  const dispatches = dispatchResult.success ? dispatchResult.data!.dispatches : [];
  const completedRevenue = dispatches
    .filter((d) => d.status === "completed")
    .reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        고객 목록
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cobalt-100 text-cobalt-600 flex items-center justify-center text-lg font-bold shrink-0">
            {c.company_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900">{c.company_name}</h1>
            {c.business_number && (
              <p className="text-sm text-slate-400 font-mono">{c.business_number}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/dispatches/new?customer_id=${c.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            수거 건 등록
          </Link>
          <Link
            href={`/admin/customers/${c.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            수정
          </Link>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard label="총 수거 건수" value={`${dispatches.length}건`} sub="전체" />
        <KpiCard label="완료 건수" value={`${dispatches.filter(d => d.status === "completed").length}건`} sub="수거 완료" />
        <KpiCard label="누적 매출" value={completedRevenue > 0 ? fmt(completedRevenue) : "-"} sub="완료 기준" className="col-span-2 sm:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 상세 정보 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-ds-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">기본 정보</h2>
            <div className="space-y-3">
              {c.ceo_name && <InfoRow icon={User} label="대표자" value={c.ceo_name} />}
              {c.address  && <InfoRow icon={MapPin} label="주소" value={c.address} />}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-ds-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">담당자 정보</h2>
            <div className="space-y-3">
              {c.contact_name  && <InfoRow icon={User}  label="담당자" value={c.contact_name} />}
              {c.contact_phone && (
                <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">연락처</p>
                    <a href={`tel:${c.contact_phone}`} className="text-sm text-cobalt-600 font-medium hover:underline">{c.contact_phone}</a>
                  </div>
                </div>
              )}
              {c.contact_email && (
                <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">이메일</p>
                    <a href={`mailto:${c.contact_email}`} className="text-sm text-cobalt-600 hover:underline truncate block">{c.contact_email}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {c.waste_types.length > 0 && (
            <div className="bg-white rounded-xl shadow-ds-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">주요 폐기물</h2>
              <div className="flex flex-wrap gap-1.5">
                {c.waste_types.map((wt) => (
                  <span key={wt} className="px-2.5 py-1 text-xs bg-cobalt-600/8 text-cobalt-600 rounded-full font-medium">{wt}</span>
                ))}
              </div>
            </div>
          )}

          {c.notes && (
            <div className="bg-white rounded-xl shadow-ds-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">메모</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.notes}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 space-y-1">
            <p>등록일: {new Date(c.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
          </div>
        </div>

        {/* 우측: 수거 이력 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-ds-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">수거 이력</h2>
              <Link href={`/admin/dispatches?customer_id=${c.id}`} className="text-xs text-cobalt-600 hover:underline">전체 보기</Link>
            </div>

            {dispatches.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">수거 이력이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {dispatches.slice(0, 10).map((d) => (
                  <Link key={d.id} href={`/admin/dispatches/${d.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-cobalt-600">{d.dispatch_number}</span>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${DISPATCH_STATUS_COLOR[d.status]}`}>
                          {DISPATCH_STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 truncate">
                        {d.waste_items.map((w) => w.waste_type).join(", ") || "-"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {d.scheduled_date ? new Date(d.scheduled_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "날짜 미정"}
                        {d.assigned_name ? ` · ${d.assigned_name}` : ""}
                      </p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-semibold text-navy-900">{fmt(d.total)}</p>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto mt-1 group-hover:text-cobalt-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, className = "" }: { label: string; value: string; sub: string; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-ds-sm p-4 ${className}`}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-navy-900">{value}</p>
      </div>
    </div>
  );
}
