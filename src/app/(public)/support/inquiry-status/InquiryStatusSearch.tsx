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
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_STEPS = ["pending", "reviewing", "quoted", "completed"] as const;

export default function InquiryStatusSearch() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<PublicInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

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
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000"
          required
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <button
          type="submit"
          disabled={isPending || !phone}
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-60 shrink-0"
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
              <p className="text-sm text-neutral-mid">해당 연락처로 접수된 문의가 없습니다.</p>
              <p className="text-xs text-gray-400 mt-1">
                입력하신 번호가 정확한지 확인해주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-mid">총 {results.length}건의 문의가 조회되었습니다.</p>
              {results.map((inq) => {
                const stepIdx = STATUS_STEPS.indexOf(inq.status as typeof STATUS_STEPS[number]);
                const isCancelled = inq.status === "cancelled";

                return (
                  <div key={inq.id} className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-dark">
                          {inq.waste_types.slice(0, 2).join(", ")}
                          {inq.waste_types.length > 2 && ` 외 ${inq.waste_types.length - 2}건`}
                        </p>
                        <p className="text-xs text-neutral-mid mt-0.5">
                          접수일: {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                          {inq.collection_date && (
                            <> · 희망수거일: {new Date(inq.collection_date).toLocaleDateString("ko-KR")}</>
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
                                <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${isActive && idx < stepIdx ? "bg-primary" : "bg-gray-200"}`} />
                              )}
                              <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                isCurrent
                                  ? "bg-primary border-primary text-white"
                                  : isActive
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}>
                                {isActive ? "✓" : ""}
                              </div>
                              <p className={`mt-1.5 text-center text-xs ${isCurrent ? "font-semibold text-primary" : isActive ? "text-neutral-dark" : "text-gray-400"}`}>
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
