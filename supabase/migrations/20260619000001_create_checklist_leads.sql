-- 올바로시스템 체크리스트 무료 다운로드 리드 수집 테이블
CREATE TABLE IF NOT EXISTS checklist_leads (
  id           bigserial   PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  phone        text        NOT NULL,
  company_name text
);

-- RLS 활성화
ALTER TABLE checklist_leads ENABLE ROW LEVEL SECURITY;

-- 누구나 신청 가능 (INSERT)
CREATE POLICY "checklist_public_insert"
  ON checklist_leads FOR INSERT
  WITH CHECK (true);

-- 로그인한 사용자만 조회 가능
CREATE POLICY "checklist_staff_select"
  ON checklist_leads FOR SELECT
  TO authenticated
  USING (true);
