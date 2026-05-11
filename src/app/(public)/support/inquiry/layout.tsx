import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 견적 문의",
  description:
    "지정폐기물 수거·운반 무료 견적을 문의하세요. 폐유·폐산·폐알칼리·폐유기용제 등 전 품목 대응. 온라인 접수 후 빠른 시일 내 담당자가 연락드립니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
