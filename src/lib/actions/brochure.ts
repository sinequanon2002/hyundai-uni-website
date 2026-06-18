"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth/roles";
import { BrochureApprovalEmail } from "@/emails/BrochureApprovalEmail";
import { z } from "zod";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type BrochureStatus = "pending" | "approved" | "rejected";

export interface BrochureRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company_name: string;
  phone: string;
  agreement: boolean;
  marketing_consent: boolean;
  status: BrochureStatus;
  approved_at: string | null;
  notes: string | null;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── 스키마 ───────────────────────────────────────────────────────────────────

const brochureFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
  companyName: z.string().min(1, "회사명을 입력해주세요"),
  phone: z.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/, "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)"),
  agreement: z.literal(true, { message: "개인정보 수집·이용에 동의하셔야 합니다" }),
  marketingConsent: z.boolean().optional().default(false),
});

export type BrochureFormValues = z.infer<typeof brochureFormSchema>;

// ─── 공개 액션 ─────────────────────────────────────────────────────────────────

export async function submitBrochureRequest(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = brochureFormSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "입력 내용을 확인해주세요" };
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  const { data: inserted, error: dbError } = await supabase
    .from("brochure_requests")
    .insert({
      name: data.name,
      email: data.email,
      company_name: data.companyName,
      phone: data.phone,
      agreement: data.agreement,
      marketing_consent: data.marketingConsent ?? false,
      status: "pending",
    })
    .select("id")
    .single();

  if (dbError || !inserted) {
    console.error("[submitBrochureRequest] DB error:", dbError);
    return { success: false, error: "신청 저장 중 오류가 발생했습니다" };
  }

  return { success: true, data: { id: inserted.id as string } };
}

// ─── 관리자 액션 ───────────────────────────────────────────────────────────────

export async function getBrochureRequests(filters?: {
  status?: BrochureStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{ requests: BrochureRequest[]; total: number; totalPages: number }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "인증이 필요합니다" };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isStaff(profile.role)) return { success: false, error: "권한이 없습니다" };

  const status = filters?.status ?? "all";
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = adminClient
    .from("brochure_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;
  if (error) return { success: false, error: "데이터 조회 중 오류가 발생했습니다" };

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { success: true, data: { requests: (data ?? []) as BrochureRequest[], total, totalPages } };
}

export async function approveBrochureRequest(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "인증이 필요합니다" };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isStaff(profile.role)) return { success: false, error: "권한이 없습니다" };

  // 신청 정보 조회
  const { data: req, error: fetchError } = await adminClient
    .from("brochure_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !req) return { success: false, error: "신청 정보를 찾을 수 없습니다" };
  if (req.status === "approved") return { success: false, error: "이미 승인된 신청입니다" };

  // 상태 업데이트
  const { error: updateError } = await adminClient
    .from("brochure_requests")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return { success: false, error: "상태 업데이트 중 오류가 발생했습니다" };

  // 이메일 발송 (PDF 첨부)
  try {
    const pdfUrl = process.env.BROCHURE_PDF_URL;
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const emailResult = await getResend().emails.send({
      from: `현대유앤아이 <${fromAddress}>`,
      to: [req.email],
      subject: "[현대유앤아이] 서비스 소개서를 보내드립니다",
      react: BrochureApprovalEmail({ name: req.name, companyName: req.company_name }),
      ...(pdfUrl && {
        attachments: [
          {
            filename: "현대유앤아이_서비스소개서.pdf",
            path: pdfUrl,
          },
        ],
      }),
    });

    if (emailResult.error) {
      console.error("[approveBrochureRequest] Email error:", emailResult.error);
    }
  } catch (err) {
    console.error("[approveBrochureRequest] Email exception:", err);
  }

  revalidatePath("/admin/brochures");
  return { success: true };
}

export async function rejectBrochureRequest(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "인증이 필요합니다" };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isStaff(profile.role)) return { success: false, error: "권한이 없습니다" };

  const { error } = await adminClient
    .from("brochure_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return { success: false, error: "상태 업데이트 중 오류가 발생했습니다" };

  revalidatePath("/admin/brochures");
  return { success: true };
}
