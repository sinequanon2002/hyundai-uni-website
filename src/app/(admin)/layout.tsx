// TODO: auth 구현 시 이 레이아웃에서 인증 체크 추가
// TODO: root layout의 Header/Footer를 (public) 라우트 그룹으로 분리 필요 (현재 admin 페이지에도 공개 헤더 표시됨)

export const metadata = {
  title: "관리자 | 현대유앤아이환경",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1F4E79] text-white px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-base tracking-tight">
          현대유앤아이환경 · 관리자
        </span>
        <span className="text-xs text-white/50">내부 전용</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
