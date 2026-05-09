"use client";

import { useState } from "react";
import { PageBanner } from "@/components/ui/PageBanner";
import { FileText, Download, CheckCircle, Building2, Phone, Mail } from "lucide-react";

const HIGHLIGHTS = [
  "지정폐기물 수집·운반 전 과정 처리 방식",
  "올바로시스템 대행 서비스 상세 안내",
  "처리 증빙 서류 종류 및 발급 절차",
  "업종별 맞춤 폐기물 처리 솔루션",
  "견적·계약·수거·처리 프로세스 한눈에",
];

export default function BrochurePage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ company: "", name: "", phone: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 관심 등록 — 실제 PDF 파일 준비 전까지 관심 고객 캡처
    setSubmitted(true);
  };

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
                {/* 표지 썸네일 */}
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
                    담당자가 확인 후 <strong>영업일 1일 이내</strong>에<br />
                    입력하신 연락처로 소개서를 보내드리겠습니다.
                  </p>
                  <div className="bg-neutral-light rounded-xl p-4 text-sm text-neutral-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-primary" />
                      빠른 문의: 010-9084-9480
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-primary" />
                      hduni3973@naver.com
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Download size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">소개서 무료 다운로드</h2>
                  </div>
                  <p className="text-sm text-neutral-mid mb-6">
                    간단한 정보를 입력하시면 소개서를 보내드립니다.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        회사명 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          placeholder="주식회사 예시"
                          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        담당자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        연락처 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="010-0000-0000"
                          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                    >
                      <Download size={16} />
                      소개서 받기
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
    </>
  );
}
