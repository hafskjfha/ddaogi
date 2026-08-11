import type { Metadata } from "next";
import { SupportedUserCard } from "@/features/user/components/SupportedUserCard";
import { UserSearchForm } from "@/features/user/components/UserSearchForm";
import { SUPPORTED_USER } from "@/features/user/data/userCatalog";

export const metadata: Metadata = { title: "유저 분석" };

/** Provides the supported user lookup and demo profile entry point. */
export default function UsersPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">유저 분석</h1>
        <p className="text-slate-600 dark:text-slate-400">DOJ 핸들로 분석 프로필을 찾아보세요.</p>
      </header>
      <UserSearchForm />
      <SupportedUserCard user={SUPPORTED_USER} />
    </div>
  );
}
