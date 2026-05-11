import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { getPortfolioItemsAdmin, deletePortfolioItem, canWritePortfolio } from "@/lib/actions/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "현장갤러리 관리" };

interface Props {
  searchParams: { page?: string; category?: string };
}

async function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    "use server";
    await deletePortfolioItem(id);
  }
  return (
    <form action={handleDelete} className="inline">
      <button type="submit" className="text-xs text-red-600 hover:text-red-800 transition-colors">
        삭제
      </button>
    </form>
  );
}

export default async function GalleryAdminPage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !isStaff(profile.role)) redirect("/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const category = searchParams.category ?? "";

  const result = await getPortfolioItemsAdmin({ page, category: category || undefined, pageSize: 20 });
  const canWrite = await canWritePortfolio();

  const items = result.success ? result.data!.items : [];
  const total = result.success ? result.data!.total : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">현장갤러리 관리</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {total}건</p>
        </div>
        {canWrite && (
          <Link
            href="/gallery/new"
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            + 새 항목 등록
          </Link>
        )}
      </div>

      {/* 그리드 */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 bg-white rounded-xl border border-neutral-200">
          등록된 갤러리 항목이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-neutral-900 line-clamp-2 leading-tight mb-1.5">
                  {item.title}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                    {item.region}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-2">
                  {new Date(item.work_date).toLocaleDateString("ko-KR")}
                </p>
                {canWrite && (
                  <div className="flex items-center gap-2 border-t border-neutral-100 pt-2">
                    <Link
                      href={`/gallery/${item.id}/edit`}
                      className="text-xs text-secondary hover:text-primary transition-colors"
                    >
                      수정
                    </Link>
                    <span className="text-neutral-200">|</span>
                    <DeleteButton id={item.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/gallery?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
