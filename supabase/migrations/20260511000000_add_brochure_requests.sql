-- 소개서 다운로드 신청 테이블
CREATE TABLE IF NOT EXISTS brochure_requests (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text        NOT NULL,
  email         text        NOT NULL,
  company_name  text        NOT NULL,
  phone         text        NOT NULL,
  agreement     boolean     NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at   timestamptz,
  notes         text
);

-- RLS 활성화
ALTER TABLE brochure_requests ENABLE ROW LEVEL SECURITY;

-- 누구나 신청 가능 (INSERT)
CREATE POLICY "brochure_public_insert"
  ON brochure_requests FOR INSERT
  WITH CHECK (true);

-- 직원만 조회·수정 가능
CREATE POLICY "brochure_staff_select"
  ON brochure_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN (
          'admin','super_admin','sales_rep','sales_manager',
          'dispatcher','accountant'
        )
    )
  );

CREATE POLICY "brochure_staff_update"
  ON brochure_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN (
          'admin','super_admin','sales_rep','sales_manager',
          'dispatcher','accountant'
        )
    )
  );
