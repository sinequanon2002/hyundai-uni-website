"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Calculator } from "lucide-react";
import { createQuotation } from "@/lib/actions/quotes";
import type { Quotation } from "@/lib/actions/quotes";

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  waste_type: z.string().min(1, "폐기물 종류를 입력하세요"),
  unit:       z.string().min(1, "단위를 입력하세요"),
  quantity:   z.number().min(0.01, "수량을 입력하세요"),
  unit_price: z.number().min(1, "단가를 입력하세요"),
  amount:     z.number(),
});

const quoteFormSchema = z.object({
  company_name:    z.string().min(1, "사업장명을 입력하세요"),
  contact_name:    z.string().min(1, "담당자명을 입력하세요"),
  email:           z.string().email("올바른 이메일 주소를 입력하세요"),
  phone:           z.string().min(1, "전화번호를 입력하세요"),
  address:         z.string().optional(),
  items:           z.array(itemSchema).min(1, "견적 항목을 1개 이상 추가하세요"),
  valid_until:     z.string().optional(),
  collection_date: z.string().optional(),
  notes:           z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface QuoteFormProps {
  inquiryId: string;
  defaults?: {
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    waste_types?: string[];
  };
}

// ─── 금액 계산 헬퍼 ────────────────────────────────────────────────────────────

function calcAmount(qty: number, price: number) {
  return Math.round(qty * price);
}

function fmt(n: number) {
  if (!n || isNaN(n)) return "0";
  return n.toLocaleString("ko-KR");
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function QuoteForm({ inquiryId, defaults }: QuoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      company_name:    defaults?.company_name ?? "",
      contact_name:    defaults?.contact_name ?? "",
      email:           defaults?.email ?? "",
      phone:           defaults?.phone ?? "",
      address:         defaults?.address ?? "",
      items: defaults?.waste_types?.map((wt) => ({
        waste_type: wt,
        unit: "kg",
        quantity: 0,
        unit_price: 0,
        amount: 0,
      })) ?? [{ waste_type: "", unit: "kg", quantity: 0, unit_price: 0, amount: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  // 항목 수량/단가 변경 시 금액 자동 계산
  useEffect(() => {
    watchedItems.forEach((item, i) => {
      const computed = calcAmount(Number(item.quantity), Number(item.unit_price));
      if (computed !== item.amount) {
        setValue(`items.${i}.amount`, computed);
      }
    });
  }, [watchedItems, setValue]);

  const subtotal = watchedItems.reduce((s, item) => s + (Number(item.amount) || 0), 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  const onSubmit = (values: QuoteFormValues) => {
    startTransition(async () => {
      const result = await createQuotation({
        inquiry_id:      inquiryId,
        company_name:    values.company_name,
        contact_name:    values.contact_name,
        email:           values.email,
        phone:           values.phone,
        address:         values.address,
        items:           values.items.map((item) => ({
          waste_type: item.waste_type,
          unit:       item.unit,
          quantity:   Number(item.quantity),
          unit_price: Number(item.unit_price),
          amount:     Number(item.amount),
        })),
        subtotal,
        tax,
        total,
        valid_until:     values.valid_until,
        collection_date: values.collection_date,
        notes:           values.notes,
      });

      if (result.success && result.data) {
        router.push(`/admin/quotes/${result.data.id}`);
      } else {
        alert(result.error ?? "견적서 생성 중 오류가 발생했습니다");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 고객 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">고객 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="사업장명 *" error={errors.company_name?.message}>
            <input {...register("company_name")} className={inputCls(!!errors.company_name)} placeholder="(주)홍길동기업" />
          </Field>
          <Field label="담당자명 *" error={errors.contact_name?.message}>
            <input {...register("contact_name")} className={inputCls(!!errors.contact_name)} placeholder="홍길동" />
          </Field>
          <Field label="이메일 *" error={errors.email?.message}>
            <input {...register("email")} type="email" className={inputCls(!!errors.email)} placeholder="example@company.com" />
          </Field>
          <Field label="전화번호 *" error={errors.phone?.message}>
            <input {...register("phone")} className={inputCls(!!errors.phone)} placeholder="010-0000-0000" />
          </Field>
          <Field label="주소" error={errors.address?.message} className="sm:col-span-2">
            <input {...register("address")} className={inputCls(false)} placeholder="경기도 화성시 ..." />
          </Field>
        </div>
      </div>

      {/* 견적 항목 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">견적 항목</h2>
          <button
            type="button"
            onClick={() => append({ waste_type: "", unit: "kg", quantity: 0, unit_price: 0, amount: 0 })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            항목 추가
          </button>
        </div>

        {errors.items && typeof errors.items === "object" && !Array.isArray(errors.items) && (
          <p className="text-xs text-red-500 mb-3">{(errors.items as { message?: string }).message}</p>
        )}

        {/* 헤더 (데스크톱) */}
        <div className="hidden sm:grid grid-cols-[1fr_80px_90px_100px_110px_36px] gap-2 text-xs text-gray-400 font-medium mb-2 px-1">
          <span>폐기물 종류</span>
          <span>단위</span>
          <span className="text-right">수량</span>
          <span className="text-right">단가(원)</span>
          <span className="text-right">금액(원)</span>
          <span />
        </div>

        <div className="space-y-2">
          {fields.map((field, i) => {
            const amount = Number(watchedItems[i]?.amount) || 0;
            return (
              <div key={field.id} className="sm:grid sm:grid-cols-[1fr_80px_90px_100px_110px_36px] sm:gap-2 space-y-2 sm:space-y-0 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <input
                  {...register(`items.${i}.waste_type`)}
                  placeholder="폐기물 종류"
                  className={inputCls(!!errors.items?.[i]?.waste_type)}
                />
                <input
                  {...register(`items.${i}.unit`)}
                  placeholder="kg"
                  className={inputCls(false)}
                />
                <input
                  {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className={`${inputCls(false)} text-right`}
                />
                <input
                  {...register(`items.${i}.unit_price`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="0"
                  className={`${inputCls(false)} text-right`}
                />
                <div className="flex items-center justify-end h-[38px] text-sm font-medium text-gray-700 bg-gray-50 rounded-lg px-3">
                  {fmt(amount)}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                  className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* 합계 */}
        <div className="mt-5 flex justify-end">
          <div className="w-full sm:w-64 border border-gray-100 rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-50">
              <span className="text-gray-500">공급가액</span>
              <span className="font-medium">{fmt(subtotal)}원</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-50">
              <span className="text-gray-500">부가세 (10%)</span>
              <span className="font-medium">{fmt(tax)}원</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-primary text-white text-sm font-bold">
              <span>합 계</span>
              <span>{fmt(total)}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">추가 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="견적 유효기간" error={errors.valid_until?.message}>
            <input {...register("valid_until")} type="date" className={inputCls(false)} />
          </Field>
          <Field label="수거 예정일" error={errors.collection_date?.message}>
            <input {...register("collection_date")} type="date" className={inputCls(false)} />
          </Field>
          <Field label="비고" className="sm:col-span-2">
            <textarea
              {...register("notes")}
              rows={3}
              className={`${inputCls(false)} resize-none`}
              placeholder="특이사항, 작업 조건 등"
            />
          </Field>
        </div>
      </div>

      {/* 제출 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          {isPending ? "생성 중..." : "견적서 생성"}
        </button>
      </div>
    </form>
  );
}

// ─── 유틸 컴포넌트 ─────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    "w-full h-[38px] px-3 text-sm rounded-lg border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
    hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white",
  ].join(" ");
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
