"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { generateQuotePdf } from "@/lib/actions/quotes";

interface GeneratePdfButtonProps {
  quoteId: string;
}

export function GeneratePdfButton({ quoteId }: GeneratePdfButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateQuotePdf(quoteId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "PDF 생성 중 오류가 발생했습니다");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <span className="w-4 h-4 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {isPending ? "생성 중..." : "PDF 생성"}
    </button>
  );
}
