import { register } from "@/lib/actions/customer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회원가입 | 현대유앤아이",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { error?: string };
}

export default function RegisterPage({ searchParams }: PageProps) {
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

          {searchParams.error && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {searchParams.error}
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

            <button type="submit"
              className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40">
              가입하기
            </button>
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
