"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { inquiryFormSchema } from "@/lib/schemas/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";
import { InquiryNotificationEmail } from "@/emails/InquiryNotificationEmail";
import { InquiryConfirmationEmail } from "@/emails/InquiryConfirmationEmail";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type InquiryStatus =
  | "pending"
  | "reviewing"
  | "quoted"
  | "completed"
  | "cancelled";

export interface Inquiry {
  id: string;
  created_at: string;
  updated_at: string | null;
  company_name: string;
  department: string | null;
  contact_name: string;
  email: string;
  phone: string;
  address: string | null;
  address_detail: string | null;
  waste_types: string[];
  photo_urls: string[] | null;
  marketing_consent: boolean;
  agreement: boolean;
  status: InquiryStatus;
  notes: string | null;
  // legacy
  region_sido: string | null;
  region_sigungu: string | null;
  quantity: number | null;
  unit: string | null;
  frequency: string | null;
  message: string | null;
}

export interface InquiryFilters {
  status?: InquiryStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── 공개 액션 ─────────────────────────────────────────────────────────────────

export async function submitInquiry(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = inquiryFormSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "입력 내용을 확인해주세요" };
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  const { data: inserted, error: dbError } = await supabase
    .from("inquiries")
    .insert({
      company_name: data.companyName,
      department: data.department,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      address_detail: data.addressDetail ?? null,
      waste_types: data.wasteTypes,
      photo_urls: data.photoUrls && data.photoUrls.length > 0 ? data.photoUrls : null,
      marketing_consent: data.marketingConsent ?? false,
      agreement: data.agreement,
      status: "pending",
    })
    .select("id")
    .single();

  if (dbError || !inserted) {
    console.error("[submitInquiry] DB error:", dbError);
    return { success: false, error: "데이터 저장 중 오류가 발생했습니다" };
  }

  const inquiryId = inserted.id as string;
  const submittedAt = new Date().toISOString();

  // 이메일 발송 (fire-and-forget)
  try {
    Promise.all([
    getResend().emails.send({
      from: "현대유앤아이환경 <onboarding@resend.dev>",
      to: ["snbhwmc@gmail.com"],
      subject: `[신규 견적 문의] ${data.companyName} - ${data.contactName}님`,
      react: InquiryNotificationEmail({
        companyName: data.companyName,
        department: data.department,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        wasteTypes: data.wasteTypes,
        marketingConsent: data.marketingConsent ?? false,
        inquiryId,
        submittedAt,
        hasPhotos: (data.photoUrls?.length ?? 0) > 0,
      }),
    }),
    getResend().emails.send({
      from: "현대유앤아이환경 <onboarding@resend.dev>",
      to: [data.email],
      subject: "견적 문의가 접수되었습니다 - 현대유앤아이환경",
      react: InquiryConfirmationEmail({
        contactName: data.contactName,
        companyName: data.companyName,
        wasteTypes: data.wasteTypes,
        inquiryId,
      }),
    }),
    ]).catch((err) => console.error("[submitInquiry] Email error:", err));
  } catch (err) {
    console.error("[submitInquiry] Email setup error:", err);
  }

  return { success: true, data: { id: inquiryId } };
}

// ─── 관리자 액션 ───────────────────────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilters = {}
): Promise<ActionResult<{ inquiries: Inquiry[]; total: number; totalPages: number }>> {
  try {
    const {
      status = "all",
      search = "",
      page = 1,
      pageSize = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    } = filters;

    const supabase = createAdminClient();
    let query = supabase.from("inquiries").select("*", { count: "exact" });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      const q = search.trim();
      query = query.or(
        `company_name.ilike.%${q}%,contact_name.ilike.%${q}%`
      );
    }

    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[getInquiries] error:", error);
      return { success: false, error: "데이터를 불러오는 중 오류가 발생했습니다" };
    }

    const total = count ?? 0;
    return {
      success: true,
      data: {
        inquiries: (data ?? []) as Inquiry[],
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    console.error("[getInquiries] unexpected error:", err);
    return { success: false, error: "데이터를 불러오는 중 오류가 발생했습니다" };
  }
}

export async function getInquiryById(
  id: string
): Promise<ActionResult<Inquiry>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: "문의를 찾을 수 없습니다" };
    }

    return { success: true, data: data as Inquiry };
  } catch (err) {
    console.error("[getInquiryById] unexpected error:", err);
    return { success: false, error: "문의를 불러오는 중 오류가 발생했습니다" };
  }
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  notes?: string
): Promise<ActionResult> {
  // TODO: auth 구현 시 인증 체크 추가

  const validStatuses: InquiryStatus[] = [
    "pending", "reviewing", "quoted", "completed", "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "유효하지 않은 상태값입니다" };
  }

  const supabase = createAdminClient();
  const updateData: Record<string, unknown> = { status };
  if (notes !== undefined) updateData.notes = notes;

  const { error } = await supabase
    .from("inquiries")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("[updateInquiryStatus] error:", error);
    return { success: false, error: "상태 업데이트 중 오류가 발생했습니다" };
  }

  revalidatePath("/inquiries");
  revalidatePath(`/inquiries/${id}`);

  return { success: true };
}
