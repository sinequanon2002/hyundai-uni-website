"use client";

import { useTransition, useState } from "react";
import { assignInquiry } from "@/lib/actions/inquiry";
import { UserCircle, Loader2, Check } from "lucide-react";

interface StaffUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

interface AssigneeSelectProps {
  inquiryId: string;
  currentAssigneeId: string | null;
  staffList: StaffUser[];
}

export function AssigneeSelect({
  inquiryId,
  currentAssigneeId,
  staffList,
}: AssigneeSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string>(currentAssigneeId ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await assignInquiry(inquiryId, selectedId || null);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error ?? "저장 실패");
      }
    });
  };

  const currentAssignee = staffList.find((s) => s.id === currentAssigneeId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-700">담당 직원</span>
      </div>

      {currentAssigneeId && currentAssignee ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-cobalt-100 rounded-lg text-sm">
          <div className="w-6 h-6 rounded-full bg-cobalt-100 text-cobalt-600 flex items-center justify-center text-xs font-bold shrink-0">
            {(currentAssignee.full_name ?? currentAssignee.email)[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-cobalt-600 truncate">
            {currentAssignee.full_name ?? currentAssignee.email}
          </span>
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic px-1">배정된 담당자 없음</div>
      )}

      <div className="flex gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 min-w-0 text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
        >
          <option value="">배정 해제</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name ?? s.email}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selectedId === (currentAssigneeId ?? "")}
          className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg bg-cobalt-600 text-white hover:bg-cobalt-700 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : null}
          {isPending ? "저장 중" : saved ? "완료" : "배정"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
