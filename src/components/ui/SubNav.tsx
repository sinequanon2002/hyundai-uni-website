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
  { label: "지정폐기물이란", href: "/waste/about" },
  { label: "지정폐기물 종류", href: "/waste/types" },
  { label: "보관방법", href: "/waste/storage" },
  { label: "처리절차", href: "/waste/process" },
  { label: "자가점검·벌칙", href: "/waste/compliance" }
];

export const SUPPORT_SUBNAV_ITEMS = [
  { label: "공지사항", href: "/support/notice" },
  { label: "현장갤러리", href: "/support/gallery" },
  { label: "견적문의", href: "/support/inquiry" }
];

export function SubNav({ items = COMPANY_SUBNAV_ITEMS }: { items?: {label: string, href: string}[] }) {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex overflow-x-auto no-scrollbar justify-start md:justify-center">
          <ul className="flex space-x-2 md:space-x-8 whitespace-nowrap">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "block px-4 py-4 text-sm md:text-base font-medium transition-colors relative",
                      isActive ? "text-primary font-bold" : "text-neutral-600 hover:text-primary"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-primary rounded-t-md" />
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
