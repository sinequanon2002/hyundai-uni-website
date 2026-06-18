"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

interface NavLink {
  href: string;
  label: string;
}

const BASE_LINKS: NavLink[] = [
  { href: "/admin/inquiries",  label: "견적 문의" },
  { href: "/admin/quotes",     label: "견적서" },
  { href: "/admin/customers",  label: "고객 관리" },
  { href: "/admin/dispatches", label: "수거 건" },
  { href: "/admin/invoices",   label: "세금계산서" },
  { href: "/admin/brochures",  label: "소개서 신청" },
  { href: "/admin/notices",    label: "공지사항" },
  { href: "/admin/gallery",    label: "현장갤러리" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin/users",    label: "사용자 관리" },
  { href: "/admin/settings", label: "설정" },
];

interface AdminNavProps {
  isAdmin: boolean;
  displayName: string;
  roleLabel: string;
}

export function AdminNav({ isAdmin, displayName, roleLabel }: AdminNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = isAdmin ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열린 동안 본문 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="bg-primary text-white shrink-0">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/admin/inquiries" className="font-bold text-sm tracking-tight hover:opacity-80 transition-opacity">
            현대유앤아이 · 관리자
          </a>
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden sm:flex items-center gap-4 text-xs text-white/70">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-white",
                  isActive(link.href) && "text-white font-semibold"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/60 hover:text-white transition-colors hidden sm:block"
            title="홈페이지 새 탭으로 열기"
          >
            홈페이지 ↗
          </a>
          <span className="text-xs text-white/70 hidden sm:block">
            <span className="text-white/50 mr-1">[{roleLabel}]</span>
            {displayName}
          </span>
          <form action={logout} className="hidden sm:block">
            <button
              type="submit"
              className="text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 rounded px-2.5 py-1 transition-colors"
            >
              로그아웃
            </button>
          </form>

          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            className="sm:hidden p-1.5 -mr-1.5 text-white focus:outline-none"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      <div
        className={cn(
          "sm:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10",
          isOpen ? "max-h-[480px]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "py-3 text-sm border-b border-white/10 transition-colors",
                isActive(link.href) ? "text-white font-semibold" : "text-white/70 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 text-sm text-white/60 hover:text-white border-b border-white/10 transition-colors"
          >
            홈페이지 ↗
          </a>
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-white/70">
              <span className="text-white/50 mr-1">[{roleLabel}]</span>
              {displayName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 rounded px-2.5 py-1 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
