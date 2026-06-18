import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DispatchForm } from "@/components/admin/DispatchForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomers } from "@/lib/actions/customers";

interface PageProps {
  searchParams: { customer_id?: string; quotation_id?: string };
}

export default async function NewDispatchPage({ searchParams }: PageProps) {
  const { customer_id } = searchParams;

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

  const custResult = await getCustomers({ page: 1, pageSize: 200 });
  const customers  = custResult.success
    ? custResult.data!.customers.map((c) => ({ id: c.id, company_name: c.company_name }))
    : [];

  return (
    <div>
      <Link
        href={customer_id ? `/admin/customers/${customer_id}` : "/admin/dispatches"}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {customer_id ? "고객 상세로" : "수거 건 목록으로"}
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">수거 건 등록</h1>
      </div>
      <DispatchForm
        mode="create"
        staffList={staffList}
        customers={customers}
        defaultCustomerId={customer_id}
      />
    </div>
  );
}
