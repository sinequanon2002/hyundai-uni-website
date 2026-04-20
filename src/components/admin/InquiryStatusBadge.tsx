import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/lib/actions/inquiry";

const STATUS_CONFIG: Record<InquiryStatus, { label: string; className: string }> = {
  pending:   { label: "접수대기", className: "bg-yellow-100 text-yellow-800" },
  reviewing: { label: "검토중",   className: "bg-blue-100 text-blue-800" },
  quoted:    { label: "견적발송", className: "bg-purple-100 text-purple-800" },
  completed: { label: "완료",     className: "bg-green-100 text-green-800" },
  cancelled: { label: "취소",     className: "bg-red-100 text-red-800" },
};

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

export function InquiryStatusBadge({ status, className }: InquiryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
