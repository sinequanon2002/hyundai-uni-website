import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Factory,
  FlaskConical,
  AlertOctagon,
  Droplets,
  Paintbrush,
  Fuel,
  Mountain,
  Zap,
  Skull,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Building2,
  ChevronLeft,
  Images,
  PhoneCall,
} from "lucide-react";
import type { Metadata } from "next";
import { wasteTypeDetails, wasteTypeDetailBySlug } from "@/lib/waste-type-details";
import { COMPANY } from "@/lib/constants";
import { ContentMeta } from "@/components/ui/ContentMeta";
import { AuthorityLinks } from "@/components/ui/AuthorityLinks";

const iconMap: Record<string, React.ElementType> = {
  Factory,
  FlaskConical,
  AlertOctagon,
  Droplets,
  Paintbrush,
  Fuel,
  Mountain,
  Zap,
  Skull,
  Stethoscope,
};

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return wasteTypeDetails.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = wasteTypeDetailBySlug[params.slug];
  if (!detail) return { title: "지정폐기물 | 현대유앤아이" };
  return {
    title: `${detail.name} 수거·운반 전문 | 현대유앤아이`,
    description: `${detail.name} 전문 수거·운반. ${detail.summary}. 경상북도·대구 기반 전국 서비스. 허가 업체 현대유앤아이에 문의하세요.`,
  };
}

export default function WasteTypeDetailPage({ params }: Props) {
  const detail = wasteTypeDetailBySlug[params.slug];
  if (!detail) notFound();

  const Icon = iconMap[detail.icon] ?? AlertOctagon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 animate-fade-in-up">
      {/* 뒤로가기 */}
      <Link
        href="/waste/types"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        지정폐기물 종류 전체 보기
      </Link>

      {/* ── 히어로 ── */}
      <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 md:p-12 mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              {detail.legalBasis}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-neutral-900 mb-3">
              {detail.name} 수거·운반
            </h1>
            <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
              {detail.fullDescription}
            </p>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-neutral-100">
          <Link
            href="/support/inquiry"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            무료 견적 문의
          </Link>
          {detail.galleryCategory && (
            <Link
              href={`/support/gallery?category=${encodeURIComponent(detail.galleryCategory)}`}
              className="inline-flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
            >
              <Images className="w-4 h-4" />
              {detail.name} 현장 사진 보기
            </Link>
          )}
        </div>
      </section>

      {/* ── 발생 업종 ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-neutral-900">주요 발생 업종</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detail.industries.map((ind) => (
            <div
              key={ind.name}
              className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-1.5">{ind.name}</h3>
              <p className="text-sm text-neutral-500">{ind.examples}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 처리 프로세스 ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-5">현대유앤아이 처리 프로세스</h2>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {detail.process.map((step, idx) => (
            <div
              key={step.step}
              className={`flex gap-4 p-5 md:p-6 ${
                idx !== detail.process.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              {/* 스텝 번호 */}
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                {step.step}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">{step.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 주요 특징 ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-5">현대유앤아이가 선택받는 이유</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {detail.keyPoints.map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 bg-accent/5 rounded-xl p-4 border border-accent/20"
            >
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-neutral-800">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 현장 갤러리 연계 (galleryCategory 있는 경우만) ── */}
      {detail.galleryCategory && (
        <section className="mb-8 bg-neutral-900 rounded-2xl p-8 text-white">
          <h2 className="text-xl font-bold mb-2">실제 {detail.name} 현장 사진</h2>
          <p className="text-neutral-400 text-sm mb-5">
            현대유앤아이가 직접 수거·운반한 {detail.name} 작업 현장 사진을 확인하세요.
          </p>
          <Link
            href={`/support/gallery?category=${encodeURIComponent(detail.galleryCategory)}`}
            className="inline-flex items-center gap-2 bg-white text-neutral-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors"
          >
            <Images className="w-4 h-4" />
            {detail.name} 현장갤러리 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ── 견적 문의 CTA ── */}
      <section className="bg-primary rounded-2xl p-8 md:p-10 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          {detail.name} 처리가 필요하신가요?
        </h2>
        <p className="text-white/80 text-sm mb-6">
          경상북도·대구 기반 전국 서비스 · 허가 업체 · 올바로시스템 전자 인계 처리<br />
          평일 08:00–18:00 · {COMPANY.tel} · {COMPANY.mobile}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/support/inquiry"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-colors"
          >
            온라인 견적 문의
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`tel:${COMPANY.tel.replace(/-/g, "")}`}
            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            {COMPANY.tel}
          </a>
        </div>
      </section>

      {/* ── 다른 품목 보기 ── */}
      <div className="mt-10 text-center">
        <Link
          href="/waste/types"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          다른 지정폐기물 종류 보기
        </Link>
      </div>

      <AuthorityLinks className="mt-10" />
      <ContentMeta
        reviewDate="2026-05"
        legalBasis={detail.legalBasis}
      />
    </div>
  );
}
