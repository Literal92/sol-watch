"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/format";
import { ThemeToggle } from "@/components/theme-toggle";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-contrast">
        Connect
      </span>
    ),
  },
);

export function SiteHeader({
  clusterLabel,
  walletEnabled,
}: {
  clusterLabel: string;
  walletEnabled: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Mark />
          SolWatch
        </Link>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
          {clusterLabel}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {walletEnabled ? <WalletControls /> : null}
        </div>
      </div>
    </header>
  );
}

function WalletControls() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const armed = useRef(false);
  const wasConnected = useRef(connected);
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    if (!wasConnected.current && connected && address && armed.current) {
      armed.current = false;
      router.push(`/wallet/${address}`);
    }
    wasConnected.current = connected;
  }, [address, connected, router]);

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <Link href={`/wallet/${address}`} className="hidden font-mono text-sm sm:inline">
          {shortenAddress(address, 4)}
        </Link>
      ) : null}
      <WalletMultiButton
        onClick={() => {
          armed.current = true;
        }}
      />
    </div>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="var(--surface-2)" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" fill="var(--accent)" />
      <path d="M16 16 V10" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
