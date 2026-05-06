export const PORTFOLIO_CATEGORIES = [
  "폐유",
  "폐산·폐알칼리",
  "폐유기용제",
  "폐석면",
  "보유장비",
] as const;

export const PORTFOLIO_REGIONS = [
  "서울·경기",
  "인천",
  "부산·경남",
  "대구·경북",
  "광주·전라",
  "대전·충청",
  "강원",
  "제주",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];
export type PortfolioRegion = (typeof PORTFOLIO_REGIONS)[number];
