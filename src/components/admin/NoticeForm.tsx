"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { createNotice, updateNotice } from "@/lib/actions/notices";
import type { Notice } from "@/lib/actions/notices";

const NOTICE_CATEGORIES = ["공지", "법령안내", "회사소식", "시스템점검"];
const BLOG_CATEGORIES = ["폐기물 정보", "법규 안내", "처리 사례", "올바로시스템", "회사 소식"];

interface Props {
  notice?: Notice; // 없으면 새 글
}

export function NoticeForm({ notice }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [postType, setPostType] = useState<"notice" | "blog">((notice as Notice & { post_type?: string })?.post_type === "blog" ? "blog" : "notice");
  const [title, setTitle] = useState(notice?.title ?? "");
  const [content, setContent] = useState(notice?.content ?? "");
  const [category, setCategory] = useState(notice?.category ?? "공지");
  const [isPinned, setIsPinned] = useState(notice?.is_pinned ?? false);
  const [excerpt, setExcerpt] = useState((notice as Notice & { excerpt?: string })?.excerpt ?? "");
  const [tags, setTags] = useState<string>((notice as Notice & { tags?: string[] })?.tags?.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);

  const CATEGORIES = postType === "blog" ? BLOG_CATEGORIES : NOTICE_CATEGORIES;

  const isEdit = !!notice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const result = isEdit
        ? await updateNotice(notice.id, { title, content, category, is_pinned: isPinned, excerpt: excerpt || undefined, tags: tagArray })
        : await createNotice({ title, content, category, is_pinned: isPinned, post_type: postType, excerpt: excerpt || undefined, tags: tagArray });

      if (!result.success) {
        setError(result.error ?? "저장 중 오류가 발생했습니다");
        return;
      }

      router.push("/admin/notices");
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

      {/* 글 유형 (신규 작성 시만 선택) */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">글 유형</label>
          <div className="flex gap-3">
            {(["notice", "blog"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setPostType(type);
                  setCategory(type === "blog" ? "폐기물 정보" : "공지");
                }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  postType === type
                    ? "bg-cobalt-600 text-white border-cobalt-600"
                    : "bg-white text-neutral-600 border-neutral-300 hover:border-cobalt-600"
                }`}
              >
                {type === "notice" ? "공지사항" : "블로그 자료실"}
              </button>
            ))}
          </div>
          {postType === "blog" && (
            <p className="mt-2 text-xs text-neutral-500">
              블로그 자료실은 /blog 에 노출됩니다. 발췌문과 태그를 입력하면 SEO에 유리합니다.
            </p>
          )}
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
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
        />
      </div>

      {/* 카테고리 + 고정 */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
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
              className="w-4 h-4 rounded border-neutral-300 text-cobalt-600 focus:ring-cobalt-600"
            />
            <span className="text-sm font-medium text-neutral-700">상단 고정</span>
          </label>
        </div>
      </div>

      {/* 블로그 전용: 발췌문 */}
      {postType === "blog" && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            발췌문 <span className="text-neutral-400 font-normal">(목록 카드에 표시되는 요약 문장)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="검색 결과와 목록 카드에 표시할 1~2문장 요약을 입력하세요"
            rows={2}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600 resize-none"
          />
        </div>
      )}

      {/* 블로그 전용: 태그 */}
      {postType === "blog" && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            태그 <span className="text-neutral-400 font-normal">(쉼표로 구분)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="예: 폐유, 폐기물관리법, 올바로시스템"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-600/20 focus:border-cobalt-600"
          />
        </div>
      )}

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
          className="px-6 py-2 text-sm bg-cobalt-600 text-white rounded-lg hover:bg-cobalt-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
        </button>
      </div>
    </form>
  );
}
