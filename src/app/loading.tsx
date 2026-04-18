export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-neutral-500 font-medium">로딩 중입니다...</p>
    </div>
  );
}
