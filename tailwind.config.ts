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
        primary: "#0C5F6B",
        secondary: "#0E9E7E",
        accent: "#10B981",
        neutral: {
          900: "#1A1A1A",
          600: "#666666",
          100: "#F0FAFA",
          white: "#FFFFFF"
        }
      },
      fontFamily: {
        pretendard: ["'Pretendard Variable'", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "'Helvetica Neue'", "'Segoe UI'", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "sans-serif"],
        sans: ["'Pretendard Variable'", "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "'Helvetica Neue'", "'Segoe UI'", "'Apple SD Gothic Neo'", "'Noto Sans KR'", "'Malgun Gothic'", "'Apple Color Emoji'", "'Segoe UI Emoji'", "'Segoe UI Symbol'", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};
export default config;
