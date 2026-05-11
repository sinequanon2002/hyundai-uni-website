import type { Metadata } from "next";
import Link from "next/link";
import { getMyProfile, getMyInquiries } from "@/lib/actions/customer";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "접수 완료",
  reviewing: "검토 중",
  quoted:    "견적 발송",
  completed: "처리 완료",
  cancelled: "취소",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  quoted:    "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
};

export default async function MyPage() {
  const [profileResult, inquiriesResult] = await Promise.all([
    getMyProfile(),
    getMyInquiries({ pageSize: 5 }),
  ]);

  const profile = profileResult.data;
  const inquiries = inquiriesResult.data?.inquiries ?? [];
  const total = inquiriesResult.data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* 인사말 */}
      <div>
        <h1 className="text-xl font-bold text-neutral-dark">
          안녕하세요, {profile?.full_name ?? "고객"}님
        </h1>
        <p className="text-sm text-neutral-mid mt-1">
          {profile?.company_name && <span>{profile.company_name} · </span>}
          현대유앤아이 고객 포털에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="전체 문의" value={`${total}건`} href="/my/inquiries" />
        <StatCard
          label="진행 중"
          value={`${inquiries.filter(i => ["pending","reviewing"].includes(i.status)).length}건`}
          href="/my/inquiries?status=reviewing"
        />
        <StatCard
          label="견적 발송"
          value={`${inquiries.filter(i => i.status === "quoted").length}건`}
          href="/my/inquiries?status=quoted"
        />
      </div>

      {/* 최근 문의 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-neutral-dark">최근 문의 내역</h2>
          <Link href="/my/inquiries" className="text-xs text-primary hover:underline">
            전체 보기
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-neutral-mid">아직 문의 내역이 없습니다.</p>
            <Link
              href="/support/inquiry"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
            >
              견적 문의 하기
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {inquiries.map((inq) => (
              <li key={inq.id}>
                <Link
                  href={`/my/inquiries/${inq.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-light transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-dark truncate">
                      {inq.waste_types.slice(0, 2).join(", ")}
                      {inq.waste_types.length > 2 && ` 외 ${inq.waste_types.length - 2}건`}
                    </p>
                    <p className="text-xs text-neutral-mid mt-0.5">
                      {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span className={`ml-3 shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[inq.status] ?? ""}`}>
                    {STATUS_LABEL[inq.status] ?? inq.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink
          href="/support/inquiry"
          title="새 견적 문의"
          desc="지정폐기물 수거 견적을 요청하세요"
        />
        <QuickLink
          href="/my/profile"
          title="프로필 설정"
          desc="담당자 정보와 연락처를 수정하세요"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 hover:border-primary/30 transition-colors"
    >
      <p className="text-xs text-neutral-mid">{label}</p>
      <p className="text-2xl font-bold text-primary mt-1">{value}</p>
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:border-primary/30 transition-colors"
    >
      <p className="text-sm font-semibold text-neutral-dark">{title}</p>
      <p className="text-xs text-neutral-mid mt-1">{desc}</p>
    </Link>
  );
}
