"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createDispatch, updateDispatch } from "@/lib/actions/dispatches";
import type { Dispatch, DispatchWasteItem } from "@/lib/actions/dispatches";

const WASTE_OPTIONS = [
  "폐유류", "폐산", "폐알칼리", "폐합성수지", "폐고무",
  "폐금속류", "폐형광등", "폐배터리", "폐페인트", "기타지정폐기물",
];

const UNIT_OPTIONS = ["드럼(200L)", "톤(ton)", "L(리터)", "kg", "개", "식"];

const wasteItemSchema = z.object({
  waste_type:    z.string().min(1, "폐기물 종류를 입력하세요"),
  unit:          z.string().min(1, "단위를 선택하세요"),
  estimated_qty: z.number().min(0.01, "예상 수량을 입력하세요"),
  actual_qty:    z.number().min(0),
  unit_price:    z.number().min(0),
  amount:        z.number().min(0),
});

const schema = z.object({
  customer_id:        z.string().optional(),
  scheduled_date:     z.string().optional(),
  collection_address: z.string().optional(),
  assigned_to:        z.string().optional(),
  notes:              z.string().optional(),
  waste_items: z.array(wasteItemSchema).min(1, "폐기물 항목을 1개 이상 입력하세요"),
});

type FormValues = z.infer<typeof schema>;

interface Staff { id: string; full_name: string | null; role: string }
interface Customer { id: string; company_name: string }

interface DispatchFormProps {
  mode:         "create" | "edit";
  dispatch?:    Dispatch;
  staffList:    Staff[];
  customers:    Customer[];
  defaultCustomerId?: string;
}

export function DispatchForm({ mode, dispatch, staffList, customers, defaultCustomerId }: DispatchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id:        dispatch?.customer_id ?? defaultCustomerId ?? "",
      scheduled_date:     dispatch?.scheduled_date?.slice(0, 10) ?? "",
      collection_address: dispatch?.collection_address ?? "",
      assigned_to:        dispatch?.assigned_to ?? "",
      notes:              dispatch?.notes ?? "",
      waste_items: dispatch?.waste_items ?? [
        { waste_type: "", unit: "드럼(200L)", estimated_qty: 0, actual_qty: 0, unit_price: 0, amount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "waste_items" });

  const wasteItems = watch("waste_items");

  // 금액 자동 계산
  useEffect(() => {
    wasteItems.forEach((item, i) => {
      const qty   = Number(item.estimated_qty) || 0;
      const price = Number(item.unit_price) || 0;
      const amount = qty * price;
      if (item.amount !== amount) {
        setValue(`waste_items.${i}.amount`, amount);
      }
    });
  }, [wasteItems.map(w => `${w.estimated_qty}-${w.unit_price}`).join(","), setValue, wasteItems]);

  const subtotal = wasteItems.reduce((s, w) => s + (Number(w.estimated_qty) || 0) * (Number(w.unit_price) || 0), 0);
  const tax      = Math.floor(subtotal * 0.1);
  const total    = subtotal + tax;

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const input = {
        customer_id:        values.customer_id  || undefined,
        scheduled_date:     values.scheduled_date || undefined,
        collection_address: values.collection_address || undefined,
        assigned_to:        values.assigned_to  || undefined,
        notes:              values.notes         || undefined,
        waste_items:        values.waste_items as DispatchWasteItem[],
        subtotal,
        tax,
        total,
      };

      let result;
      if (mode === "create") {
        result = await createDispatch(input);
        if (result.success && result.data) {
          router.push(`/admin/dispatches/${result.data.id}`);
          return;
        }
      } else {
        result = await updateDispatch(dispatch!.id, {
          assigned_to:        values.assigned_to  || null,
          scheduled_date:     values.scheduled_date || null,
          collection_address: values.collection_address || null,
          waste_items:        values.waste_items as DispatchWasteItem[],
          subtotal,
          tax,
          total,
          notes:              values.notes || null,
        });
        if (result.success) {
          router.push(`/admin/dispatches/${dispatch!.id}`);
          return;
        }
      }

      alert(result?.error ?? "오류가 발생했습니다");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 기본 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="배출 사업장">
            <select {...register("customer_id")} className={inputCls(false)}>
              <option value="">사업장 선택 (선택)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </Field>

          <Field label="담당 직원">
            <select {...register("assigned_to")} className={inputCls(false)}>
              <option value="">담당자 선택</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name ?? s.id}</option>
              ))}
            </select>
          </Field>

          <Field label="수거 예정일">
            <input {...register("scheduled_date")} type="date" className={inputCls(false)} />
          </Field>

          <Field label="수거 주소">
            <input {...register("collection_address")} className={inputCls(false)} placeholder="수거 장소 주소" />
          </Field>
        </div>
      </div>

      {/* 폐기물 항목 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">폐기물 항목</h2>
          <button
            type="button"
            onClick={() => append({ waste_type: "", unit: "드럼(200L)", estimated_qty: 0, actual_qty: 0, unit_price: 0, amount: 0 })}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-secondary font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            항목 추가
          </button>
        </div>

        {errors.waste_items?.root && (
          <p className="mb-3 text-xs text-red-500">{errors.waste_items.root.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, i) => {
            const rowErrors = errors.waste_items?.[i];
            const qty   = Number(wasteItems[i]?.estimated_qty) || 0;
            const price = Number(wasteItems[i]?.unit_price) || 0;
            const amt   = qty * price;

            return (
              <div key={field.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 relative">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-6">
                  <Field label="폐기물 종류" error={rowErrors?.waste_type?.message} className="col-span-2 sm:col-span-1">
                    <select {...register(`waste_items.${i}.waste_type`)} className={inputCls(!!rowErrors?.waste_type)}>
                      <option value="">선택</option>
                      {WASTE_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </Field>

                  <Field label="단위" error={rowErrors?.unit?.message}>
                    <select {...register(`waste_items.${i}.unit`)} className={inputCls(!!rowErrors?.unit)}>
                      {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>

                  <Field label="예상 수량" error={rowErrors?.estimated_qty?.message}>
                    <input
                      {...register(`waste_items.${i}.estimated_qty`, { valueAsNumber: true })}
                      type="number" step="0.01" min="0"
                      className={inputCls(!!rowErrors?.estimated_qty)}
                    />
                  </Field>

                  <Field label="단가 (원)">
                    <input
                      {...register(`waste_items.${i}.unit_price`, { valueAsNumber: true })}
                      type="number" step="1" min="0"
                      className={inputCls(false)}
                    />
                  </Field>

                  <Field label="금액" className="col-span-2 sm:col-span-1">
                    <div className="h-[38px] flex items-center px-3 text-sm font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg">
                      {amt.toLocaleString("ko-KR")}원
                    </div>
                  </Field>
                </div>
              </div>
            );
          })}
        </div>

        {/* 합계 */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>공급가액</span>
            <span>{subtotal.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>부가세 (10%)</span>
            <span>{tax.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-900 pt-1">
            <span>합계</span>
            <span className="text-primary">{total.toLocaleString("ko-KR")}원</span>
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">메모</h2>
        <textarea
          {...register("notes")}
          rows={3}
          className={`${inputCls(false)} resize-none h-auto`}
          placeholder="특이사항, 수거 조건 등"
        />
      </div>

      {/* 버튼 */}
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
          {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {mode === "create" ? "수거 건 등록" : "수정 완료"}
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full h-[38px] px-3 text-sm rounded-lg border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
    hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white",
  ].join(" ");
}

function Field({ label, error, children, className = "" }: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
