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
      <p className="text-sm font-medium text-red-600">ê´€ë¦¬ì ?˜ì´ì§€ ?¤ë¥˜</p>
      <p className="text-xs text-gray-400 max-w-sm">
        {error.message || "?°ì´?°ë? ë¶ˆëŸ¬?¤ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤."}
      </p>
      <button
        onClick={reset}
        className="text-xs px-4 py-2 bg-[#0C5F6B] text-white rounded-md hover:bg-[#094855]"
      >
        ?¤ì‹œ ?œë„
      </button>
    </div>
  );
}
