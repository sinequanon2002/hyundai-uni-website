"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDispatchStatus } from "@/lib/actions/dispatches";
import type { DispatchStatus } from "@/lib/actions/dispatches";

const NEXT_STATUS: Partial<Record<DispatchStatus, { status: DispatchStatus; label: string; cls: string }>> = {
  pending:    { status: "scheduled",  label: "예정으로 변경",     cls: "bg-blue-600 hover:bg-blue-700 text-white" },
  scheduled:  { status: "in_transit", label: "수거 시작",          cls: "bg-orange-500 hover:bg-orange-600 text-white" },
  in_transit: { status: "completed",  label: "수거 완료 처리",     cls: "bg-green-600 hover:bg-green-700 text-white" },
};

export function DispatchStatusButton({ dispatchId, currentStatus }: { dispatchId: string; currentStatus: DispatchStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = NEXT_STATUS[currentStatus];
  if (!next) return null;

  const handleClick = () => {
    startTransition(async () => {
      const result = await updateDispatchStatus(dispatchId, next.status);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "상태 변경 실패");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${next.cls}`}
    >
      {isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {next.label}
    </button>
  );
}
