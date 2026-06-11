"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const NAVER_ID = process.env.NEXT_PUBLIC_NAVER_ANALYTICS_ID;

/** App Router 라우트 전환 시 page_view 수동 전송 (최초 로드는 config/wcs_do가 처리) */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (GA_ID) window.gtag?.("event", "page_view", { page_path: url });
    if (NAVER_ID) window.wcs_do?.();
  }, [pathname, searchParams]);

  return null;
}

/**
 * GA4 + 네이버 프리미엄 로그분석 스크립트.
 * NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_NAVER_ANALYTICS_ID 가 없으면 아무것도 렌더링하지 않음.
 */
export function Analytics() {
  if (!GA_ID && !NAVER_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      {NAVER_ID && (
        <Script
          src="https://wcs.naver.net/wcslog.js"
          strategy="afterInteractive"
          onLoad={() => {
            window.wcs_add = window.wcs_add || {};
            window.wcs_add["wa"] = NAVER_ID;
            window.wcs_do?.();
          }}
        />
      )}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
