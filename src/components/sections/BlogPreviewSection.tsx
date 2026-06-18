import Link from "next/link";
import { getBlogPosts, type BlogPost } from "@/lib/actions/blog";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

const CATEGORY_COLOR: Record<string, string> = {
  "폐기물 정보": "bg-blue-100 text-blue-700",
  "법규 안내": "bg-red-100 text-red-700",
  "처리 사례": "bg-green-100 text-green-700",
  "올바로시스템": "bg-purple-100 text-purple-700",
  "회사 소식": "bg-yellow-100 text-yellow-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-ds-sm hover:shadow-ds-md hover:border-cobalt-100 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail or fallback */}
      <div className="aspect-video bg-gradient-to-br from-cobalt-50 to-mint-50 relative overflow-hidden">
        {post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={36} className="text-cobalt-200" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Category badge */}
        <span
          className={`self-start text-xs font-semibold px-2.5 py-1 rounded-pill mb-3 ${
            CATEGORY_COLOR[post.category] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {post.category}
        </span>

        <h3 className="font-bold text-navy-900 leading-snug mb-2 group-hover:text-cobalt-600 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={12} />
            {formatDate(post.created_at)}
          </span>
          <span className="text-xs font-semibold text-cobalt-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            읽기
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export async function BlogPreviewSection() {
  const result = await getBlogPosts({ pageSize: 3 });
  const posts = result.success && result.data ? result.data.posts : [];

  // 게시글이 없으면 빈 섹션을 노출하지 않음 (콘텐츠 확보 후 자동 표시)
  if (posts.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h3 className="text-sm font-bold text-cobalt-600 tracking-widest uppercase mb-3">
              폐기물 정보 자료실
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
              담당자가 꼭 알아야 할<br className="hidden md:inline" /> 지정폐기물 정보
            </h2>
          </div>
          <Link
            href="/blog"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-600 hover:underline underline-offset-4"
          >
            전체 글 보기
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* 전체 글 보기 CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-pill text-sm text-slate-600 hover:border-cobalt-300 hover:text-cobalt-600 transition-colors"
          >
            전체 글 보기
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
