import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/auth/roles";
import { getNoticesAdmin, deleteNotice, canWriteNotice } from "@/lib/actions/notices";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "공지사항 관리" };

interface Props {
  searchParams: { page?: string; search?: string; category?: string };
}

async function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    "use server";
    await deleteNotice(id);
  }
  return (
    <form action={handleDelete} className="inline">
      <button
        type="submit"
        className="text-xs text-red-600 hover:text-red-800 transition-colors"
      >
        삭제
      </button>
    </form>
  );
}

export default async function NoticesAdminPage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isStaff(profile.role)) redirect("/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";
  const category = searchParams.category ?? "";

  const result = await getNoticesAdmin({ page, search, category: category || undefined, pageSize: 20 });
  const canWrite = await canWriteNotice();

  const notices = result.success ? result.data!.notices : [];
  const total = result.success ? result.data!.total : 0;
  const totalPages = result.success ? result.data!.totalPages : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">공지사항 관리</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {total}건</p>
        </div>
        {canWrite && (
          <Link
            href="/notices/new"
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            + 새 공지 작성
          </Link>
        )}
      </div>

      {/* 검색 필터 */}
      <form method="GET" className="flex gap-2 mb-4">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="제목 검색..."
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
        >
          검색
        </button>
        {search && (
          <Link
            href="/notices"
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            초기화
          </Link>
        )}
      </form>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">제목</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 w-24 hidden sm:table-cell">카테고리</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32 hidden md:table-cell">작성자</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32 hidden lg:table-cell">등록일</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 w-16 hidden md:table-cell">조회</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                  공지사항이 없습니다
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {notice.is_pinned && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                          고정
                        </span>
                      )}
                      <span className="truncate max-w-[240px]">{notice.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{notice.category}</td>
                  <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{notice.author_name ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{notice.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      {canWrite && (
                        <>
                          <Link
                            href={`/notices/${notice.id}/edit`}
                            className="text-xs text-secondary hover:text-primary transition-colors"
                          >
                            수정
                          </Link>
                          <DeleteButton id={notice.id} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/notices?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
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
