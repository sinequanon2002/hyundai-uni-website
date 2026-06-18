"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  company_name: string;
  business_number: string | null;
  ceo_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  waste_types: string[];
  contract_prices: Record<string, number>;
  notes: string | null;
  source_inquiry_id: string | null;
  created_at: string;
  updated_at: string | null;
  // 집계 (JOIN용)
  dispatch_count?: number;
  total_revenue?: number;
}

export interface CreateCustomerInput {
  company_name: string;
  business_number?: string;
  ceo_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  waste_types?: string[];
  contract_prices?: Record<string, number>;
  notes?: string;
  source_inquiry_id?: string;
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
  return { id: user.id, full_name: (profile as { role: string; full_name: string | null }).full_name };
}

// ─── 고객 생성 ────────────────────────────────────────────────────────────────

export async function createCustomer(
  input: CreateCustomerInput
): Promise<ActionResult<Customer>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      company_name:      input.company_name,
      business_number:   input.business_number ?? null,
      ceo_name:          input.ceo_name ?? null,
      contact_name:      input.contact_name ?? null,
      contact_phone:     input.contact_phone ?? null,
      contact_email:     input.contact_email ?? null,
      address:           input.address ?? null,
      waste_types:       input.waste_types ?? [],
      contract_prices:   input.contract_prices ?? {},
      notes:             input.notes ?? null,
      source_inquiry_id: input.source_inquiry_id ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createCustomer]", error);
    return { success: false, error: "고객 등록 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/customers");
  return { success: true, data: data as unknown as Customer };
}

// ─── 목록 조회 ────────────────────────────────────────────────────────────────

export async function getCustomers(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<{ customers: Customer[]; total: number; totalPages: number }>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const { search = "", page = 1, pageSize = 20 } = filters;
  const supabase = createAdminClient();

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(
      `company_name.ilike.%${search.trim()}%,contact_name.ilike.%${search.trim()}%,business_number.ilike.%${search.trim()}%`
    );
  }

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { success: false, error: "조회 중 오류가 발생했습니다" };

  // 각 고객의 수거 건수 집계
  const customerIds = (data ?? []).map((c: { id: string }) => c.id);
  let dispatchCounts: Record<string, number> = {};
  let revenues: Record<string, number> = {};

  if (customerIds.length > 0) {
    const { data: dStats } = await supabase
      .from("dispatches")
      .select("customer_id, total")
      .in("customer_id", customerIds)
      .eq("status", "completed");

    (dStats ?? []).forEach((d: { customer_id: string; total: number }) => {
      dispatchCounts[d.customer_id] = (dispatchCounts[d.customer_id] ?? 0) + 1;
      revenues[d.customer_id] = (revenues[d.customer_id] ?? 0) + (d.total ?? 0);
    });
  }

  const customers = (data ?? []).map((c) => ({
    ...(c as unknown as Customer),
    dispatch_count: dispatchCounts[(c as { id: string }).id] ?? 0,
    total_revenue:  revenues[(c as { id: string }).id] ?? 0,
  }));

  const total = count ?? 0;
  return {
    success: true,
    data: { customers, total, totalPages: Math.ceil(total / pageSize) },
  };
}

// ─── 단건 조회 ────────────────────────────────────────────────────────────────

export async function getCustomerById(id: string): Promise<ActionResult<Customer>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers").select("*").eq("id", id).single();

  if (error || !data) return { success: false, error: "고객을 찾을 수 없습니다" };
  return { success: true, data: data as unknown as Customer };
}

// ─── 수정 ─────────────────────────────────────────────────────────────────────

export async function updateCustomer(
  id: string,
  input: Partial<CreateCustomerInput>
): Promise<ActionResult<Customer>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      ...(input.company_name    !== undefined && { company_name: input.company_name }),
      ...(input.business_number !== undefined && { business_number: input.business_number }),
      ...(input.ceo_name        !== undefined && { ceo_name: input.ceo_name }),
      ...(input.contact_name    !== undefined && { contact_name: input.contact_name }),
      ...(input.contact_phone   !== undefined && { contact_phone: input.contact_phone }),
      ...(input.contact_email   !== undefined && { contact_email: input.contact_email }),
      ...(input.address         !== undefined && { address: input.address }),
      ...(input.waste_types     !== undefined && { waste_types: input.waste_types }),
      ...(input.contract_prices !== undefined && { contract_prices: input.contract_prices }),
      ...(input.notes           !== undefined && { notes: input.notes }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[updateCustomer]", error);
    return { success: false, error: "수정 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { success: true, data: data as unknown as Customer };
}

// ─── 문의에서 고객 생성 ───────────────────────────────────────────────────────

export async function createCustomerFromInquiry(
  inquiryId: string
): Promise<ActionResult<Customer>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();

  // 이미 등록된 고객인지 확인
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("source_inquiry_id", inquiryId)
    .maybeSingle();

  if (existing) return { success: false, error: "이미 고객으로 등록되어 있습니다" };

  const { data: inq } = await supabase
    .from("inquiries")
    .select("company_name, contact_name, phone, email, address, address_detail, waste_types")
    .eq("id", inquiryId)
    .single();

  if (!inq) return { success: false, error: "문의를 찾을 수 없습니다" };

  const addr = (inq as { address?: string; address_detail?: string }).address_detail
    ? `${(inq as { address?: string }).address ?? ""} ${(inq as { address_detail?: string }).address_detail ?? ""}`.trim()
    : (inq as { address?: string }).address ?? null;

  const result = await createCustomer({
    company_name:      (inq as { company_name: string }).company_name,
    contact_name:      (inq as { contact_name?: string }).contact_name ?? undefined,
    contact_phone:     (inq as { phone?: string }).phone ?? undefined,
    contact_email:     (inq as { email?: string }).email ?? undefined,
    address:           addr ?? undefined,
    waste_types:       (inq as { waste_types?: string[] }).waste_types ?? [],
    source_inquiry_id: inquiryId,
  });

  return result;
}

// ─── 검색용 간단 목록 ─────────────────────────────────────────────────────────

export async function searchCustomers(
  q: string
): Promise<ActionResult<Pick<Customer, "id" | "company_name" | "contact_name" | "contact_phone">[]>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, company_name, contact_name, contact_phone")
    .or(`company_name.ilike.%${q}%,contact_name.ilike.%${q}%`)
    .limit(10);

  if (error) return { success: false, error: "검색 중 오류가 발생했습니다" };
  return { success: true, data: (data ?? []) as unknown as Pick<Customer, "id" | "company_name" | "contact_name" | "contact_phone">[] };
}
