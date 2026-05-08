"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Customer Portal Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
      <p className="text-sm font-medium text-red-600">오류가 발생했습니다</p>
      <p className="text-xs text-gray-400 max-w-sm">
        {error.message || "데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="text-xs px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="text-xs px-4 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
