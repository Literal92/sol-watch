import { AddressSearch } from "@/components/address-search";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { clusterLabel, getCluster } from "@/lib/cluster";

export default function HomePage() {
  const cluster = getCluster();

  return (
    <div className="hero-wash">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-accent">{clusterLabel(cluster)} · public data only</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
            See a wallet without touching it.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted">
            Paste any Solana address, or connect Phantom or Solflare. SolWatch reads balances and
            recent activity. It cannot send, swap, or sign.
          </p>
        </div>
        <AddressSearch />
        <WatchlistPanel cluster={cluster} />
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className="font-medium">No secrets</p>
            <p className="mt-1 text-muted">The RPC URL stays on the server. Keys are never requested.</p>
          </li>
          <li className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className="font-medium">Devnet first</p>
            <p className="mt-1 text-muted">Switch clusters with NEXT_PUBLIC_CLUSTER and a matching RPC URL.</p>
          </li>
          <li className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className="font-medium">Local watchlist</p>
            <p className="mt-1 text-muted">Saved addresses and balance checks never leave this browser.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
