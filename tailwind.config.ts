import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        // ── Microsoft 스타일 디자인 시스템 — 모노크롬 + 단일 블루(#0067b8) ──
        // 레거시 토큰: 모두 모노크롬/블루로 재매핑 (하위 호환)
        primary: "#0067B8",
        secondary: "#005299",
        accent: "#0067B8",
        "bg-hero": "#171717",
        "bg-dark": "#1F1F1F",
        "bg-section": "#262626",
        surface: "#2E2E2E",
        "text-on-dark": "#F2F2F2",
        neutral: {
          900: "#171717",
          800: "#262626",
          700: "#404040",
          600: "#616161",
          500: "#808080",
          400: "#9E9E9E",
          300: "#C8C8C8",
          200: "#E0E0E0",
          100: "#F2F2F2",
          50:  "#FAFAFA",
          white: "#FFFFFF",
        },
        // navy → 카본 블랙/그래파이트 계열 (본문 텍스트·다크 밴드)
        navy: {
          900: "#171717",
          800: "#262626",
          700: "#404040",
          600: "#616161",
        },
        // cobalt → Microsoft 블루(단일 액션 컬러)
        cobalt: {
          700: "#005299",
          600: "#0067B8",
          500: "#2A87D8",
          100: "#CFE4F5",
          50:  "#F0F6FC",
        },
        // mint → 블루로 통합 (기존 민트 CTA가 자동으로 블루 전환)
        mint: {
          600: "#005299",
          500: "#0067B8",
          400: "#2A87D8",
          100: "#CFE4F5",
          50:  "#F0F6FC",
        },
        // slate → 블루틴트 제거한 순수 그레이 (Mist/Steel)
        slate: {
          600: "#404040",
          500: "#616161",
          400: "#8A8A8A",
          300: "#C8C8C8",
          200: "#E0E0E0",
          100: "#F2F2F2",
          50:  "#F8F8F8",
        },
        // amber → 경고용 시맨틱 컬러만 유지 (블루 단일 원칙의 기능적 예외)
        amber: {
          500: "#C7800A",
          50:  "#FBF6EC",
        },
        lime: {
          500: "#0067B8",
          100: "#CFE4F5",
        },
      },
      fontFamily: {
        // Microsoft 스타일: Segoe UI 우선, 한글 Pretendard, system-ui fallback
        "plus-jakarta": ["'Segoe UI'", "'Pretendard Variable'", "Pretendard", "system-ui", "'Noto Sans KR'", "sans-serif"],
        pretendard: ["'Segoe UI'", "'Pretendard Variable'", "Pretendard", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        sans: ["'Segoe UI'", "'Pretendard Variable'", "Pretendard", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SFMono-Regular'", "Consolas", "'Liberation Mono'", "monospace"],
      },
      borderRadius: {
        // Microsoft 스타일: 거의 샤프한 모서리 (2px 기준)
        xs:   "2px",
        sm:   "2px",   // 버튼
        md:   "2px",   // 카드
        lg:   "4px",
        xl:   "8px",
        pill: "2px",
      },
      boxShadow: {
        // Microsoft 스타일: 단일 중립 섀도우 스택, 카드에만 사용
        "ds-xs": "rgba(0,0,0,0.08) 0px 1px 2px 0px",
        "ds-sm": "rgba(0,0,0,0.13) 0px 3px 7px 0px, rgba(0,0,0,0.11) 0px 1px 2px 0px",
        "ds-md": "rgba(0,0,0,0.13) 0px 3px 7px 0px, rgba(0,0,0,0.11) 0px 1px 2px 0px",
        "ds-lg": "rgba(0,0,0,0.15) 0px 6px 14px 0px, rgba(0,0,0,0.11) 0px 2px 4px 0px",
        "ds-xl": "rgba(0,0,0,0.16) 0px 10px 24px 0px, rgba(0,0,0,0.12) 0px 3px 8px 0px",
        "glow-cta": "rgba(0,0,0,0.13) 0px 3px 7px 0px, rgba(0,0,0,0.11) 0px 1px 2px 0px",
        "glow-cobalt": "rgba(0,0,0,0.13) 0px 3px 7px 0px, rgba(0,0,0,0.11) 0px 1px 2px 0px",
      },
    },
  },
  plugins: [typography],
};
export default config;
