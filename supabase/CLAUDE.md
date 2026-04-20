**

# Supabase 작업 규칙

  

## 마이그레이션 원칙

  

- 기존 SQL 파일 절대 수정 금지

  

- 새 변경사항은 반드시 새 파일로 (019_xxx.sql)

  

- 파일 순서가 의존성 순서: 외래키 참조 전 참조되는 테이블 먼저

  

## RLS 정책 작성 시

  

- 모든 테이블에 RLS 활성화 (ALTER TABLE xxx ENABLE ROW LEVEL SECURITY)

  

- customer role: 본인 데이터만 (auth.uid() = profile_id 패턴)

  

- super_admin: RLS 우회 (service_role 클라이언트 사용)

  

## 타입 갱신 시

  

npx supabase gen types typescript --project-id [ID] > src/lib/supabase/types.ts

**