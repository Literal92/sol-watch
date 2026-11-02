"use client";

import { useState } from "react";
import { solscanTokenUrl, type Cluster } from "@/lib/cluster";
import { formatChange, formatTokenAmount, formatUsd } from "@/lib/format";
import type { TokenRow } from "@/lib/types";
import { TokenIcon } from "@/components/token-icon";

export function TokenTable({ tokens, cluster }: { tokens: TokenRow[]; cluster: Cluster }) {
  const [showAll, setShowAll] = useState(false);
  const listed = tokens.filter((token) => token.verified || token.usdValue !== null);
  const visible = showAll || listed.length === 0 ? tokens : listed;
  const hidden = tokens.length - visible.length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 px-5">
        <p className="text-sm text-muted">
          {hidden > 0 ? `${hidden} unlisted tokens hidden.` : "Prices cached for 60 seconds."}
        </p>
        {listed.length > 0 && listed.length < tokens.length ? (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="rounded-full border border-border px-3 py-1.5 text-sm"
            aria-pressed={showAll}
          >
            {showAll ? "Hide unlisted" : "Show unlisted"}
          </button>
        ) : null}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-3 py-3 font-medium">Balance</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((token) => {
              const change = formatChange(token.change24h);
              return (
                <tr key={token.mint} className="border-t border-border">
                  <td className="px-5 py-3">
                    <a
                      href={solscanTokenUrl(token.mint, cluster)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3"
                    >
                      <TokenIcon src={token.icon} symbol={token.symbol} />
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {token.symbol}
                          {token.verified ? <span className="ml-2 text-xs text-positive">Verified</span> : null}
                          {token.frozen ? <span className="ml-2 text-xs text-danger">Frozen</span> : null}
                        </span>
                        <span className="block truncate text-xs text-muted">{token.name}</span>
                      </span>
                    </a>
                  </td>
                  <td className="px-3 py-3 font-mono">{formatTokenAmount(token.amount, token.decimals)}</td>
                  <td className="px-3 py-3 font-mono">
                    {formatUsd(token.usdPrice)}
                    {change ? <span className="ml-2 text-xs text-muted">{change}</span> : null}
                  </td>
                  <td className="px-5 py-3 font-mono">{formatUsd(token.usdValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
