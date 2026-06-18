import { CalendarDays, BookOpen, Building2 } from "lucide-react";

interface ContentMetaProps {
  reviewDate: string;       // "2026-05" 형식
  legalBasis?: string;      // "폐기물관리법 시행령 별표1"
  author?: string;          // 기본값: "현대유앤아이 환경관리팀"
  className?: string;
}

/**
 * E-E-A-T / GEO 신호용 콘텐츠 메타 컴포넌트
 * - AI 답변 엔진이 "작성자 · 검토일 · 법령 근거"를 명시적으로 인식할 수 있도록 표시
 * - schema.org 상 author / dateModified 와 시각적으로 일치
 */
export function ContentMeta({ reviewDate, legalBasis, author = "현대유앤아이 환경관리팀", className = "" }: ContentMetaProps) {
  const [year, month] = reviewDate.split("-");
  const displayDate = `${year}년 ${parseInt(month, 10)}월`;

  return (
    <div className={`mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500 ${className}`}>
      <span className="flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        작성·관리: <strong className="text-navy-700">{author}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        최종 검토: <strong className="text-navy-700">{displayDate}</strong>
      </span>
      {legalBasis && (
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          법령 근거: <strong className="text-navy-700">{legalBasis}</strong>
        </span>
      )}
    </div>
  );
}
