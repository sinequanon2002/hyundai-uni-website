"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Building2, Hospital, Factory, Landmark } from "lucide-react";

interface Client {
  category: string;
  icon: React.ReactNode;
  items: string[];
}

const CLIENT_CATEGORIES: Client[] = [
  {
    category: "대기업",
    icon: <Building2 size={24} />,
    items: [
      "삼성전자 협력사",
      "LG화학 협력사",
      "SK이노베이션 계열",
      "현대자동차 그룹",
    ],
  },
  {
    category: "중견기업",
    icon: <Factory size={24} />,
    items: [
      "경북 소재 제조업체 15곳+",
      "대구 소재 화학업체 8곳+",
      "경산 소재 산업단지 입주사",
      "구미 소재 전자부품업체",
    ],
  },
  {
    category: "의료기관",
    icon: <Hospital size={24} />,
    items: [
      "대구 소재 대형병원 3곳",
      "경북 소재 종합병원 5곳+",
      "지역 의원·클리닉",
      "의료폐기물 전문 처리",
    ],
  },
  {
    category: "공공기관",
    icon: <Landmark size={24} />,
    items: [
      "경북도청 산하기관",
      "경산시 공공시설",
      "국립대학교 연구소",
      "공공 연구기관",
    ],
  },
];

const AVATAR_BG = ["bg-cobalt-700", "bg-mint-500", "bg-mint-400", "bg-cobalt-600"];
const AVATAR_LABELS = ["삼", "L", "S", "현"];

export function ClientsSection() {
  const fadeInHeader = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231D4ED8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <div {...fadeInHeader} className={`text-center mb-16 ${fadeInHeader.className}`}>
          <span className="inline-flex items-center bg-cobalt-50 text-cobalt-700 border border-cobalt-100 rounded-pill px-3 py-1 text-xs font-semibold tracking-wide mb-4">
            함께하는 고객사
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight mb-4">
            국내 유수 기업·기관이<br className="md:hidden" /> 선택한 파트너
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            대기업부터 공공기관까지, 다양한 산업군의 고객사가 현대유앤아이의<br className="hidden md:inline" />
            전문적이고 투명한 폐기물 처리 서비스를 신뢰하고 있습니다.
          </p>
        </div>

        {/* Client Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLIENT_CATEGORIES.map((cat, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const fadeCard = useFadeIn(0.1, index * 120);
            return (
              <div
                key={index}
                {...fadeCard}
                className={`group p-6 rounded-2xl border border-slate-200 bg-white hover:border-cobalt-200 hover:shadow-ds-md transition-all duration-300 ${fadeCard.className}`}
              >
                <div className="w-12 h-12 rounded-xl bg-cobalt-50 border border-cobalt-100 text-cobalt-600 flex items-center justify-center mb-5 group-hover:bg-cobalt-600 group-hover:border-cobalt-600 group-hover:text-white transition-colors duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-4">
                  {cat.category}
                </h3>
                <ul className="space-y-2.5">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-cobalt-300 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200">
            <div className="flex -space-x-2">
              {AVATAR_LABELS.map((label, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${AVATAR_BG[i]}`}
                >
                  {label}
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">
              <span className="text-cobalt-600 font-bold">300+</span> 기업·기관과 함께합니다
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
