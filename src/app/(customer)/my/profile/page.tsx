"use client";

import { useState, useTransition } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/actions/customer";
import type { CustomerProfile } from "@/lib/actions/customer";
import { useEffect } from "react";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyProfile().then((r) => {
      if (r.success && r.data) setProfile(r.data);
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name:    fd.get("full_name") as string,
      company_name: fd.get("company_name") as string,
      department:   fd.get("department") as string,
      phone:        fd.get("phone") as string,
    };

    startTransition(async () => {
      const result = await updateMyProfile(payload);
      if (result.success) {
        setSuccess(true);
        // 로컬 상태 업데이트
        setProfile((prev) => prev ? { ...prev, ...payload } : prev);
      } else {
        setError(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-lg font-bold text-neutral-dark">프로필 설정</h1>

      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          프로필이 업데이트되었습니다.
        </div>
      )}

      <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6">
        {/* 이메일 (읽기 전용) */}
        <div className="mb-5 pb-5 border-b border-gray-100">
          <p className="text-xs text-neutral-mid mb-1">이메일 (변경 불가)</p>
          <p className="text-sm font-medium text-neutral-dark">{profile?.email ?? "—"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-neutral-dark mb-1.5">
              담당자명 <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={profile?.full_name ?? ""}
              key={profile?.full_name}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-neutral-dark mb-1.5">
              사업장명
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              defaultValue={profile?.company_name ?? ""}
              key={profile?.company_name}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-neutral-dark mb-1.5">
              부서명
            </label>
            <input
              id="department"
              name="department"
              type="text"
              defaultValue={profile?.department ?? ""}
              key={profile?.department}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-dark mb-1.5">
              연락처
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              key={profile?.phone}
              placeholder="010-0000-0000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {isPending ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
