"use client";

import { NAV_GROUPS } from "@/components/nav-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.id} className="px-1">
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            {group.title}
          </p>
          <ul className="space-y-px">
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`relative flex flex-col rounded-md py-2 pl-3 pr-2 text-[13px] leading-snug transition-colors duration-150 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:transition-colors ${
                      active
                        ? "font-medium text-zinc-900 before:bg-[#0a66c2] dark:text-zinc-50 dark:before:bg-[#70b5f9]"
                        : "text-zinc-600 before:bg-transparent hover:bg-zinc-950/[0.03] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="mt-0.5 text-[11px] font-normal leading-relaxed text-zinc-400 dark:text-zinc-500">
                        {item.description}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] text-zinc-900 dark:text-zinc-50">
      <aside className="relative z-30 hidden w-[15.5rem] shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--app-bg)] lg:flex">
        <div className="px-5 pb-4 pt-6">
          <Link href="/" className="block transition-opacity hover:opacity-80">
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              FeedStrategy
            </span>
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
              Agent
            </span>
          </Link>
          <p className="mt-4 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            붙여 넣은 글만으로 트렌드·브리프·일정을 잡습니다.
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-8">
          <NavLinks pathname={pathname} />
        </nav>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-[2px] transition-opacity dark:bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(19rem,100%)] border-r border-[var(--hairline)] bg-[var(--app-bg)] transition-transform duration-200 ease-out dark:border-zinc-800/80 lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50" onClick={closeMenu}>
            FeedStrategy
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-950/5 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200"
            onClick={closeMenu}
            aria-label="닫기"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        <nav className="flex flex-col gap-5 overflow-y-auto px-3 pb-8">
          <NavLinks pathname={pathname} onNavigate={closeMenu} />
        </nav>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--hairline)] bg-[var(--app-bg)]/90 px-4 py-3 backdrop-blur-md dark:border-zinc-800/80 lg:hidden">
          <Link href="/" className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            FeedStrategy
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700/80 dark:bg-[var(--surface)] dark:text-zinc-200 dark:hover:bg-zinc-800/40"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
          >
            메뉴
          </button>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:max-w-4xl lg:px-10 lg:py-12">
          {children}
        </main>

        <footer className="border-t border-[var(--hairline)] px-4 py-5 text-center text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
          데이터는 이 브라우저(로컬)에만 저장됩니다. 링크드인 이용약관·저작권·개인정보를 준수해 주세요.
        </footer>
      </div>
    </div>
  );
}
