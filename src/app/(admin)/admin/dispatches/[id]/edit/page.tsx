import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDispatchById } from "@/lib/actions/dispatches";
import { DispatchForm } from "@/components/admin/DispatchForm";
import { getCustomers } from "@/lib/actions/customers";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps { params: { id: string } }

export default async function EditDispatchPage({ params }: PageProps) {
  const [result, custResult] = await Promise.all([
    getDispatchById(params.id),
    getCustomers({ page: 1, pageSize: 200 }),
  ]);

  if (!result.success || !result.data) notFound();

  const d = result.data;

  const supabase = createAdminClient();
  const { data: staffRaw } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["dispatcher", "sales_rep", "sales_manager", "admin", "super_admin"])
    .order("full_name");

  const staffList = (staffRaw ?? []).map((s) => ({
    id:        (s as { id: string }).id,
    full_name: (s as { full_name: string | null }).full_name,
    role:      (s as { role: string }).role,
  }));

  const customers = custResult.success
    ? custResult.data!.customers.map((c) => ({ id: c.id, company_name: c.company_name }))
    : [];

  return (
    <div>
      <Link
        href={`/admin/dispatches/${d.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        수거 건 상세
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-900">수거 건 수정</h1>
        <p className="text-sm text-slate-400 font-mono mt-0.5">{d.dispatch_number}</p>
      </div>
      <DispatchForm
        mode="edit"
        dispatch={d}
        staffList={staffList}
        customers={customers}
      />
    </div>
  );
}
