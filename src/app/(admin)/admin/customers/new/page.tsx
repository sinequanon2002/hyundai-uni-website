import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { getInquiryById } from "@/lib/actions/inquiry";

interface PageProps {
  searchParams: { inquiry_id?: string };
}

export default async function NewCustomerPage({ searchParams }: PageProps) {
  const { inquiry_id } = searchParams;

  let defaultCustomer;
  if (inquiry_id) {
    const result = await getInquiryById(inquiry_id);
    if (result.success && result.data) {
      const inq = result.data;
      const addr = inq.address
        ? inq.address_detail ? `${inq.address} ${inq.address_detail}` : inq.address
        : undefined;

      defaultCustomer = {
        id: "", company_name: inq.company_name,
        business_number: null, ceo_name: null,
        contact_name: inq.contact_name ?? null,
        contact_phone: inq.phone ?? null,
        contact_email: inq.email ?? null,
        address: addr ?? null,
        waste_types: inq.waste_types ?? [],
        contract_prices: {}, notes: null,
        source_inquiry_id: inquiry_id,
        created_at: "", updated_at: null,
      };
    }
  }

  return (
    <div>
      <Link
        href={inquiry_id ? `/admin/inquiries/${inquiry_id}` : "/admin/customers"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {inquiry_id ? "문의 상세로" : "고객 목록으로"}
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-900">고객 등록</h1>
        {inquiry_id && (
          <p className="text-sm text-slate-500 mt-1">문의 정보를 기반으로 자동 입력되었습니다</p>
        )}
      </div>
      <CustomerForm mode="create" customer={defaultCustomer as never} sourceInquiryId={inquiry_id} />
    </div>
  );
}
