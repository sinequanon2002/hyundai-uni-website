"use client";

import { useState, useTransition } from "react";
import { searchInquiriesByPhone, type PublicInquiry } from "@/lib/actions/customer";

const STATUS_LABEL: Record<string, string> = {
  pending:   "접수 완료",
  reviewing: "검토 중",
  quoted:    "견적 발송",
  completed: "처리 완료",
  cancelled: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  quoted:    "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-slate-50 text-slate-400 border-slate-200",
};

const STATUS_STEPS = ["pending", "reviewing", "quoted", "completed"] as const;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith("02")) {
    // 서울 지역번호 02-XXXX-XXXX 또는 02-XXX-XXXX
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 010, 011, 016, 051 등 3자리 지역번호
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function InquiryStatusSearch() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<PublicInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSearched(false);
    startTransition(async () => {
      const result = await searchInquiriesByPhone(phone);
      if (result.success) {
        setResults(result.data ?? []);
        setSearched(true);
      } else {
        setError(result.error ?? "조회 중 오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          required
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-500/30 focus:border-cobalt-500 transition"
        />
        <button
          type="submit"
          disabled={isPending || !phone}
          className="px-5 py-2.5 rounded-lg bg-mint-500 text-white text-sm font-semibold hover:bg-mint-600 transition-colors disabled:opacity-60 shrink-0"
        >
          {isPending ? "조회 중..." : "조회"}
        </button>
      </form>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {searched && results !== null && (
        <>
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">해당 연락처로 접수된 문의가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                입력하신 번호가 정확한지 확인해주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">총 {results.length}건의 문의가 조회되었습니다.</p>
              {results.map((inq) => {
                const stepIdx = STATUS_STEPS.indexOf(inq.status as typeof STATUS_STEPS[number]);
                const isCancelled = inq.status === "cancelled";

                return (
                  <div key={inq.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-navy-900">
                          {inq.waste_types.slice(0, 2).join(", ")}
                          {inq.waste_types.length > 2 && ` 외 ${inq.waste_types.length - 2}건`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          접수일: {new Date(inq.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                          {inq.collection_date && (
                            <> · 희망수거일: {new Date(inq.collection_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</>
                          )}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[inq.status] ?? ""}`}>
                        {STATUS_LABEL[inq.status] ?? inq.status}
                      </span>
                    </div>

                    {/* 진행 상태 바 */}
                    {!isCancelled && (
                      <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          return (
                            <div key={step} className="flex-1 flex flex-col items-center relative">
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${isActive && idx < stepIdx ? "bg-cobalt-600" : "bg-slate-200"}`} />
                              )}
                              <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                isCurrent
                                  ? "bg-cobalt-600 border-cobalt-600 text-white"
                                  : isActive
                                  ? "bg-cobalt-50 border-cobalt-600 text-cobalt-600"
                                  : "bg-white border-slate-200 text-slate-400"
                              }`}>
                                {isActive ? "✓" : ""}
                              </div>
                              <p className={`mt-1.5 text-center text-xs ${isCurrent ? "font-semibold text-cobalt-600" : isActive ? "text-navy-900" : "text-slate-400"}`}>
                                {STATUS_LABEL[step]}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {inq.status === "quoted" && (
                      <div className="mt-4 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-lg text-xs text-purple-700">
                        견적서가 발송되었습니다. 담당자에게 연락하시거나 로그인 후 확인하세요.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
