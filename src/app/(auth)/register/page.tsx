"use client";

import { register } from "@/lib/actions/customer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
    >
      {pending ? "처리 중..." : "가입하기"}
    </button>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const verify = searchParams.get("verify");

  // 이메일 확인 대기 화면 (email_confirm 활성화 시에만 해당)
  if (verify === "1") {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-dark mb-2">이메일을 확인해주세요</h1>
          <p className="text-sm text-neutral-mid leading-relaxed mb-6">
            가입하신 이메일로 인증 링크를 발송했습니다.
            <br />
            이메일 내 링크를 클릭하면 로그인이 가능합니다.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left mb-6">
            <p className="text-xs text-blue-700 leading-relaxed">
              이메일이 오지 않는 경우 스팸함을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
          <Link href="/login" className="block w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors text-center">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-dark">현대유앤아이</h1>
          <p className="text-sm text-neutral-mid mt-1">고객 포털 회원가입</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-base font-semibold text-neutral-dark mb-6">회원가입</h2>

          {error && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={register} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1.5">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input id="email" name="email" type="email" required autoComplete="email"
                placeholder="example@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-1.5">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input id="password" name="password" type="password" required autoComplete="new-password"
                placeholder="8자 이상"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-neutral-dark mb-1.5">
                담당자명 <span className="text-red-500">*</span>
              </label>
              <input id="full_name" name="full_name" type="text" required
                placeholder="홍길동"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-neutral-dark mb-1.5">
                사업장명 <span className="text-red-500">*</span>
              </label>
              <input id="company_name" name="company_name" type="text" required
                placeholder="주식회사 예시"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-dark mb-1.5">
                연락처 <span className="text-gray-400 font-normal text-xs">(선택)</span>
              </label>
              <input id="phone" name="phone" type="tel"
                placeholder="010-0000-0000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
            </div>

            <SubmitButton />
          </form>
        </div>

        <p className="text-center text-sm text-neutral-mid mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
