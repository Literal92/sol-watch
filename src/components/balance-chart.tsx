"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { formatSol, formatUtc } from "@/lib/format";
import { historySnapshot, mergeHistory, recordSnapshot, subscribeHistory } from "@/lib/local-history";
import type { HistoryPoint } from "@/lib/types";

const empty: HistoryPoint[] = [];

export function BalanceChart({
  cluster,
  address,
  serverPoints,
  sampled,
  available,
}: {
  cluster: string;
  address: string;
  serverPoints: HistoryPoint[];
  sampled: number;
  available: number;
}) {
  const localPoints = useSyncExternalStore(
    subscribeHistory,
    () => historySnapshot(cluster, address),
    () => empty,
  );
  const currentSol = serverPoints.at(-1)?.sol;

  useEffect(() => {
    if (currentSol === undefined) return;
    recordSnapshot(cluster, address, currentSol);
  }, [address, cluster, currentSol]);

  const points = useMemo(
    () => mergeHistory(serverPoints, localPoints),
    [localPoints, serverPoints],
  );

  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">SOL balance</h2>
        <p className="text-sm text-muted">
          {available === 0
            ? "No transactions yet. Later visits on this browser are kept locally."
            : `Last ${sampled} of ${available} recent transactions, plus checks saved in this browser.`}
        </p>
      </div>
      {points.length < 2 ? (
        <p className="mt-8 font-mono text-3xl">{formatSol(points[0]?.sol ?? 0)} SOL</p>
      ) : (
        <Chart points={points} />
      )}
    </section>
  );
}

function Chart({ points }: { points: HistoryPoint[] }) {
  const width = 640;
  const height = 200;
  const pad = { top: 16, right: 12, bottom: 28, left: 12 };
  const values = points.map((point) => point.sol);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(Math.abs(max) * 0.08, 0.0001);
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const coords = points.map((point, index) => {
    const x = pad.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = pad.top + ((max - point.sol) / span) * innerHeight;
    return { x, y };
  });
  const line = coords.map((coord) => `${coord.x},${coord.y}`).join(" ");
  const first = coords[0];
  const last = coords.at(-1);
  const baseline = pad.top + innerHeight;
  const area =
    first && last
      ? [`${first.x},${baseline}`, ...coords.map((coord) => `${coord.x},${coord.y}`), `${last.x},${baseline}`].join(" ")
      : "";

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`SOL balance from ${formatSol(points[0]?.sol ?? 0)} to ${formatSol(points.at(-1)?.sol ?? 0)}`}
        className="h-52 w-full"
      >
        <polygon points={area} fill="var(--accent)" opacity="0.16" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((coord, index) => (
          <circle key={`${points[index]?.t ?? "t"}-${index}`} cx={coord.x} cy={coord.y} r="3" fill="var(--accent)" />
        ))}
      </svg>
      <figcaption className="flex justify-between font-mono text-xs text-muted">
        <span>
          {formatUtc(points[0]?.t ?? 0)} · {formatSol(min)} SOL
        </span>
        <span>
          {formatUtc(points.at(-1)?.t ?? 0)} · {formatSol(max)} SOL
        </span>
      </figcaption>
    </figure>
  );
}
