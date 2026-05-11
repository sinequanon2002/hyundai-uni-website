"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, FileText, Download, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubItem {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
  highlight?: boolean;
}

/** 드롭다운이 있는 그룹 메뉴 */
interface NavGroup {
  type: 'group';
  label: string;
  basePath: string;
  children: SubItem[];
}

/** 드롭다운 없는 단독 링크 */
interface NavDirect {
  type: 'direct';
  label: string;
  href: string;
}

type NavItem = NavGroup | NavDirect;

const NAV_ITEMS: NavItem[] = [
  {
    type: 'group',
    label: '서비스 소개',
    basePath: '/service',
    children: [
      { label: '서비스 안내',    href: '/waste/types' },
      { label: '보관·법적 의무', href: '/waste/storage' },
      { label: '서비스 소개서',  href: '/resources/brochure', highlight: true },
      { label: '업종별 솔루션',  href: '/support/inquiry', badge: '준비중' },
      { label: '회사 소개',      href: '/company' },
    ],
  },
  {
    type: 'direct',
    label: '블로그',
    href: '/blog',
  },
  {
    type: 'direct',
    label: '실적사례',
    href: '/gallery',
  },
  {
    type: 'group',
    label: '고객센터',
    basePath: '/support',
    children: [
      { label: '공지사항',       href: '/support/notice' },
      { label: '견적문의',       href: '/support/inquiry' },
      { label: '문의현황 조회',  href: '/support/inquiry-status' },
    ],
  },
];

const CTA_ITEM = { label: '견적 문의', href: '/support/inquiry' };

function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.children.some(
    (child) => !child.external && pathname.startsWith(child.href.split('?')[0])
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((key: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const toggleMobileAccordion = (key: string) => {
    setMobileAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-[60] w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary shrink-0">
            현대유앤아이
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              if (item.type === 'direct') {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-5 transition-colors hover:text-primary",
                      pathname.startsWith(item.href) ? "text-primary font-semibold" : "text-neutral-600"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              // NavGroup
              const active = isGroupActive(item, pathname);
              const isDropdownOpen = activeDropdown === item.basePath;

              return (
                <div
                  key={item.basePath}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.basePath)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-5 transition-colors hover:text-primary",
                      active ? "text-primary" : "text-neutral-600"
                    )}
                    onClick={() =>
                      setActiveDropdown((prev) =>
                        prev === item.basePath ? null : item.basePath
                      )
                    }
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        isDropdownOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={cn(
                      "absolute top-full left-0 min-w-[200px] bg-white rounded-xl shadow-xl border border-neutral-100 py-2 transition-all duration-200 origin-top",
                      isDropdownOpen
                        ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                    )}
                    onMouseEnter={() => handleMouseEnter(item.basePath)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.children.map((child, idx) => {
                      // 서비스 소개: highlight 항목 앞에 구분선
                      const showDivider = item.basePath === '/service' && child.highlight;

                      return (
                        <div key={child.href}>
                          {showDivider && (
                            <div className="my-1.5 mx-4 border-t border-neutral-100" />
                          )}
                          <Link
                            href={child.href}
                            {...(child.external
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                            className={cn(
                              "flex items-center justify-between px-5 py-2.5 text-sm transition-colors",
                              child.highlight
                                ? "hover:bg-accent/5 hover:text-accent text-accent/80 font-medium"
                                : "hover:bg-primary/5 hover:text-primary",
                              pathname === child.href && !child.external
                                ? "bg-primary/5 text-primary font-medium"
                                : !child.highlight && "text-neutral-600"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {child.highlight && <Download size={13} className="shrink-0" />}
                              {child.label}
                            </span>
                            {child.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* CTA 버튼 */}
            <Link
              href={CTA_ITEM.href}
              className={cn(
                "ml-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] bg-primary text-white shadow-primary/20 hover:bg-primary/90",
                pathname === CTA_ITEM.href && "shadow-primary/30"
              )}
            >
              <FileText size={16} />
              {CTA_ITEM.label}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="p-2 text-neutral-900 focus:outline-none relative z-[70]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[50] bg-white transition-all duration-300 ease-in-out lg:hidden overflow-y-auto pt-20",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        )}
      >
        <nav className="flex flex-col p-6 md:p-8">
          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              if (item.type === 'direct') {
                return (
                  <div key={item.href} className="border-b border-neutral-100">
                    <Link
                      href={item.href}
                      className={cn(
                        "block py-4 text-lg font-bold transition-colors",
                        pathname.startsWith(item.href)
                          ? "text-primary"
                          : "text-neutral-900 hover:text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              }

              // NavGroup
              const active = isGroupActive(item, pathname);
              const isAccordionOpen = mobileAccordion === item.basePath;

              return (
                <div key={item.basePath} className="border-b border-neutral-100">
                  <button
                    className={cn(
                      "w-full flex items-center justify-between py-4 text-left text-lg font-bold transition-colors",
                      active ? "text-primary" : "text-neutral-900"
                    )}
                    onClick={() => toggleMobileAccordion(item.basePath)}
                    aria-expanded={isAccordionOpen}
                  >
                    {item.label}
                    <ChevronDown
                      size={20}
                      className={cn(
                        "transition-transform duration-300 text-neutral-400",
                        isAccordionOpen ? "rotate-180 text-primary" : ""
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isAccordionOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-4 pb-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          {...(child.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-colors",
                            child.highlight
                              ? "text-accent/80 font-medium hover:bg-accent/5 hover:text-accent"
                              : pathname === child.href
                              ? "text-primary bg-primary/5 font-medium"
                              : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {child.highlight && <Download size={13} />}
                            {child.label}
                          </span>
                          {child.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-8 pb-12">
            <Link
              href="/support/inquiry"
              className="flex items-center justify-center gap-2 w-full py-4 text-center bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <ArrowRight size={18} />
              견적 문의하기
            </Link>
            <div className="mt-10 space-y-2 text-sm text-neutral-500">
              <p>주식회사 현대유앤아이</p>
              <p>대표전화: 010-9084-9480</p>
              <p>이메일: hduni3973@naver.com</p>
            </div>
            <p className="text-neutral-400 text-xs mt-8">
              © 2025 주식회사 현대유앤아이. All rights reserved.
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
