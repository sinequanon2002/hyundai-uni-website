export interface GalleryItem {
  id: number;
  category: "폐유" | "폐산·폐알칼리" | "폐유기용제" | "폐석면" | "보유장비";
  title: string;
  imageUrl: string;
  date: string;
}

export const galleryItems: GalleryItem[] = [
  { id: 1, category: "보유장비", title: "최신식 5톤 윙바디 차량", imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=800&fit=crop", date: "2025-03-01" },
  { id: 2, category: "폐유", title: "공장 폐윤활유 수거 현장", imageUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop", date: "2025-02-28" },
  { id: 3, category: "폐산·폐알칼리", title: "도금 공장 폐산 드럼 수거", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop", date: "2025-02-20" },
  { id: 4, category: "폐유기용제", title: "지정폐기물 전용 특수 드럼", imageUrl: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&h=800&fit=crop", date: "2025-02-15" },
  { id: 5, category: "보유장비", title: "안전 장비를 갖춘 전문 수거팀", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop", date: "2025-02-10" },
  { id: 6, category: "폐석면", title: "건물 철거 폐석면 밀봉 포장", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&sat=-100", date: "2025-01-25" },
  { id: 7, category: "폐유", title: "자동차 정비소 폐오일 수거", imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=800&fit=crop", date: "2025-01-20" },
  { id: 8, category: "폐유기용제", title: "화학 공단 IBC 탱크 수거", imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop", date: "2025-01-15" },
  { id: 9, category: "보유장비", title: "1톤 소형 수거 차량", imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=800&fit=crop", date: "2025-01-10" },
  { id: 10, category: "폐산·폐알칼리", title: "실험실 폐시약 안전 회수", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=800&fit=crop", date: "2025-01-05" },
  { id: 11, category: "폐석면", title: "건축 현장 텍스 파쇄물 수거", imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=800&fit=crop", date: "2024-12-20" },
  { id: 12, category: "폐유", title: "대용량 폐유 혼합 탱크 상차", imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=800&fit=crop", date: "2024-12-10" }
];
