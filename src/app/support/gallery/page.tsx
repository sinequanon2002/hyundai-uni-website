"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { galleryItems, type GalleryItem } from "@/lib/gallery";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["전체", "폐유", "폐산·폐알칼리", "폐유기용제", "폐석면", "보유장비"] as const;

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "전체") return galleryItems;
    return galleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : 0));
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filtered.length - 1));
  }, [lightboxIndex, filtered.length]);

  // 키보드 + ESC 이벤트 처리
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, goNext, goPrev]);

  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* 섹션 타이틀 */}
        <div className="mb-10">
          <span className="text-primary font-bold tracking-wider text-sm mb-2 block">GALLERY</span>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">현장갤러리</h2>
          <div className="w-12 h-1 bg-accent mt-4"></div>
        </div>

        {/* 카테고리 필터 탭 */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 갤러리 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="group relative cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full mb-2 w-fit">
                    {item.category}
                  </span>
                  <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-white/70 text-xs">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            해당 카테고리의 갤러리 항목이 없습니다.
          </div>
        )}
      </section>

      {/* 라이트박스 모달 */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 닫기 버튼 */}
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-50 transition-colors"
            onClick={closeLightbox}
            aria-label="닫기"
          >
            <X className="w-7 h-7" />
          </button>

          {/* 이전 화살표 */}
          <button
            className="absolute left-4 md:left-8 text-white/60 hover:text-white p-2 z-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* 중앙 이미지 */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-12 md:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIndex].imageUrl.replace("w=600", "w=1200")}
              alt={filtered[lightboxIndex].title}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <h3 className="text-white font-bold text-lg">{filtered[lightboxIndex].title}</h3>
              <p className="text-white/60 text-sm mt-1">
                {filtered[lightboxIndex].category} · {filtered[lightboxIndex].date}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </div>

          {/* 다음 화살표 */}
          <button
            className="absolute right-4 md:right-8 text-white/60 hover:text-white p-2 z-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </main>
  );
}



