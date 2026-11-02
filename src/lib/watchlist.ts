export type WatchItem = {
  address: string;
  alias: string;
  addedAt: number;
};

const MAX_ITEMS = 25;
const EMPTY: WatchItem[] = [];
const CHANGE = "solwatch-watchlist";

function storageKey(cluster: string): string {
  return `solwatch.watchlist.${cluster}`;
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE));
}

function isWatchItem(value: unknown): value is WatchItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WatchItem>;
  return (
    typeof item.address === "string" &&
    typeof item.alias === "string" &&
    typeof item.addedAt === "number"
  );
}

export function readWatchlist(cluster: string): WatchItem[] {
  if (typeof window === "undefined") return EMPTY;
  return parseWatchlist(localStorage.getItem(storageKey(cluster)));
}

function parseWatchlist(raw: string | null): WatchItem[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const items = parsed.filter(isWatchItem).slice(0, MAX_ITEMS);
    return items.length === 0 ? EMPTY : items;
  } catch {
    return EMPTY;
  }
}

let snapshot: { cluster: string; raw: string | null; items: WatchItem[] } | null = null;

export function watchlistSnapshot(cluster: string): WatchItem[] {
  const raw = localStorage.getItem(storageKey(cluster));
  if (snapshot?.cluster === cluster && snapshot.raw === raw) return snapshot.items;
  const items = parseWatchlist(raw);
  snapshot = { cluster, raw, items };
  return items;
}

export function subscribeWatchlist(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function writeWatchlist(cluster: string, items: readonly WatchItem[]): void {
  localStorage.setItem(storageKey(cluster), JSON.stringify(items.slice(0, MAX_ITEMS)));
  notify();
}

export function upsertWatch(
  cluster: string,
  address: string,
  alias = "",
): { items: WatchItem[]; error: string | null } {
  const items = readWatchlist(cluster);
  if (items.some((item) => item.address === address)) {
    return { items, error: null };
  }
  if (items.length >= MAX_ITEMS) {
    return { items, error: `The watchlist holds ${MAX_ITEMS} addresses.` };
  }
  const next = [{ address, alias, addedAt: Date.now() }, ...items];
  writeWatchlist(cluster, next);
  return { items: next, error: null };
}

export function removeWatch(cluster: string, address: string): WatchItem[] {
  const next = readWatchlist(cluster).filter((item) => item.address !== address);
  writeWatchlist(cluster, next);
  return next;
}

export function renameWatch(cluster: string, address: string, alias: string): WatchItem[] {
  const next = readWatchlist(cluster).map((item) =>
    item.address === address ? { ...item, alias: alias.trim() } : item,
  );
  writeWatchlist(cluster, next);
  return next;
}
