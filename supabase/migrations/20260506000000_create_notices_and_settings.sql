-- ─── notices 테이블 ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,          -- HTML (Tiptap 출력)
  category      TEXT NOT NULL DEFAULT '공지',
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  views         INTEGER NOT NULL DEFAULT 0,
  author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT                           -- 작성 당시 이름 스냅샷
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION set_notices_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION set_notices_updated_at();

-- ─── 조회수 증가 RPC ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_notice_views(notice_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE notices SET views = views + 1 WHERE id = notice_id;
END;
$$;

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (누구나)
CREATE POLICY "notices_public_read"
  ON notices FOR SELECT
  USING (true);

-- 쓰기는 서비스 롤만 (Server Action → admin client 사용)
CREATE POLICY "notices_service_write"
  ON notices FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── site_settings 테이블 ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION set_site_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_site_settings_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 스태프는 읽기 가능
CREATE POLICY "site_settings_staff_read"
  ON site_settings FOR SELECT
  USING (auth.role() = 'service_role');

-- 쓰기는 서비스 롤만
CREATE POLICY "site_settings_service_write"
  ON site_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── 기본값 시드 ─────────────────────────────────────────────────────────────

INSERT INTO site_settings (key, value)
VALUES (
  'notice_write_roles',
  '["admin", "super_admin"]'::jsonb
)
ON CONFLICT (key) DO NOTHING;
