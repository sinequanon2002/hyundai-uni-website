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
        // 기존 브랜드 색상 (하위 호환)
        primary: "#0C5F6B",
        secondary: "#0E9E7E",
        accent: "#10B981",
        "bg-hero": "#0A1B20",
        "bg-dark": "#0F2830",
        "bg-section": "#132D35",
        surface: "#1C3A44",
        "text-on-dark": "#E8F4F6",
        neutral: {
          900: "#1A1A1A",
          800: "#2D2D2D",
          700: "#4A4A4A",
          600: "#666666",
          500: "#808080",
          400: "#9E9E9E",
          300: "#C0C0C0",
          200: "#E0E0E0",
          100: "#F0FAFA",
          50:  "#FAFAFA",
          white: "#FFFFFF",
        },
        // 디자인 시스템 — 네이비/코발트/민트 팔레트
        navy: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
        cobalt: {
          700: "#1D4ED8",
          600: "#2563EB",
          500: "#3B82F6",
          100: "#DBEAFE",
          50:  "#EFF6FF",
        },
        mint: {
          600: "#059669",
          500: "#10B981",
          400: "#34D399",
          100: "#D1FAE5",
          50:  "#ECFDF5",
        },
        slate: {
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50:  "#F8FAFC",
        },
        amber: {
          500: "#F59E0B",
          50:  "#FFFBEB",
        },
        lime: {
          500: "#84CC16",
          100: "#ECFCCB",
        },
      },
      fontFamily: {
        pretendard: ["'Pretendard Variable'", "Pretendard", "'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "system-ui", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        sans: ["'Pretendard Variable'", "Pretendard", "'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "system-ui", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SFMono-Regular'", "Consolas", "'Liberation Mono'", "monospace"],
      },
      borderRadius: {
        xs:   "4px",
        sm:   "8px",
        md:   "12px",
        lg:   "16px",
        xl:   "24px",
        pill: "999px",
      },
      boxShadow: {
        "ds-xs": "0 1px 2px rgba(15,23,42,0.05)",
        "ds-sm": "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)",
        "ds-md": "0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)",
        "ds-lg": "0 12px 28px rgba(15,23,42,0.10), 0 4px 10px rgba(15,23,42,0.05)",
        "ds-xl": "0 24px 48px rgba(15,23,42,0.14)",
        "glow-cta": "0 6px 16px rgba(16,185,129,0.28)",
        "glow-cobalt": "0 6px 16px rgba(37,99,235,0.24)",
      },
    },
  },
  plugins: [typography],
};
export default config;
