"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { wasteTypes } from '@/lib/waste-types';
import { wasteTypeSlugById } from '@/lib/waste-type-details';
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
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

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
  Stethoscope
};

export default function WasteTypesPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">지정폐기물 종류</h2>
        <p className="text-lg text-gray-600 inline-flex items-center px-4 py-2 bg-gray-100 rounded-full font-medium">
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
                onClick={() => toggleAccordion(waste.id)}
                className="w-full text-left p-6 flex flex-col items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="w-full flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{waste.name}</h3>
                <p className="text-gray-500 text-sm font-medium">{waste.summary}</p>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}
              >
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

      {/* 전용 랜딩 페이지 바로가기 */}
      <div className="mt-14 bg-primary/5 rounded-2xl border border-primary/15 p-8">
        <h3 className="text-lg font-bold text-neutral-900 mb-2">품목별 전문 서비스 안내</h3>
        <p className="text-sm text-neutral-600 mb-5">
          주요 품목은 수거·운반 절차, 발생 업종, 현장 사진까지 자세히 확인할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { slug: "폐유", label: "폐유 수거·운반" },
            { slug: "폐산", label: "폐산·폐알칼리 수거·운반" },
            { slug: "폐유기용제", label: "폐유기용제 수거·운반" },
            { slug: "폐석면", label: "폐석면 수거·운반" },
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
    </div>
  );
}
