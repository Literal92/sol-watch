import { clusterLabel, solscanAccountUrl, solscanTxUrl } from "@/lib/cluster";
import { formatChange, formatSol, formatUsd, formatUtc, shortenAddress } from "@/lib/format";
import type { Portfolio } from "@/lib/types";
import { CopyButton } from "@/components/copy-button";
import { RefreshButton } from "@/components/refresh-button";
import { TokenTable } from "@/components/token-table";
import { WatchButton } from "@/components/watch-button";

export function WalletHeading({ address, cluster }: { address: string; cluster: Portfolio["cluster"] }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">{clusterLabel(cluster)} account</p>
        <h1 className="mt-1 truncate font-mono text-lg sm:text-xl">{address}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton value={address} />
        <WatchButton cluster={cluster} address={address} />
        <a
          href={solscanAccountUrl(address, cluster)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-border px-3 py-1.5 text-sm"
        >
          Solscan
        </a>
      </div>
    </div>
  );
}

export function PortfolioView({ portfolio }: { portfolio: Portfolio }) {
  const solChange = formatChange(portfolio.solChange24h);

  return (
    <div className="flex flex-col gap-6">
      {portfolio.warnings.length > 0 ? (
        <ul className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          {portfolio.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="SOL balance"
          value={`${formatSol(portfolio.sol)} SOL`}
          hint={solChange ? `${solChange} · 24h` : `${portfolio.lamports} lamports`}
        />
        <Stat label="SOL value" value={formatUsd(portfolio.solUsd)} hint={portfolio.solPriceUsd ? `${formatUsd(portfolio.solPriceUsd)} / SOL` : "Price unavailable"} />
        <Stat
          label="Portfolio"
          value={formatUsd(portfolio.portfolioUsd)}
          hint={
            portfolio.tokenUsd === null
              ? "Token prices missing"
              : `${formatUsd(portfolio.tokenUsd)} in tokens`
          }
        />
      </div>

      <section className="rounded-3xl border border-border bg-surface">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5">
          <h2 className="text-lg font-semibold">Tokens</h2>
          <p className="text-sm text-muted">
            {portfolio.hiddenZeroBalances > 0
              ? `${portfolio.hiddenZeroBalances} empty accounts hidden`
              : "SPL and Token-2022"}
          </p>
        </div>
        {portfolio.tokens.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">No SPL tokens with a balance.</p>
        ) : (
          <TokenTable tokens={portfolio.tokens} cluster={portfolio.cluster} />
        )}
      </section>

      <section className="rounded-3xl border border-border bg-surface">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="text-sm text-muted">Times are UTC</p>
        </div>
        {portfolio.activity.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">No recent transactions for this address.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Signature</th>
                  <th className="px-3 py-3 font-medium">Time</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.activity.map((row) => (
                  <tr key={row.signature} className="border-t border-border">
                    <td className="px-5 py-3 font-mono" title={row.signature}>
                      {shortenAddress(row.signature, 8)}
                    </td>
                    <td className="px-3 py-3">{row.time === null ? "—" : formatUtc(row.time * 1000)}</td>
                    <td className="px-3 py-3">
                      <span className={row.status === "success" ? "text-positive" : "text-danger"}>
                        {row.status === "success" ? "Success" : "Failed"}
                      </span>
                      {row.confirmation ? (
                        <span className="ml-2 text-xs text-muted">{row.confirmation}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={solscanTxUrl(row.signature, portfolio.cluster)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-border underline-offset-4"
                      >
                        Solscan
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>Updated {formatUtc(portfolio.fetchedAt)} UTC. Prices refresh about every 60 seconds.</p>
        <RefreshButton />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <section className="rounded-3xl border border-border bg-surface px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </section>
  );
}
