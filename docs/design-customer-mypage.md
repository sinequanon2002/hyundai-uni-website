# 고객 마이페이지 기능 설계 (B-2)

> 작성일: 2026-05-07
> 대상: `src/app/(customer)/` 라우트 그룹 전체 신규 구현

---

## 1. 배경 및 목적

현재 견적 문의 폼(`/support/inquiry`)은 비로그인 상태에서도 제출 가능하며,
제출 후 고객이 진행 상태를 확인할 방법이 없다.

고객 마이페이지는 다음 문제를 해결한다:
- 고객이 자신의 문의 접수 내역과 처리 상태를 직접 확인
- 담당자 연락 전까지의 불안감 해소 → 재문의/전화 문의 감소
- B2B 특성상 담당자가 바뀌어도 문의 이력 연속성 유지

---

## 2. 사전 DB 변경사항 (마이그레이션 필요)

### 2-1. `inquiries` 테이블에 `user_id` 컬럼 추가

현재 inquiries 테이블에 user_id 외래키가 없어 고객과 문의를 연결할 수 없다.

```sql
-- supabase/migrations/20260508000000_add_user_id_to_inquiries.sql

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);

-- 고객 RLS: 자신의 문의만 조회 가능
CREATE POLICY "customer_select_own_inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- 기존 staff SELECT 정책이 없다면 추가
-- (이미 있다면 생략)
CREATE POLICY "staff_select_all_inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN (
          'sales_rep','sales_manager','dispatcher',
          'accountant','admin','super_admin'
        )
    )
  );
```

### 2-2. `profiles` 테이블에 B2B 정보 추가

```sql
-- supabase/migrations/20260508000001_add_company_to_profiles.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS department   TEXT,
  ADD COLUMN IF NOT EXISTS phone        TEXT;
```

---

## 3. 라우트 구조

```
src/app/(customer)/
├── layout.tsx                  ← 고객 전용 레이아웃 (헤더 + 하단 네비)
├── my/
│   ├── page.tsx                ← 마이홈 (대시보드)
│   ├── inquiries/
│   │   ├── page.tsx            ← 내 문의 목록
│   │   └── [id]/
│   │       └── page.tsx        ← 문의 상세 + 상태 타임라인
│   └── profile/
│       └── page.tsx            ← 내 정보 수정 (이름, 연락처, 소속)
```

접근 제어: 미들웨어에서 `/my/*` 경로는 `customer` 역할 필요.
staff(관리자)가 `/my`에 접근하면 `/inquiries`(관리자 대시보드)로 리다이렉트.

---

## 4. 페이지별 기능 명세

### 4-1. 마이홈 `/my`

**목적**: 현황 요약 + 빠른 접근

**구성 요소**:
- 환영 메시지 (이름, 회사명)
- 문의 현황 카드 3개
  - 진행 중 (pending + reviewing)
  - 견적 발송됨 (quoted)
  - 완료 (completed)
- 최근 문의 3건 리스트 (상태 배지 포함)
- "새 견적 문의하기" 버튼 → `/support/inquiry`

---

### 4-2. 내 문의 목록 `/my/inquiries`

**목적**: 전체 문의 이력 조회

**구성 요소**:
- 상태 탭 필터: 전체 / 진행중 / 견적완료 / 완료
- 문의 카드 리스트 (최신순)
  - 접수번호, 접수일, 폐기물 종류(최대 2개 + 외 N건), 상태 배지
- 페이지네이션 (10건/페이지)
- 빈 상태: "아직 문의 내역이 없습니다" + 견적 문의 버튼

**상태 배지 색상**:

| 상태 | 한국어 | 색상 |
|------|--------|------|
| pending | 접수 대기 | gray |
| reviewing | 검토 중 | blue |
| quoted | 견적 발송됨 | yellow |
| completed | 처리 완료 | green |
| cancelled | 취소 | red |

---

### 4-3. 문의 상세 `/my/inquiries/[id]`

**목적**: 개별 문의의 전체 내용 + 처리 상태 확인

**구성 요소**:

**(a) 접수 정보 요약**
- 접수번호, 접수일시, 현재 상태 배지

**(b) 처리 상태 타임라인** (세로 스텝)
```
● 접수 완료   2026-05-07 10:23
● 검토 중     2026-05-07 14:00
○ 견적 발송
○ 처리 완료
```
- 완료된 단계: 채워진 원 + 타임스탬프
- 미완료 단계: 빈 원 + 회색

**(c) 문의 내용 (읽기 전용)**
- 사업장명, 담당자, 연락처, 수거 장소
- 폐기물 종류 (태그 형식)
- 수거 희망일, 예상 수량, 상세 문의
- 첨부 사진 썸네일 그리드

**(d) 하단 액션**
- 추가 문의: "전화 문의" 버튼 (tel: 링크)
- 목록으로 돌아가기

**보안**: 타인의 문의 ID로 접근 시 → 404 처리
(RLS + 서버에서 user_id 일치 검증)

---

### 4-4. 내 정보 수정 `/my/profile`

**목적**: 프로필 정보 관리

**수정 가능 항목**:
- 이름 (full_name)
- 회사명 (company_name)
- 소속팀 (department)
- 연락처 (phone)

**수정 불가 항목** (읽기 전용):
- 이메일 (Supabase Auth 계정)
- 가입일

**저장**: Server Action → profiles 테이블 UPDATE
(자신의 행만 수정 가능, RLS 보장)

---

## 5. 로그인 흐름 수정

현재 로그인 성공 시 무조건 `/inquiries`(관리자)로 리다이렉트된다.
역할에 따라 분기 처리가 필요하다.

```typescript
// src/lib/actions/auth.ts 수정 방향
if (isStaff(profile.role)) {
  redirect(next ?? "/inquiries");
} else {
  // customer
  redirect(next ?? "/my");
}
```

미들웨어도 `/my/*` 경로 보호 추가:
```typescript
// customer 또는 staff 모두 접근 가능
// 단, 미인증 시 /login?next=/my 로 리다이렉트
```

---

## 6. 견적 문의 제출 시 user_id 연결

로그인 상태에서 문의 제출 시 자동으로 user_id를 저장해
마이페이지에서 조회 가능하도록 한다.

```typescript
// src/lib/actions/inquiry.ts submitInquiry() 수정 방향
const supabase = createClient(); // server client (쿠키 기반)
const { data: { user } } = await supabase.auth.getUser();

await adminClient.from("inquiries").insert({
  ...fields,
  user_id: user?.id ?? null,  // 비로그인이면 null
});
```

비로그인 제출 문의는 마이페이지에서 조회 불가.
(추후 이메일로 본인 인증 후 연결하는 기능은 범위 외)

---

## 7. 신규 Server Actions

```typescript
// src/lib/actions/customer.ts (신규 파일)

// 내 문의 목록 조회 (본인 것만, RLS 보장)
getMyInquiries(filters): Promise<ActionResult<{ inquiries, total, totalPages }>>

// 내 문의 상세 조회 (타인 문의 접근 시 null 반환)
getMyInquiryById(id): Promise<ActionResult<Inquiry>>

// 내 프로필 조회
getMyProfile(): Promise<ActionResult<Profile>>

// 내 프로필 수정
updateMyProfile(data): Promise<ActionResult>
```

---

## 8. 구현 순서 (권장)

```
1단계   DB 마이그레이션 (user_id 컬럼, RLS 정책, profiles 확장)
2단계   submitInquiry()에 user_id 저장 로직 추가
3단계   로그인 리다이렉트 분기 처리 (auth.ts + middleware.ts)
4단계   customer.ts Server Actions 구현
5단계   (customer)/layout.tsx — 레이아웃 및 접근 제어
6단계   /my — 마이홈 페이지
7단계   /my/inquiries — 목록 페이지
8단계   /my/inquiries/[id] — 상세 + 타임라인 페이지
9단계   /my/profile — 프로필 수정 페이지
```

---

## 9. 범위 외 (추후 검토)

- 비로그인 제출 문의를 로그인 후 본인 문의로 연결
- 견적서 PDF 다운로드 (관리자가 quoted 처리 시 첨부)
- 문의 취소 기능 (pending 상태에서만 가능)
- 알림 설정 변경 (SMS/이메일/카카오 선호도)
- 재문의 (기존 문의 내용 복사해서 새 문의)
