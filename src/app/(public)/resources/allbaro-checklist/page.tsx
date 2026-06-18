"use client";

import { useState, useTransition } from "react";
import { PageBanner } from "@/components/ui/PageBanner";
import { ClipboardList, Download, CheckCircle, Phone, Building2, AlertCircle, Printer } from "lucide-react";
import { submitChecklistLead } from "@/lib/actions/checklist";

// ── 32개 체크리스트 항목 ──────────────────────────────────────────────────────
const CHECKLIST_SECTIONS = [
  {
    category: "배출 전 확인",
    color: "text-cobalt-600",
    bg: "bg-cobalt-50",
    border: "border-cobalt-100",
    items: [
      "폐기물 종류 및 성상 코드 확인 (올바로시스템 코드표 대조)",
      "올바로시스템 배출자 등록 여부",
      "수탁업체 허가증 원본 수취",
      "허가 품목 범위 및 처리 지역 일치 여부",
      "폐기물 발생량 및 월별 발생 주기 파악",
      "폐기물 위탁처리 계획서 작성",
      "수탁업체와 서면 계약서 체결 여부",
      "연간 발생량 기준 초과 시 배출자 신고 여부",
    ],
  },
  {
    category: "인계 서류",
    color: "text-cobalt-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    items: [
      "폐기물 인계·인수 확인서 사전 작성",
      "사업장 폐기물 배출자 신고서 제출 여부",
      "수집·운반 계획서 작성 및 제출",
      "올바로시스템 전자 인계서 발급 여부",
      "인계서 전자 서명 완료 여부",
      "처리업체 도착·수령 확인 여부",
      "위탁계약서 필수 기재사항 누락 여부 확인",
      "고위험 폐기물(폐산·폐알칼리 등) 추가 서류 구비",
    ],
  },
  {
    category: "보관 기준",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    items: [
      "보관 용기 표시 부착 여부 (품목·성상·위험성)",
      "보관 기간 60일 초과 여부 확인",
      "보관 창고 시건 장치 확인",
      "누출·화재 방지 설비 확인",
      "지정폐기물 전용 보관구역 — 일반폐기물과 분리 여부",
      "보관 용기 파손·누액 여부",
      "보관 장소 외부인 출입 통제 여부",
      "보관량이 허가 범위 이내인지 확인",
    ],
  },
  {
    category: "사후 관리",
    color: "text-mint-600",
    bg: "bg-mint-50",
    border: "border-mint-100",
    items: [
      "처리 완료 확인서 수령 여부",
      "올바로시스템 처리 결과 등록 완료",
      "인계·인수 서류 3년간 보관 여부",
      "연간 위탁처리 실적 자체 기록",
      "폐기물 처리 대장 최신화 여부",
      "올바로시스템 이의신청 기간(처리 후 14일) 관리",
      "배출업소 변경사항(주소·업종 등) 신고 여부",
      "정기 자체 점검 및 환경 감사 대비 자료 보관",
    ],
  },
];

// ── 미리보기용 축약본 (제출 전 표시) ─────────────────────────────────────────
const PREVIEW_SECTIONS = CHECKLIST_SECTIONS.map((s) => ({
  ...s,
  items: s.items.slice(0, 3),
}));

export default function AllbaroChecklistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      const result = await submitChecklistLead({
        phone: phone.trim(),
        companyName: companyName.trim() || undefined,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(result.error ?? "오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <>
      <PageBanner
        title="올바로시스템 체크리스트"
        subtitle="지정폐기물 담당자가 꼭 알아야 할 필수 체크리스트를 무료로 받아보세요"
      />

      <section className="py-16 md:py-24 bg-slate-50 print:bg-white print:py-6">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">

          {/* 과태료 경고 배너 */}
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3 mb-10 print:hidden">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              올바로시스템 미신고·오기재 시 <strong>300만 원 이하 과태료</strong>가 부과됩니다. 아래 체크리스트로 사전 점검하세요.
            </p>
          </div>

          {submitted ? (
            /* ── 제출 완료: 전체 32개 체크리스트 표시 ─────────────────────── */
            <div>
              {/* 상단 안내 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mint-50 rounded-sm flex items-center justify-center shrink-0">
                    <CheckCircle size={22} className="text-mint-500" />
                  </div>
                  <div>
                    <p className="font-bold text-navy-900 text-lg">신청 완료 — 체크리스트를 확인하세요</p>
                    <p className="text-sm text-slate-500">담당자가 확인 후 당일~익영업일 내 연락드립니다</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="print:hidden flex items-center gap-2 px-5 py-2.5 bg-cobalt-600 text-white text-sm font-semibold rounded-sm hover:bg-cobalt-700 transition-colors shadow-ds-sm shrink-0"
                >
                  <Printer size={16} />
                  PDF로 저장 / 인쇄
                </button>
              </div>

              {/* 인쇄 헤더 (화면에서는 숨김) */}
              <div className="hidden print:block mb-6 border-b-2 border-navy-900 pb-4">
                <h1 className="text-2xl font-bold text-navy-900">올바로시스템 지정폐기물 체크리스트</h1>
                <p className="text-sm text-slate-500 mt-1">현대유앤아이 | 지정폐기물 수집·운반 전문기업 | 010-9084-9480</p>
              </div>

              {/* 32개 항목 그리드 */}
              <div className="grid md:grid-cols-2 gap-5 print:gap-4 print:grid-cols-2">
                {CHECKLIST_SECTIONS.map((section) => (
                  <div
                    key={section.category}
                    className={`bg-white rounded-sm border ${section.border} shadow-ds-sm p-5 print:shadow-none print:border print:rounded-lg`}
                  >
                    <h3 className={`text-sm font-bold ${section.color} mb-4 flex items-center gap-2`}>
                      <ClipboardList size={15} />
                      {section.category}
                      <span className="ml-auto text-xs font-normal text-slate-400">8개 항목</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0 mt-0.5 print:border-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 인쇄 푸터 */}
              <div className="hidden print:block mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400">
                <p>본 체크리스트는 참고용이며, 실제 법령 준수 여부는 담당자가 최종 확인하시기 바랍니다.</p>
                <p>문의: 010-9084-9480 | hduni3973@naver.com</p>
              </div>

              {/* 상담 유도 카드 (인쇄 시 숨김) */}
              <div className="mt-8 p-5 bg-cobalt-50 border border-cobalt-100 rounded-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 print:hidden">
                <div className="flex-1">
                  <p className="font-semibold text-navy-900 mb-1">체크리스트 작성 후 궁금한 점이 있으신가요?</p>
                  <p className="text-sm text-slate-600">현장 방문 무료 상담 및 영업일 2일 이내 견적서 제공</p>
                </div>
                <a
                  href="tel:010-9084-9480"
                  className="flex items-center gap-2 px-5 py-2.5 bg-cobalt-600 text-white text-sm font-semibold rounded-sm hover:bg-cobalt-700 transition-colors shrink-0"
                >
                  <Phone size={15} />
                  전화 상담
                </a>
              </div>
            </div>
          ) : (
            /* ── 제출 전: 미리보기 + 폼 ──────────────────────────────────── */
            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* 체크리스트 미리보기 */}
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-navy-900">체크리스트 포함 항목 (미리보기)</h2>
                {PREVIEW_SECTIONS.map((section) => (
                  <div key={section.category} className="bg-white rounded-sm border border-slate-200 shadow-ds-sm p-5">
                    <h3 className={`text-sm font-bold ${section.color} mb-3 flex items-center gap-2`}>
                      <ClipboardList size={15} />
                      {section.category}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-slate-500">
                          <div className="w-4 h-4 rounded border-2 border-slate-200 shrink-0" />
                          {item}
                        </li>
                      ))}
                      <li className="flex items-center gap-2.5 text-xs text-slate-400 italic pl-6">
                        + 5개 항목 더 포함
                      </li>
                    </ul>
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center">
                  * 전체 4개 카테고리 · 총 32개 항목 제공
                </p>
              </div>

              {/* 다운로드 폼 */}
              <div className="bg-white rounded-sm shadow-ds-sm border border-slate-200 p-8 sticky top-28">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-cobalt-50 rounded-sm flex items-center justify-center">
                    <Download size={20} className="text-cobalt-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">무료 체크리스트 받기</h2>
                    <p className="text-xs text-cobalt-500 font-medium">32개 항목 · 즉시 출력 가능</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  전화번호만 입력하시면 전체 체크리스트를 바로 확인하실 수 있습니다.
                  담당자가 폐기물 처리 상담도 함께 도와드립니다.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-500/30 focus:border-cobalt-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      회사명 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="주식회사 예시"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-500/30 focus:border-cobalt-500 transition"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-500 flex items-center gap-1.5">
                      <AlertCircle size={13} />
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-mint-500 text-white rounded-sm font-bold text-sm hover:bg-mint-600 transition-colors shadow-ds-sm disabled:opacity-60"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        처리 중...
                      </span>
                    ) : (
                      <>
                        <Download size={16} />
                        올바로시스템 체크리스트 받기
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed">
                  입력하신 정보는 자료 발송 목적으로만 사용됩니다.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-2">이런 분께 추천합니다</p>
                  <ul className="space-y-1.5">
                    {[
                      "처음 올바로시스템을 사용하는 담당자",
                      "정기 환경 감사를 앞두고 있는 사업장",
                      "폐기물 처리 업무를 인수인계받은 분",
                    ].map((item) => (
                      <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <CheckCircle size={12} className="text-mint-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
