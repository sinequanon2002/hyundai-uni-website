export const PORTFOLIO_CATEGORIES = [
  "폐시약",
  "폐산",
  "폐황산",
  "폐불산",
  "폐질산",
  "그밖의폐산",
  "폐알칼리",
  "폐유독물",
  "폐윤활유",
  "폐페인트",
  "폐유해화학물질",
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
