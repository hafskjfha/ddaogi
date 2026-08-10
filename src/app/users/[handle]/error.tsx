"use client";

import { House, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface UserDashboardErrorProps {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
}

/** Presents recoverable actions when the user dashboard route fails. */
export default function UserDashboardError({ error, retry }: UserDashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card
        role="alert"
        className="flex flex-col items-start gap-5 border-red-200 p-6 dark:border-red-900/70 sm:p-8"
      >
        <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          <TriangleAlert aria-hidden="true" className="size-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">
            유저 정보를 불러오지 못했습니다.
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            잠시 후 다시 시도하거나 홈으로 돌아가 주세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={retry}>
            <RotateCcw aria-hidden="true" className="size-4" />
            다시 시도
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
          >
            <House aria-hidden="true" className="size-4" />
            홈으로
          </Link>
        </div>
      </Card>
    </div>
  );
}
