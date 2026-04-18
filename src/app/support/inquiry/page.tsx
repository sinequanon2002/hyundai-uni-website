"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { COMPANY } from "@/lib/constants";
import {
  inquirySchema,
  type InquiryFormValues,
  REGIONS,
  WASTE_TYPE_OPTIONS,
  UNIT_OPTIONS,
  FREQUENCY_OPTIONS,
} from "@/lib/schemas/inquiry";
import {
  Clock,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   전화번호 자동 하이픈 포매터
   ────────────────────────────────────────────── */
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  if (numbers.startsWith("02")) {
    if (numbers.length <= 6) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }
  if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

/* ──────────────────────────────────────────────
   개인정보 동의 전문
   ────────────────────────────────────────────── */
const PRIVACY_FULL_TEXT = `[개인정보 수집·이용 동의서]

1. 수집 항목: 업체명, 담당자명, 연락처, 이메일, 배출 지역, 폐기물 종류, 예상 수량, 상세 문의사항

2. 수집 목적: 견적 문의 접수 및 상담, 서비스 안내

3. 보유 기간: 문의 접수일로부터 1년간 보유 후 파기
   (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보존)

4. 동의를 거부할 권리가 있으나, 거부 시 견적 문의 접수가 어려울 수 있습니다.

위 내용을 확인하였으며, 개인정보 수집·이용에 동의합니다.`;

/* ──────────────────────────────────────────────
   메인 컴포넌트
   ────────────────────────────────────────────── */
export default function InquiryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      regionSido: "",
      regionSigungu: "",
      wasteTypes: [],
      quantity: undefined,
      unit: "kg",
      frequency: "once",
      message: "",
      agreement: undefined as unknown as true,
    },
  });

  const selectedSido = watch("regionSido");
  const messageValue = watch("message") ?? "";

  const onSubmit = useCallback(
    async (data: InquiryFormValues) => {
      setIsSubmitting(true);

      // TODO: Resend 또는 EmailJS로 실제 이메일 발송 연동
      console.log("📋 견적문의 접수 데이터:", data);

      // 1초 딜레이 후 성공 모달 표시
      await new Promise((r) => setTimeout(r, 1000));
      setIsSubmitting(false);
      setShowSuccessModal(true);
    },
    []
  );

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    reset();
  };

  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* 섹션 타이틀 */}
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">INQUIRY</span>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">견적문의</h2>
          <div className="w-12 h-1 bg-accent mt-4"></div>
          <p className="text-neutral-600 mt-4 text-sm md:text-base leading-relaxed">
            아래 양식을 작성하여 견적을 문의해 주시면, 1영업일 내에 담당자가 연락드리겠습니다.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ──────── 좌측 (4/12): 연락처 안내 ──────── */}
          <div className="w-full lg:w-4/12 space-y-6">
            {/* 연락처 카드 */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-6">연락처 안내</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-white/60 text-xs mb-1">운영시간</p>
                    <p className="font-medium">{COMPANY.businessHours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-white/60 text-xs mb-1">대표번호</p>
                    <a
                      href={`tel:${COMPANY.tel}`}
                      className="text-xl font-bold hover:underline"
                    >
                      {COMPANY.tel}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
                  <div>
                    <p className="text-white/60 text-xs mb-1">이메일</p>
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="font-medium hover:underline"
                    >
                      {COMPANY.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 처리 프로세스 인포그래픽 */}
            <div className="bg-neutral-100 rounded-2xl p-6">
              <h3 className="font-bold text-neutral-900 mb-6">문의 처리 프로세스</h3>
              <div className="space-y-0">
                {[
                  { step: "01", label: "문의 접수", desc: "온라인 양식 제출" },
                  { step: "02", label: "담당자 배정", desc: "전문 상담원 배치" },
                  { step: "03", label: "1영업일 내 연락", desc: "견적 및 상담 안내" },
                ].map((item, i) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {item.step}
                      </div>
                      {i < 2 && (
                        <div className="w-0.5 h-8 bg-primary/20 my-1" />
                      )}
                    </div>
                    <div className="pt-1.5 pb-4">
                      <p className="font-bold text-neutral-900 text-sm">{item.label}</p>
                      <p className="text-neutral-600 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ──────── 우측 (8/12): 견적 문의 폼 ──────── */}
          <div className="w-full lg:w-8/12">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* 1. 업체명 */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    업체명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="예: (주)○○산업"
                    {...register("companyName")}
                    aria-describedby={errors.companyName ? "err-companyName" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all",
                      errors.companyName
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                  {errors.companyName && (
                    <p id="err-companyName" role="alert" className="mt-1 text-red-500 text-xs">{errors.companyName.message}</p>
                  )}
                </div>

                {/* 2. 담당자명 */}
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    담당자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    placeholder="홍길동"
                    {...register("contactName")}
                    aria-describedby={errors.contactName ? "err-contactName" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all",
                      errors.contactName
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                  {errors.contactName && (
                    <p id="err-contactName" role="alert" className="mt-1 text-red-500 text-xs">{errors.contactName.message}</p>
                  )}
                </div>

                {/* 3. 연락처 (자동 하이픈) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                        aria-describedby={errors.phone ? "err-phone" : undefined}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all",
                          errors.phone
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p id="err-phone" role="alert" className="mt-1 text-red-500 text-xs">{errors.phone.message}</p>
                  )}
                </div>

                {/* 4. 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@company.co.kr"
                    {...register("email")}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all",
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                  {errors.email && (
                    <p id="err-email" role="alert" className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                {/* 5. 배출 지역 (시/도 + 시/군/구) */}
                <div>
                  <label htmlFor="regionSido" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    배출 지역 (시/도) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="regionSido"
                    {...register("regionSido", {
                      onChange: () => setValue("regionSigungu", ""),
                    })}
                    aria-describedby={errors.regionSido ? "err-regionSido" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all bg-white",
                      errors.regionSido
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    <option value="">시/도 선택</option>
                    {Object.keys(REGIONS).map((sido) => (
                      <option key={sido} value={sido}>{sido}</option>
                    ))}
                  </select>
                  {errors.regionSido && (
                    <p id="err-regionSido" role="alert" className="mt-1 text-red-500 text-xs">{errors.regionSido.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="regionSigungu" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    배출 지역 (시/군/구) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="regionSigungu"
                    disabled={!selectedSido}
                    {...register("regionSigungu")}
                    aria-describedby={errors.regionSigungu ? "err-regionSigungu" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border outline-none text-sm transition-all bg-white",
                      !selectedSido && "bg-gray-100 cursor-not-allowed",
                      errors.regionSigungu
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    <option value="">시/군/구 선택</option>
                    {selectedSido &&
                      REGIONS[selectedSido]?.map((sigungu) => (
                        <option key={sigungu} value={sigungu}>{sigungu}</option>
                      ))}
                  </select>
                  {errors.regionSigungu && (
                    <p id="err-regionSigungu" role="alert" className="mt-1 text-red-500 text-xs">{errors.regionSigungu.message}</p>
                  )}
                </div>
              </div>

              {/* 6. 폐기물 종류 (체크박스 그룹) — Full Width */}
              <div className="mt-6">
                <fieldset>
                  <legend className="block text-sm font-semibold text-neutral-900 mb-3">
                    폐기물 종류 <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(복수 선택 가능)</span>
                  </legend>
                  <Controller
                    name="wasteTypes"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {WASTE_TYPE_OPTIONS.map((type) => {
                          const checked = field.value?.includes(type);
                          return (
                            <label
                              key={type}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all text-sm",
                                checked
                                  ? "border-primary bg-primary/5 text-primary font-medium"
                                  : "border-gray-200 hover:border-gray-300 text-neutral-600"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...(field.value || []), type]
                                    : (field.value || []).filter((v) => v !== type);
                                  field.onChange(updated);
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary/20 w-4 h-4"
                              />
                              {type}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.wasteTypes && (
                    <p role="alert" className="mt-1 text-red-500 text-xs">{errors.wasteTypes.message}</p>
                  )}
                </fieldset>
              </div>

              {/* 7. 예상 수량 + 단위 */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    예상 수량 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="quantity"
                      type="number"
                      min={0}
                      placeholder="수량 입력"
                      {...register("quantity", { valueAsNumber: true })}
                      aria-describedby={errors.quantity ? "err-quantity" : undefined}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border outline-none text-sm transition-all",
                        errors.quantity
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                    <select
                      {...register("unit")}
                      className="w-32 px-3 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                    >
                      {UNIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.quantity && (
                    <p id="err-quantity" role="alert" className="mt-1 text-red-500 text-xs">{errors.quantity.message}</p>
                  )}
                </div>

                {/* 8. 수거 주기 (라디오) */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-semibold text-neutral-900 mb-1.5">
                      수거 주기 <span className="text-red-500">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            "px-4 py-3 rounded-lg border cursor-pointer transition-all text-sm",
                            watch("frequency") === opt.value
                              ? "border-primary bg-primary/5 text-primary font-medium"
                              : "border-gray-200 hover:border-gray-300 text-neutral-600"
                          )}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            {...register("frequency")}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.frequency && (
                      <p role="alert" className="mt-1 text-red-500 text-xs">{errors.frequency.message}</p>
                    )}
                  </fieldset>
                </div>
              </div>

              {/* 9. 상세 문의사항 (textarea) */}
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-semibold text-neutral-900 mb-1.5">
                  상세 문의사항 <span className="text-xs text-gray-400 font-normal">(선택)</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  placeholder="추가 요청사항이나 특이사항을 입력해 주세요"
                  {...register("message")}
                  aria-describedby={errors.message ? "err-message" : undefined}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all resize-none"
                />
                <div className="flex justify-between mt-1">
                  {errors.message ? (
                    <p id="err-message" role="alert" className="text-red-500 text-xs">{errors.message.message}</p>
                  ) : (
                    <span />
                  )}
                  <span className={cn("text-xs", messageValue.length > 450 ? "text-red-500" : "text-gray-400")}>
                    {messageValue.length}/500
                  </span>
                </div>
              </div>

              {/* 10. 개인정보 수집·이용 동의 */}
              <div className="mt-6 bg-neutral-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Controller
                    name="agreement"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="agreement"
                        type="checkbox"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary/20 w-5 h-5 cursor-pointer"
                      />
                    )}
                  />
                  <label htmlFor="agreement" className="text-sm text-neutral-700 cursor-pointer leading-relaxed">
                    <span className="font-bold">[필수]</span> 개인정보 수집·이용에 동의합니다.{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-primary underline hover:text-secondary font-medium"
                    >
                      전문 보기
                    </button>
                  </label>
                </div>
                {errors.agreement && (
                  <p role="alert" className="mt-2 text-red-500 text-xs ml-8">{errors.agreement.message}</p>
                )}
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "mt-8 w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-200",
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-secondary shadow-lg hover:shadow-xl active:scale-[0.99]"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    전송 중...
                  </span>
                ) : (
                  "견적문의 보내기"
                )}
              </button>

              {/* 하단 고지 */}
              <p className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
                ※ 본 문의 내용은 업무 목적으로만 사용되며, 개인정보처리방침에 따라 안전하게 관리됩니다.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ──────── 성공 모달 ──────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center animate-fade-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">문의가 접수되었습니다</h3>
            <p className="text-neutral-600 text-sm leading-relaxed mb-2">
              1영업일 내에 담당자가 연락드리겠습니다.
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              긴급한 경우{" "}
              <a href={`tel:${COMPANY.tel}`} className="text-primary font-bold hover:underline">
                {COMPANY.tel}
              </a>
              로 직접 연락 부탁드립니다.
            </p>
            <button
              onClick={handleSuccessClose}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ──────── 개인정보 동의 전문 모달 ──────── */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-neutral-900">개인정보 수집·이용 동의</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 leading-relaxed font-sans">
                {PRIVACY_FULL_TEXT}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



