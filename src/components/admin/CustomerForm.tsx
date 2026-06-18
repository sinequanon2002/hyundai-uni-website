"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import type { Customer } from "@/lib/actions/customers";

const WASTE_OPTIONS = [
  "폐유류", "폐산", "폐알칼리", "폐합성수지", "폐고무",
  "폐금속류", "폐형광등", "폐배터리", "폐페인트", "기타지정폐기물",
];

const schema = z.object({
  company_name:    z.string().min(1, "사업장명을 입력하세요"),
  business_number: z.string().optional(),
  ceo_name:        z.string().optional(),
  contact_name:    z.string().optional(),
  contact_phone:   z.string().optional(),
  contact_email:   z.string().email("올바른 이메일을 입력하세요").optional().or(z.literal("")),
  address:         z.string().optional(),
  waste_types:     z.array(z.string()).optional(),
  notes:           z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer;
  sourceInquiryId?: string;
}

export function CustomerForm({ mode, customer, sourceInquiryId }: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name:    customer?.company_name ?? "",
      business_number: customer?.business_number ?? "",
      ceo_name:        customer?.ceo_name ?? "",
      contact_name:    customer?.contact_name ?? "",
      contact_phone:   customer?.contact_phone ?? "",
      contact_email:   customer?.contact_email ?? "",
      address:         customer?.address ?? "",
      waste_types:     customer?.waste_types ?? [],
      notes:           customer?.notes ?? "",
    },
  });

  const selectedWasteTypes = watch("waste_types") ?? [];

  const toggleWasteType = (type: string) => {
    const cur = watch("waste_types") ?? [];
    setValue("waste_types", cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type]);
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const input = {
        company_name:      values.company_name,
        business_number:   values.business_number || undefined,
        ceo_name:          values.ceo_name || undefined,
        contact_name:      values.contact_name || undefined,
        contact_phone:     values.contact_phone || undefined,
        contact_email:     values.contact_email || undefined,
        address:           values.address || undefined,
        waste_types:       values.waste_types ?? [],
        notes:             values.notes || undefined,
        source_inquiry_id: sourceInquiryId,
      };

      let result;
      if (mode === "create") {
        result = await createCustomer(input);
        if (result.success && result.data) {
          router.push(`/admin/customers/${result.data.id}`);
        }
      } else {
        result = await updateCustomer(customer!.id, input);
        if (result.success) {
          router.push(`/admin/customers/${customer!.id}`);
        }
      }

      if (!result?.success) {
        alert(result?.error ?? "오류가 발생했습니다");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 기본 정보 */}
      <div className="bg-white rounded-sm shadow-ds-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="사업장명 *" error={errors.company_name?.message} className="sm:col-span-2">
            <input {...register("company_name")} className={inputCls(!!errors.company_name)} placeholder="(주)예시기업" />
          </Field>
          <Field label="사업자번호" error={errors.business_number?.message}>
            <input {...register("business_number")} className={inputCls(false)} placeholder="000-00-00000" />
          </Field>
          <Field label="대표자명">
            <input {...register("ceo_name")} className={inputCls(false)} placeholder="홍길동" />
          </Field>
          <Field label="주소" className="sm:col-span-2">
            <input {...register("address")} className={inputCls(false)} placeholder="경기도 화성시 ..." />
          </Field>
        </div>
      </div>

      {/* 담당자 정보 */}
      <div className="bg-white rounded-sm shadow-ds-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">담당자 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="담당자명" error={errors.contact_name?.message}>
            <input {...register("contact_name")} className={inputCls(false)} placeholder="김담당" />
          </Field>
          <Field label="연락처" error={errors.contact_phone?.message}>
            <input {...register("contact_phone")} className={inputCls(false)} placeholder="010-0000-0000" />
          </Field>
          <Field label="이메일" error={errors.contact_email?.message} className="sm:col-span-2">
            <input {...register("contact_email")} type="email" className={inputCls(!!errors.contact_email)} placeholder="manager@company.com" />
          </Field>
        </div>
      </div>

      {/* 폐기물 종류 */}
      <div className="bg-white rounded-sm shadow-ds-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">주요 폐기물 종류</h2>
        <div className="flex flex-wrap gap-2">
          {WASTE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleWasteType(type)}
              className={[
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                selectedWasteTypes.includes(type)
                  ? "bg-cobalt-600 text-white border-cobalt-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
              ].join(" ")}
            >
              {type}
            </button>
          ))}
        </div>
        {selectedWasteTypes.length > 0 && (
          <p className="text-xs text-slate-400 mt-3">
            선택됨: {selectedWasteTypes.join(", ")}
          </p>
        )}
      </div>

      {/* 비고 */}
      <div className="bg-white rounded-sm shadow-ds-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">메모 / 특이사항</h2>
        <textarea
          {...register("notes")}
          rows={3}
          className={`${inputCls(false)} resize-none`}
          placeholder="계약 조건, 특이사항 등"
        />
      </div>

      {/* 제출 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors disabled:opacity-50"
        >
          {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {mode === "create" ? "고객 등록" : "수정 완료"}
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full h-[38px] px-3 text-sm rounded-lg border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600",
    hasError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white",
  ].join(" ");
}

function Field({ label, error, children, className = "" }: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
