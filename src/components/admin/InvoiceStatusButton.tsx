"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus } from "@/lib/actions/dispatches";

const NEXT: Record<string, { status: "issued" | "paid" | "cancelled"; label: string; cls: string } | null> = {
  pending:   { status: "issued", label: "발행 처리",  cls: "bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded-lg font-medium transition-colors" },
  issued:    { status: "paid",   label: "수납 완료",  cls: "bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded-lg font-medium transition-colors" },
  paid:      null,
  cancelled: null,
};

export function InvoiceStatusButton({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = NEXT[currentStatus];
  if (!next) return <span className="text-xs text-gray-300">-</span>;

  const handleClick = () => {
    startTransition(async () => {
      const today = new Date().toISOString().split("T")[0];
      const result = await updateInvoiceStatus(
        invoiceId,
        next.status,
        next.status === "issued" ? today : undefined,
      );
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "처리 실패");
      }
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending} className={`${next.cls} disabled:opacity-50 whitespace-nowrap`}>
      {isPending ? "..." : next.label}
    </button>
  );
}
