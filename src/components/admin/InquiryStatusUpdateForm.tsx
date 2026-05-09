"use client";

import { useTransition, useState } from "react";
import { updateInquiryStatus, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "pending",   label: "?‘ìˆ˜?€ê¸? },
  { value: "reviewing", label: "ê²€? ì¤‘" },
  { value: "quoted",    label: "ê²¬ì ë°œì†¡" },
  { value: "completed", label: "?„ë£Œ" },
  { value: "cancelled", label: "ì·¨ì†Œ" },
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
        setResult({ type: "success", message: "?íƒœê°€ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ?? });
      } else {
        setResult({ type: "error", message: res.error ?? "?…ë°?´íŠ¸ ?¤íŒ¨" });
        setSelectedStatus(currentStatus);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">ì²˜ë¦¬ ?íƒœ</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedStatus(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                selectedStatus === opt.value
                  ? "border-[#0C5F6B] bg-[#0C5F6B] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#0C5F6B]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ?„ì¬:{" "}
          <InquiryStatusBadge status={currentStatus} className="ml-1" />
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          ë©”ëª¨ (?´ë???
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="?´ë‹¹??ë©”ëª¨, ì²˜ë¦¬ ?´ìš© ?±ì„ ê¸°ë¡?˜ì„¸??
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0C5F6B]/30 focus:border-[#0C5F6B] resize-none"
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
        className="w-full py-2.5 bg-[#0C5F6B] text-white text-sm font-semibold rounded-lg hover:bg-[#0E9E7E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "?€??ì¤?.." : "?€?¥í•˜ê¸?}
      </button>
    </form>
  );
}
