import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getInquiryById,
  getInquiryActivities,
  getAssignableStaff,
  type InquiryStatus,
} from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquiryStatusUpdateForm } from "@/components/admin/InquiryStatusUpdateForm";
import { AssigneeSelect } from "@/components/admin/AssigneeSelect";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin,
  Package, Camera, Calendar, FileText, ExternalLink, PenLine,
} from "lucide-react";

function isImageUrl(url: string): boolean {
  const ext = url.split(".").pop()?.split("?")[0].toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "heic"].includes(ext ?? "");
}

function getFileExt(url: string): string {
  return (url.split(".").pop()?.split("?")[0].toUpperCase()) ?? "FILE";
}

interface PageProps {
  params: { id: string };
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-slate-50 last:border-0">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
      <div className={Icon ? "" : "pl-7"}>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-navy-900">{value}</p>
      </div>
    </div>
  );
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const [result, activitiesResult, staffResult] = await Promise.all([
    getInquiryById(params.id),
    getInquiryActivities(params.id),
    getAssignableStaff(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const inq = result.data;
  const activities = activitiesResult.data ?? [];
  const staffList = staffResult.data ?? [];

  const fullAddress = inq.address_detail
    ? `${inq.address} ${inq.address_detail}`
    : inq.address;

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        문의 목록으로
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 break-keep">{inq.company_name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            문의 ID: <span className="font-mono text-xs break-all">{inq.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <InquiryStatusBadge status={inq.status as InquiryStatus} className="text-sm px-3 py-1.5" />
          <Link
            href={`/admin/customers/new?inquiry_id=${inq.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            고객 등록
          </Link>
          <Link
            href={`/admin/quotes/new?inquiry_id=${inq.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            견적서 작성
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 문의 상세 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 연락처 정보 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">연락처 정보</h2>
            <DetailRow label="사업장명" value={inq.company_name} icon={Building2} />
            <DetailRow label="소속팀" value={inq.department} icon={Building2} />
            <DetailRow label="담당자명" value={inq.contact_name} icon={User} />
            <DetailRow label="전화번호" value={inq.phone} icon={Phone} />
            <DetailRow label="이메일" value={inq.email} icon={Mail} />
          </div>

          {/* 수거 정보 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">수거 정보</h2>
            <DetailRow
              label="수거 장소"
              value={fullAddress ?? (inq.region_sido ? `${inq.region_sido ?? ""} ${inq.region_sigungu ?? ""}`.trim() : null)}
              icon={MapPin}
            />
            <DetailRow
              label="폐기물 종류"
              value={inq.waste_types.join(", ")}
              icon={Package}
            />
            {inq.quantity && (
              <DetailRow
                label="예상 수량"
                value={`${inq.quantity} ${inq.unit ?? ""}`}
                icon={Package}
              />
            )}
            {inq.frequency && (
              <DetailRow label="수거 주기" value={inq.frequency} icon={Calendar} />
            )}
            {inq.message && (
              <DetailRow label="상세 문의" value={inq.message} />
            )}
          </div>

          {/* 첨부 파일 */}
          {inq.photo_urls && inq.photo_urls.length > 0 && (
            <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                첨부 파일 ({inq.photo_urls.length}개)
              </h2>
              {inq.photo_urls.some(isImageUrl) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {inq.photo_urls.filter(isImageUrl).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 hover:opacity-90 transition-opacity">
                        <Image
                          src={url}
                          alt={`첨부사진 ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {inq.photo_urls.some((u) => !isImageUrl(u)) && (
                <div className="space-y-2">
                  {inq.photo_urls.filter((u) => !isImageUrl(u)).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="flex-1 text-sm text-slate-700">
                        첨부 문서 {i + 1}
                        <span className="ml-1.5 text-xs text-slate-400 font-medium">
                          ({getFileExt(url)})
                        </span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 동의 정보 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">동의 정보</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${inq.agreement ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                개인정보 수집·이용 동의: {inq.agreement ? "동의" : "미동의"}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${inq.marketing_consent ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-500"}`}>
                마케팅 수신 동의: {inq.marketing_consent ? "동의" : "미동의"}
              </span>
            </div>
          </div>

          {/* 활동 이력 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <ActivityTimeline
              activities={activities}
              createdAt={inq.created_at}
              companyName={inq.company_name}
            />
          </div>
        </div>

        {/* 우측: 상태 관리 + 담당자 + 빠른 연락 */}
        <div className="space-y-4">
          {/* 상태 관리 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">상태 관리</h2>
            <InquiryStatusUpdateForm
              inquiryId={inq.id}
              currentStatus={inq.status as InquiryStatus}
              currentNotes={inq.notes}
            />
          </div>

          {/* 담당자 배정 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">담당자 배정</h2>
            <AssigneeSelect
              inquiryId={inq.id}
              currentAssigneeId={inq.assigned_to}
              staffList={staffList}
            />
          </div>

          {/* 빠른 연락 */}
          <div className="bg-white rounded-sm shadow-ds-sm p-4 sm:p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">빠른 연락</h2>
            <div className="space-y-2">
              <a
                href={`tel:${inq.phone}`}
                className="flex items-center gap-2 px-3 py-2.5 bg-cobalt-50 rounded-lg text-sm text-cobalt-600 font-medium hover:bg-cobalt-100 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {inq.phone}
              </a>
              <a
                href={`mailto:${inq.email}`}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="truncate">{inq.email}</span>
              </a>
            </div>
          </div>

          {/* 타임스탬프 */}
          <div className="bg-slate-50 rounded-sm p-4 text-xs text-slate-400 space-y-1">
            <p>
              접수일:{" "}
              {new Date(inq.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            </p>
            {inq.updated_at && (
              <p>
                최종 수정:{" "}
                {new Date(inq.updated_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
