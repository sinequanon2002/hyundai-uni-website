import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 관리자 백오피스 URL 패턴
 * (admin) 라우트 그룹은 URL에 영향 없음 → 실제 경로로 나열
 */
const ADMIN_PATHS = ["/inquiries", "/users", "/notices", "/gallery", "/settings"];
const CUSTOMER_PATHS = ["/my"];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isCustomerPath(pathname: string): boolean {
  return CUSTOMER_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request);

  // 세션 갱신 (SSR 쿠키 동기화 — 반드시 호출해야 함)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 관리자 라우트: 미인증 시 로그인으로 리다이렉트
  if (isAdminPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 고객 마이페이지 라우트: 미인증 시 로그인으로 리다이렉트
  if (isCustomerPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 로그인/회원가입 페이지: 이미 로그인된 경우 리다이렉트
  if ((pathname === "/login" || pathname === "/register") && user) {
    const next = request.nextUrl.searchParams.get("next") ?? "/my";
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/my";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = safeNext;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 미들웨어 적용
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico, 이미지 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
