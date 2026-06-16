"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { inquiryFormSchema } from "@/lib/schemas/inquiry";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
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

export type ActivityType = "status_change" | "assigned" | "note_added";

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
  assigned_to: string | null;
  // legacy
  region_sido: string | null;
  region_sigungu: string | null;
  quantity: string | null;
  unit: string | null;
  collection_date: string | null;
  frequency: string | null;
  message: string | null;
}

export interface InquiryActivity {
  id: string;
  inquiry_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action_type: ActivityType;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
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

  // 로그인된 사용자이면 user_id 연결
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();
  const userId = user?.id ?? null;

  const supabase = createAdminClient();

  const { data: inserted, error: dbError } = await supabase
    .from("inquiries")
    .insert({
      company_name: data.companyName,
      department: data.department || null,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      address_detail: data.addressDetail ?? null,
      waste_types: data.wasteTypes,
      photo_urls: data.photoUrls && data.photoUrls.length > 0 ? data.photoUrls : null,
      marketing_consent: data.marketingConsent ?? false,
      agreement: data.agreement,
      status: "pending",
      collection_date: null,
      quantity: null,
      message: data.message ?? null,
      notification_method: data.notificationMethod,
      user_id: userId,
    })
    .select("id")
    .single();

  if (dbError || !inserted) {
    console.error("[submitInquiry] DB error:", dbError);
    return { success: false, error: "데이터 저장 중 오류가 발생했습니다" };
  }

  const inquiryId = inserted.id as string;
  const submittedAt = new Date().toISOString();

  // 이메일 발송 — 각각 독립 try-catch로 분리해 한쪽 실패가 다른쪽에 영향 없음
  void (async () => {
    // 관리자 알림
    try {
      const r1 = await getResend().emails.send({
        from: `현대유앤아이 <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
        to: ["snbhwmc@gmail.com"],
        subject: `[신규 견적 문의] ${data.companyName} - ${data.contactName}님`,
        react: InquiryNotificationEmail({
          companyName: data.companyName,
          department: data.department ?? "",
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          address: data.address ?? "",
          addressDetail: data.addressDetail,
          wasteTypes: data.wasteTypes,
          marketingConsent: data.marketingConsent ?? false,
          inquiryId,
          submittedAt,
          hasPhotos: (data.photoUrls?.length ?? 0) > 0,
          collectionDate: undefined,
          quantity: undefined,
          message: data.message,
        }),
      });
      if (r1.error) {
        console.error("[submitInquiry] Admin email error:", r1.error);
      } else {
        console.log("[submitInquiry] Admin email sent:", r1.data?.id);
      }
    } catch (err) {
      console.error("[submitInquiry] Admin email exception:", err);
    }

    // 고객 접수 확인 이메일 (이메일은 항상 필수)
    if (data.email) {
      try {
        const r2 = await getResend().emails.send({
          from: `현대유앤아이 <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
          to: [data.email],
          subject: "견적 문의가 접수되었습니다 - 현대유앤아이",
          react: InquiryConfirmationEmail({
            contactName: data.contactName,
            companyName: data.companyName,
            wasteTypes: data.wasteTypes,
            inquiryId,
          }),
        });
        if (r2.error) {
          console.error("[submitInquiry] Customer email error:", r2.error);
        } else {
          console.log("[submitInquiry] Customer email sent:", r2.data?.id);
        }
      } catch (err) {
        console.error("[submitInquiry] Customer email exception:", err);
      }
    }
  })();

  return { success: true, data: { id: inquiryId } };
}

// ─── 관리자 전용: 역할 검증 헬퍼 ─────────────────────────────────────────────────

async function requireStaff(): Promise<{ id: string; full_name: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증이 필요합니다");
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) {
    throw new Error("접근 권한이 없습니다");
  }

  return { id: user.id, full_name: (profile as { role: string; full_name: string | null }).full_name ?? null };
}

// ─── 관리자 액션 ───────────────────────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilters = {}
): Promise<ActionResult<{ inquiries: Inquiry[]; total: number; totalPages: number }>> {
  try {
    await requireStaff();
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
    await requireStaff();
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
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const validStatuses: InquiryStatus[] = [
    "pending", "reviewing", "quoted", "completed", "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "유효하지 않은 상태값입니다" };
  }

  const supabase = createAdminClient();

  // 현재 상태 조회 (이력 기록용)
  const { data: current } = await supabase
    .from("inquiries")
    .select("status, notes")
    .eq("id", id)
    .single();

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

  // 활동 이력 기록
  const activities: Array<Record<string, unknown>> = [];

  if (current?.status !== status) {
    activities.push({
      inquiry_id: id,
      actor_id: actor.id,
      actor_name: actor.full_name,
      action_type: "status_change",
      from_status: current?.status ?? null,
      to_status: status,
    });
  }

  if (notes !== undefined && notes.trim() && notes !== (current as { notes?: string } | null)?.notes) {
    activities.push({
      inquiry_id: id,
      actor_id: actor.id,
      actor_name: actor.full_name,
      action_type: "note_added",
      note: notes,
    });
  }

  if (activities.length > 0) {
    const { error: actErr } = await supabase
      .from("inquiry_activities")
      .insert(activities);
    if (actErr) console.error("[updateInquiryStatus] activity log error:", actErr);
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);

  return { success: true };
}

export async function assignInquiry(
  inquiryId: string,
  staffId: string | null
): Promise<ActionResult> {
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("inquiries")
    .select("assigned_to")
    .eq("id", inquiryId)
    .single();

  const { error } = await supabase
    .from("inquiries")
    .update({ assigned_to: staffId })
    .eq("id", inquiryId);

  if (error) {
    console.error("[assignInquiry] error:", error);
    return { success: false, error: "담당자 배정 중 오류가 발생했습니다" };
  }

  if ((current as { assigned_to?: string | null } | null)?.assigned_to !== staffId) {
    let note: string;
    if (!staffId) {
      note = "담당자 배정 해제";
    } else {
      const { data: staffProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", staffId)
        .single();
      const name = (staffProfile as { full_name?: string | null } | null)?.full_name;
      note = `담당자 배정: ${name ?? staffId}`;
    }

    const { error: actErr } = await supabase
      .from("inquiry_activities")
      .insert({
        inquiry_id: inquiryId,
        actor_id: actor.id,
        actor_name: actor.full_name,
        action_type: "assigned",
        note,
      });
    if (actErr) console.error("[assignInquiry] activity log error:", actErr);
  }

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin/inquiries");

  return { success: true };
}

export interface AssignableStaff {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export async function getAssignableStaff(): Promise<ActionResult<AssignableStaff[]>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .neq("role", "customer")
    .order("full_name");

  if (error) {
    return { success: false, error: "직원 목록을 불러오는 중 오류가 발생했습니다" };
  }

  // email은 auth.users 테이블에 있으므로 profiles에서 가져올 수 없음
  // AssigneeSelect에서 full_name을 우선 표시하므로 email 없이도 충분
  return {
    success: true,
    data: (data ?? []).map((p) => ({
      id: (p as { id: string }).id,
      full_name: (p as { full_name: string | null }).full_name,
      email: "",
      role: (p as { role: string }).role,
    })),
  };
}

export async function getInquiryActivities(
  inquiryId: string
): Promise<ActionResult<InquiryActivity[]>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiry_activities")
    .select("*")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getInquiryActivities] error:", error);
    return { success: false, error: "이력을 불러오는 중 오류가 발생했습니다" };
  }

  return { success: true, data: (data ?? []) as InquiryActivity[] };
}
