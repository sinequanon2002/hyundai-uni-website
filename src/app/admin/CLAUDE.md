**

# 관리자 백오피스 규칙

  

## 접근 제어

  

- 모든 admin 라우트: role != 'customer' 체크 필수

  

- super_admin 전용 기능: role == 'super_admin' 명시적 체크

  

## 레이아웃

  

- AdminSidebar + AdminHeader + 메인 콘텐츠 구조

  

- 역할별 동적 메뉴: roles.ts의 getAccessibleRoutes() 사용

  

- 테이블: @tanstack/react-table 사용

  

## 데이터 페칭

  

- 모든 데이터는 Server Component에서 직접 fetch 또는 Server Action

  

- 클라이언트 실시간 업데이트: Supabase Realtime 구독

**