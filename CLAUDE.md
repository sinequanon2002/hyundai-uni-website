**

# 지정폐기물 수거·운반업 통합 관리 시스템

  

## 프로젝트 개요

  

- 목적: 지정폐기물 수거·운반업 홍보 사이트 + 운영관리 시스템 (ERP)

  

- 타겟: B2B 폐기물 배출 사업장 담당자 (고객) + 내부 직원

  

- 비즈니스 목표: 견적 문의 전환 최대화, 내부 업무 디지털화

  

## 기술 스택

  

- Framework: Next.js 14 (App Router, TypeScript strict)

  

- DB / Auth: Supabase (PostgreSQL + RLS + Storage)

  

- Styling: Tailwind CSS (브랜드 컬러 tailwind.config.ts 참고)

  

- Forms: react-hook-form + zod

  

- State: Zustand (전역) + TanStack Query (서버)

  

- Charts: recharts

  

- PDF: @react-pdf/renderer

  

- Email: Resend + React Email

  

- SDK: @supabase/ssr (App Router 전용)

  

## 브랜드 컬러

  

- primary:       #1F4E79  (신뢰 딥블루)

  

- secondary:     #2E75B6  (포인트 블루)

  

- accent:        #4CAF50  (환경 그린)

  

- neutral-dark:  #1A1A1A

  

- neutral-mid:   #666666

  

- neutral-light: #F5F8FB

  

## 폴더 구조 규칙

  

- src/app/(auth)/          → 인증 페이지

  

- src/app/(customer)/      → 고객 마이페이지 (role=customer만)

  

- src/app/(admin)/         → 관리자 백오피스 (직원 전용)

  

- src/components/layout/   → Header, Footer

  

- src/components/ui/       → 재사용 UI (PageBanner, SubNav 등)

  

- src/components/sections/ → 메인 페이지 섹션

  

- src/components/admin/    → 관리자 전용 컴포넌트

  

- src/components/customer/ → 고객 전용 컴포넌트

  

- src/lib/supabase/        → 4가지 클라이언트 (client/server/middleware/admin)

  

- src/lib/actions/         → Server Actions (모든 DB 변경은 여기서)

  

- src/lib/schemas/         → zod 스키마

  

- src/lib/auth/roles.ts    → 권한 유틸

  

- src/lib/constants.ts     → COMPANY 상수 (TODO: 실제 정보로 교체)

  

- supabase/migrations/     → SQL 마이그레이션 파일 (001~018)

  

## 사용자 역할 (7가지)

  

customer / sales_rep / sales_manager / dispatcher / accountant / admin / super_admin

  

## 견적 상태 흐름 (절대 변경 금지)

  

draft → submitted → rep_reviewing → rep_approved

  

→ manager_reviewing → manager_approved → sent_to_customer

  

→ accepted | rejected_by_customer | expired | cancelled

  

## 코딩 규칙

  

- 모든 DB 접근은 Server Action 경유 (클라이언트에서 직접 supabase 쿼리 금지)

  

- 권한 체크는 반드시 서버에서 (클라이언트 UI 제어는 UX일 뿐 보안 아님)

  

- 에러 처리: try-catch + toast 알림 패턴

  

- 타입: src/lib/supabase/types.ts의 Database 타입 사용

  

- 이미지: next/image 사용 필수

  

- 폰트: Pretendard Variable

  

- 번호 체계: INQ/QT/DP/CT/INV-YYYY-NNNN

  

## 중요 TODO (실제 정보로 교체 필요)

  

- src/lib/constants.ts의 COMPANY 상수

  

- 카카오맵 iframe URL (오시는 길)

  

- RESEND_API_KEY (이메일 발송)

  

- sitemap.ts의 baseUrl

  

## 수정 금지 파일

  

- supabase/migrations/*.sql  (마이그레이션은 새 파일로만 추가)

  

- src/lib/supabase/types.ts   (supabase gen types로만 갱신)

  

## 세션 간 기억할 것

  

- Supabase 클라이언트는 4가지 변형으로 사용 (client/server/middleware/admin)

  

- RLS는 항상 활성화 상태. 테스트 편의를 위해 끄지 말 것

  

- 견적서 승인 완료(manager_approved) 시 반드시 PDF 자동 생성 + 이메일 발송

  

- 배차 완료 시 세금계산서 발행 대상으로 자동 분류

**