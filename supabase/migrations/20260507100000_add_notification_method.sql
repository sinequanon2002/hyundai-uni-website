-- inquiries 테이블에 notification_method 컬럼 추가
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS notification_method TEXT NOT NULL DEFAULT 'sms';

COMMENT ON COLUMN inquiries.notification_method IS '견적 알림 수신 방법: email | sms | kakao';

-- email 을 nullable 로 변경 (기존에 NOT NULL 이었다면)
ALTER TABLE inquiries
  ALTER COLUMN email DROP NOT NULL;

-- address 를 nullable 로 변경
ALTER TABLE inquiries
  ALTER COLUMN address DROP NOT NULL;

-- department 를 nullable 로 변경
ALTER TABLE inquiries
  ALTER COLUMN department DROP NOT NULL;
