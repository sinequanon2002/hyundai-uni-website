-- 020: quotations 테이블 + 견적서 번호 생성 함수 + Storage 버킷

-- updated_at 트리거 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── quotations ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number    TEXT        NOT NULL UNIQUE,              -- QT-2026-0001
  inquiry_id      UUID        NOT NULL REFERENCES inquiries(id) ON DELETE RESTRICT,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_name TEXT,
  status          TEXT        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','sent','accepted','rejected','expired')),

  -- 고객 스냅샷 (문의 수정과 무관하게 견적서 내용 보존)
  company_name    TEXT        NOT NULL,
  contact_name    TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  phone           TEXT        NOT NULL,
  address         TEXT,

  -- 항목 배열 (JSONB): [{waste_type, unit, quantity, unit_price, amount}]
  items           JSONB       NOT NULL DEFAULT '[]',

  -- 금액 (원 단위 정수)
  subtotal        INTEGER     NOT NULL DEFAULT 0,  -- 공급가액
  tax             INTEGER     NOT NULL DEFAULT 0,  -- 부가세(10%)
  total           INTEGER     NOT NULL DEFAULT 0,  -- 합계

  -- 부가 정보
  valid_until     DATE,
  collection_date DATE,
  notes           TEXT,
  pdf_url         TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER quotations_set_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_quotations_inquiry_id ON quotations(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status     ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage quotations" ON quotations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role <> 'customer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role <> 'customer'
    )
  );

-- ─── 견적서 번호 생성 (QT-YYYY-NNNN) ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num  INTEGER;
BEGIN
  year_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYY');
  -- 올해 마지막 번호 + 1
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(quote_number FROM 9) AS INTEGER)),
    0
  ) + 1
  INTO seq_num
  FROM quotations
  WHERE quote_number LIKE 'QT-' || year_str || '-%';

  RETURN 'QT-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ─── Storage 버킷 (PDF 저장용) ────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes', 'quotes', true)
ON CONFLICT (id) DO NOTHING;

-- 직원만 업로드
CREATE POLICY "Staff can upload quote PDFs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'quotes'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role <> 'customer'
    )
  );

-- 누구나 읽기 (URL에 UUID 포함 → 추측 불가)
CREATE POLICY "Public read quote PDFs" ON storage.objects
  FOR SELECT USING (bucket_id = 'quotes');

-- 직원만 삭제
CREATE POLICY "Staff can delete quote PDFs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'quotes'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role <> 'customer'
    )
  );
