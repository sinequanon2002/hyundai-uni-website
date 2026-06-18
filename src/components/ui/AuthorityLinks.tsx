import { ExternalLink } from "lucide-react";

const AUTHORITY_LINKS = [
  {
    label: "환경부",
    href: "https://www.me.go.kr",
    desc: "폐기물관리 정책·고시",
  },
  {
    label: "올바로시스템",
    href: "https://www.allbaro.or.kr",
    desc: "전자인계서 작성·조회",
  },
  {
    label: "환경법령정보",
    href: "https://www.law.go.kr/법령/폐기물관리법",
    desc: "폐기물관리법 전문",
  },
  {
    label: "한국환경공단",
    href: "https://www.keco.or.kr",
    desc: "올바로시스템 운영·지원",
  },
];

interface AuthorityLinksProps {
  className?: string;
}

/**
 * GEO / E-E-A-T 보강용 외부 공신력 기관 링크
 * - AI 답변 엔진에 콘텐츠의 출처·신뢰도 신호를 전달
 */
export function AuthorityLinks({ className = "" }: AuthorityLinksProps) {
  return (
    <div className={`mt-8 bg-slate-50 rounded-sm border border-slate-200 p-5 ${className}`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        관련 공공기관 바로가기
      </p>
      <div className="flex flex-wrap gap-2">
        {AUTHORITY_LINKS.map(({ label, href, desc }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={desc}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-cobalt-600 hover:text-cobalt-600 text-slate-500 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
          >
            {label}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        ※ 위 링크는 외부 공공기관 사이트로 연결됩니다.
      </p>
    </div>
  );
}
