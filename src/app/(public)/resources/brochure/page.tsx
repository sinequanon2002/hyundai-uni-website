"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageBanner } from "@/components/ui/PageBanner";
import {
  FileText, Download, CheckCircle, Phone, Mail,
  ExternalLink, Loader2,
} from "lucide-react";
import { submitBrochureRequest } from "@/lib/actions/brochure";
import { trackBrochureSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  "지정폐기물 수집·운반 전 과정 처리 방식",
  "올바로시스템 대행 서비스 상세 안내",
  "처리 증빙 서류 종류 및 발급 절차",
  "업종별 맞춤 폐기물 처리 솔루션",
  "견적·계약·수거·처리 프로세스 한눈에",
];

const PRIVACY_TEXT = `[개인정보 수집·이용 동의서]

1. 수집 항목: 이름, 이메일, 회사명, 연락처
2. 수집 목적: 서비스 소개서 발송 및 문의 응대
3. 보유 기간: 소개서 발송 완료 후 1년간 보유 후 파기
4. 동의를 거부할 권리가 있으나, 거부 시 소개서 신청이 어려울 수 있습니다.`;

const MARKETING_TEXT = `[마케팅 수신 동의서]

수집 항목: 이메일, 전화번호
수신 내용: 서비스 안내, 이벤트, 업계 정보
보유 기간: 동의 철회 시까지

동의는 선택 사항이며, 동의 거부 시에도 서비스 이용에 불이익이 없습니다.`;

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
  companyName: z.string().min(1, "회사명을 입력해주세요"),
  phone: z.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/, "올바른 전화번호 형식 (예: 010-1234-5678)"),
  agreement: z.literal(true, { errorMap: () => ({ message: "개인정보 수집·이용에 동의하셔야 합니다" }) }),
  marketingConsent: z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof formSchema>;

function formatPhone(value: string) {
  const n = value.replace(/[^\d]/g, "");
  if (n.length <= 3) return n;
  if (n.startsWith("02")) {
    if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
    if (n.length <= 10) return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}`;
    return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6, 10)}`;
  }
  if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
  if (n.length <= 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
}

function PrivacyModal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500">✕</button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">{content}</pre>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 bg-[#0C5F6B] text-white text-sm font-semibold rounded-xl hover:bg-[#0E9E7E] transition-colors">확인</button>
        </div>
      </div>
    </div>
  );
}

export default function BrochurePage() {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { marketingConsent: false },
  });

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors",
      "focus:ring-2 focus:ring-[#0C5F6B]/25 focus:border-[#0C5F6B]",
      hasError ? "border-red-400 bg-red-50/30" : "border-gray-200 bg-white hover:border-gray-300"
    );

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await submitBrochureRequest(data);
      if (result.success) {
        trackBrochureSubmit();
        setSubmitted(true);
      } else {
        alert(result.error ?? "신청 중 오류가 발생했습니다.");
      }
    });
  });

  return (
    <>
      <PageBanner
        title="서비스 소개서 다운로드"
        subtitle="현대유앤아이의 지정폐기물 처리 서비스를 한눈에 확인하세요"
      />

      <section className="py-16 md:py-24 bg-neutral-light">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-start">

            {/* 소개서 미리보기 */}
            <div>
              <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-secondary aspect-[3/4] flex flex-col items-center justify-center text-white p-8">
                  <FileText size={64} className="mb-4 opacity-80" />
                  <p className="text-sm font-medium uppercase tracking-widest opacity-70 mb-2">COMPANY BROCHURE</p>
                  <h3 className="text-2xl font-bold text-center leading-snug">
                    현대유앤아이<br />서비스 소개서
                  </h3>
                  <p className="mt-3 text-sm text-white/60">2025년 최신판</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-neutral-mid mb-4 font-medium">소개서 주요 내용</p>
                  <ul className="space-y-2.5">
                    {HIGHLIGHTS.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 다운로드 폼 */}
            <div>
              {submitted ? (
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">신청이 완료되었습니다</h3>
                  <p className="text-neutral-mid text-sm leading-relaxed mb-6">
                    담당자 검토 후 <strong>영업일 1일 이내</strong>에<br />
                    입력하신 이메일로 소개서를 보내드립니다.
                  </p>
                  <div className="bg-neutral-light rounded-xl p-4 text-sm text-neutral-600 space-y-1 text-left">
                    <p className="flex items-center gap-2"><Phone size={14} className="text-primary shrink-0" /> 빠른 문의: 054-973-3973</p>
                    <p className="flex items-center gap-2"><Mail size={14} className="text-primary shrink-0" /> hduni3973@naver.com</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Download size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">소개서 무료 신청</h2>
                  </div>
                  <p className="text-sm text-neutral-mid mb-6">
                    간단한 정보를 입력하시면 이메일로 소개서를 보내드립니다.
                  </p>

                  <form onSubmit={onSubmit} noValidate className="space-y-4">
                    {/* 이름 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("name")}
                        placeholder="홍길동"
                        className={inputCls(!!errors.name)}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    {/* 이메일 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="example@company.com"
                        className={inputCls(!!errors.email)}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    {/* 회사명 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        회사명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("companyName")}
                        placeholder="주식회사 예시"
                        className={inputCls(!!errors.companyName)}
                      />
                      {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                    </div>

                    {/* 연락처 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        연락처 <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            placeholder="010-0000-0000"
                            onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            className={inputCls(!!errors.phone)}
                          />
                        )}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>

                    {/* 동의 섹션 */}
                    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                      {/* 개인정보 동의 (필수) */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button type="button" onClick={() => setPrivacyOpen(true)} className="text-sm font-semibold text-gray-700 hover:text-[#0C5F6B] underline decoration-dotted flex items-center gap-1">
                            개인정보 수집 및 이용 동의
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <span className="text-red-500 text-xs font-bold">*</span>
                        </div>
                        <Controller
                          name="agreement"
                          control={control}
                          render={({ field }) => (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="w-4 h-4 accent-[#0C5F6B]"
                              />
                              <span className="text-sm text-gray-600">동의합니다</span>
                            </label>
                          )}
                        />
                        {errors.agreement && <p className="text-xs text-red-500 mt-1">{errors.agreement.message}</p>}
                      </div>

                      <hr className="border-gray-100" />

                      {/* 마케팅 동의 (선택) */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button type="button" onClick={() => setMarketingOpen(true)} className="text-sm font-semibold text-gray-700 hover:text-[#0C5F6B] underline decoration-dotted flex items-center gap-1">
                            마케팅 수신 동의
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-400">(선택)</span>
                        </div>
                        <Controller
                          name="marketingConsent"
                          control={control}
                          render={({ field }) => (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="w-4 h-4 accent-[#0C5F6B]"
                              />
                              <span className="text-sm text-gray-600">동의합니다</span>
                            </label>
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
                    >
                      {isPending ? (
                        <><Loader2 size={16} className="animate-spin" /> 신청 중...</>
                      ) : (
                        <><Download size={16} /> 소개서 신청하기</>
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-xs text-neutral-400 text-center leading-relaxed">
                    입력하신 정보는 소개서 발송 목적으로만 사용되며,<br />
                    제3자에게 제공되지 않습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {privacyOpen && <PrivacyModal title="개인정보 수집 및 이용 동의" content={PRIVACY_TEXT} onClose={() => setPrivacyOpen(false)} />}
      {marketingOpen && <PrivacyModal title="마케팅 수신 동의" content={MARKETING_TEXT} onClose={() => setMarketingOpen(false)} />}
    </>
  );
}
