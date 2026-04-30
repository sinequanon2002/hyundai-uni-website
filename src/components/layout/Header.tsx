"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: '회사소개', href: '/company/profile' },
  { label: '지정폐기물', href: '/waste/types' },
  { label: '올바로시스템', href: '/allbaro/about' },
  { label: '견적문의', href: '/support/inquiry' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
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

  return (
    <>
      <header className="sticky top-0 z-[60] w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-primary">현대유앤아이</Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname.startsWith(item.href.split('/')[1]) ? "text-primary" : "text-neutral-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
          "fixed inset-0 z-[50] bg-white transition-all duration-300 ease-in-out md:hidden overflow-y-auto pt-20",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
        )}
        style={{ backgroundColor: 'white' }}
      >
        <nav className="flex flex-col p-8 space-y-8">
          <div className="flex flex-col space-y-6">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "text-2xl font-bold border-b border-neutral-100 pb-4 transition-colors",
                  pathname.startsWith(item.href.split('/')[1]) ? "text-primary" : "text-neutral-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="pt-10 pb-12">
            <Link 
              href="/support/inquiry" 
              className="block w-full py-4 text-center bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
            >
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
