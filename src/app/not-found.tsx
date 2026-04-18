import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col font-pretendard">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-16">
        <h1 className="text-6xl font-black text-primary mb-6">404</h1>
        <h2 className="text-2xl font-bold mb-4">찾으시는 페이지가 없습니다.</h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          요청하신 페이지의 주소가 잘못 입력되었거나, 변경 혹은 삭제되어 현재 사용할 수 없습니다.
        </p>
        <Link 
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
