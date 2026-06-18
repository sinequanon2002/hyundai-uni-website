import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostById, incrementBlogViews } from "@/lib/actions/blog";
import { ChevronLeft, Eye, Calendar, Tag, BookOpen } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

function extractDescription(html: string, maxLength = 155): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getBlogPostById(params.id);
  if (!result.success || !result.data) return { title: "폐기물 정보 자료실" };
  const { title, excerpt, content, thumbnail_url } = result.data;
  const description = excerpt || extractDescription(content);
  return {
    title: `${title}`,
    description,
    openGraph: {
      title: `${title}`,
      description,
      ...(thumbnail_url && { images: [{ url: thumbnail_url }] }),
    },
  };
}

const categoryColorMap: Record<string, string> = {
  "폐기물 정보":  "bg-blue-100 text-blue-700",
  "법규 안내":    "bg-red-100 text-red-700",
  "처리 사례":    "bg-green-100 text-green-700",
  "올바로시스템": "bg-purple-100 text-purple-700",
  "회사 소식":    "bg-yellow-100 text-yellow-800",
};

export default async function BlogDetailPage({ params }: Props) {
  const result = await getBlogPostById(params.id);
  if (!result.success || !result.data) notFound();

  const post = result.data;
  void incrementBlogViews(post.id);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || extractDescription(post.content),
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: { "@type": "Organization", name: "현대유앤아이" },
    publisher: {
      "@type": "Organization",
      name: "현대유앤아이",
      logo: { "@type": "ImageObject", url: "/images/logo.png" },
    },
    ...(post.thumbnail_url && { image: post.thumbnail_url }),
  };

  return (
    <main className="min-h-dvh bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* 뒤로가기 */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cobalt-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          블로그 목록
        </Link>

        {/* 썸네일 */}
        {post.thumbnail_url && (
          <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* 헤더 */}
        <div className="border-t-2 border-cobalt-600 pt-8 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${categoryColorMap[post.category] ?? "bg-slate-100 text-slate-500"}`}>
              {post.category}
            </span>
            {post.tags?.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-navy-900 leading-tight mb-4 break-keep">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-slate-500 text-sm leading-relaxed mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              조회 {post.views.toLocaleString()}
            </span>
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {post.author_name}
              </span>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div
          className="py-10 md:py-14 prose prose-neutral max-w-none leading-relaxed text-navy-700
                     prose-headings:text-navy-900 prose-p:mb-4 prose-ul:pl-5 prose-ol:pl-5 prose-li:mb-1
                     min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 하단 CTA */}
        <div className="mt-10 bg-cobalt-50/50 rounded-xl border border-cobalt-50 p-6 text-center">
          <p className="text-sm text-slate-500 mb-4">
            지정폐기물 처리가 필요하시면 무료 상담을 요청하세요.
          </p>
          <Link
            href="/support/inquiry"
            className="inline-flex items-center gap-2 bg-mint-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-mint-600 transition-colors"
          >
            무료 견적 문의
          </Link>
        </div>

        {/* 목록 버튼 */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:border-cobalt-600 hover:text-cobalt-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            블로그 목록으로
          </Link>
        </div>
      </section>
    </main>
  );
}
