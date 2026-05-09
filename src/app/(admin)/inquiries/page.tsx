import Link from "next/link";
import { getInquiries, type InquiryStatus } from "@/lib/actions/inquiry";
import { InquiryStatusBadge } from "@/components/admin/InquiryStatusBadge";
import { InquirySearchInput } from "@/components/admin/InquirySearchInput";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
  };
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all",       label: "?ÑÏ≤¥" },
  { value: "pending",   label: "?ëÏàò?ÄÍ∏? },
  { value: "reviewing", label: "Í≤Ä?†Ï§ë" },
  { value: "quoted",    label: "Í≤¨Ï†ÅÎ∞úÏÜ°" },
  { value: "completed", label: "?ÑÎ£å" },
  { value: "cancelled", label: "Ï∑®ÏÜå" },
];

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const status = (searchParams.status ?? "all") as InquiryStatus | "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";

  const result = await getInquiries({ status, page, search, pageSize: 20 });
  const { inquiries = [], total = 0, totalPages = 1 } =
    result.success && result.data ? result.data : {};

  const buildHref = (params: Record<string, string>) => {
    const base = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(params).forEach(([k, v]) => base.set(k, v));
    return `/admin/inquiries?${base.toString()}`;
  };

  return (
    <div>
      {/* ?§Îçî */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Í≤¨Ï†Å Î¨∏Ïùò Í¥ÄÎ¶?/h1>
          <p className="text-sm text-gray-500 mt-0.5">?ÑÏ≤¥ {total}Í±?/p>
        </div>
        <InquirySearchInput />
      </div>

      {/* ?ÅÌÉú ?ÑÌÑ∞ ??*/}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: "1" })}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
                isActive
                  ? "border-[#0C5F6B] text-[#0C5F6B]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ?åÏù¥Î∏?*/}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Î¨∏Ïùò ?¥Ïó≠???ÜÏäµ?àÎã§.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">?ëÏàò??/th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">?¨ÏóÖ?•Î™Ö</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">?åÏÜç?Ä</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">?¥Îãπ??/th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">?∞ÎùΩÏ≤?/th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">?êÍ∏∞Î¨?/th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-24">?ÅÌÉú</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-16">?ÅÏÑ∏</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inq.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {inq.department ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inq.contact_name}</td>
                  <td className="px-4 py-3 text-gray-600">{inq.phone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {inq.waste_types[0]}
                    {inq.waste_types.length > 1 && (
                      <span className="text-gray-400 text-xs ml-1">
                        +{inq.waste_types.length - 1}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <InquiryStatusBadge status={inq.status as InquiryStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="text-[#0E9E7E] hover:text-[#0C5F6B] font-medium text-xs"
                    >
                      Î≥¥Í∏∞
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ?òÏù¥ÏßÄ?§Ïù¥??*/}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href={buildHref({ page: String(page - 1) })}
            aria-disabled={page <= 1}
            className={`p-2 rounded-lg border transition-colors ${
              page <= 1
                ? "opacity-30 pointer-events-none border-gray-100"
                : "border-gray-200 hover:border-[#0C5F6B] hover:text-[#0C5F6B]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-600 px-2">
            {page} / {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(page + 1) })}
            aria-disabled={page >= totalPages}
            className={`p-2 rounded-lg border transition-colors ${
              page >= totalPages
                ? "opacity-30 pointer-events-none border-gray-100"
                : "border-gray-200 hover:border-[#0C5F6B] hover:text-[#0C5F6B]"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
