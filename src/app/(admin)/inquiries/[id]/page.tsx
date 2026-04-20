import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getInquiryById, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquiryStatusUpdateForm } from "@/components/admin/InquiryStatusUpdateForm";
import { ArrowLeft, Building2, User, Phone, Mail, MapPin, Package, Camera, Calendar } from "lucide-react";

interface PageProps {
  params: { id: string };
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
      <div className={Icon ? "" : "pl-7"}>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const result = await getInquiryById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const inq = result.data;
  const fullAddress = inq.address_detail
    ? `${inq.address} ${inq.address_detail}`
    : inq.address;

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1F4E79] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        문의 목록으로
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{inq.company_name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            문의 ID: <span className="font-mono text-xs">{inq.id}</span>
          </p>
        </div>
        <InquiryStatusBadge status={inq.status as InquiryStatus} className="text-sm px-3 py-1.5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 문의 상세 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 연락처 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">연락처 정보</h2>
            <DetailRow label="사업장명" value={inq.company_name} icon={Building2} />
            <DetailRow label="소속팀" value={inq.department} icon={Building2} />
            <DetailRow label="담당자명" value={inq.contact_name} icon={User} />
            <DetailRow label="전화번호" value={inq.phone} icon={Phone} />
            <DetailRow label="이메일" value={inq.email} icon={Mail} />
          </div>

          {/* 수거 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">수거 정보</h2>
            <DetailRow label="수거 장소" value={fullAddress ?? inq.region_sido ? `${inq.region_sido ?? ""} ${inq.region_sigungu ?? ""}`.trim() : null} icon={MapPin} />
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

          {/* 사진 */}
          {inq.photo_urls && inq.photo_urls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-400" />
                첨부 사진 ({inq.photo_urls.length}장)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inq.photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
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
            </div>
          )}

          {/* 동의 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">동의 정보</h2>
            <div className="flex gap-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${inq.agreement ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                개인정보 수집·이용 동의: {inq.agreement ? "동의" : "미동의"}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${inq.marketing_consent ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"}`}>
                마케팅 수신 동의: {inq.marketing_consent ? "동의" : "미동의"}
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 상태 관리 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">상태 관리</h2>
            <InquiryStatusUpdateForm
              inquiryId={inq.id}
              currentStatus={inq.status as InquiryStatus}
              currentNotes={inq.notes}
            />
          </div>

          {/* 타임스탬프 */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
            <p>
              접수일:{" "}
              {new Date(inq.created_at).toLocaleString("ko-KR")}
            </p>
            {inq.updated_at && (
              <p>
                최종 수정:{" "}
                {new Date(inq.updated_at).toLocaleString("ko-KR")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
