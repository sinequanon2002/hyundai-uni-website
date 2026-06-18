import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyInquiryById } from "@/lib/actions/customer";

export const metadata: Metadata = {
  title: "문의 상세 | 마이페이지",
  robots: { index: false, follow: false },
};

const STATUS_STEPS = [
  { key: "pending",   label: "접수 완료",  desc: "문의가 접수되었습니다" },
  { key: "reviewing", label: "검토 중",    desc: "담당자가 검토 중입니다" },
  { key: "quoted",    label: "견적 발송",  desc: "견적서가 발송되었습니다" },
  { key: "completed", label: "처리 완료",  desc: "처리가 완료되었습니다" },
];

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  quoted:    "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "접수 완료",
  reviewing: "검토 중",
  quoted:    "견적 발송",
  completed: "처리 완료",
  cancelled: "취소",
};

const NOTIFICATION_LABEL: Record<string, string> = {
  sms:   "SMS 문자",
  kakao: "카카오 알림톡",
  email: "이메일",
};

interface PageProps {
  params: { id: string };
}

export default async function MyInquiryDetailPage({ params }: PageProps) {
  const result = await getMyInquiryById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const inq = result.data;
  const isCancelled = inq.status === "cancelled";
  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === inq.status);

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/my/inquiries" className="text-neutral-mid hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-neutral-dark">문의 상세</h1>
        <span className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[inq.status] ?? ""}`}>
          {STATUS_LABEL[inq.status] ?? inq.status}
        </span>
      </div>

      {/* 진행 상태 타임라인 (취소가 아닌 경우) */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h2 className="text-sm font-semibold text-neutral-dark mb-4">처리 현황</h2>
          <div className="flex items-start gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const isActive = idx <= stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {/* 연결선 */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${isActive && idx < stepIndex ? "bg-primary" : "bg-gray-200"}`} />
                  )}
                  {/* 점 */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isCurrent
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}>
                    {isActive ? "✓" : idx + 1}
                  </div>
                  <p className={`mt-2 text-center text-xs font-medium ${isCurrent ? "text-primary" : isActive ? "text-neutral-dark" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 문의 정보 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-dark">문의 정보</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <InfoRow label="접수 일시" value={new Date(inq.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} />
          <InfoRow label="담당자명" value={inq.contact_name} />
          <InfoRow label="연락처" value={inq.phone} />
          <InfoRow label="알림 방법" value={NOTIFICATION_LABEL[inq.notification_method] ?? inq.notification_method} />
          {inq.email && <InfoRow label="이메일" value={inq.email} />}
          {inq.address && (
            <InfoRow
              label="주소"
              value={[inq.address, inq.address_detail].filter(Boolean).join(" ")}
              full
            />
          )}
        </dl>
      </div>

      {/* 폐기물 종류 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
        <h2 className="text-sm font-semibold text-neutral-dark mb-3">수거 요청 폐기물</h2>
        <div className="flex flex-wrap gap-2">
          {inq.waste_types.map((type) => (
            <span key={type} className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/20">
              {type}
            </span>
          ))}
        </div>
        {inq.quantity && (
          <p className="mt-3 text-sm text-neutral-mid">예상 수량: {inq.quantity}</p>
        )}
        {inq.collection_date && (
          <p className="text-sm text-neutral-mid mt-1">
            희망 수거일: {new Date(inq.collection_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
          </p>
        )}
      </div>

      {/* 추가 요청 사항 */}
      {inq.message && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h2 className="text-sm font-semibold text-neutral-dark mb-2">추가 요청 사항</h2>
          <p className="text-sm text-neutral-dark whitespace-pre-wrap">{inq.message}</p>
        </div>
      )}

      {/* 사진 첨부 */}
      {inq.photo_urls && inq.photo_urls.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h2 className="text-sm font-semibold text-neutral-dark mb-3">첨부 사진</h2>
          <div className="grid grid-cols-3 gap-2">
            {inq.photo_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`첨부사진 ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-100" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/my/inquiries"
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-neutral-mid hover:border-gray-300 transition-colors"
        >
          목록으로
        </Link>
        <Link
          href="/support/inquiry"
          className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
        >
          새 문의하기
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-neutral-mid">{label}</dt>
      <dd className="text-sm font-medium text-neutral-dark mt-0.5">{value}</dd>
    </div>
  );
}
