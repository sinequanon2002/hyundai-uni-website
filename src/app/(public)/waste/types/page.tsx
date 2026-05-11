"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { wasteTypes } from '@/lib/waste-types';
import { wasteTypeSlugById } from '@/lib/waste-type-details';
import { ProcessClient } from '../process/ProcessClient';
import {
  Factory, FlaskConical, AlertOctagon, Droplets, Paintbrush,
  Fuel, Mountain, Zap, Skull, Stethoscope,
  ChevronDown, ArrowRight,
  ShieldAlert, Truck, FileCheck, Eye,
  Monitor, RefreshCw, FileText, CheckCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Factory, FlaskConical, AlertOctagon, Droplets, Paintbrush,
  Fuel, Mountain, Zap, Skull, Stethoscope,
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "지정폐기물 수거·운반 처리 절차",
  description: "지정폐기물 배출자가 알아야 할 6단계 적법 처리 절차.",
  totalTime: "P1D",
  step: [
    { "@type": "HowToStep", position: 1, name: "문의 및 상담", url: "/waste/types#step-1" },
    { "@type": "HowToStep", position: 2, name: "견적 및 위·수탁 계약 체결", url: "/waste/types#step-2" },
    { "@type": "HowToStep", position: 3, name: "전자인계서 작성 (올바로시스템)", url: "/waste/types#step-3" },
    { "@type": "HowToStep", position: 4, name: "허가 차량으로 수거·운반", url: "/waste/types#step-4" },
    { "@type": "HowToStep", position: 5, name: "공인 처리시설 인계·적정 처리", url: "/waste/types#step-5" },
    { "@type": "HowToStep", position: 6, name: "처리 결과 통보 및 증빙 서류 제공", url: "/waste/types#step-6" },
  ],
};

export default function ServicePage() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">

        {/* ── 지정폐기물이란? ── */}
        <div className="mb-14 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="bg-primary px-8 py-6">
            <span className="text-xs font-bold text-white/70 tracking-widest uppercase block mb-1">법적 정의</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">지정폐기물이란?</h2>
          </div>
          <div className="p-6 md:p-8">
            <blockquote className="border-l-4 border-primary/40 pl-5 py-1 mb-6 text-neutral-700 text-sm leading-relaxed">
              사업장에서 발생하는 폐기물 중 주변 환경을 오염시킬 수 있거나 인체에 위해를 줄 수 있는 유해한 물질로서 대통령령으로 정하는 폐기물
              <span className="block text-xs text-neutral-400 mt-1">— 폐기물관리법 제2조 제4호</span>
            </blockquote>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: ShieldAlert, label: "무단투기 시", value: "7년 이하 징역 / 5천만원 벌금", color: "text-red-600 bg-red-50 border-red-100" },
                { icon: FileCheck,   label: "처리 전 필수", value: "올바로시스템 전자인계서 작성", color: "text-blue-600 bg-blue-50 border-blue-100" },
                { icon: Truck,       label: "운반 가능 업체", value: "환경부 허가 수집·운반업체만", color: "text-amber-600 bg-amber-50 border-amber-100" },
                { icon: Eye,         label: "관리 방식", value: "전 과정 전자 추적·기록 의무", color: "text-primary bg-primary/5 border-primary/15" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`rounded-xl border p-4 ${color}`}>
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
                  <p className="text-xs font-semibold leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ SECTION 1: 서비스 영역 ══════════ */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-accent tracking-widest uppercase block mb-2">서비스 영역</span>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">처리 가능 폐기물</h2>
          <p className="text-gray-600 inline-flex items-center px-4 py-2 bg-gray-100 rounded-full font-medium text-sm md:text-base">
            「폐기물관리법 시행령」 별표1 기준 분류체계
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wasteTypes.map((waste) => {
            const Icon = iconMap[waste.icon] || AlertOctagon;
            const isOpen = openId === waste.id;
            const slug = wasteTypeSlugById[waste.id];

            return (
              <div
                key={waste.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary border-transparent' : 'border-gray-200 hover:border-primary/50 hover:shadow-md'}`}
              >
                <button
                  onClick={() => setOpenId(openId === waste.id ? null : waste.id)}
                  className="w-full text-left p-6 flex flex-col items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <div className="w-full flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{waste.name}</h3>
                  <p className="text-gray-500 text-sm font-medium">{waste.summary}</p>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                    <div className="pt-4 text-sm">{waste.details}</div>
                    {slug && (
                      <Link
                        href={`/waste/types/${slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        수거·운반 서비스 자세히 보기
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 품목별 전문 서비스 바로가기 */}
        <div className="mt-10 bg-primary/5 rounded-2xl border border-primary/15 p-6 md:p-8">
          <h3 className="text-base font-bold text-neutral-900 mb-1.5">품목별 전문 서비스 안내</h3>
          <p className="text-sm text-neutral-600 mb-4">
            주요 품목은 수거·운반 절차, 발생 업종, 현장 사진까지 자세히 확인할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { slug: "폐유",    label: "폐유 수거·운반" },
              { slug: "폐산",    label: "폐산·폐알칼리 수거·운반" },
              { slug: "폐유기용제", label: "폐유기용제 수거·운반" },
              { slug: "폐석면",  label: "폐석면 수거·운반" },
            ].map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/waste/types/${slug}`}
                className="inline-flex items-center gap-1.5 bg-white border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all"
              >
                {label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════ SECTION 2: 처리 절차 ══════════ */}
        <div className="mt-20 mb-12 text-center" id="process">
          <span className="text-xs font-bold text-accent tracking-widest uppercase block mb-2">처리 절차</span>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">6단계 처리 프로세스</h2>
          <p className="text-gray-600 text-sm md:text-base">배출부터 최종 처리까지, 완벽한 적법 절차를 준수합니다.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ProcessClient />
        </div>

        {/* 올바로시스템 소개 */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="bg-secondary px-8 py-6">
            <span className="text-xs font-bold text-white/70 tracking-widest uppercase block mb-1">3단계 필수 도구</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">올바로시스템이란?</h2>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              한국환경공단이 운영하는 지정폐기물 전자 인계·관리 시스템으로, 배출부터 운반·처리까지 전 과정을 전산으로 추적합니다.
              지정폐기물 배출 전 <strong>전자인계서 작성은 법적 의무</strong>이며, 미작성 시 과태료 처분을 받습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Monitor,     label: "전자 인계서", desc: "종이 서류 없이 온라인으로 작성·제출" },
                { icon: RefreshCw,   label: "실시간 추적", desc: "배출→운반→처리 전 과정 현황 확인" },
                { icon: FileText,    label: "법적 증빙",   desc: "처리 완료 증빙서류 자동 보관" },
                { icon: CheckCircle, label: "처리 결과",   desc: "최종 처리 결과 통보 및 이력 관리" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-secondary/5 border border-secondary/15 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-xs font-bold text-neutral-800 mb-0.5">{label}</p>
                  <p className="text-[11px] text-neutral-500 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/support/blog?category=올바로시스템"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline underline-offset-4"
            >
              올바로시스템 작성 가이드 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 max-w-4xl mx-auto bg-primary/5 border border-primary/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-700">
            처리 가능 여부가 불확실한 폐기물도 문의 주시면 검토해드립니다.
          </p>
          <Link
            href="/support/inquiry"
            className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            견적 문의
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </>
  );
}
