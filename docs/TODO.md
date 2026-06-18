# 프로젝트 TODO 리스트

> 최종 업데이트: 2026-06-14
> 기준 커밋: `11cfa71` feat: 리드 전환 개선 — 전화 CTA, 애널리틱스, FAQ·비용 안내 페이지

---

## 🔴 A. 환경변수 / API 연동

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| A-1 | 솔라피 API Key 입력 및 Vercel 환경변수 설정 | ⬜ 미완성 | `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` — 코드 연동 완료, 키만 입력하면 활성화 |
| A-2 | 솔라피 발신번호 등록 (서류 인증) | ⬜ 미완성 | `SOLAPI_SENDER_PHONE` — solapi.com → 발신번호 관리 |
| A-3 | 카카오 알림톡 채널 등록 | ⬜ 미완성 | solapi.com → 카카오 채널 연동 |
| A-4 | 카카오 알림톡 템플릿 제작 및 카카오 검수 승인 | ⬜ 미완성 | 승인 후 `SOLAPI_KAKAO_PF_ID`, `SOLAPI_KAKAO_TEMPLATE_ID` Vercel 입력 |
| A-5 | 카카오맵 API Key 발급 및 Vercel 환경변수 설정 | ⬜ 미완성 | `NEXT_PUBLIC_KAKAO_MAP_KEY` |
| A-6 | Google Analytics 4 측정 ID 발급·입력 | ⬜ 미완성 | `NEXT_PUBLIC_GA_ID` — 코드 연동 완료, ID 입력 시 즉시 수집 시작 |
| A-7 | 네이버 애널리틱스(프리미엄 로그분석) ID 입력 | ⬜ 미완성 | `NEXT_PUBLIC_NAVER_ANALYTICS_ID` — 코드 연동 완료 |
| A-8 | 카카오톡 채널 상담 URL 입력 | ⬜ 미완성 | `NEXT_PUBLIC_KAKAO_CHANNEL_URL` — CTA 버튼에 연결됨 |

---

## 🟠 B. 페이지 기능 구현

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| B-1 | 오시는 길 — 카카오맵 실제 지도 embed | ⬜ 미완성 | `/company#location` 현재 MapPin 아이콘 + 네이버지도 링크만. A-5 완료 후 진행 |
| B-2 | 고객 마이페이지 — 문의 내역 조회 | ✅ 완료 | `/my`, `/my/inquiries`, `/my/profile` 구현 완료 |

---

## 🟡 C. 에셋 / 디자인

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| C-1 | OG 이미지 (`public/images/og-image.jpg`) | ⬜ 미완성 | SNS 공유 시 표시 이미지. 현재 `hero-site.jpg`만 존재 |
| C-2 | 로고 이미지 (`public/images/logo.png`) | ⬜ 미완성 | 구조화 데이터(LocalBusiness schema) logo 필드에 사용 |
| C-3 | 파비콘 — 실제 브랜드 파비콘으로 교체 | 🔶 부분완성 | `src/app/favicon.ico` 기본 파일 존재. 브랜드 파비콘으로 교체 필요 |

---

## 🟢 D. 콘텐츠 등록 (운영)

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| D-1 | 블로그/자료실 초기 콘텐츠 작성 및 등록 | ⬜ 미완성 | 관리자 → 공지사항 → 블로그 유형 선택 후 등록 |
| D-2 | 현장갤러리(실적사례) 초기 사진 업로드 | ⬜ 미완성 | 관리자 → 갤러리 → 새 사진 등록 |
| D-3 | 공지사항 초기 게시물 등록 | ⬜ 미완성 | 관리자 → 공지사항 → 새 글 작성 |

---

## 🔵 E. 이메일 (Resend)

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| E-1 | Resend 도메인 인증 완료 확인 | ⬜ 대기중 | `hyundaiuni.kr` DNS 전파 완료 후 Resend Domains → Verify |
| E-2 | 발신 주소 변경 — `onboarding@resend.dev` → `no-reply@hyundaiuni.kr` | 🔶 부분완성 | 코드는 `RESEND_FROM_EMAIL` 환경변수로 처리됨. E-1 완료 후 Vercel에 값만 입력 |
| E-3 | 견적서 발송 이메일 템플릿 | ⬜ 미구현 | 관리자가 견적 확정 후 고객에게 견적서 발송 시 사용 (ERP 견적 단계 도입 시) |

---

## ⚪ F. QA / 검증

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| F-1 | 견적 문의 폼 실발송 테스트 (SMS + 이메일) | ⬜ 미완성 | A-1, A-2 완료 후 진행 |
| F-2 | Google Search Console 색인 요청 | ⬜ 미완성 | 소유권 인증 완료 → URL 검사 → 색인 요청 |
| F-3 | 네이버 서치어드바이저 사이트맵 제출 및 수집 요청 | ⬜ 미완성 | searchadvisor.naver.com → 사이트맵 제출 |
| F-4 | 모바일 반응형 전체 점검 | ⬜ 미완성 | 주요 페이지 + 견적 문의 폼 중점 확인 |
| F-5 | Lighthouse 성능·SEO 점수 측정 | ⬜ 미완성 | [pagespeed.web.dev](https://pagespeed.web.dev) |
| F-6 | 애널리틱스 수집 확인 (GA4 실시간 + 네이버) | ⬜ 미완성 | A-6, A-7 완료 후 실시간 리포트로 page_view 수신 확인 |

---

## 우선순위 요약

```
즉시 처리   A-1, A-2          솔라피 API Key → SMS 발송 활성화
            A-6, A-7, A-8     애널리틱스 ID·카카오 채널 URL 입력 (코드 준비 완료)
단기 처리   A-5, B-1          카카오맵 embed
            C-1, C-2          OG 이미지·로고 이미지 파일 추가
            E-1, E-2          Resend 도메인 인증 + 발신주소 환경변수 입력
중기 처리   A-3, A-4          카카오 알림톡 채널·템플릿 승인
            D-1, D-2, D-3     초기 콘텐츠 등록
            F-1 ~ F-6         실발송 테스트·검색엔진 등록·애널리틱스 확인
장기 처리   E-3               견적서 발송 이메일 템플릿 (ERP 견적 단계)
```

---

## 완료 항목 (참고)

- ✅ 회사소개 전 페이지 실제 데이터 반영 (단일 페이지 통합)
- ✅ SEO 약점 개선 — FAQPage·HowTo·Article·NewsArticle 스키마, 메타데이터 강화
- ✅ GEO 대응 — LocalBusiness 스키마, ContentMeta, AuthorityLinks, robots.ts AI 봇 허용
- ✅ sitemap.ts 동적 생성 (블로그·공지·폐기물 유형 페이지 자동 포함)
- ✅ Google Search Console / 네이버 서치어드바이저 소유권 인증
- ✅ 솔라피 SMS/카카오 알림톡 연동 기반 구축 (API Key 입력 시 즉시 활성화)
- ✅ 블로그/자료실 섹션 구현 (Upbox 스타일) + 독립 상위 메뉴 전환
- ✅ 폐기물 유형별 전용 랜딩 페이지 (/waste/types/[slug]), 폐기물 종류 11개로 통일
- ✅ 견적 문의 양식 간소화 (폐기물 종류 콤보박스, 이메일 필수화, 불필요 필드 제거)
- ✅ 헤더 메뉴 구조 개편 — 사용자 의도 중심 4메뉴 (Option A) + 고객센터 추가
- ✅ 브랜드 컬러 스킴 변경 — 딥블루 → 틸 테크 (Option B), 헤더·메인 다크 테마
- ✅ 랜딩페이지 개선 — TrustStats·PainPoint·비교표 섹션, Hero 배지, 이중 CTA
- ✅ Upbox 폰트 스킴 적용 — IBM Plex Sans + Pretendard Variable
- ✅ **B-2 고객 마이페이지 구현** (문의 내역·프로필)
- ✅ 회원가입/로그인 버그 수정, 비회원 전화번호 기반 문의 연결, 문의현황 조회 페이지
- ✅ **서비스 소개서 신청·관리 기능 구현** (브로슈어 요청)
- ✅ 관리자 페이지 경로 `/admin/*` 하위로 통합
- ✅ **FAQ 페이지(/support/faq) + 비용 안내 페이지(/waste/pricing)**
- ✅ **리드 전환 개선** — 전화 CTA, 모바일 하단바, GA4 + 네이버 애널리틱스 코드 연동
- ✅ Resend 발신 주소 `RESEND_FROM_EMAIL` 환경변수화
