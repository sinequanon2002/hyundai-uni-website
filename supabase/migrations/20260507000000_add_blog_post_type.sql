-- notices 테이블에 블로그/공지 구분 컬럼 추가
-- post_type: 'notice' = 공지사항, 'blog' = 블로그/자료실

ALTER TABLE notices
  ADD COLUMN IF NOT EXISTS post_type    TEXT        NOT NULL DEFAULT 'notice',
  ADD COLUMN IF NOT EXISTS excerpt      TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS tags         TEXT[]      NOT NULL DEFAULT '{}';

-- post_type 인덱스 (목록 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_notices_post_type ON notices(post_type);
CREATE INDEX IF NOT EXISTS idx_notices_post_type_created ON notices(post_type, created_at DESC);
