"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from "lucide-react";
import type { PortfolioItem } from "@/lib/actions/portfolio";

const categoryColorMap: Record<string, string> = {
  "폐유": "bg-orange-100 text-orange-700",
  "폐산·폐알칼리": "bg-purple-100 text-purple-700",
  "폐유기용제": "bg-blue-100 text-blue-700",
  "폐석면": "bg-red-100 text-red-700",
  "보유장비": "bg-green-100 text-green-700",
};

interface Props {
  items: PortfolioItem[];
}

export function GalleryGrid({ items }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const close = () => setLightboxIdx(null);
  const goNext = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i + 1) % items.length : 0));
  }, [items.length]);
  const goPrev = useCallback(() => {
    setLightboxIdx((i) => (i !== null ? (i - 1 + items.length) % items.length : 0));
  }, [items.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIdx, goNext, goPrev]);

  const current = lightboxIdx !== null ? items[lightboxIdx] : null;

  return (
    <>
      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setLightboxIdx(idx)}
            className="group text-left rounded-xl overflow-hidden shadow-ds-sm hover:shadow-ds-md transition-all duration-300 bg-white border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-600"
          >
            {/* 이미지 */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-cobalt-600/80 via-cobalt-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">자세히 보기 →</span>
              </div>
            </div>

            {/* 카드 정보 */}
            <div className="p-4">
              {/* 카테고리 배지 */}
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
                  categoryColorMap[item.category] ?? "bg-slate-100 text-slate-500"
                }`}
              >
                {item.category}
              </span>

              {/* 제목 */}
              <h3 className="text-sm font-bold text-navy-900 mb-2 leading-snug line-clamp-2">
                {item.title}
              </h3>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {item.region}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" />
                  {new Date(item.work_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 라이트박스 */}
      {current && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={close}
        >
          {/* 닫기 */}
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 z-50 transition-colors rounded-full hover:bg-white/10"
            onClick={close}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 이전 */}
          <button
            className="absolute left-3 md:left-6 text-white/50 hover:text-white p-3 z-50 transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* 콘텐츠 */}
          <div
            className="flex flex-col lg:flex-row items-center gap-6 max-w-6xl w-full mx-14 md:mx-20 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 이미지 */}
            <div className="relative flex-1 w-full max-h-[60vh] lg:max-h-[80vh]">
              <Image
                src={current.image_url}
                alt={current.title}
                width={1200}
                height={900}
                className="w-full h-auto max-h-[60vh] lg:max-h-[80vh] object-contain rounded-xl"
              />
            </div>

            {/* 상세 정보 패널 */}
            <div className="lg:w-72 shrink-0 text-white space-y-4">
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  categoryColorMap[current.category] ?? "bg-white/20 text-white"
                }`}
              >
                {current.category}
              </span>

              <h2 className="text-lg font-bold leading-snug">{current.title}</h2>

              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-white/40" />
                  <span>{current.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0 text-white/40" />
                  <span>작업일: {new Date(current.work_date).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                </div>
                {current.author_name && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 shrink-0 text-white/40" />
                    <span>{current.author_name}</span>
                  </div>
                )}
              </div>

              {current.description && (
                <p className="text-sm text-white/60 leading-relaxed border-t border-white/10 pt-4">
                  {current.description}
                </p>
              )}

              <p className="text-xs text-white/30">
                {(lightboxIdx ?? 0) + 1} / {items.length}
              </p>
            </div>
          </div>

          {/* 다음 */}
          <button
            className="absolute right-3 md:right-6 text-white/50 hover:text-white p-3 z-50 transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
}
