"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createPortfolioItem,
  updatePortfolioItem,
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_REGIONS,
  type PortfolioItem,
} from "@/lib/actions/portfolio";

interface Props {
  item?: PortfolioItem;
}

export function GalleryForm({ item }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const [category, setCategory] = useState(item?.category ?? PORTFOLIO_CATEGORIES[0]);
  const [region, setRegion] = useState(item?.region ?? PORTFOLIO_REGIONS[0]);
  const [workDate, setWorkDate] = useState(item?.work_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!item;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "content-images");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) {
        setImageUrl(json.url);
      } else {
        setError(json.error ?? "이미지 업로드에 실패했습니다");
      }
    } catch {
      setError("이미지 업로드 중 오류가 발생했습니다");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = { title, description, image_url: imageUrl, category, region, work_date: workDate };
      const result = isEdit
        ? await updatePortfolioItem(item.id, payload)
        : await createPortfolioItem(payload);

      if (!result.success) {
        setError(result.error ?? "저장 중 오류가 발생했습니다");
        return;
      }
      router.push("/gallery");
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

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          이미지 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4 items-start">
          {/* 미리보기 */}
          <div
            className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center shrink-0 cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="미리보기"
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div className="text-center text-neutral-400 text-xs p-2">
                <div className="text-3xl mb-1">🖼</div>
                <div>클릭하여 업로드</div>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="text-xs text-neutral-500">업로드 중...</div>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {imageUrl ? "이미지 변경" : "이미지 선택"}
            </button>
            <p className="text-xs text-neutral-400">
              JPG, PNG, GIF, WEBP · 최대 5MB
            </p>
            {imageUrl && (
              <p className="text-xs text-green-600 break-all max-w-xs truncate">
                ✓ {imageUrl.split("/").pop()}
              </p>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 경기도 안산 도금공장 폐산 수거"
          required
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 카테고리 + 지역 + 작업일 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            폐기물 종류 <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {PORTFOLIO_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            지역 <span className="text-red-500">*</span>
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {PORTFOLIO_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            작업일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          설명 <span className="text-neutral-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="작업 내용, 배출 사업장 종류, 처리 방법 등을 간략히 기재하세요"
          rows={3}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
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
          disabled={isPending || uploading}
          className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "저장 중..." : isEdit ? "수정 완료" : "등록"}
        </button>
      </div>
    </form>
  );
}
