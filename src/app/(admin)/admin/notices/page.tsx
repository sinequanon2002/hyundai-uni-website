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
            href="/admin/notices/new"
            className="px-4 py-2 bg-cobalt-600 text-white text-sm rounded-lg hover:bg-cobalt-700 transition-colors"
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
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-cobalt-600/20"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
        >
          검색
        </button>
        {search && (
          <Link
            href="/admin/notices"
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            초기화
          </Link>
        )}
      </form>

      {/* 목록 */}
      {notices.length === 0 ? (
        <div className="bg-white rounded-sm border border-neutral-200 py-12 text-center text-neutral-400 text-sm">
          공지사항이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <ul className="md:hidden space-y-3">
            {notices.map((notice) => (
              <li key={notice.id} className="bg-white rounded-sm border border-neutral-200 p-4">
                <div className="flex items-start gap-2">
                  {notice.is_pinned && (
                    <span className="text-xs bg-cobalt-100 text-cobalt-600 px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5">
                      고정
                    </span>
                  )}
                  <span className="font-medium text-neutral-900 text-[15px] leading-snug">{notice.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-neutral-500">
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded">{notice.category}</span>
                  <span>{notice.author_name ?? "-"}</span>
                  <span>{new Date(notice.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                  <span>조회 {notice.views}</span>
                </div>
                {canWrite && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
                    <Link
                      href={`/admin/notices/${notice.id}/edit`}
                      className="text-sm text-mint-600 hover:text-cobalt-600 transition-colors font-medium"
                    >
                      수정
                    </Link>
                    <DeleteButton id={notice.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block bg-white rounded-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">제목</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 w-24">카테고리</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32">작성자</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32 hidden lg:table-cell">등록일</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 w-16">조회</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {notice.is_pinned && (
                            <span className="text-xs bg-cobalt-100 text-cobalt-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                              고정
                            </span>
                          )}
                          <span className="truncate max-w-[240px]">{notice.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{notice.category}</td>
                      <td className="px-4 py-3 text-neutral-500">{notice.author_name ?? "-"}</td>
                      <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                        {new Date(notice.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{notice.views}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 justify-end">
                          {canWrite && (
                            <>
                              <Link
                                href={`/admin/notices/${notice.id}/edit`}
                                className="text-xs text-mint-600 hover:text-cobalt-600 transition-colors"
                              >
                                수정
                              </Link>
                              <DeleteButton id={notice.id} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/notices?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-cobalt-600 text-white"
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
