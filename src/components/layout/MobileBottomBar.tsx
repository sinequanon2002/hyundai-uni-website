"use client";

import Link from "next/link";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { trackPhoneClick, trackKakaoClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const KAKAO_CHANNEL_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL;

/** 모바일 전용 하단 고정 바 — 전화 / 카톡(채널 설정 시) / 견적 문의 */
export function MobileBottomBar() {
  const hasKakao = !!KAKAO_CHANNEL_URL;

  return (
    <>
      {/* 고정 바가 푸터 하단을 가리지 않도록 하는 스페이서 — 고정 바 높이(4rem) + iOS 홈 인디케이터 영역 */}
      <div
        className="lg:hidden"
        style={{ height: "calc(4rem + env(safe-area-inset-bottom))" }}
        aria-hidden
      />

      <nav
        aria-label="빠른 문의"
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 lg:hidden",
          "grid h-16 bg-white border-t border-neutral-200",
          "shadow-[0_-2px_12px_rgba(0,0,0,0.08)]",
          "pb-[env(safe-area-inset-bottom)]",
          hasKakao ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        <a
          href={`tel:${COMPANY.tel}`}
          onClick={() => trackPhoneClick("mobile_bottom_bar")}
          className="flex flex-col items-center justify-center gap-0.5 text-cobalt-600 active:bg-slate-50"
        >
          <Phone size={19} />
          <span className="text-[11px] font-bold">전화 문의</span>
        </a>

        {hasKakao && (
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackKakaoClick("mobile_bottom_bar")}
            className="flex flex-col items-center justify-center gap-0.5 text-[#3C1E1E] bg-[#FEE500] active:brightness-95"
          >
            <MessageCircle size={19} />
            <span className="text-[11px] font-bold">카톡 문의</span>
          </a>
        )}

        <Link
          href="/support/inquiry"
          className="flex flex-col items-center justify-center gap-0.5 bg-mint-500 text-white active:bg-mint-600"
        >
          <FileText size={19} />
          <span className="text-[11px] font-bold">견적 문의</span>
        </Link>
      </nav>
    </>
  );
}
