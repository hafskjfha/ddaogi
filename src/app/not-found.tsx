import Link from "next/link";

/** Explains unavailable routes and links to the supported dashboard views. */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">404</p>
      <h1 className="text-3xl font-black tracking-tight">페이지를 찾을 수 없습니다.</h1>
      <p className="text-slate-600 dark:text-slate-400">
        요청한 유저 또는 대회 분석 페이지는 아직 지원하지 않습니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/users/jtw7913"
          className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-50 dark:focus-visible:ring-offset-slate-950"
        >
          지원 유저 보기
        </Link>
        <Link
          href="/contests/doj-beginner-contest-4"
          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-50 dark:focus-visible:ring-offset-slate-950"
        >
          지원 대회 보기
        </Link>
      </div>
    </div>
  );
}
