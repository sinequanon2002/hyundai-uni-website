'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col font-pretendard">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-16">
        <h1 className="text-6xl font-black text-red-500 mb-6">500</h1>
        <h2 className="text-2xl font-bold mb-4">일시적 오류가 발생했습니다.</h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          서비스 이용에 불편을 드려 죄송합니다. 잠시 후 다시 시도해 주시기 바랍니다.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-100"
          >
            재시도
          </button>
          <Link 
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
