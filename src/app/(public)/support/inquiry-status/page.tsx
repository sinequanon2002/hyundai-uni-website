import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyInquiries } from "@/lib/actions/customer";
import InquiryStatusSearch from "./InquiryStatusSearch";
import { PageBanner } from "@/components/ui/PageBanner";
import { SubNav, SUPPORT_SUBNAV_ITEMS } from "@/components/ui/SubNav";

export const metadata: Metadata = {
  title: "문의현황 조회 | 현대유앤아이",
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

export default async function InquiryStatusPage() {
  // 로그인 여부 확인
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인된 고객: 내 문의 목록 표시
  if (user) {
    const result = await getMyInquiries({ pageSize: 20 });
    const inquiries = result.data?.inquiries ?? [];

    return (
      <>
        <PageBanner title="문의현황 조회" breadcrumb={["고객지원", "문의현황 조회"]} />
        <SubNav items={SUPPORT_SUBNAV_ITEMS} />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-dark">나의 문의 내역</h2>
            <Link
              href="/my/inquiries"
              className="text-sm text-primary hover:underline"
            >
              마이페이지에서 보기 →
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-14 text-center">
              <p className="text-sm text-neutral-mid">아직 문의 내역이 없습니다.</p>
              <Link
                href="/support/inquiry"
                className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
              >
                견적 문의하기
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {inquiries.map((inq) => (
                <li key={inq.id}>
                  <Link
                    href={`/my/inquiries/${inq.id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:border-primary/30 transition-colors gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-dark truncate">
                        {inq.waste_types.slice(0, 2).join(", ")}
                        {inq.waste_types.length > 2 && ` 외 ${inq.waste_types.length - 2}건`}
                      </p>
                      <p className="text-xs text-neutral-mid mt-0.5">
                        접수일: {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[inq.status] ?? ""}`}>
                      {STATUS_LABEL[inq.status] ?? inq.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/support/inquiry"
              className="inline-block px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
            >
              새 견적 문의하기
            </Link>
          </div>
        </div>
      </>
    );
  }

  // 비로그인: 전화번호 검색 + 로그인 유도
  return (
    <>
      <PageBanner title="문의현황 조회" breadcrumb={["고객지원", "문의현황 조회"]} />
      <SubNav items={SUPPORT_SUBNAV_ITEMS} />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* 비회원 조회 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-base font-bold text-neutral-dark mb-1">비회원 문의 조회</h2>
          <p className="text-sm text-neutral-mid mb-5">
            견적 문의 시 입력하신 연락처로 접수 현황을 조회할 수 있습니다.
          </p>
          <InquiryStatusSearch />
        </div>

        {/* 로그인 유도 */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-bold text-neutral-dark mb-1">
                더 편리하게 관리하려면 로그인하세요
              </h3>
              <p className="text-sm text-neutral-mid leading-relaxed">
                로그인하면 모든 문의 내역을 한 곳에서 확인하고,
                견적서 수신·진행 상태를 실시간으로 추적할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2 sm:flex-col sm:gap-2 shrink-0">
              <Link
                href="/login?next=/support/inquiry-status"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-mid">
          새로운 견적이 필요하신가요?{" "}
          <Link href="/support/inquiry" className="text-primary font-medium hover:underline">
            견적 문의하기 →
          </Link>
        </p>
      </div>
    </>
  );
}
