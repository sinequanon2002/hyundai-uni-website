"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import * as React from "react";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { QuotePdf } from "@/components/pdf/QuotePdf";
import { QuoteEmail } from "@/emails/QuoteEmail";
import type { ActionResult } from "./inquiry";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuoteItem {
  waste_type: string;
  unit: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface Quotation {
  id: string;
  quote_number: string;
  inquiry_id: string;
  created_by: string | null;
  created_by_name: string | null;
  status: QuoteStatus;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string | null;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  valid_until: string | null;
  collection_date: string | null;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateQuoteInput {
  inquiry_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  valid_until?: string;
  collection_date?: string;
  notes?: string;
}

// ─── 권한 헬퍼 ────────────────────────────────────────────────────────────────

async function requireStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles").select("role, full_name").eq("id", user.id).single();

  if (!profile || !isStaff(profile.role)) throw new Error("접근 권한이 없습니다");

  return {
    id: user.id,
    full_name: (profile as { role: string; full_name: string | null }).full_name ?? null,
  };
}

// ─── 견적서 생성 ──────────────────────────────────────────────────────────────

export async function createQuotation(
  input: CreateQuoteInput
): Promise<ActionResult<Quotation>> {
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();

  // 번호 생성 (DB 함수 호출)
  const { data: numData, error: numErr } = await supabase
    .rpc("generate_quote_number");
  if (numErr || !numData) {
    return { success: false, error: "견적서 번호 생성 실패" };
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      quote_number:    numData as string,
      inquiry_id:      input.inquiry_id,
      created_by:      actor.id,
      created_by_name: actor.full_name,
      status:          "draft",
      company_name:    input.company_name,
      contact_name:    input.contact_name,
      email:           input.email,
      phone:           input.phone,
      address:         input.address ?? null,
      items:           input.items,
      subtotal:        input.subtotal,
      tax:             input.tax,
      total:           input.total,
      valid_until:     input.valid_until ?? null,
      collection_date: input.collection_date ?? null,
      notes:           input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createQuotation] error:", error);
    return { success: false, error: "견적서 저장 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/inquiries/${input.inquiry_id}`);

  return { success: true, data: data as unknown as Quotation };
}

// ─── 목록 조회 ────────────────────────────────────────────────────────────────

export async function getQuotations(filters: {
  status?: QuoteStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<{ quotations: Quotation[]; total: number; totalPages: number }>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const { status = "all", search = "", page = 1, pageSize = 20 } = filters;
  const supabase = createAdminClient();

  let query = supabase
    .from("quotations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (search.trim()) {
    query = query.or(`company_name.ilike.%${search.trim()}%,quote_number.ilike.%${search.trim()}%`);
  }

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { success: false, error: "조회 중 오류가 발생했습니다" };

  const total = count ?? 0;
  return {
    success: true,
    data: {
      quotations: (data ?? []) as unknown as Quotation[],
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// ─── 단건 조회 ────────────────────────────────────────────────────────────────

export async function getQuotationById(id: string): Promise<ActionResult<Quotation>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quotations").select("*").eq("id", id).single();

  if (error || !data) return { success: false, error: "견적서를 찾을 수 없습니다" };
  return { success: true, data: data as unknown as Quotation };
}

// ─── 문의별 견적서 목록 ────────────────────────────────────────────────────────

export async function getQuotationsByInquiry(
  inquiryId: string
): Promise<ActionResult<Quotation[]>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "조회 중 오류가 발생했습니다" };
  return { success: true, data: (data ?? []) as unknown as Quotation[] };
}

// ─── PDF 생성 + 스토리지 업로드 ───────────────────────────────────────────────

export async function generateQuotePdf(
  id: string
): Promise<ActionResult<{ pdf_url: string }>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data: quote, error: fetchErr } = await supabase
    .from("quotations").select("*").eq("id", id).single();

  if (fetchErr || !quote) return { success: false, error: "견적서를 찾을 수 없습니다" };

  try {
    const q = quote as unknown as Quotation;
    const issuedAt = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });

    // PDF 렌더링
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotePdf, { quote: q, issuedAt }) as React.ReactElement<DocumentProps>
    );

    // Storage 업로드
    const fileName = `${q.quote_number}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from("quotes")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      console.error("[generateQuotePdf] upload error:", uploadErr);
      return { success: false, error: "PDF 업로드 중 오류가 발생했습니다" };
    }

    const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(fileName);
    const pdf_url = urlData.publicUrl;

    // DB 업데이트
    await supabase.from("quotations").update({ pdf_url }).eq("id", id);

    revalidatePath(`/admin/quotes/${id}`);
    return { success: true, data: { pdf_url } };
  } catch (err) {
    console.error("[generateQuotePdf] render error:", err);
    return { success: false, error: "PDF 생성 중 오류가 발생했습니다" };
  }
}

// ─── 견적서 발송 ──────────────────────────────────────────────────────────────

export async function sendQuotation(
  id: string
): Promise<ActionResult<{ pdf_url: string }>> {
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  // 1. 견적서 조회
  const supabase = createAdminClient();
  const { data: quoteRaw, error: fetchErr } = await supabase
    .from("quotations").select("*").eq("id", id).single();

  if (fetchErr || !quoteRaw) return { success: false, error: "견적서를 찾을 수 없습니다" };
  const quote = quoteRaw as unknown as Quotation;

  if (quote.status !== "draft") {
    return { success: false, error: "이미 발송된 견적서입니다" };
  }

  try {
    // 2. PDF 생성
    const issuedAt = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotePdf, { quote, issuedAt }) as React.ReactElement<DocumentProps>
    );

    // 3. Storage 업로드
    const fileName = `${quote.quote_number}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from("quotes")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      console.error("[sendQuotation] upload error:", uploadErr);
      return { success: false, error: "PDF 업로드 중 오류가 발생했습니다" };
    }

    const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(fileName);
    const pdf_url = urlData.publicUrl;

    // 4. 이메일 발송 (PDF 첨부)
    const resend = getResend();
    const emailResult = await resend.emails.send({
      from: `현대유앤아이 <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
      to: [quote.email],
      subject: `[견적서] ${quote.quote_number} - 현대유앤아이`,
      react: React.createElement(QuoteEmail, {
        contactName:   quote.contact_name,
        companyName:   quote.company_name,
        quoteNumber:   quote.quote_number,
        total:         quote.total,
        validUntil:    quote.valid_until,
      }),
      attachments: [
        {
          filename: `${quote.quote_number}.pdf`,
          content:  Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    if (emailResult.error) {
      console.error("[sendQuotation] email error:", emailResult.error);
      // 이메일 실패해도 PDF는 저장 — 상태는 sent로 변경하지 않음
      return { success: false, error: "이메일 발송 중 오류가 발생했습니다 (PDF는 저장됨)" };
    }

    // 5. 상태 업데이트
    await supabase.from("quotations").update({ status: "sent", pdf_url }).eq("id", id);

    // 6. 문의 상태 → quoted
    await supabase.from("inquiries")
      .update({ status: "quoted" })
      .eq("id", quote.inquiry_id);

    // 7. 활동 이력 기록
    await supabase.from("inquiry_activities").insert({
      inquiry_id:  quote.inquiry_id,
      actor_id:    actor.id,
      actor_name:  actor.full_name,
      action_type: "status_change",
      from_status: "reviewing",
      to_status:   "quoted",
      note:        `견적서 발송: ${quote.quote_number}`,
    });

    revalidatePath(`/admin/quotes/${id}`);
    revalidatePath(`/admin/inquiries/${quote.inquiry_id}`);
    revalidatePath("/admin/quotes");

    return { success: true, data: { pdf_url } };
  } catch (err) {
    console.error("[sendQuotation] error:", err);
    return { success: false, error: "견적서 발송 중 오류가 발생했습니다" };
  }
}
