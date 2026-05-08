import { login } from "@/lib/actions/auth";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "관리자 로그인 | 현대유앤아이",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  missing_fields:      "이메일과 비밀번호를 모두 입력해주세요.",
};

interface PageProps {
  searchParams: { error?: string; next?: string };
}

export default function LoginPage({ searchParams }: PageProps) {
  const errorMsg = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? "로그인 중 오류가 발생했습니다.")
    : null;

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-dark">현대유앤아이</h1>
          <p className="text-sm text-neutral-mid mt-1">내부 관리 시스템</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-base font-semibold text-neutral-dark mb-6">
            로그인
          </h2>

          {/* 에러 메시지 */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
            >
              {errorMsg}
            </div>
          )}

          <form action={login} className="space-y-4">
            {/* next 파라미터 전달 */}
            <input
              type="hidden"
              name="next"
              value={searchParams.next ?? ""}
            />

            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="example@company.co.kr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-neutral-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-neutral-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              로그인
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-mid mt-6">
          내부 직원 전용 시스템입니다. 계정 문의는 관리자에게 연락하세요.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-mid hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            웹사이트 메인으로
          </Link>
        </div>
      </div>
    </div>
  );
}
