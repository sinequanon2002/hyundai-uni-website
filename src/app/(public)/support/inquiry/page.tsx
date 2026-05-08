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
  type InquiryFormValues,
  WASTE_CATEGORIES,
} from "@/lib/schemas/inquiry";
import { submitInquiry } from "@/lib/actions/inquiry";
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
  ChevronDown,
  MapPin,
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [wasteSearch, setWasteSearch] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
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
          results.push({ name: file.name, url: json.url });
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
      "focus:ring-2 focus:ring-[#1F4E79]/25 focus:border-[#1F4E79]",
      hasError
        ? "border-red-400 bg-red-50/30"
        : "border-gray-200 bg-white hover:border-gray-300"
    );

  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
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
        breadcrumb={["고객지원", "견적 문의"]}
      />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} current="/support/inquiry" />

      <section className="py-16 bg-[#F5F8FB]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ── 좌측 안내 ── */}
            <aside className="lg:col-span-2 space-y-6">
              {/* 연락처 카드 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  직접 문의하기
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${COMPANY.tel}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1F4E79]/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#1F4E79]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">전화 문의</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1F4E79] transition-colors">
                        {COMPANY.tel}
                      </p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1F4E79]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#1F4E79]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">이메일 문의</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1F4E79] transition-colors">
                        {COMPANY.email}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1F4E79]/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#1F4E79]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">운영시간</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {COMPANY.businessHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 처리 절차 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
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
                        <div className="w-7 h-7 rounded-full bg-[#1F4E79] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {step}
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-gray-800">
                          {title}
                        </p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── 우측 폼 ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  견적 문의
                </h2>
                <p className="text-sm text-gray-400 mb-6">
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
                        <span className="text-gray-400 font-normal text-xs">(선택)</span>
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

                  {/* 이메일 (견적 결과 수신용 — 선택) */}
                  <div>
                    <label className={labelCls}>
                      <Mail className="inline w-4 h-4 mr-1 mb-0.5 text-[#1F4E79]" />
                      이메일{" "}
                      <span className="text-gray-400 font-normal text-xs">(선택)</span>
                    </label>
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                      입력하시면 접수 확인 및 견적서를 이메일로 발송해드립니다.
                      미입력 시 담당자가 전화로 연락드립니다.
                    </p>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="example@company.com"
                      className={inputCls(!!errors.email)}
                    />
                    {errors.email && (
                      <p className={errorCls}>{errors.email.message}</p>
                    )}
                  </div>

                  {/* 수거 장소 */}
                  <div>
                    <label className={labelCls}>
                      <MapPin className="inline w-4 h-4 mr-1 mb-0.5 text-[#1F4E79]" />
                      수거 장소{" "}
                      <span className="text-gray-400 font-normal text-xs">(선택)</span>
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
                        className="px-3 py-2.5 border border-gray-200 rounded-lg hover:border-[#1F4E79] hover:text-[#1F4E79] transition-colors shrink-0"
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
                      폐기물 종류 (중복 선택){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="폐기물 명칭 검색 (예: 폐유, 슬러지...)"
                        value={wasteSearch}
                        onChange={(e) => setWasteSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 transition-all"
                      />
                      {wasteSearch && (
                        <button
                          type="button"
                          onClick={() => setWasteSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Controller
                      name="wasteTypes"
                      control={control}
                      render={({ field }) => {
                        const filteredCategories = Object.entries(WASTE_CATEGORIES).filter(([major, minors]) => {
                          if (!wasteSearch) return true;
                          const s = wasteSearch.toLowerCase();
                          return major.toLowerCase().includes(s) || minors.some(m => m.toLowerCase().includes(s));
                        });

                        return (
                          <div className={cn("space-y-2 p-1", errors.wasteTypes && "border border-red-400 rounded-lg bg-red-50/30")}>
                            {filteredCategories.length === 0 ? (
                              <p className="text-center py-8 text-gray-400 text-sm italic">
                                검색 결과가 없습니다. 직접 입력하시려면 '기타'를 선택해 주세요.
                              </p>
                            ) : (
                              filteredCategories.map(([major, minors]) => {
                                // 검색어가 있을 때, 해당 카테고리가 검색어와 직접 매칭되지 않더라도 
                                // 하위 아이템이 매칭되면 카테고리를 강제로 확장해서 보여줍니다.
                                const s = wasteSearch.toLowerCase();
                                const isMajorMatch = major.toLowerCase().includes(s);
                                const matchingMinors = minors.filter(m => m.toLowerCase().includes(s));
                                
                                // 검색 중이고 하위 아이템이 매칭되거나, 클릭해서 확장된 경우
                                const isExpanded = (wasteSearch && matchingMinors.length > 0) || expandedCategory === major;
                                const selectedCount = field.value.filter((v) => v.startsWith(`${major} - `) || v === major).length;

                                const isFeatured = major.startsWith("⭐");
                                return (
                                  <div
                                    key={major}
                                    className={cn(
                                      "border rounded-lg overflow-hidden bg-white",
                                      isFeatured
                                        ? "border-[#1F4E79]/40 ring-1 ring-[#1F4E79]/20"
                                        : "border-gray-200"
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setExpandedCategory(isExpanded ? null : major)}
                                      className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 transition-colors",
                                        isFeatured
                                          ? isExpanded ? "bg-[#1F4E79]/10" : "bg-[#1F4E79]/5 hover:bg-[#1F4E79]/10"
                                          : isExpanded ? "bg-[#F5F8FB]" : "hover:bg-gray-50",
                                        selectedCount > 0 && !isExpanded && !isFeatured && "border-l-4 border-l-[#1F4E79]"
                                      )}
                                    >
                                      <span className={cn("font-semibold text-sm", isFeatured ? "text-[#1F4E79]" : "text-gray-800")}>
                                        {major}
                                        {isFeatured && (
                                          <span className="ml-2 text-[10px] bg-[#1F4E79] text-white px-2 py-0.5 rounded-full font-bold">
                                            집중 처리
                                          </span>
                                        )}
                                        {selectedCount > 0 && (
                                          <span className="ml-2 text-[#1F4E79] bg-[#1F4E79]/10 px-2 py-0.5 rounded-full text-xs">
                                            {selectedCount}개 선택됨
                                          </span>
                                        )}
                                      </span>
                                      <ChevronDown
                                        className={cn("w-4 h-4 transition-transform", isFeatured ? "text-[#1F4E79]" : "text-gray-500", isExpanded && "rotate-180")}
                                      />
                                    </button>
                                    {isExpanded && (
                                      <div className="p-4 bg-white border-t border-gray-100 flex flex-wrap gap-2">
                                        {minors.map((minor) => {
                                          const valueStr = major === "기타" ? "기타" : `${major} - ${minor}`;
                                          const checked = field.value.includes(valueStr);
                                          // 검색 중일 때 매칭되는 아이템만 강조하거나 필터링할 수 있지만, 
                                          // 여기서는 전체 리스트를 보여주되 매칭되는 것 위주로 확장했습니다.
                                          return (
                                            <button
                                              key={minor}
                                              type="button"
                                              onClick={() => {
                                                field.onChange(
                                                  checked
                                                    ? field.value.filter((v) => v !== valueStr)
                                                    : [...field.value, valueStr]
                                                );
                                              }}
                                              className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                                checked
                                                  ? "bg-[#1F4E79] border-[#1F4E79] text-white"
                                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#1F4E79]/50",
                                                wasteSearch && minor.toLowerCase().includes(s) && !checked && "ring-2 ring-[#1F4E79]/30 border-[#1F4E79]/50"
                                              )}
                                            >
                                              {minor}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        );
                      }}
                    />
                    {errors.wasteTypes && (
                      <p className={errorCls}>{errors.wasteTypes.message}</p>
                    )}
                  </div>

                  {/* 수거 요청일 + 폐기물 수량 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>수거 요청일</label>
                      <input
                        {...register("collectionDate")}
                        type="date"
                        className={inputCls(!!errors.collectionDate)}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        * 희망하시는 수거 날짜를 선택해주세요.
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}>폐기물 수량/단위</label>
                      <input
                        {...register("quantity")}
                        placeholder="예: 약 500kg, 2드럼 등"
                        className={inputCls(!!errors.quantity)}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        * 대략적인 정보를 입력하셔도 괜찮습니다.
                      </p>
                    </div>
                  </div>

                  {/* 기타 문의사항 */}
                  <div>
                    <label className={labelCls}>기타 문의사항</label>
                    <textarea
                      {...register("message")}
                      placeholder="특이사항이나 추가로 문의하실 내용을 자유롭게 작성해주세요."
                      rows={3}
                      className={cn(inputCls(!!errors.message), "resize-none")}
                    />
                    {errors.message && (
                      <p className={errorCls}>{errors.message.message}</p>
                    )}
                  </div>

                  {/* 첨부 파일 (사진, 서류) */}
                  <div>
                    <label className={labelCls}>첨부 파일 (사진, 서류 등)</label>
                    <p className="text-xs text-gray-400 mb-2">
                      현장 사진, MSDS 등 관련 서류를 업로드해 주시면 빠르고 정확한 견적이 가능합니다. (이미지, PDF, DOC, HWP 지원 / 파일당 최대 10MB)
                    </p>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {uploadedFiles.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="flex-1 truncate text-gray-700 text-xs">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
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
                            "inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-[#1F4E79] hover:text-[#1F4E79] transition-colors",
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
                          <p className="text-xs text-gray-400 mt-1">
                            선택된 파일이 존재하지 않습니다.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* 개인정보 동의 */}
                  <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                    {/* 필수 동의 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPrivacyModalOpen(true)}
                          className="text-sm font-semibold text-gray-700 hover:text-[#1F4E79] underline decoration-dotted flex items-center gap-1"
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
                              className="w-4 h-4 accent-[#1F4E79]"
                            />
                            <span className="text-sm text-gray-600">동의합니다</span>
                          </label>
                        )}
                      />
                      {errors.agreement && (
                        <p className={errorCls}>{errors.agreement.message}</p>
                      )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* 선택 동의 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setMarketingModalOpen(true)}
                          className="text-sm font-semibold text-gray-700 hover:text-[#1F4E79] underline decoration-dotted flex items-center gap-1"
                        >
                          마케팅 수신 동의
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-400">(선택)</span>
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
                              className="w-4 h-4 accent-[#1F4E79]"
                            />
                            <span className="text-sm text-gray-600">동의합니다</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="w-full py-3.5 bg-[#1F4E79] text-white font-bold rounded-xl hover:bg-[#2E75B6] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
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
            <CheckCircle2 className="w-14 h-14 text-[#4CAF50] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              문의가 접수되었습니다
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              빠른 시일 내에 담당자가 연락드리겠습니다.
              {submittedEmail && (
                <><br />접수 확인 이메일을 발송했습니다.</>
              )}
            </p>

            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  href="/my/inquiries"
                  className="block w-full py-3 bg-[#1F4E79] text-white font-semibold rounded-xl hover:bg-[#2E75B6] transition-colors text-sm"
                  onClick={() => setShowSuccessModal(false)}
                >
                  문의 내역 확인하기
                </Link>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="block w-full py-2.5 bg-[#1F4E79] text-white font-semibold rounded-xl hover:bg-[#2E75B6] transition-colors text-sm text-center"
                  onClick={() => setShowSuccessModal(false)}
                >
                  문의현황 조회하기
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 py-2 border border-[#1F4E79] text-[#1F4E79] font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 py-2 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm text-center"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    회원가입
                  </Link>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1F4E79] text-white text-sm font-semibold rounded-xl hover:bg-[#2E75B6] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
