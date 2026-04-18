"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

export function CtaSection() {
  const fadeIn = useFadeIn();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 md:px-8">
        <div
          {...fadeIn}
          className={`flex flex-col lg:flex-row items-center justify-between gap-10 ${fadeIn.className}`}
        >
          <div className="text-center lg:text-left text-white max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              지정폐기물 처리, <br className="lg:hidden" />
              더 이상 고민하지 마세요
            </h2>
            <p className="text-lg text-white/80 shrink-0">
              전문가와 상담을 통해 귀사에 최적화된 처리를 경험해보세요.
            </p>
          </div>
          
          <Link
            href="/support/inquiry"
            className="group flex-shrink-0 inline-flex items-center gap-3 bg-white text-primary px-8 py-5 rounded-xl font-bold text-lg md:text-xl shadow-xl hover:bg-neutral-100 hover:scale-105 transition-all duration-300"
          >
            견적 문의하기
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
