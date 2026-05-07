"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  department: string | null;
  phone: string | null;
  created_at: string;
}

export interface MyInquiry {
  id: string;
  created_at: string;
  updated_at: string | null;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  address_detail: string | null;
  waste_types: string[];
  photo_urls: string[] | null;
  quantity: string | null;
  collection_date: string | null;
  message: string | null;
  status: "pending" | "reviewing" | "quoted" | "completed" | "cancelled";
  notification_method: string;
}

// ─── 인증 헬퍼 ───────────────────────────────────────────────────────────────

async function requireCustomer(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my");
  return user.id;
}

// ─── 내 문의 목록 ─────────────────────────────────────────────────────────────

export async function getMyInquiries(filters: {
  status?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<{ inquiries: MyInquiry[]; total: number; totalPages: number }>> {
  const userId = await requireCustomer();
  const { status = "all", page = 1, pageSize = 10 } = filters;

  const supabase = createAdminClient();
  let query = supabase
    .from("inquiries")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[getMyInquiries] error:", error);
    return { success: false, error: "문의 내역을 불러오는 중 오류가 발생했습니다" };
  }

  const total = count ?? 0;
  return {
    success: true,
    data: {
      inquiries: (data ?? []) as MyInquiry[],
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// ─── 내 문의 상세 ─────────────────────────────────────────────────────────────

export async function getMyInquiryById(id: string): Promise<ActionResult<MyInquiry>> {
  const userId = await requireCustomer();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId) // 반드시 본인 문의만
    .single();

  if (error || !data) {
    return { success: false, error: "문의를 찾을 수 없습니다" };
  }

  return { success: true, data: data as MyInquiry };
}

// ─── 내 프로필 조회 ───────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<ActionResult<CustomerProfile>> {
  const userId = await requireCustomer();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createAdminClient();

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, email, full_name, company_name, department, phone, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { success: false, error: "프로필을 불러오는 중 오류가 발생했습니다" };
  }

  return { success: true, data: profile as CustomerProfile };
}

// ─── 내 프로필 수정 ───────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  full_name:    z.string().min(1, "이름을 입력해주세요").max(50),
  company_name: z.string().max(100).optional().or(z.literal("")),
  department:   z.string().max(50).optional().or(z.literal("")),
  phone:        z.string().max(20).optional().or(z.literal("")),
});

export async function updateMyProfile(
  formData: unknown
): Promise<ActionResult> {
  const userId = await requireCustomer();

  const parsed = updateProfileSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "입력 내용을 확인해주세요" };
  }

  const { full_name, company_name, department, phone } = parsed.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      company_name: company_name || null,
      department: department || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[updateMyProfile] error:", error);
    return { success: false, error: "프로필 업데이트 중 오류가 발생했습니다" };
  }

  revalidatePath("/my/profile");
  return { success: true };
}

// ─── 회원가입 ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email:        z.string().email("올바른 이메일 형식이 아닙니다"),
  password:     z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  full_name:    z.string().min(1, "이름을 입력해주세요"),
  company_name: z.string().min(1, "사업장명을 입력해주세요"),
  phone:        z.string().optional().or(z.literal("")),
});

export async function register(formData: FormData): Promise<void> {
  const raw = {
    email:        formData.get("email"),
    password:     formData.get("password"),
    full_name:    formData.get("full_name"),
    company_name: formData.get("company_name"),
    phone:        formData.get("phone") ?? "",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    redirect(`/register?error=${encodeURIComponent(firstError ?? "입력 내용을 확인해주세요")}`);
  }

  const { email, password, full_name, company_name, phone } = parsed.data;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 트리거(handle_new_user)가 raw_user_meta_data에서 full_name을 읽어 profiles에 저장
      data: { full_name },
    },
  });

  if (error) {
    const msg = error.message.includes("already registered") || error.message.includes("User already registered")
      ? "이미 가입된 이메일입니다"
      : `회원가입 중 오류가 발생했습니다 (${error.message})`;
    redirect(`/register?error=${encodeURIComponent(msg)}`);
  }

  if (!data.user) {
    redirect(`/register?error=${encodeURIComponent("회원가입 중 오류가 발생했습니다")}`);
  }

  // 중복 이메일: 이메일 확인 활성화 상태에서 Supabase는 에러 없이 fake user 반환 (identities=[])
  if ((data.user.identities ?? []).length === 0) {
    redirect(`/register?error=${encodeURIComponent("이미 가입된 이메일입니다")}`);
  }

  // profiles 테이블 업데이트 (트리거로 row가 먼저 생성됨)
  const adminClient = createAdminClient();
  await adminClient
    .from("profiles")
    .update({ full_name, company_name, phone: phone || null })
    .eq("id", data.user.id);

  // data.session이 null이면 이메일 확인이 필요한 상태
  if (!data.session) {
    redirect("/register?verify=1");
  }

  redirect("/my");
}
