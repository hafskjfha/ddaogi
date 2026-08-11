"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_USER } from "@/features/user/data/userCatalog";

const unsupportedHandleMessage = "현재는 jtw7913만 검색할 수 있어요.";
const errorId = "user-search-error";

/** Searches the single user available in the repository's mock snapshot. */
export function UserSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (query.trim().toLowerCase() === SUPPORTED_USER.handle) {
      setError(null);
      router.push(SUPPORTED_USER.href);
      return;
    }

    setError(unsupportedHandleMessage);
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-1 flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="user-handle">
          유저 핸들
        </label>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300 dark:focus:ring-slate-300"
          id="user-handle"
          onChange={(event) => {
            setQuery(event.target.value);
            setError(null);
          }}
          placeholder="jtw7913"
          type="text"
          value={query}
        />
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button
        className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300"
        type="submit"
      >
        검색
      </button>
    </form>
  );
}
