"use client";

import { useState, useTransition } from "react";
import { approveBrochureRequest, rejectBrochureRequest, type BrochureStatus } from "@/lib/actions/brochure";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  status: BrochureStatus;
  approvedAt: string | null;
}

export function BrochureApproveButton({ id, status, approvedAt }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<BrochureStatus>(status);
  const [error, setError] = useState<string | null>(null);

  if (localStatus === "approved") {
    return (
      <span className="text-xs text-slate-400">
        {approvedAt ? new Date(approvedAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "발송됨"}
      </span>
    );
  }

  if (localStatus === "rejected") {
    return <span className="text-xs text-slate-400">반려됨</span>;
  }

  const handleApprove = () => {
    if (!confirm("승인하고 소개서 이메일을 발송하시겠습니까?")) return;
    setError(null);
    startTransition(async () => {
      const result = await approveBrochureRequest(id);
      if (result.success) {
        setLocalStatus("approved");
      } else {
        setError(result.error ?? "오류가 발생했습니다");
      }
    });
  };

  const handleReject = () => {
    if (!confirm("이 신청을 반려하시겠습니까?")) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectBrochureRequest(id);
      if (result.success) {
        setLocalStatus("rejected");
      } else {
        setError(result.error ?? "오류가 발생했습니다");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            "bg-cobalt-600 text-white hover:bg-cobalt-700 disabled:opacity-50"
          )}
          title="승인 및 이메일 발송"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          발송
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
          title="반려"
        >
          <X className="w-3 h-3" />
          반려
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
