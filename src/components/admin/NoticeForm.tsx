"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { createNotice, updateNotice } from "@/lib/actions/notices";
import type { Notice } from "@/lib/actions/notices";

const CATEGORIES = ["공지", "법령안내", "회사소식", "시스템점검"];

interface Props {
  notice?: Notice; // 없으면 새 글
}

export function NoticeForm({ notice }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(notice?.title ?? "");
  const [content, setContent] = useState(notice?.content ?? "");
  const [category, setCategory] = useState(notice?.category ?? "공지");
  const [isPinned, setIsPinned] = useState(notice?.is_pinned ?? false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!notice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateNotice(notice.id, { title, content, category, is_pinned: isPinned })
        : await createNotice({ title, content, category, is_pinned: isPinned });

      if (!result.success) {
        setError(result.error ?? "저장 중 오류가 발생했습니다");
        return;
      }

      router.push("/notices");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지사항 제목을 입력하세요"
          required
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 카테고리 + 고정 */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-neutral-700">상단 고정</span>
          </label>
        </div>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          내용 <span className="text-red-500">*</span>
        </label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
        </button>
      </div>
    </form>
  );
}
