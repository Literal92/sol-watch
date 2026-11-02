"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted">{error.message || "The page failed to load."}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-border px-4 py-2 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
