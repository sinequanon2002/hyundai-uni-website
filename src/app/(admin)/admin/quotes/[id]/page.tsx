import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuotationById, generateQuotePdf, sendQuotation } from "@/lib/actions/quotes";
import type { QuoteStatus } from "@/lib/actions/quotes";
import {
  ArrowLeft, Download, Send, FileText, Building2,
  User, Phone, Mail, MapPin, Calendar, Truck,
} from "lucide-react";
import { SendQuoteButton } from "@/components/admin/SendQuoteButton";
import { GeneratePdfButton } from "@/components/admin/GeneratePdfButton";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft:    "작성중",
  sent:     "발송됨",
  accepted: "수락",
  rejected: "거절",
  expired:  "만료",
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft:    "bg-gray-100 text-gray-600",
  sent:     "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  expired:  "bg-orange-50 text-orange-600",
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

interface PageProps {
  params: { id: string };
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const result = await getQuotationById(params.id);
  if (!result.success || !result.data) notFound();

  const q = result.data;

  return (
    <div>
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        견적서 목록
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-navy-900 font-mono">{q.quote_number}</h1>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[q.status]}`}>
              {STATUS_LABELS[q.status]}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{q.company_name}</p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 flex-wrap">
          {q.pdf_url ? (
            <a
              href={q.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF 다운로드
            </a>
          ) : (
            <GeneratePdfButton quoteId={q.id} />
          )}
          {q.status === "draft" && (
            <SendQuoteButton quoteId={q.id} email={q.email} />
          )}
          <Link
            href={`/admin/dispatches/new?quotation_id=${q.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-cobalt-600/30 bg-cobalt-50 text-cobalt-600 rounded-lg hover:bg-cobalt-100 transition-colors"
          >
            <Truck className="w-4 h-4" />
            수거 건 생성
          </Link>
          <Link
            href={`/admin/inquiries/${q.inquiry_id}`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            원본 문의
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 수신처 + 항목 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 고객 정보 */}
          <div className="bg-white rounded-xl shadow-ds-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">수신처 정보</h2>
            <div className="space-y-3">
              <Row icon={Building2} label="사업장명" value={q.company_name} />
              <Row icon={User}      label="담당자"   value={q.contact_name} />
              <Row icon={Phone}     label="전화번호" value={q.phone} />
              <Row icon={Mail}      label="이메일"   value={q.email} />
              {q.address && <Row icon={MapPin} label="주소" value={q.address} />}
            </div>
          </div>

          {/* 견적 항목 테이블 */}
          <div className="bg-white rounded-xl shadow-ds-sm overflow-hidden">
            <div className="p-5 sm:p-6 pb-0">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">견적 항목</h2>
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden sm:block overflow-x-auto px-5 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-xs text-slate-400 font-medium w-8">No.</th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium">폐기물 종류</th>
                    <th className="text-center py-2 text-xs text-slate-400 font-medium w-16">단위</th>
                    <th className="text-right py-2 text-xs text-slate-400 font-medium w-20">수량</th>
                    <th className="text-right py-2 text-xs text-slate-400 font-medium w-28">단가(원)</th>
                    <th className="text-right py-2 text-xs text-slate-400 font-medium w-32">금액(원)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {q.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 text-slate-400 text-xs">{i + 1}</td>
                      <td className="py-3 font-medium text-navy-900">{item.waste_type}</td>
                      <td className="py-3 text-center text-slate-600">{item.unit}</td>
                      <td className="py-3 text-right text-slate-600">{item.quantity.toLocaleString("ko-KR")}</td>
                      <td className="py-3 text-right text-slate-600">{item.unit_price.toLocaleString("ko-KR")}</td>
                      <td className="py-3 text-right font-medium text-navy-900">{item.amount.toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="sm:hidden divide-y divide-slate-100 px-4">
              {q.items.map((item, i) => (
                <div key={i} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 mr-1.5">{i + 1}.</span>
                      <span className="text-sm font-medium text-navy-900">{item.waste_type}</span>
                    </div>
                    <span className="text-sm font-semibold text-navy-900">{fmt(item.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-4">
                    {item.quantity.toLocaleString("ko-KR")} {item.unit} × {item.unit_price.toLocaleString("ko-KR")}원
                  </p>
                </div>
              ))}
            </div>

            {/* 합계 */}
            <div className="p-5 sm:p-6 pt-4 flex justify-end">
              <div className="w-full sm:w-60 border border-slate-100 rounded-lg overflow-hidden">
                <div className="flex justify-between px-4 py-2.5 text-sm border-b border-slate-50">
                  <span className="text-slate-500">공급가액</span>
                  <span className="font-medium">{fmt(q.subtotal)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm border-b border-slate-50">
                  <span className="text-slate-500">부가세 (10%)</span>
                  <span className="font-medium">{fmt(q.tax)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-cobalt-600 text-white text-sm font-bold">
                  <span>합 계</span>
                  <span>{fmt(q.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 비고 */}
          {q.notes && (
            <div className="bg-white rounded-xl shadow-ds-sm p-5 sm:p-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">비고</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{q.notes}</p>
            </div>
          )}
        </div>

        {/* 우측: 견적 정보 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-ds-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">견적 정보</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">견적번호</span>
                <span className="font-mono text-xs font-medium text-navy-900">{q.quote_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">작성자</span>
                <span className="text-navy-900">{q.created_by_name ?? "-"}</span>
              </div>
              {q.valid_until && (
                <div className="flex justify-between">
                  <span className="text-slate-500">유효기간</span>
                  <span className="text-navy-900">{new Date(q.valid_until).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                </div>
              )}
              {q.collection_date && (
                <div className="flex justify-between">
                  <span className="text-slate-500">수거예정일</span>
                  <span className="text-navy-900">{new Date(q.collection_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                </div>
              )}
            </div>
          </div>

          {/* 타임스탬프 */}
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 space-y-1">
            <p>작성일: {new Date(q.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
            {q.updated_at && <p>수정일: {new Date(q.updated_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
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
