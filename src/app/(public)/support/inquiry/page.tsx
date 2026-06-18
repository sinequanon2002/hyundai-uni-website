"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Script from "next/script";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { COMPANY } from "@/lib/constants";
import {
  inquiryFormSchema,
  type InquiryFormInput,
  type InquiryFormValues,
  WASTE_TYPES,
} from "@/lib/schemas/inquiry";
import { submitInquiry } from "@/lib/actions/inquiry";
import { trackInquirySubmit } from "@/lib/analytics";
import {
  Search,
  Paperclip,
  X,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  MapPin,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Daum Postcode 타입 선언 ──────────────────────────────────────────────────
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
          zonecode: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

// ─── 개인정보 전문 ─────────────────────────────────────────────────────────────
const PRIVACY_FULL_TEXT = `[개인정보 수집·이용 동의서]

1. 수집 항목: 사업장명, 소속팀, 담당자명, 연락처, 이메일, 수거 장소, 폐기물 종류, 첨부 사진

2. 수집 목적: 견적 문의 접수 및 상담, 서비스 안내

3. 보유 기간: 문의 접수일로부터 1년간 보유 후 파기
   (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보존)

4. 동의를 거부할 권리가 있으나, 거부 시 견적 문의 접수가 어려울 수 있습니다.

위 내용을 확인하였으며, 개인정보 수집·이용에 동의합니다.`;

const MARKETING_FULL_TEXT = `[마케팅 수신 동의서]

수집 항목: 이메일, 전화번호
수신 내용: 서비스 안내, 이벤트, 업계 정보
수신 채널: 이메일, 문자(SMS)
보유 기간: 동의 철회 시까지

동의는 선택 사항이며, 동의 거부 시에도 서비스 이용에 불이익이 없습니다.`;

interface UploadedFile {
  name: string;
  url: string;
  isImage: boolean;
}

export default function InquiryPage() {
  const [isPending, startTransition] = useTransition();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InquiryFormInput, unknown, InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      wasteTypes: [],
      photoUrls: [],
      marketingConsent: false,
      notificationMethod: "email",
    },
  });

  const addressValue = watch("address");

  // ─── 전화번호 자동 하이픈 ───────────────────────────────────────────────────
  const formatPhone = (value: string) => {
    const n = value.replace(/[^\d]/g, "");
    if (n.length <= 3) return n;
    if (n.startsWith("02")) {
      if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
      if (n.length <= 10) return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}`;
      return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6, 10)}`;
    }
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    if (n.length <= 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
  };

  // ─── 주소 검색 ──────────────────────────────────────────────────────────────
  const handleAddressSearch = () => {
    if (typeof window.daum === "undefined") {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setValue("address", data.roadAddress || data.jibunAddress, {
          shouldValidate: true,
        });
      },
    }).open();
  };

  // ─── 파일 업로드 ────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = 10 - uploadedFiles.length;
    if (remaining <= 0) {
      alert("최대 10개의 파일을 첨부할 수 있습니다.");
      return;
    }
    const toUpload = files.slice(0, remaining);

    setIsUploading(true);
    const results: UploadedFile[] = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/inquiry/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok && json.url) {
          results.push({ name: file.name, url: json.url, isImage: file.type.startsWith("image/") });
        } else {
          alert(`파일 업로드 실패: ${json.error ?? file.name}`);
        }
      } catch {
        alert(`파일 업로드 중 오류가 발생했습니다: ${file.name}`);
      }
    }

    const updated = [...uploadedFiles, ...results];
    setUploadedFiles(updated);
    setValue("photoUrls", updated.map((f) => f.url));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== idx);
    setUploadedFiles(updated);
    setValue("photoUrls", updated.map((f) => f.url));
  };

  // ─── 폼 제출 ────────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await submitInquiry(data);
      if (result.success) {
        trackInquirySubmit();
        setSubmittedEmail(data.email ?? "");
        setShowSuccessModal(true);
        reset();
        setUploadedFiles([]);
      } else {
        alert(result.error ?? "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  });

  // ─── 공통 input 스타일 ───────────────────────────────────────────────────────
  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors",
      "focus:ring-2 focus:ring-cobalt-500/25 focus:border-cobalt-500",
      hasError
        ? "border-red-400 bg-red-50/30"
        : "border-slate-200 bg-white hover:border-slate-300"
    );

  const labelCls = "block text-sm font-semibold text-navy-700 mb-1.5";
  const errorCls = "text-xs text-red-500 mt-1";

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <PageBanner
        title="견적 문의"
        subtitle="지정폐기물 수거·운반 견적을 문의하세요"
        compact
      />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="py-8 md:py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ── 좌측 안내 ── */}
            <aside className="lg:col-span-2 space-y-6">
              {/* 연락처 카드 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-navy-900 mb-4">
                  직접 문의하기
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${COMPANY.tel}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-cobalt-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-cobalt-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">전화 문의</p>
                      <p className="text-sm font-semibold text-navy-900 group-hover:text-cobalt-600 transition-colors">
                        {COMPANY.tel}
                      </p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-cobalt-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-cobalt-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">이메일 문의</p>
                      <p className="text-sm font-semibold text-navy-900 group-hover:text-cobalt-600 transition-colors">
                        {COMPANY.email}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cobalt-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-cobalt-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">운영시간</p>
                      <p className="text-sm font-semibold text-navy-900">
                        {COMPANY.businessHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 처리 절차 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-navy-900 mb-4">
                  처리 절차
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "01", title: "문의 접수", desc: "온라인 양식 또는 전화" },
                    { step: "02", title: "현장 방문 / 상담", desc: "담당자 직접 연락" },
                    { step: "03", title: "견적 발송", desc: "맞춤 견적서 이메일 발송" },
                  ].map(({ step, title, desc }, i, arr) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-cobalt-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {step}
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px h-6 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-navy-900">
                          {title}
                        </p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── 우측 폼 ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-1">
                  견적 문의
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  아래 정보를 제출하시면, 빠른 시일 내 연락드리겠습니다.
                </p>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  {/* 사업장명 + 소속팀 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        사업장명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("companyName")}
                        placeholder="회사명을 입력해주세요"
                        className={inputCls(!!errors.companyName)}
                      />
                      {errors.companyName && (
                        <p className={errorCls}>{errors.companyName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>
                        소속팀{" "}
                        <span className="text-slate-400 font-normal text-xs">(선택)</span>
                      </label>
                      <input
                        {...register("department")}
                        placeholder="예: 환경안전팀"
                        className={inputCls(false)}
                      />
                    </div>
                  </div>

                  {/* 이름 + 전화번호 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        담당자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("contactName")}
                        placeholder="담당자 성함"
                        className={inputCls(!!errors.contactName)}
                      />
                      {errors.contactName && (
                        <p className={errorCls}>{errors.contactName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>
                        전화번호 <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            placeholder="010-0000-0000"
                            onChange={(e) =>
                              field.onChange(formatPhone(e.target.value))
                            }
                            className={inputCls(!!errors.phone)}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className={errorCls}>{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 이메일 (필수 — 접수 확인 및 견적서 수신) */}
                  <div>
                    <label className={labelCls}>
                      <Mail className="inline w-4 h-4 mr-1 mb-0.5 text-cobalt-600" />
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-2">
                      접수 확인 및 견적서를 이메일로 발송해드립니다.
                    </p>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <EmailAutocomplete
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          hasError={!!errors.email}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className={errorCls}>{errors.email.message}</p>
                    )}
                  </div>

                  {/* 수거 장소 */}
                  <div>
                    <label className={labelCls}>
                      <MapPin className="inline w-4 h-4 mr-1 mb-0.5 text-cobalt-600" />
                      수거 장소{" "}
                      <span className="text-slate-400 font-normal text-xs">(선택)</span>
                    </label>
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-2 flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">💡</span>
                      <span>
                        정확한 수거 지역을 입력하시면 운반 거리를 반영한 더 정확한 견적을 안내해드릴 수 있습니다.
                        주소 입력은 필수가 아니며, 미입력 시 담당자 연락 후 확인합니다.
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={addressValue ?? ""}
                        placeholder="주소 검색 (선택)"
                        className={cn(inputCls(false), "cursor-pointer flex-1 min-w-0")}
                        onClick={handleAddressSearch}
                      />
                      <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="px-3 py-2.5 border border-slate-200 rounded-lg hover:border-cobalt-600 hover:text-cobalt-600 transition-colors shrink-0"
                        aria-label="주소 검색"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      {...register("addressDetail")}
                      placeholder="상세 주소 (선택)"
                      className={cn(inputCls(), "mt-2")}
                    />
                  </div>

                  {/* 폐기물 종류 */}
                  <div>
                    <label className={labelCls}>
                      폐기물 종류 (중복 선택 가능){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="wasteTypes"
                      control={control}
                      render={({ field }) => (
                        <WasteTypeCombobox
                          value={field.value}
                          onChange={field.onChange}
                          hasError={!!errors.wasteTypes}
                        />
                      )}
                    />
                    {errors.wasteTypes && (
                      <p className={errorCls}>{errors.wasteTypes.message}</p>
                    )}
                  </div>

                  {/* 기타 문의사항 */}
                  <div>
                    <label className={labelCls}>기타 문의사항</label>
                    <textarea
                      {...register("message")}
                      placeholder={"수거 희망일, 폐기물 수량·단위, 보관 상태 등을 자유롭게 적어주세요.\n예) 폐황산 약 500kg (드럼 3개), 수거 희망일 6월 초, 옥외 탱크 보관 중"}
                      rows={4}
                      className={cn(inputCls(!!errors.message), "resize-none")}
                    />
                    {errors.message && (
                      <p className={errorCls}>{errors.message.message}</p>
                    )}
                  </div>

                  {/* 첨부 파일 (사진, 서류) */}
                  <div>
                    <label className={labelCls}>첨부 파일 (사진, 서류 등)</label>
                    <p className="text-xs text-slate-400 mb-2">
                      현장 사진, MSDS 등 관련 서류를 업로드해 주시면 빠르고 정확한 견적이 가능합니다. (이미지, PDF, DOC, HWP 지원 / 파일당 최대 10MB)
                    </p>

                    {uploadedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {/* 이미지: 썸네일 그리드 */}
                        {uploadedFiles.some((f) => f.isImage) && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {uploadedFiles.map((file, i) =>
                              file.isImage ? (
                                <div
                                  key={i}
                                  className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                  <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}
                        {/* 문서: 파일명 목록 */}
                        {uploadedFiles.some((f) => !f.isImage) && (
                          <div className="space-y-1.5">
                            {uploadedFiles.map((file, i) =>
                              !file.isImage ? (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="flex-1 truncate text-navy-700 text-xs">
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {uploadedFiles.length < 10 && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.doc,.docx,.hwp,.hwpx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-pointer hover:border-cobalt-600 hover:text-cobalt-600 transition-colors",
                            isUploading && "opacity-60 pointer-events-none"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4" />
                          )}
                          {isUploading
                            ? "업로드 중..."
                            : uploadedFiles.length === 0
                            ? "파일 업로드"
                            : "파일 추가"}
                        </label>
                        {uploadedFiles.length === 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            선택된 파일이 존재하지 않습니다.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* 개인정보 동의 */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    {/* 필수 동의 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPrivacyModalOpen(true)}
                          className="text-sm font-semibold text-navy-700 hover:text-cobalt-600 underline decoration-dotted flex items-center gap-1"
                        >
                          개인정보 수집 및 이용 동의
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <span className="text-red-500 text-xs font-bold">*</span>
                      </div>
                      <Controller
                        name="agreement"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="w-4 h-4 accent-cobalt-600"
                            />
                            <span className="text-sm text-slate-500">동의합니다</span>
                          </label>
                        )}
                      />
                      {errors.agreement && (
                        <p className={errorCls}>{errors.agreement.message}</p>
                      )}
                    </div>

                    <hr className="border-slate-200" />

                    {/* 선택 동의 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setMarketingModalOpen(true)}
                          className="text-sm font-semibold text-navy-700 hover:text-cobalt-600 underline decoration-dotted flex items-center gap-1"
                        >
                          마케팅 수신 동의
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-slate-400">(선택)</span>
                      </div>
                      <Controller
                        name="marketingConsent"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="w-4 h-4 accent-cobalt-600"
                            />
                            <span className="text-sm text-slate-500">동의합니다</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="w-full py-3.5 bg-mint-500 text-white font-bold rounded-xl hover:bg-mint-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      <>
                        제출하기
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 성공 모달 ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-mint-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-900 mb-2">
              문의가 접수되었습니다
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              빠른 시일 내에 담당자가 연락드리겠습니다.
              {submittedEmail && (
                <><br />접수 확인 이메일을 발송했습니다.</>
              )}
            </p>

            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/my/inquiries"
                  className="block w-full py-3 bg-mint-500 text-white font-semibold rounded-xl hover:bg-mint-600 transition-colors text-sm"
                  onClick={() => setShowSuccessModal(false)}
                >
                  문의 내역 확인하기
                </Link>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2.5 text-sm text-slate-400 hover:text-slate-500 transition-colors"
                >
                  닫기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left">
                  <p className="text-xs font-semibold text-blue-800 mb-1">문의 내역을 온라인으로 확인하세요</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    로그인하면 접수 현황·견적 결과를 실시간으로 추적할 수 있습니다.
                  </p>
                </div>
                <Link
                  href="/support/inquiry-status"
                  className="block w-full py-2.5 bg-mint-500 text-white font-semibold rounded-xl hover:bg-mint-600 transition-colors text-sm text-center"
                  onClick={() => setShowSuccessModal(false)}
                >
                  문의현황 조회하기
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 py-2 border border-cobalt-600 text-cobalt-600 font-semibold rounded-xl hover:bg-cobalt-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 py-2 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    회원가입
                  </Link>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2 text-sm text-slate-400 hover:text-slate-500 transition-colors"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 개인정보 모달 ── */}
      {privacyModalOpen && (
        <PrivacyModal
          title="개인정보 수집 및 이용 동의"
          content={PRIVACY_FULL_TEXT}
          onClose={() => setPrivacyModalOpen(false)}
        />
      )}

      {/* ── 마케팅 모달 ── */}
      {marketingModalOpen && (
        <PrivacyModal
          title="마케팅 수신 동의"
          content={MARKETING_FULL_TEXT}
          onClose={() => setMarketingModalOpen(false)}
        />
      )}
    </>
  );
}

// ─── 폐기물 종류 콤보박스 ──────────────────────────────────────────────────────

const ALL_WASTE_TYPES: string[] = [...WASTE_TYPES];

function WasteTypeCombobox({
  value,
  onChange,
  hasError,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  hasError?: boolean;
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lc = input.toLowerCase();
  const filtered = ALL_WASTE_TYPES.filter(
    (t) => !value.includes(t) && (!input || t.toLowerCase().includes(lc))
  );
  const showCustomAdd =
    input.trim().length > 0 &&
    !ALL_WASTE_TYPES.some((t) => t === input.trim()) &&
    !value.includes(input.trim());

  const add = (v: string) => {
    const trimmed = v.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (v: string) => onChange(value.filter((t) => t !== v));

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {/* 선택된 항목 chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cobalt-600 text-white"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 검색/입력창 */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-colors",
            hasError
              ? "border-red-400 bg-red-50/30"
              : "border-slate-200 hover:border-slate-300",
            open && "ring-2 ring-cobalt-500/25 border-cobalt-500"
          )}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (showCustomAdd) {
                  add(input.trim());
                  setOpen(false);
                } else if (filtered[0]) {
                  add(filtered[0]);
                  setOpen(false);
                }
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="폐기물 종류 검색 또는 직접 입력 후 Enter"
            className="flex-1 text-sm outline-none bg-transparent min-w-0"
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                setOpen(false);
              }}
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-500" />
            </button>
          )}
        </div>

        {open && (
          <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto max-h-56">
            {showCustomAdd && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(input.trim());
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 bg-cobalt-50/50 text-cobalt-600 hover:bg-cobalt-50 border-b border-slate-200"
                >
                  <span className="font-semibold">직접 입력:</span>
                  <span>&ldquo;{input.trim()}&rdquo; 추가</span>
                </button>
              </li>
            )}
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      add(t);
                      setOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-navy-700 hover:bg-cobalt-50/50 hover:text-cobalt-600 transition-colors"
                  >
                    {t}
                  </button>
                </li>
              ))
            ) : !showCustomAdd ? (
              <li className="px-4 py-3 text-sm text-slate-400 italic">
                검색 결과가 없습니다.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── 이메일 자동완성 ────────────────────────────────────────────────────────────

const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "kakao.com",
  "hanmail.net",
  "nate.com",
  "outlook.com",
  "icloud.com",
];

function EmailAutocomplete({
  value,
  onChange,
  onBlur,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputCls = cn(
    "w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors",
    "focus:ring-2 focus:ring-cobalt-500/25 focus:border-cobalt-500",
    hasError
      ? "border-red-400 bg-red-50/30"
      : "border-slate-200 bg-white hover:border-slate-300"
  );

  function getSuggestions(v: string): string[] {
    const atIdx = v.indexOf("@");
    if (atIdx < 1) return [];
    const local = v.slice(0, atIdx);
    const domainTyped = v.slice(atIdx + 1).toLowerCase();
    const matched = EMAIL_DOMAINS.filter((d) => d.startsWith(domainTyped));
    // 완전히 입력됐으면 숨김
    if (matched.length === 1 && matched[0] === domainTyped) return [];
    return matched.map((d) => `${local}@${d}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    const next = getSuggestions(v);
    setSuggestions(next);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  function select(v: string) {
    onChange(v);
    setSuggestions([]);
    setActiveIdx(-1);
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder="example@company.com"
        autoComplete="off"
        className={inputCls}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, idx) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(s);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors",
                  idx === activeIdx
                    ? "bg-cobalt-600 text-white"
                    : "text-navy-700 hover:bg-cobalt-50/50 hover:text-cobalt-600"
                )}
              >
                <Mail className={cn("w-3.5 h-3.5 shrink-0", idx === activeIdx ? "text-white/70" : "text-slate-400")} />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrivacyModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-mint-500 text-white text-sm font-semibold rounded-xl hover:bg-mint-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
