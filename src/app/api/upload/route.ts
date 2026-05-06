import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";

const ALLOWED_BUCKETS = ["content-images"] as const;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  // 인증 확인
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 역할 확인
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) ?? "content-images";

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }
  if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
    return NextResponse.json({ error: "허용되지 않는 버킷입니다" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "지원하지 않는 파일 형식입니다" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await adminClient.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[upload] storage error:", uploadError);
    return NextResponse.json({ error: "업로드 중 오류가 발생했습니다" }, { status: 500 });
  }

  const { data: urlData } = adminClient.storage
    .from(bucket)
    .getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
