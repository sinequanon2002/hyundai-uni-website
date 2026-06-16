-- 019: 담당자 배정 + 활동 이력 테이블
-- inquiries에 assigned_to 추가, inquiry_activities 신설

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON inquiries(assigned_to);

-- ─── 활동 이력 ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquiry_activities (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id   UUID        NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  actor_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name   TEXT,
  action_type  TEXT        NOT NULL CHECK (
                             action_type IN ('status_change', 'assigned', 'note_added')
                           ),
  from_status  TEXT,
  to_status    TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiry_activities_inquiry_id
  ON inquiry_activities(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_activities_created_at
  ON inquiry_activities(inquiry_id, created_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE inquiry_activities ENABLE ROW LEVEL SECURITY;

-- 직원(non-customer)만 조회
CREATE POLICY "Staff can view activities" ON inquiry_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'customer'
    )
  );

-- 직원만 삽입 (Server Action에서 admin client로 호출하므로 실질적 보호)
CREATE POLICY "Staff can insert activities" ON inquiry_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'customer'
    )
  );
