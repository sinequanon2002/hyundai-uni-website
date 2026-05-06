-- ─── portfolio_items 테이블 ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ,
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT NOT NULL,
  category     TEXT NOT NULL,   -- 폐유 / 폐산·폐알칼리 / 폐유기용제 / 폐석면 / 보유장비
  region       TEXT NOT NULL,   -- 서울·경기 / 인천 / 부산·경남 등
  work_date    DATE NOT NULL,   -- 관리자가 선택하는 작업일
  author_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name  TEXT
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION set_portfolio_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION set_portfolio_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- 공개 읽기
CREATE POLICY "portfolio_public_read"
  ON portfolio_items FOR SELECT
  USING (true);

-- 쓰기는 service_role (Server Action → admin client)
CREATE POLICY "portfolio_service_write"
  ON portfolio_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── site_settings: 포트폴리오 작성 권한 기본값 시드 ───────────────────────────

INSERT INTO site_settings (key, value)
VALUES (
  'portfolio_write_roles',
  '["admin", "super_admin"]'::jsonb
)
ON CONFLICT (key) DO NOTHING;
