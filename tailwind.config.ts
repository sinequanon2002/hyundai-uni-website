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
        // ClickUp 디자인 시스템 — Brand Violet 팔레트
        primary: "#7b68ee",
        secondary: "#6647f0",
        accent: "#9b8ff6",
        "bg-hero": "#ffffff",
        "bg-dark": "#f8f9fa",
        "bg-section": "#e9ebf0",
        surface: "#ffffff",
        "text-on-dark": "#090c1d",
        // ClickUp 전용 토큰
        carbon: "#202023",
        linen: "#e9ebf0",
        paper: "#f8f9fa",
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
        // navy → Midnight Ink 팔레트
        navy: {
          900: "#090c1d",  // Midnight Ink (primary text)
          800: "#292d34",  // Charcoal
          700: "#646464",  // Slate
          600: "#9ea3ae",  // Muted
        },
        // cobalt → Brand Violet 팔레트
        cobalt: {
          700: "#6647f0",  // Ultra Violet
          600: "#7b68ee",  // Brand Violet
          500: "#9b8ff6",  // Light Violet
          300: "#b8affa",  // Muted Violet
          200: "#d4cefc",  // Soft Violet
          100: "#ede9ff",  // Violet 100
          50:  "#f5f3ff",  // Violet 50
        },
        // mint → Brand Violet 보조 (gradient용)
        mint: {
          600: "#6647f0",  // Ultra Violet
          500: "#7b68ee",  // Brand Violet
          400: "#9b8ff6",  // Light Violet
          100: "#ede9ff",  // Violet 100
          50:  "#f5f3ff",  // Violet 50
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
        "plus-jakarta": ["'Plus Jakarta Sans'", "'Pretendard Variable'", "Pretendard", "'Noto Sans KR'", "sans-serif"],
        pretendard: ["'Pretendard Variable'", "Pretendard", "'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "system-ui", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "'Pretendard Variable'", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SFMono-Regular'", "Consolas", "'Liberation Mono'", "monospace"],
      },
      borderRadius: {
        xs:   "4px",
        sm:   "9px",    // ClickUp 버튼 반경
        md:   "12px",   // ClickUp 카드 반경
        lg:   "16px",
        xl:   "24px",
        pill: "54px",   // ClickUp pill 반경
      },
      boxShadow: {
        "ds-xs": "rgba(13,21,48,0.04) 0px 4px 4px 0px",
        "ds-sm": "0 1px 3px rgba(13,21,48,0.06), 0 1px 2px rgba(13,21,48,0.04)",
        "ds-md": "0 4px 12px rgba(13,21,48,0.08), 0 2px 4px rgba(13,21,48,0.04)",
        "ds-lg": "0 8px 24px rgba(13,21,48,0.10), 0 2px 8px rgba(13,21,48,0.06)",
        "ds-xl": "0 16px 40px rgba(13,21,48,0.12), 0 4px 16px rgba(13,21,48,0.08)",
        "glow-cta": "0 6px 16px rgba(123,104,238,0.30)",
        "glow-cobalt": "0 6px 16px rgba(102,71,240,0.28)",
      },
    },
  },
  plugins: [typography],
};
export default config;
