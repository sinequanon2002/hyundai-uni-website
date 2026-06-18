import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/auth/roles";
import { getStaffUsers, updateUserRole, createStaffUser, deleteStaffUser } from "@/lib/actions/users";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "사용자 관리" };

// ─── 역할 변경 폼 ─────────────────────────────────────────────────────────────

function RoleSelect({
  userId,
  currentRole,
  currentUserId,
}: {
  userId: string;
  currentRole: UserRole;
  currentUserId: string;
}) {
  const isSelf = userId === currentUserId;

  async function handleRoleChange(formData: FormData) {
    "use server";
    const newRole = formData.get("role") as UserRole;
    await updateUserRole(userId, newRole);
  }

  return (
    <form action={handleRoleChange} className="flex items-center gap-2">
      <select
        name="role"
        defaultValue={currentRole}
        disabled={isSelf}
        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-neutral-dark disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-600/20"
      >
        {USER_ROLES.filter((r) => r !== "customer").map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {!isSelf && (
        <button
          type="submit"
          className="text-xs px-2.5 py-1 rounded bg-cobalt-100 text-cobalt-600 hover:bg-cobalt-100/80 transition-colors font-medium"
        >
          저장
        </button>
      )}
    </form>
  );
}

// ─── 계정 삭제 버튼 ───────────────────────────────────────────────────────────

function DeleteButton({ userId, currentUserId }: { userId: string; currentUserId: string }) {
  if (userId === currentUserId) return null;

  async function handleDelete() {
    "use server";
    await deleteStaffUser(userId);
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        삭제
      </button>
    </form>
  );
}

// ─── 계정 생성 폼 ─────────────────────────────────────────────────────────────

function CreateUserForm() {
  async function handleCreate(formData: FormData) {
    "use server";
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role     = formData.get("role")     as UserRole;
    await createStaffUser(email, password, fullName, role);
  }

  return (
    <form action={handleCreate} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">이메일 *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="staff@company.co.kr"
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">비밀번호 * (8자 이상)</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="비밀번호 입력"
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">이름</label>
          <input
            name="fullName"
            type="text"
            placeholder="홍길동"
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-mid mb-1">역할 *</label>
          <select
            name="role"
            required
            defaultValue="sales_rep"
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          >
            {USER_ROLES.filter((r) => r !== "customer").map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 transition-colors"
        >
          계정 생성
        </button>
      </div>
    </form>
  );
}

// ─── 날짜 포맷 ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

// ─── 페이지 ───────────────────────────────────────────────────────────────────

export default async function UsersPage() {
  // admin/super_admin만 접근 가능
  const supabase  = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: myProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!myProfile || !isAdmin(myProfile.role)) {
    redirect("/inquiries");
  }

  const result = await getStaffUsers();
  const users  = result.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-dark">사용자 관리</h1>
        <p className="text-sm text-neutral-mid mt-1">
          직원 계정 생성 및 역할 관리. 고객(customer) 계정은 표시되지 않습니다.
        </p>
      </div>

      {/* 계정 생성 */}
      <div className="bg-white rounded-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-neutral-dark mb-4">새 직원 계정 생성</h2>
        <CreateUserForm />
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-dark">직원 목록</h2>
          <span className="text-sm text-neutral-mid">{users.length}명</span>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-mid">
            등록된 직원이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left text-xs font-medium text-neutral-mid px-6 py-3">이름 / 이메일</th>
                  <th className="text-left text-xs font-medium text-neutral-mid px-6 py-3">역할</th>
                  <th className="text-left text-xs font-medium text-neutral-mid px-6 py-3">마지막 로그인</th>
                  <th className="text-left text-xs font-medium text-neutral-mid px-6 py-3">가입일</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-dark">
                        {u.full_name ?? (
                          <span className="text-neutral-mid italic text-xs">이름 없음</span>
                        )}
                        {u.id === user.id && (
                          <span className="ml-2 text-xs text-cobalt-600 font-normal">(나)</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-mid mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleSelect
                        userId={u.id}
                        currentRole={u.role}
                        currentUserId={user.id}
                      />
                    </td>
                    <td className="px-6 py-4 text-neutral-mid text-xs">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4 text-neutral-mid text-xs">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <DeleteButton userId={u.id} currentUserId={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
