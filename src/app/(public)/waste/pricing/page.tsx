import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import {
  FlaskConical,
  Package,
  Warehouse,
  Truck,
  CalendarClock,
  PhoneCall,
  ClipboardCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
  Phone,
  Lightbulb,
} from "lucide-react";

export const metadata: Metadata = {
  title: "지정폐기물 처리 비용 안내",
  description:
    "지정폐기물 수거·운반 비용이 결정되는 5가지 요인(품목·성상, 수량·용기, 보관 상태, 운반 거리, 수거 빈도)과 비용 절감 방법을 안내합니다. 무료 방문 견적.",
  alternates: { canonical: "/waste/pricing" },
};

const COST_FACTORS = [
  {
    icon: FlaskConical,
    title: "폐기물 품목·성상",
    desc: "폐산, 폐알칼리, 폐유 등 품목과 농도·혼합 여부 같은 성상에 따라 처리 방식과 단가가 달라집니다. MSDS나 성분 정보가 있으면 더 정확한 견적이 가능합니다.",
  },
  {
    icon: Package,
    title: "수량·보관 용기",
    desc: "총량(kg/L)과 용기 종류(드럼 200L, IBC 1,000L 등)에 따라 운반 효율이 달라집니다. 표준 용기에 보관돼 있을수록 비용이 줄어듭니다.",
  },
  {
    icon: Warehouse,
    title: "보관 상태",
    desc: "용기 밀폐 상태, 보관 장소 접근성, 상차 가능 여부(지게차 사용 등)에 따라 작업 시간이 달라집니다. 현장 사진을 첨부해 주시면 빠르게 확인됩니다.",
  },
  {
    icon: Truck,
    title: "운반 거리·지역",
    desc: "수거 현장과 처리 시설 간 거리에 따라 운반비가 산정됩니다. 대구·경북 전 지역은 전담 대응으로 신속하게 처리합니다.",
  },
  {
    icon: CalendarClock,
    title: "수거 빈도",
    desc: "1회성 수거인지, 월 1회·주 1회 등 정기 수거인지에 따라 조건이 달라집니다. 정기 계약 시 회당 비용을 낮출 수 있습니다.",
  },
];

const QUOTE_STEPS = [
  {
    icon: PhoneCall,
    step: "01",
    title: "문의 접수",
    desc: "온라인 견적 문의 또는 전화로 품목·수량을 알려주세요.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "방문·상담 (무료)",
    desc: "영업일 기준 24시간 내 연락드리고, 필요 시 현장을 방문해 보관 상태까지 확인합니다.",
  },
  {
    icon: FileText,
    step: "03",
    title: "견적서 발송",
    desc: "확인된 조건을 바탕으로 맞춤 견적서를 보내드립니다. 견적 비용은 일절 없습니다.",
  },
];

const SAVING_TIPS = [
  "품목별로 분리 보관하면 혼합 폐기물 처리 비용을 피할 수 있습니다.",
  "드럼·IBC 등 표준 용기에 보관하면 상차 작업이 빨라져 비용이 줄어듭니다.",
  "정기적으로 배출하는 사업장은 정기 수거 계약으로 회당 비용을 낮출 수 있습니다.",
  "문의 시 현장 사진과 MSDS를 첨부하면 방문 전 견적 정확도가 높아집니다.",
];

export default function PricingPage() {
  return (
    <>
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* 안내 문구 */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight mb-4">
              왜 정해진 단가표가 없나요?
            </h2>
            <p className="text-[15px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
              지정폐기물은 같은 품목이라도 성상·수량·보관 상태에 따라 처리 조건이 크게 달라져
              일률적인 단가를 안내하기 어렵습니다. 대신 비용이 결정되는 기준을 투명하게 공개하고,
              <span className="font-semibold text-cobalt-600"> 무료 방문 견적</span>으로 정확한 금액을
              안내해 드립니다.
            </p>
          </div>

          {/* 비용 결정 5요인 */}
          <h3 className="text-xs font-bold text-cobalt-600 tracking-widest uppercase mb-3 text-center">
            비용 결정 요인
          </h3>
          <h2 className="text-xl md:text-2xl font-bold text-navy-900 text-center mb-8">
            견적은 이 5가지로 결정됩니다
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {COST_FACTORS.map((factor, i) => {
              const Icon = factor.icon;
              const isLast = i === COST_FACTORS.length - 1;
              return (
                <div
                  key={factor.title}
                  className={`flex gap-4 p-5 bg-slate-50 rounded-sm border border-slate-200 ${
                    isLast ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-cobalt-50 text-cobalt-600 flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-navy-900 mb-1">
                      {factor.title}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{factor.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 견적 절차 */}
          <h3 className="text-xs font-bold text-cobalt-600 tracking-widest uppercase mb-3 text-center">
            견적 절차
          </h3>
          <h2 className="text-xl md:text-2xl font-bold text-navy-900 text-center mb-8">
            문의부터 견적서까지, 비용 없이 진행됩니다
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {QUOTE_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 bg-white rounded-sm border border-slate-200 shadow-ds-sm text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-cobalt-50 text-cobalt-600 flex items-center justify-center mb-4">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <div className="text-xs font-black text-cobalt-600/40 mb-1">STEP {s.step}</div>
                  <h4 className="text-[15px] font-bold text-navy-900 mb-2">{s.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 비용 절감 팁 */}
          <div className="bg-[#F0FAFA] rounded-sm p-6 md:p-8 mb-16">
            <div className="flex items-center gap-2.5 mb-5">
              <Lightbulb size={20} className="text-cobalt-600" />
              <h2 className="text-lg md:text-xl font-bold text-navy-900">
                처리 비용을 줄이는 4가지 방법
              </h2>
            </div>
            <ul className="space-y-3">
              {SAVING_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <CheckCircle2 size={17} className="shrink-0 text-cobalt-500 mt-0.5" />
                  <span className="text-sm text-navy-700 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-navy-900 rounded-sm p-8 md:p-10 text-center text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              정확한 비용이 궁금하신가요?
            </h2>
            <p className="text-sm text-white/70 mb-6">
              품목과 수량만 알려주시면 영업일 기준 24시간 내 담당자가 연락드립니다.
              방문 견적은 무료입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/support/inquiry"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-cobalt-600 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-xl"
              >
                <ArrowRight size={16} />
                무료 견적 문의
              </Link>
              <a
                href={`tel:${COMPANY.tel}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/40 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                <Phone size={15} />
                {COMPANY.tel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
