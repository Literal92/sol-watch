import type { Metadata } from "next";
import { Suspense } from "react";
import { AddressSearch } from "@/components/address-search";
import { BalanceChart } from "@/components/balance-chart";
import { ChartSkeleton, DashboardSkeleton, PortfolioSkeleton } from "@/components/skeletons";
import { PortfolioView, WalletHeading } from "@/components/portfolio-view";
import { parseAddress } from "@/lib/address";
import { getCluster } from "@/lib/cluster";
import { shortenAddress } from "@/lib/format";
import { loadHistory, loadPortfolio } from "@/lib/wallet-data";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const parsed = parseAddress(address);
  return {
    title: parsed ? shortenAddress(parsed) : "Invalid address",
    description: parsed
      ? `Read-only SOL balance, tokens, and recent activity for ${parsed}.`
      : "That value is not a Solana address.",
  };
}

export default function WalletPage({ params }: Props) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <WalletScreen params={params} />
    </Suspense>
  );
}

async function WalletScreen({ params }: Props) {
  const { address } = await params;
  const parsed = parseAddress(address);
  if (!parsed) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">That address is not valid</h1>
        <p className="break-all font-mono text-sm text-muted">{address.slice(0, 120)}</p>
        <AddressSearch initialValue={address} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <WalletHeading address={parsed} cluster={getCluster()} />
      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioSection address={parsed} />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <HistorySection address={parsed} />
      </Suspense>
    </div>
  );
}

async function PortfolioSection({ address }: { address: string }) {
  const result = await loadPortfolio(address);
  if (!result.ok) {
    return (
      <div className="rounded-3xl border border-border bg-surface px-5 py-6" role="alert">
        <h2 className="text-lg font-semibold">Could not read this wallet</h2>
        <p className="mt-2 text-sm text-muted">{result.error}</p>
      </div>
    );
  }
  return <PortfolioView portfolio={result.portfolio} />;
}

async function HistorySection({ address }: { address: string }) {
  const history = await loadHistory(address);
  if (!history) return null;
  return (
    <BalanceChart
      cluster={getCluster()}
      address={address}
      serverPoints={history.points}
      sampled={history.sampled}
      available={history.available}
    />
  );
}
