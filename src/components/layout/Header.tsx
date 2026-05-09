"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubItem {
  label: string;
  href: string;
  external?: boolean;
}

interface NavGroup {
  label: string;
  basePath: string;
  children: SubItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '회사소개',
    basePath: '/company',
    children: [
      { label: '인사말', href: '/company/greeting' },
      { label: '회사개요', href: '/company/profile' },
      { label: '연혁', href: '/company/history' },
      { label: '인허가현황', href: '/company/certifications' },
      { label: '오시는 길', href: '/company/location' },
    ],
  },
  {
    label: '지정폐기물',
    basePath: '/waste',
    children: [
      { label: '지정폐기물이란', href: '/waste/about' },
      { label: '수거대상 폐기물', href: '/waste/types' },
      { label: '보관기준', href: '/waste/storage' },
      { label: '처리절차', href: '/waste/process' },
      { label: '법적의무', href: '/waste/compliance' },
    ],
  },
  {
    label: '올바로시스템',
    basePath: '/allbaro',
    children: [
      { label: '올바로시스템 소개', href: '/allbaro/about' },
      { label: '이용가이드', href: '/allbaro/guide' },
    ],
  },
  {
    label: '고객지원',
    basePath: '/support',
    children: [
      { label: '공지사항', href: '/support/notice' },
      { label: '현장갤러리', href: '/support/gallery' },
      { label: '견적 문의', href: '/support/inquiry' },
      { label: '네이버 블로그 ↗', href: 'https://blog.naver.com/hduni2020', external: true },
    ],
  },
];

const CTA_ITEM = { label: '견적문의', href: '/support/inquiry' };

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((basePath: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(basePath);
  }, []);

  const handleMouseLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const toggleMobileAccordion = (basePath: string) => {
    setMobileAccordion(prev => prev === basePath ? null : basePath);
  };

  const isGroupActive = (basePath: string) => {
    return pathname.startsWith(basePath);
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-[60] w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary shrink-0">현대유앤아이</Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {NAV_GROUPS.map((group) => (
              <div 
                key={group.basePath}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.basePath)}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  className={cn(
                    "flex items-center gap-1 px-4 py-5 transition-colors hover:text-primary",
                    isGroupActive(group.basePath) ? "text-primary" : "text-neutral-600"
                  )}
                  onClick={() => setActiveDropdown(prev => prev === group.basePath ? null : group.basePath)}
                  aria-expanded={activeDropdown === group.basePath}
                  aria-haspopup="true"
                >
                  {group.label}
                  <ChevronDown 
                    size={14} 
                    className={cn(
                      "transition-transform duration-200",
                      activeDropdown === group.basePath ? "rotate-180" : ""
                    )} 
                  />
                </button>

                {/* Dropdown */}
                <div 
                  className={cn(
                    "absolute top-full left-0 min-w-[200px] bg-white rounded-xl shadow-xl border border-neutral-100 py-2 transition-all duration-200 origin-top",
                    activeDropdown === group.basePath 
                      ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto" 
                      : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                  )}
                  onMouseEnter={() => handleMouseEnter(group.basePath)}
                  onMouseLeave={handleMouseLeave}
                >
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      {...(child.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={cn(
                        "block px-5 py-2.5 text-sm transition-colors hover:bg-primary/5 hover:text-primary",
                        pathname === child.href ? "text-primary bg-primary/5 font-medium" : "text-neutral-600"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA Button - 견적문의 */}
            <Link 
              href={CTA_ITEM.href}
              className={cn(
                "ml-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]",
                pathname === CTA_ITEM.href
                  ? "bg-primary text-white shadow-primary/30"
                  : "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
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
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
        )}
        style={{ backgroundColor: 'white' }}
      >
        <nav className="flex flex-col p-6 md:p-8">
          <div className="flex flex-col">
            {NAV_GROUPS.map((group) => (
              <div key={group.basePath} className="border-b border-neutral-100">
                <button
                  className={cn(
                    "w-full flex items-center justify-between py-4 text-left text-lg font-bold transition-colors",
                    isGroupActive(group.basePath) ? "text-primary" : "text-neutral-900"
                  )}
                  onClick={() => toggleMobileAccordion(group.basePath)}
                  aria-expanded={mobileAccordion === group.basePath}
                >
                  {group.label}
                  <ChevronDown 
                    size={20} 
                    className={cn(
                      "transition-transform duration-300 text-neutral-400",
                      mobileAccordion === group.basePath ? "rotate-180 text-primary" : ""
                    )} 
                  />
                </button>

                {/* Mobile Submenu */}
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    mobileAccordion === group.basePath ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="pl-4 pb-4 space-y-1">
                    {group.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        {...(child.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={cn(
                          "block py-2.5 px-3 rounded-lg text-sm transition-colors",
                          pathname === child.href
                            ? "text-primary bg-primary/5 font-medium"
                            : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-8 pb-12">
            <Link 
              href="/support/inquiry" 
              className="flex items-center justify-center gap-2 w-full py-4 text-center bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <FileText size={20} />
              무료 견적 상담받기
            </Link>
            <div className="mt-12 space-y-2 text-sm text-neutral-500">
              <p>주식회사 현대유앤아이</p>
              <p>대표전화: 010-9084-9480</p>
              <p>이메일: hduni3973@naver.com</p>
            </div>
            <p className="text-neutral-400 text-xs mt-8">
              © 2024 주식회사 현대유앤아이. All rights reserved.
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
