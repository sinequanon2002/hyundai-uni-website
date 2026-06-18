"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export interface ChecklistLead {
  id: number;
  created_at: string;
  phone: string;
  company_name: string | null;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

const submitSchema = z.object({
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(/^0\d{1,2}-?\d{3,4}-?\d{4}$/, "올바른 전화번호를 입력해주세요 (예: 010-1234-5678)"),
  companyName: z.string().optional(),
});

export async function submitChecklistLead(
  formData: unknown
): Promise<ActionResult> {
  const parsed = submitSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "입력 내용을 확인해주세요" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("checklist_leads").insert({
    phone: parsed.data.phone,
    company_name: parsed.data.companyName?.trim() || null,
  });

  if (error) {
    console.error("[submitChecklistLead]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  return { success: true };
}

export async function getChecklistLeads(filters?: {
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{ leads: ChecklistLead[]; total: number; totalPages: number }>> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "인증이 필요합니다" };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const staffRoles = ["admin", "super_admin", "sales_rep", "sales_manager", "dispatcher", "accountant"];
  if (!profile || !staffRoles.includes(profile.role)) {
    return { success: false, error: "권한이 없습니다" };
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 30;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await adminClient
    .from("checklist_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { success: false, error: "데이터 조회 중 오류가 발생했습니다" };

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    success: true,
    data: { leads: (data ?? []) as ChecklistLead[], total, totalPages },
  };
}
