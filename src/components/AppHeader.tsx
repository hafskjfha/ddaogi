import { Bird } from "lucide-react";
import Link from "next/link";

/** Persistent navigation for supported analytics and planned destinations. */
export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 text-slate-950 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/users/jtw7913" className="flex items-center gap-2 font-semibold tracking-tight">
          <Bird aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" />
          <span>따오기</span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          <Link href="/users/jtw7913" aria-label="유저 분석" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300">
            <span className="hidden sm:inline">유저 분석</span>
            <span className="sm:hidden">유저</span>
          </Link>
          <span
            role="link"
            aria-disabled="true"
            aria-label="대회 분석 준비 중"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-600"
          >
            <span className="hidden sm:inline">대회 분석</span>
            <span className="sm:hidden">대회</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              준비 중
            </span>
          </span>
        </nav>
      </div>
    </header>
  );
}
