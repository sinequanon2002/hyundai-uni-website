"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import type { ActionResult } from "./inquiry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DispatchWasteItem {
  waste_type: string;
  unit: string;
  estimated_qty: number;
  actual_qty: number;
  unit_price: number;
  amount: number;
}

export type DispatchStatus = "pending" | "scheduled" | "in_transit" | "completed" | "cancelled";

export interface Dispatch {
  id: string;
  dispatch_number: string;
  customer_id: string | null;
  inquiry_id: string | null;
  quotation_id: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  status: DispatchStatus;
  scheduled_date: string | null;
  actual_date: string | null;
  collection_address: string | null;
  waste_items: DispatchWasteItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string | null;
  // JOIN 필드 (조회 시)
  customer_name?: string;
}

export interface CreateDispatchInput {
  customer_id?: string;
  inquiry_id?: string;
  quotation_id?: string;
  assigned_to?: string;
  scheduled_date?: string;
  collection_address?: string;
  waste_items: DispatchWasteItem[];
  subtotal: number;
  tax: number;
  total: number;
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
  return { id: user.id, full_name: (profile as { role: string; full_name: string | null }).full_name };
}

// ─── 수거 건 생성 ─────────────────────────────────────────────────────────────

export async function createDispatch(
  input: CreateDispatchInput
): Promise<ActionResult<Dispatch>> {
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();

  // 번호 생성
  const { data: dispatchNum, error: numErr } = await supabase.rpc("generate_dispatch_number");
  if (numErr || !dispatchNum) return { success: false, error: "수거 건 번호 생성 실패" };

  // 담당자 이름 조회
  let assignedName: string | null = null;
  if (input.assigned_to) {
    const { data: p } = await supabase
      .from("profiles").select("full_name").eq("id", input.assigned_to).single();
    assignedName = (p as { full_name: string | null } | null)?.full_name ?? null;
  }

  const { data, error } = await supabase
    .from("dispatches")
    .insert({
      dispatch_number:    dispatchNum as string,
      customer_id:        input.customer_id ?? null,
      inquiry_id:         input.inquiry_id ?? null,
      quotation_id:       input.quotation_id ?? null,
      assigned_to:        input.assigned_to ?? null,
      assigned_name:      assignedName,
      status:             "pending",
      scheduled_date:     input.scheduled_date ?? null,
      collection_address: input.collection_address ?? null,
      waste_items:        input.waste_items,
      subtotal:           input.subtotal,
      tax:                input.tax,
      total:              input.total,
      notes:              input.notes ?? null,
      created_by:         actor.id,
      created_by_name:    actor.full_name,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createDispatch]", error);
    return { success: false, error: "수거 건 생성 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/dispatches");
  if (input.customer_id) revalidatePath(`/admin/customers/${input.customer_id}`);
  if (input.inquiry_id)  revalidatePath(`/admin/inquiries/${input.inquiry_id}`);

  return { success: true, data: data as unknown as Dispatch };
}

// ─── 견적서에서 수거 건 생성 ──────────────────────────────────────────────────

export async function createDispatchFromQuote(
  quotationId: string,
  customerId?: string
): Promise<ActionResult<Dispatch>> {
  let actor: { id: string; full_name: string | null };
  try {
    actor = await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data: quote, error: qErr } = await supabase
    .from("quotations").select("*").eq("id", quotationId).single();

  if (qErr || !quote) return { success: false, error: "견적서를 찾을 수 없습니다" };

  const q = quote as {
    id: string; inquiry_id: string; items: Array<{waste_type: string; unit: string; quantity: number; unit_price: number; amount: number}>;
    subtotal: number; tax: number; total: number; address?: string; contact_name?: string;
  };

  // waste_items 변환 (quote items → dispatch waste_items)
  const wasteItems: DispatchWasteItem[] = q.items.map((item) => ({
    waste_type:    item.waste_type,
    unit:          item.unit,
    estimated_qty: item.quantity,
    actual_qty:    0,
    unit_price:    item.unit_price,
    amount:        item.amount,
  }));

  const { data: dispatchNum } = await supabase.rpc("generate_dispatch_number");

  const { data, error } = await supabase
    .from("dispatches")
    .insert({
      dispatch_number:    dispatchNum as string,
      customer_id:        customerId ?? null,
      inquiry_id:         q.inquiry_id ?? null,
      quotation_id:       quotationId,
      status:             "pending",
      waste_items:        wasteItems,
      subtotal:           q.subtotal,
      tax:                q.tax,
      total:              q.total,
      created_by:         actor.id,
      created_by_name:    actor.full_name,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createDispatchFromQuote]", error);
    return { success: false, error: "수거 건 생성 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/dispatches");
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);

  return { success: true, data: data as unknown as Dispatch };
}

// ─── 목록 조회 ────────────────────────────────────────────────────────────────

export async function getDispatches(filters: {
  status?: DispatchStatus | "all";
  customer_id?: string;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<{ dispatches: Dispatch[]; total: number; totalPages: number; counts: Record<string, number> }>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const { status = "all", customer_id, search = "", page = 1, pageSize = 20 } = filters;
  const supabase = createAdminClient();

  // 상태별 건수
  const { data: countData } = await supabase
    .from("dispatches")
    .select("status");

  const counts: Record<string, number> = { all: 0, pending: 0, scheduled: 0, in_transit: 0, completed: 0, cancelled: 0 };
  (countData ?? []).forEach((d: { status: string }) => {
    counts[d.status] = (counts[d.status] ?? 0) + 1;
    counts.all++;
  });

  let query = supabase
    .from("dispatches")
    .select("*, customers(company_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (customer_id) query = query.eq("customer_id", customer_id);
  if (search.trim()) {
    query = query.or(`dispatch_number.ilike.%${search.trim()}%,assigned_name.ilike.%${search.trim()}%`);
  }

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { success: false, error: "조회 중 오류가 발생했습니다" };

  const dispatches = (data ?? []).map((d) => {
    const row = d as Record<string, unknown>;
    const customer = row.customers as { company_name: string } | null;
    return {
      ...row,
      customers: undefined,
      customer_name: customer?.company_name ?? null,
    } as unknown as Dispatch;
  });

  const total = count ?? 0;
  return {
    success: true,
    data: { dispatches, total, totalPages: Math.ceil(total / pageSize), counts },
  };
}

// ─── 단건 조회 ────────────────────────────────────────────────────────────────

export async function getDispatchById(id: string): Promise<ActionResult<Dispatch & { customer_name?: string }>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dispatches")
    .select("*, customers(company_name)")
    .eq("id", id)
    .single();

  if (error || !data) return { success: false, error: "수거 건을 찾을 수 없습니다" };

  const row = data as Record<string, unknown>;
  const customer = row.customers as { company_name: string } | null;
  const result = { ...row, customers: undefined, customer_name: customer?.company_name ?? null } as unknown as Dispatch;

  return { success: true, data: result };
}

// ─── 상태 변경 ────────────────────────────────────────────────────────────────

export async function updateDispatchStatus(
  id: string,
  status: DispatchStatus,
  actualDate?: string
): Promise<ActionResult<void>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const updatePayload: Record<string, unknown> = { status };
  if (status === "completed" && actualDate) updatePayload.actual_date = actualDate;
  if (status === "completed" && !actualDate) updatePayload.actual_date = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("dispatches").update(updatePayload).eq("id", id);
  if (error) {
    console.error("[updateDispatchStatus]", error);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/dispatches");
  revalidatePath(`/admin/dispatches/${id}`);
  revalidatePath("/admin/invoices");
  return { success: true, data: undefined };
}

// ─── 담당자·일정 수정 ──────────────────────────────────────────────────────────

export async function updateDispatch(
  id: string,
  input: {
    assigned_to?: string | null;
    scheduled_date?: string | null;
    collection_address?: string | null;
    waste_items?: DispatchWasteItem[];
    subtotal?: number;
    tax?: number;
    total?: number;
    notes?: string | null;
    actual_date?: string | null;
  }
): Promise<ActionResult<Dispatch>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();

  let assignedName: string | null | undefined;
  if (input.assigned_to !== undefined) {
    if (input.assigned_to) {
      const { data: p } = await supabase
        .from("profiles").select("full_name").eq("id", input.assigned_to).single();
      assignedName = (p as { full_name: string | null } | null)?.full_name ?? null;
    } else {
      assignedName = null;
    }
  }

  const payload: Record<string, unknown> = {};
  if (input.assigned_to      !== undefined) { payload.assigned_to = input.assigned_to; payload.assigned_name = assignedName; }
  if (input.scheduled_date   !== undefined) payload.scheduled_date   = input.scheduled_date;
  if (input.collection_address !== undefined) payload.collection_address = input.collection_address;
  if (input.waste_items      !== undefined) payload.waste_items      = input.waste_items;
  if (input.subtotal         !== undefined) payload.subtotal         = input.subtotal;
  if (input.tax              !== undefined) payload.tax              = input.tax;
  if (input.total            !== undefined) payload.total            = input.total;
  if (input.notes            !== undefined) payload.notes            = input.notes;
  if (input.actual_date      !== undefined) payload.actual_date      = input.actual_date;

  const { data, error } = await supabase
    .from("dispatches").update(payload).eq("id", id).select().single();

  if (error || !data) {
    console.error("[updateDispatch]", error);
    return { success: false, error: "수정 중 오류가 발생했습니다" };
  }

  revalidatePath("/admin/dispatches");
  revalidatePath(`/admin/dispatches/${id}`);
  return { success: true, data: data as unknown as Dispatch };
}

// ─── 세금계산서 목록 ──────────────────────────────────────────────────────────

export async function getInvoices(filters: {
  status?: "pending" | "issued" | "paid" | "cancelled" | "all";
  customer_id?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ActionResult<{
  invoices: Array<{
    id: string; invoice_number: string; status: string;
    subtotal: number; tax: number; total: number;
    issued_at: string | null; due_date: string | null;
    created_at: string; dispatch_number?: string; customer_name?: string;
  }>;
  total: number; totalPages: number;
}>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const { status = "all", customer_id, page = 1, pageSize = 20 } = filters;
  const supabase = createAdminClient();

  let query = supabase
    .from("invoices")
    .select("*, dispatches(dispatch_number), customers(company_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (customer_id) query = query.eq("customer_id", customer_id);

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { success: false, error: "조회 중 오류가 발생했습니다" };

  type InvoiceRow = {
    id: string; invoice_number: string; status: string;
    subtotal: number; tax: number; total: number;
    issued_at: string | null; due_date: string | null; created_at: string;
    dispatch_number?: string; customer_name?: string;
  };

  const invoices: InvoiceRow[] = (data ?? []).map((inv) => {
    const row = inv as Record<string, unknown>;
    const disp = row.dispatches as { dispatch_number: string } | null;
    const cust = row.customers  as { company_name: string } | null;
    const { dispatches: _d, customers: _c, ...rest } = row;
    void _d; void _c;
    return {
      ...(rest as Omit<InvoiceRow, "dispatch_number" | "customer_name">),
      dispatch_number: disp?.dispatch_number,
      customer_name:   cust?.company_name,
    };
  });

  const total = count ?? 0;
  return {
    success: true,
    data: { invoices, total, totalPages: Math.ceil(total / pageSize) },
  };
}

// ─── 세금계산서 상태 변경 ─────────────────────────────────────────────────────

export async function updateInvoiceStatus(
  id: string,
  status: "issued" | "paid" | "cancelled",
  issuedAt?: string,
  dueDate?: string
): Promise<ActionResult<void>> {
  try {
    await requireStaff();
  } catch {
    return { success: false, error: "접근 권한이 없습니다" };
  }

  const supabase = createAdminClient();
  const payload: Record<string, unknown> = { status };
  if (issuedAt) payload.issued_at = issuedAt;
  if (dueDate)  payload.due_date  = dueDate;

  const { error } = await supabase.from("invoices").update(payload).eq("id", id);
  if (error) return { success: false, error: "상태 변경 중 오류가 발생했습니다" };

  revalidatePath("/admin/invoices");
  return { success: true, data: undefined };
}
