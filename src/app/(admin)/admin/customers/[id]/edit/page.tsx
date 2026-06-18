import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCustomerById } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/admin/CustomerForm";

interface PageProps { params: { id: string } }

export default async function EditCustomerPage({ params }: PageProps) {
  const result = await getCustomerById(params.id);
  if (!result.success || !result.data) notFound();

  const c = result.data;

  return (
    <div>
      <Link
        href={`/admin/customers/${c.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        고객 상세로
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">고객 정보 수정</h1>
        <p className="text-sm text-gray-400 mt-0.5">{c.company_name}</p>
      </div>
      <CustomerForm mode="edit" customer={c} />
    </div>
  );
}
