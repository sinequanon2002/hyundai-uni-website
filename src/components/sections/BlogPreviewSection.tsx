import Link from "next/link";
import { getBlogPosts, type BlogPost } from "@/lib/actions/blog";
import { Calendar, ArrowRight, BookOpen, ExternalLink } from "lucide-react";

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
      href={`/support/blog/${post.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail or fallback */}
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        {post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={36} className="text-primary/30" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Category badge */}
        <span
          className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
            CATEGORY_COLOR[post.category] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {post.category}
        </span>

        <h3 className="font-bold text-neutral-900 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-50">
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Calendar size={12} />
            {formatDate(post.created_at)}
          </span>
          <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            읽기
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-3 py-16 text-center">
      <BookOpen size={40} className="text-neutral-300 mx-auto mb-4" />
      <p className="text-neutral-400 text-sm mb-4">
        곧 유용한 지정폐기물 정보 콘텐츠가 업로드될 예정입니다.
      </p>
      <Link
        href="https://blog.naver.com/hduni2020"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline underline-offset-4"
      >
        네이버 블로그에서 먼저 만나보기
        <ExternalLink size={13} />
      </Link>
    </div>
  );
}

export async function BlogPreviewSection() {
  const result = await getBlogPosts({ pageSize: 3 });
  const posts = result.success && result.data ? result.data.posts : [];

  return (
    <section className="py-20 md:py-28 bg-neutral-light">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-3">
              폐기물 정보 자료실
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
              담당자가 꼭 알아야 할<br className="hidden md:inline" /> 지정폐기물 정보
            </h2>
          </div>
          <Link
            href="/support/blog"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            전체 글 보기
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Naver Blog CTA */}
        <div className="mt-10 text-center">
          <Link
            href="https://blog.naver.com/hduni2020"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-primary hover:text-primary transition-colors"
          >
            <ExternalLink size={14} />
            네이버 블로그에서 더 많은 정보 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
