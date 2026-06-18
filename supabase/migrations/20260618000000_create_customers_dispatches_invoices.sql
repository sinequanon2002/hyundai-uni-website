-- 021: ERP Phase 1 — customers / dispatches / invoices

-- ─── CUSTOMERS (배출 사업장) ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name    TEXT        NOT NULL,
  business_number TEXT,                                -- 사업자번호
  ceo_name        TEXT,                                -- 대표자명
  contact_name    TEXT,                                -- 담당자
  contact_phone   TEXT,
  contact_email   TEXT,
  address         TEXT,
  waste_types     TEXT[]      NOT NULL DEFAULT '{}',   -- 주요 폐기물 종류
  contract_prices JSONB       NOT NULL DEFAULT '{}',   -- {waste_type: unit_price}
  notes           TEXT,
  source_inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_business_number ON customers(business_number);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  );

-- ─── DISPATCHES (수거 건) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispatches (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_number  TEXT        NOT NULL UNIQUE,        -- DP-YYYY-NNNN
  customer_id      UUID        REFERENCES customers(id) ON DELETE SET NULL,
  inquiry_id       UUID        REFERENCES inquiries(id) ON DELETE SET NULL,
  quotation_id     UUID        REFERENCES quotations(id) ON DELETE SET NULL,
  assigned_to      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_name    TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','scheduled','in_transit','completed','cancelled')),
  scheduled_date   DATE,
  actual_date      DATE,
  collection_address TEXT,
  waste_items      JSONB       NOT NULL DEFAULT '[]',  -- [{waste_type, unit, estimated_qty, actual_qty, unit_price, amount}]
  subtotal         INTEGER     NOT NULL DEFAULT 0,
  tax              INTEGER     NOT NULL DEFAULT 0,
  total            INTEGER     NOT NULL DEFAULT 0,
  notes            TEXT,
  created_by       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_name  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER dispatches_set_updated_at
  BEFORE UPDATE ON dispatches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dispatches_customer_id  ON dispatches(customer_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status       ON dispatches(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_scheduled    ON dispatches(scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at   ON dispatches(created_at DESC);

ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage dispatches" ON dispatches
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  );

-- ─── INVOICES (세금계산서) ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number  TEXT        NOT NULL UNIQUE,         -- INV-YYYY-NNNN
  dispatch_id     UUID        REFERENCES dispatches(id) ON DELETE SET NULL,
  customer_id     UUID        REFERENCES customers(id) ON DELETE SET NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','issued','paid','cancelled')),
  subtotal        INTEGER     NOT NULL DEFAULT 0,
  tax             INTEGER     NOT NULL DEFAULT 0,
  total           INTEGER     NOT NULL DEFAULT 0,
  issued_at       DATE,
  due_date        DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER invoices_set_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_invoices_dispatch_id ON invoices(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status      ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at  ON invoices(created_at DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role <> 'customer')
  );

-- ─── 번호 생성 함수 ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_dispatch_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num  INTEGER;
BEGIN
  year_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(dispatch_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM dispatches
  WHERE dispatch_number LIKE 'DP-' || year_str || '-%';
  RETURN 'DP-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num  INTEGER;
BEGIN
  year_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_str || '-%';
  RETURN 'INV-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ─── 배차 완료 시 세금계산서 자동 생성 트리거 ────────────────────────────────

CREATE OR REPLACE FUNCTION auto_create_invoice_on_dispatch_complete()
RETURNS TRIGGER AS $$
DECLARE
  inv_number TEXT;
BEGIN
  -- completed로 변경될 때만 실행
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    -- 이미 세금계산서가 있으면 건너뜀
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE dispatch_id = NEW.id) THEN
      inv_number := generate_invoice_number();
      INSERT INTO invoices (invoice_number, dispatch_id, customer_id, status, subtotal, tax, total)
      VALUES (inv_number, NEW.id, NEW.customer_id, 'pending', NEW.subtotal, NEW.tax, NEW.total);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER dispatch_completed_create_invoice
  AFTER UPDATE OF status ON dispatches
  FOR EACH ROW EXECUTE FUNCTION auto_create_invoice_on_dispatch_complete();
