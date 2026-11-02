"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-60"
    >
      {pending ? "Refreshing" : "Refresh"}
    </button>
  );
}
