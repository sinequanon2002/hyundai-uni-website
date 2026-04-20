import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 10MB를 초과할 수 없습니다" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다 (jpg, png, webp, heic, pdf만 가능)" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${crypto.randomUUID()}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("inquiry-attachments")
      .upload(filename, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("[upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: "파일 업로드 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("inquiry-attachments")
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
