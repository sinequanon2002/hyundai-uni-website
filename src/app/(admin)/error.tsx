"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <p className="text-sm font-medium text-red-600">관리자 페이지 오류</p>
      <p className="text-xs text-gray-400 max-w-sm">
        {error.message || "데이터를 불러오는 중 오류가 발생했습니다."}
      </p>
      <button
        onClick={reset}
        className="text-xs px-4 py-2 bg-[#1F4E79] text-white rounded-md hover:bg-[#1a4066]"
      >
        다시 시도
      </button>
    </div>
  );
}
