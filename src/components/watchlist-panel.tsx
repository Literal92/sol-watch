"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { shortenAddress } from "@/lib/format";
import {
  removeWatch,
  renameWatch,
  subscribeWatchlist,
  watchlistSnapshot,
  type WatchItem,
} from "@/lib/watchlist";

const empty: WatchItem[] = [];

export function WatchlistPanel({ cluster }: { cluster: string }) {
  const items = useSyncExternalStore(
    subscribeWatchlist,
    () => watchlistSnapshot(cluster),
    () => empty,
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [alias, setAlias] = useState("");

  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Watchlist</h2>
        <p className="text-sm text-muted">Saved in this browser</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Watched addresses stay on this device. Nothing is uploaded.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.address} className="flex items-center gap-3 py-3">
              {editing === item.address ? (
                <form
                  className="min-w-0 flex-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    renameWatch(cluster, item.address, alias);
                    setEditing(null);
                  }}
                >
                  <input
                    value={alias}
                    onChange={(event) => setAlias(event.target.value)}
                    aria-label={`Alias for ${item.address}`}
                    className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                    autoFocus
                  />
                </form>
              ) : (
                <Link href={`/wallet/${item.address}`} className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {item.alias || shortenAddress(item.address, 6)}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted">{item.address}</span>
                </Link>
              )}
              <button
                type="button"
                className="text-sm text-muted"
                onClick={() => {
                  if (editing === item.address) {
                    renameWatch(cluster, item.address, alias);
                    setEditing(null);
                    return;
                  }
                  setEditing(item.address);
                  setAlias(item.alias);
                }}
              >
                {editing === item.address ? "Save" : "Rename"}
              </button>
              <button
                type="button"
                className="text-sm text-danger"
                onClick={() => removeWatch(cluster, item.address)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
