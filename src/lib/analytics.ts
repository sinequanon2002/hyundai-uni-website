// 전환 이벤트 헬퍼 — GA4(gtag) + 네이버 프리미엄 로그분석(wcs) 동시 전송
// 측정 ID가 설정되지 않은 환경에서는 모든 함수가 조용히 no-op 처리됩니다.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    wcs?: { cnv?: (type: string, value: string) => unknown };
    wcs_add?: Record<string, string>;
    wcs_do?: (nasa?: Record<string, unknown>) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

/** GA4 커스텀 이벤트 전송 */
export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

/**
 * 네이버 프리미엄 로그분석 전환 전송
 * type — "1" 구매, "2" 회원가입, "3" 장바구니, "4" 구매예약·상담신청, "5" 기타
 */
function trackNaverConversion(type: string, value = "1") {
  if (typeof window === "undefined") return;
  if (!window.wcs?.cnv || !window.wcs_do) return;
  window.wcs_do({ cnv: window.wcs.cnv(type, value) });
}

/** 견적 문의 접수 완료 — 핵심 전환 */
export function trackInquirySubmit() {
  trackEvent("generate_lead", { lead_type: "inquiry" });
  trackNaverConversion("4");
}

/** 서비스 소개서 신청 완료 — 보조 전환 */
export function trackBrochureSubmit() {
  trackEvent("generate_lead", { lead_type: "brochure" });
  trackNaverConversion("5");
}

/** 전화번호 클릭 (location: header, mobile_bottom_bar, inquiry_page 등) */
export function trackPhoneClick(location: string) {
  trackEvent("phone_click", { location });
}

/** 카카오톡 채널 클릭 */
export function trackKakaoClick(location: string) {
  trackEvent("kakao_click", { location });
}
