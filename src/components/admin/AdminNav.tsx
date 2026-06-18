"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, ClipboardList, FileText, Users, Truck, Receipt,
  BookOpen, Bell, Image as GalleryIcon, UserCog, Settings,
  LogOut, Globe, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const BASE_GROUPS: NavGroup[] = [
  {
    title: "영업 관리",
    items: [
      { href: "/admin/inquiries", label: "견적 문의", icon: ClipboardList },
      { href: "/admin/quotes",    label: "견적서",   icon: FileText },
    ],
  },
  {
    title: "운영 관리",
    items: [
      { href: "/admin/customers",  label: "고객 관리",  icon: Users },
      { href: "/admin/dispatches", label: "수거 건",    icon: Truck },
      { href: "/admin/invoices",   label: "세금계산서", icon: Receipt },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      { href: "/admin/brochures", label: "소개서 신청", icon: BookOpen },
      { href: "/admin/notices",   label: "공지사항",    icon: Bell },
      { href: "/admin/gallery",   label: "현장갤러리",  icon: GalleryIcon },
    ],
  },
];

const ADMIN_GROUP: NavGroup = {
  title: "시스템",
  items: [
    { href: "/admin/users",    label: "사용자 관리", icon: UserCog },
    { href: "/admin/settings", label: "설정",        icon: Settings },
  ],
};

interface AdminNavProps {
  isAdmin: boolean;
  displayName: string;
  roleLabel: string;
}

export function AdminNav({ isAdmin, displayName, roleLabel }: AdminNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const groups = isAdmin ? [...BASE_GROUPS, ADMIN_GROUP] : BASE_GROUPS;

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => pathname.startsWith(href);

  const sidebarInner = (
    <>
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <a
          href="/admin/inquiries"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0">
            HY
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">현대유앤아이</p>
            <p className="text-white/50 text-[10px] leading-tight mt-0.5">관리자 시스템</p>
          </div>
        </a>
      </div>

      {/* 메뉴 그룹 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    {active && (
                      <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 하단 사용자 정보 */}
      <div className="px-3 py-3 border-t border-white/10 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/10 hover:text-white transition-colors mb-1"
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          홈페이지 보기 ↗
        </a>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {displayName.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{displayName}</p>
            <p className="text-white/40 text-[10px] truncate">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="로그아웃"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 데스크톱 사이드바 (lg 이상) */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-navy-900 sticky top-0 h-dvh">
        {sidebarInner}
      </aside>

      {/* 모바일 상단 헤더 (lg 미만) */}
      <header className="lg:hidden bg-navy-900 text-white sticky top-0 z-30 shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <a
            href="/admin/inquiries"
            className="font-bold text-sm tracking-tight hover:opacity-80 transition-opacity"
          >
            현대유앤아이 · 관리자
          </a>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1.5 -mr-1.5 text-white focus:outline-none"
            aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* 모바일 오버레이 드로어 */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 flex transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={cn(
            "relative w-[280px] bg-navy-900 flex flex-col h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarInner}
        </aside>
      </div>
    </>
  );
}
