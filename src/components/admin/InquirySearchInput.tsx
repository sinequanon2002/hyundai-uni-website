"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef } from "react";
import { Search } from "lucide-react";

export function InquirySearchInput({ basePath }: { basePath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const targetPath = basePath ?? pathname;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set("search", e.target.value);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.replace(`${targetPath}?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={handleChange}
        placeholder="사업장명 또는 담당자명 검색"
        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
      />
    </div>
  );
}
