-- ─── content-images 버킷 Storage RLS 정책 ──────────────────────────────────

-- 공개 읽기: 누구나 content-images 버킷의 파일을 읽을 수 있음
CREATE POLICY "content_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

-- 업로드: service_role만 가능 (Server Action → admin client 경유)
CREATE POLICY "content_images_service_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-images'
    AND auth.role() = 'service_role'
  );

-- 삭제: service_role만 가능
CREATE POLICY "content_images_service_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-images'
    AND auth.role() = 'service_role'
  );
