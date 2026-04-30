import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";
import { notices } from "@/lib/notices";
import { ChevronUp, ChevronDown, List, Eye, Calendar, Tag } from "lucide-react";

interface Props {
  params: { id: string };
}

const categoryColorMap: Record<string, string> = {
  "공지": "bg-red-100 text-red-700",
  "법령안내": "bg-blue-100 text-blue-700",
  "회사소식": "bg-green-100 text-green-700",
  "시스템점검": "bg-yellow-100 text-yellow-700",
};

export function generateStaticParams() {
  return notices.map((n) => ({ id: String(n.id) }));
}

export default function NoticeDetailPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  const noticeIndex = notices.findIndex((n) => n.id === id);

  if (noticeIndex === -1) {
    notFound();
  }

  const notice = notices[noticeIndex];
  const prev = noticeIndex < notices.length - 1 ? notices[noticeIndex + 1] : null;
  const next = noticeIndex > 0 ? notices[noticeIndex - 1] : null;

  return (
    <main className="min-h-screen bg-white">
      <PageBanner title="고객센터" subtitle="Customer Support" />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />

      <section className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* 제목 영역 */}
        <div className="border-t-2 border-primary pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                categoryColorMap[notice.category] || "bg-gray-100 text-gray-600"
              }`}
            >
              {notice.category}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight mb-4 break-keep">
            {notice.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {notice.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              조회 {notice.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {notice.category}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div
          className="py-10 md:py-14 prose prose-neutral max-w-none leading-relaxed text-neutral-700 
                     prose-headings:text-neutral-900 prose-p:mb-4 prose-ul:pl-5 prose-ol:pl-5 prose-li:mb-1 
                     min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />

        {/* 이전글 / 다음글 */}
        <div className="border-t border-gray-200">
          {next && (
            <Link
              href={`/support/notice/${next.id}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-blue-50/50 transition-colors border-b border-gray-100 group"
            >
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              <span className="text-sm text-gray-500 w-16 shrink-0">다음글</span>
              <span className="text-sm text-neutral-900 group-hover:text-primary transition-colors truncate">
                {next.title}
              </span>
            </Link>
          )}
          {prev && (
            <Link
              href={`/support/notice/${prev.id}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-blue-50/50 transition-colors border-b border-gray-100 group"
            >
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              <span className="text-sm text-gray-500 w-16 shrink-0">이전글</span>
              <span className="text-sm text-neutral-900 group-hover:text-primary transition-colors truncate">
                {prev.title}
              </span>
            </Link>
          )}
        </div>

        {/* 목록 버튼 */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/support/notice"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg text-sm font-medium text-neutral-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-all"
          >
            <List className="w-4 h-4" />
            목록으로
          </Link>
        </div>
      </section>
    </main>
  );
}
