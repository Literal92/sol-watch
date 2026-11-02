import type { HistoryPoint } from "@/lib/types";

const MAX_POINTS = 48;
const EMPTY: HistoryPoint[] = [];
const CHANGE = "solwatch-history";

function storageKey(cluster: string, address: string): string {
  return `solwatch.snapshots.${cluster}.${address}`;
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE));
}

function isPoint(value: unknown): value is HistoryPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<HistoryPoint>;
  return typeof point.t === "number" && typeof point.sol === "number";
}

function parseSnapshots(raw: string | null): HistoryPoint[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const points = parsed.filter(isPoint).slice(-MAX_POINTS);
    return points.length === 0 ? EMPTY : points;
  } catch {
    return EMPTY;
  }
}

let snapshot: { key: string; raw: string | null; points: HistoryPoint[] } | null = null;

export function historySnapshot(cluster: string, address: string): HistoryPoint[] {
  const key = storageKey(cluster, address);
  const raw = localStorage.getItem(key);
  if (snapshot?.key === key && snapshot.raw === raw) return snapshot.points;
  const points = parseSnapshots(raw);
  snapshot = { key, raw, points };
  return points;
}

export function subscribeHistory(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function recordSnapshot(cluster: string, address: string, sol: number): void {
  const existing = historySnapshot(cluster, address);
  const last = existing.at(-1);
  const now = Date.now();
  if (last && now - last.t < 60_000 && Math.abs(last.sol - sol) < 1e-9) return;
  const next = [...existing, { t: now, sol }].slice(-MAX_POINTS);
  localStorage.setItem(storageKey(cluster, address), JSON.stringify(next));
  notify();
}

export function mergeHistory(server: readonly HistoryPoint[], local: readonly HistoryPoint[]): HistoryPoint[] {
  const merged = [...server, ...local]
    .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.sol))
    .sort((a, b) => a.t - b.t);
  const deduped: HistoryPoint[] = [];
  for (const point of merged) {
    const prev = deduped.at(-1);
    if (prev && Math.abs(prev.t - point.t) < 30_000 && Math.abs(prev.sol - point.sol) < 1e-9) {
      continue;
    }
    deduped.push(point);
  }
  return deduped.slice(-60);
}
