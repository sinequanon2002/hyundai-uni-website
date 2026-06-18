"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const COMPANY_SUBNAV_ITEMS = [
  { label: "인사말", href: "/company/greeting" },
  { label: "기업개요", href: "/company/profile" },
  { label: "연혁", href: "/company/history" },
  { label: "허가·인증", href: "/company/certifications" },
  { label: "오시는 길", href: "/company/location" }
];

export const WASTE_SUBNAV_ITEMS = [
  { label: "서비스 안내", href: "/waste/types" },
  { label: "보관·법적 의무", href: "/waste/storage" },
  { label: "비용 안내", href: "/waste/pricing" },
];

export const SUPPORT_SUBNAV_ITEMS = [
  { label: "공지사항", href: "/support/notice" },
  { label: "자주 묻는 질문", href: "/support/faq" },
  { label: "견적문의", href: "/support/inquiry" },
  { label: "문의현황 조회", href: "/support/inquiry-status" },
];

export function SubNav({ items = COMPANY_SUBNAV_ITEMS }: { items?: {label: string, href: string}[] }) {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="w-full">
          <ul className="grid grid-cols-2 md:flex md:justify-center md:space-x-8">
            {items.map((item, index) => {
              const isActive = pathname === item.href;
              const isLastOdd = items.length % 2 === 1 && index === items.length - 1;
              return (
                <li
                  key={item.href}
                  className={cn(
                    "flex border-b border-slate-100 md:border-none",
                    isLastOdd && "col-span-2 md:col-span-1"
                  )}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex-1 flex items-center justify-center min-h-[48px] px-2 py-3 md:px-4 md:py-4 text-sm md:text-base font-medium leading-tight transition-colors relative text-center",
                      isActive ? "text-cobalt-600 font-bold" : "text-slate-500 hover:text-cobalt-600"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-cobalt-600 rounded-t-md" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
