-- profiles 테이블에 B2B 고객 정보 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS department   TEXT,
  ADD COLUMN IF NOT EXISTS phone        TEXT;
