import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { getInquiryById } from "@/lib/actions/inquiry";

interface PageProps {
  searchParams: { inquiry_id?: string };
}

export default async function NewQuotePage({ searchParams }: PageProps) {
  const { inquiry_id } = searchParams;

  // 문의로부터 기본값 pre-fill
  let defaults: {
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    waste_types?: string[];
  } | undefined;

  if (inquiry_id) {
    const result = await getInquiryById(inquiry_id);
    if (result.success && result.data) {
      const inq = result.data;
      const addr = inq.address
        ? inq.address_detail
          ? `${inq.address} ${inq.address_detail}`
          : inq.address
        : inq.region_sido
          ? `${inq.region_sido ?? ""} ${inq.region_sigungu ?? ""}`.trim()
          : undefined;

      defaults = {
        company_name: inq.company_name,
        contact_name: inq.contact_name,
        email:        inq.email,
        phone:        inq.phone,
        address:      addr,
        waste_types:  inq.waste_types,
      };
    }
  }

  return (
    <div>
      <Link
        href={inquiry_id ? `/admin/inquiries/${inquiry_id}` : "/admin/quotes"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {inquiry_id ? "문의 상세로 돌아가기" : "견적서 목록으로"}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-900">견적서 작성</h1>
        {inquiry_id && (
          <p className="text-sm text-slate-500 mt-1">
            문의 번호 <span className="font-mono text-xs">{inquiry_id}</span> 기반 작성
          </p>
        )}
      </div>

      <QuoteForm
        inquiryId={inquiry_id ?? ""}
        defaults={defaults}
      />
    </div>
  );
}
