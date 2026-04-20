"use client";

import { useTransition, useState } from "react";
import { updateInquiryStatus, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "pending",   label: "접수대기" },
  { value: "reviewing", label: "검토중" },
  { value: "quoted",    label: "견적발송" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
];

interface InquiryStatusUpdateFormProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
  currentNotes?: string | null;
}

export function InquiryStatusUpdateForm({
  inquiryId,
  currentStatus,
  currentNotes,
}: InquiryStatusUpdateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await updateInquiryStatus(inquiryId, selectedStatus, notes);
      if (res.success) {
        setResult({ type: "success", message: "상태가 업데이트되었습니다" });
      } else {
        setResult({ type: "error", message: res.error ?? "업데이트 실패" });
        setSelectedStatus(currentStatus);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">처리 상태</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedStatus(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                selectedStatus === opt.value
                  ? "border-[#1F4E79] bg-[#1F4E79] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#1F4E79]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          현재:{" "}
          <InquiryStatusBadge status={currentStatus} className="ml-1" />
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          메모 (내부용)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="담당자 메모, 처리 내용 등을 기록하세요"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/30 focus:border-[#1F4E79] resize-none"
        />
      </div>

      {result && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-2 rounded-lg",
            result.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          )}
        >
          {result.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-[#1F4E79] text-white text-sm font-semibold rounded-lg hover:bg-[#2E75B6] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}
