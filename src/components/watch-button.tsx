"use client";

import { useState, useSyncExternalStore } from "react";
import {
  removeWatch,
  subscribeWatchlist,
  upsertWatch,
  watchlistSnapshot,
  type WatchItem,
} from "@/lib/watchlist";

const empty: WatchItem[] = [];

export function WatchButton({ cluster, address }: { cluster: string; address: string }) {
  const items = useSyncExternalStore(
    subscribeWatchlist,
    () => watchlistSnapshot(cluster),
    () => empty,
  );
  const [error, setError] = useState<string | null>(null);
  const watching = items.some((item) => item.address === address);

  function toggle() {
    if (watching) {
      removeWatch(cluster, address);
      setError(null);
      return;
    }
    const result = upsertWatch(cluster, address);
    setError(result.error);
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={watching}
        className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
      >
        {watching ? "Watching" : "Watch"}
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
