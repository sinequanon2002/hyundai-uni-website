"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendQuotation } from "@/lib/actions/quotes";

interface SendQuoteButtonProps {
  quoteId: string;
  email: string;
}

export function SendQuoteButton({ quoteId, email }: SendQuoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSend = () => {
    if (!confirm(`${email} 로 견적서를 발송하시겠습니까?`)) return;

    startTransition(async () => {
      const result = await sendQuotation(quoteId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "발송 중 오류가 발생했습니다");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      {isPending ? "발송 중..." : "견적서 발송"}
    </button>
  );
}
