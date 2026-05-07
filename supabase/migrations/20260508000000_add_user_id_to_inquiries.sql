-- inquiries 테이블에 user_id 컬럼 추가 (고객 마이페이지 연동)
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);

-- 고객 RLS: 자신의 문의만 조회
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inquiries' AND policyname = 'customer_select_own_inquiries'
  ) THEN
    CREATE POLICY "customer_select_own_inquiries"
      ON inquiries FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
