"use client";

import { useState } from "react";
import { PageBanner } from "@/components/ui/PageBanner";
import { ClipboardList, Download, CheckCircle, Phone, Mail, AlertCircle } from "lucide-react";

const CHECKLIST_ITEMS = [
  { category: "배출 전 확인", items: ["폐기물 종류 및 코드 확인", "올바로시스템 배출자 등록 여부", "수탁업체 허가증 원본 수취"] },
  { category: "인계 서류", items: ["폐기물 인계·인수 확인서 출력", "처리업체 사업장 폐기물 배출자 신고서", "수집·운반 계획서 작성"] },
  { category: "보관 기준", items: ["보관 용기 표시 부착 여부", "보관 기간 초과 여부 (60일)", "보관 창고 시건 장치 확인"] },
  { category: "사후 관리", items: ["처리 완료 확인서 수령", "올바로시스템 처리 결과 등록", "3년간 서류 보관 여부"] },
];

export default function AllbaroChecklistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageBanner
        title="올바로시스템 체크리스트"
        subtitle="지정폐기물 담당자가 꼭 알아야 할 필수 체크리스트를 무료로 받아보세요"
      />

      <section className="py-16 md:py-24 bg-neutral-light">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          {/* 상단 안내 배너 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-10">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              올바로시스템 미신고·오기재 시 <strong>300만 원 이하 과태료</strong>가 부과됩니다. 아래 체크리스트로 사전 점검하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* 체크리스트 미리보기 */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-navy-900">체크리스트 포함 항목</h2>
              {CHECKLIST_ITEMS.map((section) => (
                <div key={section.category} className="bg-white rounded-xl border border-slate-200 shadow-ds-sm p-5">
                  <h3 className="text-sm font-bold text-cobalt-600 mb-3 flex items-center gap-2">
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
                  </ul>
                </div>
              ))}
              <p className="text-xs text-slate-400 text-center">
                * 실제 다운로드 파일에는 총 32개 항목이 포함되어 있습니다.
              </p>
            </div>

            {/* 다운로드 폼 */}
            <div>
              {submitted ? (
                <div className="bg-white rounded-xl shadow-ds-sm border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-cobalt-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-mint-500" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">신청 완료!</h3>
                  <p className="text-neutral-mid text-sm leading-relaxed mb-6">
                    담당자가 확인 후 <strong>당일 또는 익영업일</strong>에<br />
                    입력하신 번호로 연락드립니다.
                  </p>
                  <div className="bg-neutral-light rounded-xl p-4 text-sm text-slate-500 space-y-1.5">
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-cobalt-600" />
                      직접 문의: 010-9084-9480
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-cobalt-600" />
                      hduni3973@naver.com
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-ds-sm border border-slate-200 p-8 sticky top-28">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-cobalt-50 rounded-xl flex items-center justify-center">
                      <Download size={20} className="text-cobalt-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-navy-900">무료 체크리스트 받기</h2>
                      <p className="text-xs text-cobalt-500 font-medium">PDF 1장 · 바로 활용 가능</p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-mid mb-6 leading-relaxed">
                    전화번호만 입력하시면 담당자가 직접 연락해 체크리스트와 함께
                    폐기물 처리 상담도 도와드립니다.
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
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-500/30 focus:border-cobalt-500 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-mint-500 text-white rounded-xl font-bold text-sm hover:bg-mint-600 transition-colors shadow-ds-sm"
                    >
                      <Download size={16} />
                      올바로시스템 체크리스트 받기
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
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
