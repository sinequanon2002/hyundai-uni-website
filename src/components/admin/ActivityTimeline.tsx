import { type InquiryActivity } from "@/lib/actions/inquiry";
import { ArrowRight, UserCheck, StickyNote, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending:   "접수대기",
  reviewing: "검토중",
  quoted:    "견적발송",
  completed: "완료",
  cancelled: "취소",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "text-yellow-600 bg-yellow-50 border-yellow-200",
  reviewing: "text-blue-600 bg-blue-50 border-blue-200",
  quoted:    "text-purple-600 bg-purple-50 border-purple-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-gray-500 bg-gray-50 border-gray-200",
};

function StatusChip({ status }: { status: string | null }) {
  if (!status) return <span className="text-gray-400">-</span>;
  return (
    <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", STATUS_COLORS[status] ?? "text-gray-600 bg-gray-50 border-gray-200")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface ActivityItemProps {
  activity: InquiryActivity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const time = new Date(activity.created_at).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  let icon: React.ReactNode;
  let content: React.ReactNode;
  let iconBg: string;

  if (activity.action_type === "status_change") {
    iconBg = "bg-primary/10 text-primary";
    icon = <ArrowRight className="w-3.5 h-3.5" />;
    content = (
      <span className="flex items-center gap-1.5 flex-wrap">
        <StatusChip status={activity.from_status} />
        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
        <StatusChip status={activity.to_status} />
        <span className="text-gray-500 text-xs">로 변경</span>
      </span>
    );
  } else if (activity.action_type === "assigned") {
    iconBg = "bg-secondary/10 text-secondary";
    icon = <UserCheck className="w-3.5 h-3.5" />;
    content = <span className="text-sm text-gray-700">{activity.note}</span>;
  } else {
    iconBg = "bg-gray-100 text-gray-500";
    icon = <StickyNote className="w-3.5 h-3.5" />;
    content = (
      <span className="text-sm text-gray-700 line-clamp-2 break-keep">
        메모: {activity.note}
      </span>
    );
  }

  return (
    <li className="flex gap-3">
      {/* 타임라인 선 */}
      <div className="flex flex-col items-center">
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* 내용 */}
      <div className={cn("pb-4 min-w-0", isLast && "pb-0")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
          <span className="text-xs font-semibold text-gray-700">
            {activity.actor_name ?? "시스템"}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <Clock className="w-2.5 h-2.5" />
            {time}
          </span>
        </div>
        <div>{content}</div>
      </div>
    </li>
  );
}

interface ActivityTimelineProps {
  activities: InquiryActivity[];
  createdAt: string;
  companyName: string;
}

export function ActivityTimeline({ activities, createdAt, companyName }: ActivityTimelineProps) {
  const createdTime = new Date(createdAt).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
        활동 이력
      </h2>

      <ul className="space-y-0">
        {/* 접수 이벤트 (항상 첫 번째) */}
        <li className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-xs font-bold">
              접
            </div>
            {(activities.length > 0) && <div className="w-px flex-1 bg-gray-100 mt-1" />}
          </div>
          <div className={cn("min-w-0", activities.length > 0 ? "pb-4" : "pb-0")}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
              <span className="text-xs font-semibold text-gray-700">{companyName}</span>
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Clock className="w-2.5 h-2.5" />
                {createdTime}
              </span>
            </div>
            <span className="text-sm text-gray-700">견적 문의 접수</span>
          </div>
        </li>

        {activities.map((activity, i) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isLast={i === activities.length - 1}
          />
        ))}
      </ul>

      {activities.length === 0 && (
        <p className="text-xs text-gray-400 mt-2 pl-10">아직 처리 이력이 없습니다.</p>
      )}
    </div>
  );
}
