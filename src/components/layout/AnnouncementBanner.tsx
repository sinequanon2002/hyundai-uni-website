"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const BANNER_KEY = "announcement-dismissed-v1";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(BANNER_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-accent text-white text-xs md:text-sm py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <p className="text-center leading-snug">
          지정폐기물 담당자 필독 —{" "}
          <Link
            href="/resources/allbaro-checklist"
            className="font-bold underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            올바로시스템 체크리스트 무료 다운로드 →
          </Link>
        </p>
        <button
          onClick={dismiss}
          aria-label="배너 닫기"
          className="shrink-0 p-0.5 hover:text-white/70 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
