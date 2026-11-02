import { cache } from "react";
import {
  address,
  createSolanaRpc,
  type Address,
  type Signature,
} from "@solana/kit";
import { parseAddress } from "@/lib/address";
import { clusterMismatch, getCluster, type Cluster } from "@/lib/cluster";
import { lamportsToSol, tokenUiNumber } from "@/lib/format";
import { getMarkets, getTokenProfiles, WSOL_MINT } from "@/lib/prices";
import type { ActivityRow, BalanceHistory, Portfolio, TokenRow } from "@/lib/types";

const TOKEN_PROGRAM = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022 = address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const HISTORY_SAMPLE = 8;
const TOKEN_CAP = 100;

type RawHolding = {
  mint: string;
  amount: bigint;
  decimals: number;
  frozen: boolean;
};

type AccountBundle = {
  cluster: Cluster;
  sol: number;
  lamports: string;
  activity: ActivityRow[];
  holdings: RawHolding[];
  hiddenZeroBalances: number;
  warnings: string[];
};

export type WalletLoad =
  | { ok: true; bundle: AccountBundle }
  | { ok: false; error: string };

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "The RPC request failed.";
  if (/429|rate limit|too many requests/i.test(message)) {
    return "The RPC rate limit was hit. Set SOLANA_RPC_URL to a Helius, QuickNode, or other provider URL and try again.";
  }
  return message.length > 280 ? `${message.slice(0, 277)}...` : message;
}

function rpcClient() {
  const url = process.env.SOLANA_RPC_URL?.trim();
  if (!url) return null;
  return { url, client: createSolanaRpc(url) };
}

async function readHoldings(
  client: ReturnType<typeof createSolanaRpc>,
  owner: Address,
  programId: Address,
): Promise<RawHolding[]> {
  const response = await client
    .getTokenAccountsByOwner(owner, { programId }, { encoding: "jsonParsed", commitment: "confirmed" })
    .send();

  const holdings: RawHolding[] = [];
  for (const item of response.value) {
    const parsed = item.account.data.parsed;
    if (parsed.type !== "account") continue;
    const info = parsed.info;
    holdings.push({
      mint: info.mint,
      amount: BigInt(info.tokenAmount.amount),
      decimals: info.tokenAmount.decimals,
      frozen: info.state === "frozen",
    });
  }
  return holdings;
}

function mergeHoldings(rows: readonly RawHolding[]): RawHolding[] {
  const byMint = new Map<string, RawHolding>();
  for (const row of rows) {
    const existing = byMint.get(row.mint);
    if (!existing) {
      byMint.set(row.mint, { ...row });
      continue;
    }
    existing.amount += row.amount;
    existing.frozen = existing.frozen || row.frozen;
  }
  return [...byMint.values()];
}

export const loadAccount = cache(async (walletAddress: string): Promise<WalletLoad> => {
  const parsed = parseAddress(walletAddress);
  if (!parsed) return { ok: false, error: "That is not a valid Solana address." };

  const connection = rpcClient();
  if (!connection) {
    return {
      ok: false,
      error: "Add SOLANA_RPC_URL to .env.local before looking up wallets. Copy .env.example to start.",
    };
  }

  const cluster = getCluster();
  const warnings: string[] = [];
  const mismatch = clusterMismatch(cluster, connection.url);
  if (mismatch) warnings.push(mismatch);

  const owner = address(parsed);
  const { client } = connection;

  const [balanceResult, signatureResult, splResult, token2022Result] = await Promise.allSettled([
    client.getBalance(owner, { commitment: "confirmed" }).send(),
    client.getSignaturesForAddress(owner, { limit: 20, commitment: "confirmed" }).send(),
    readHoldings(client, owner, TOKEN_PROGRAM),
    readHoldings(client, owner, TOKEN_2022),
  ]);

  if (balanceResult.status === "rejected") {
    return { ok: false, error: toErrorMessage(balanceResult.reason) };
  }

  const lamports = balanceResult.value.value;
  const activity: ActivityRow[] =
    signatureResult.status === "fulfilled"
      ? signatureResult.value.map((tx) => ({
          signature: tx.signature,
          time: tx.blockTime === null ? null : Number(tx.blockTime),
          status: tx.err ? "failed" : "success",
          confirmation: tx.confirmationStatus,
        }))
      : [];

  if (signatureResult.status === "rejected") {
    warnings.push("Recent transactions could not be loaded.");
  }

  const holdings: RawHolding[] = [];
  if (splResult.status === "fulfilled") holdings.push(...splResult.value);
  else warnings.push("SPL token accounts could not be loaded.");
  if (token2022Result.status === "fulfilled") holdings.push(...token2022Result.value);
  else warnings.push("Token-2022 accounts could not be loaded.");

  const merged = mergeHoldings(holdings);
  const funded = merged.filter((row) => row.amount > 0n);
  const hiddenZeroBalances = merged.length - funded.length;
  funded.sort(
    (a, b) => tokenUiNumber(b.amount, b.decimals) - tokenUiNumber(a.amount, a.decimals),
  );
  const capped = funded.slice(0, TOKEN_CAP);
  if (funded.length > TOKEN_CAP) {
    warnings.push(`Showing ${TOKEN_CAP} token accounts with the largest balances.`);
  }

  return {
    ok: true,
    bundle: {
      cluster,
      sol: lamportsToSol(lamports),
      lamports: lamports.toString(),
      activity,
      holdings: capped,
      hiddenZeroBalances,
      warnings,
    },
  };
});

export async function loadPortfolio(walletAddress: string): Promise<
  | { ok: true; portfolio: Portfolio }
  | { ok: false; error: string }
> {
  const loaded = await loadAccount(walletAddress);
  if (!loaded.ok) return loaded;

  const { bundle } = loaded;
  const mints = bundle.holdings.map((row) => row.mint);
  const [markets, profiles] = await Promise.all([getMarkets(mints), getTokenProfiles(mints)]);
  const warnings = [...bundle.warnings];
  if (Object.keys(markets).length === 0) {
    warnings.push("USD prices are unavailable right now. Balances are still shown.");
  }

  const solMarket = markets[WSOL_MINT];
  const solPriceUsd = solMarket?.usdPrice ?? null;
  const solChange24h = solMarket?.change24h ?? null;
  const solUsd = solPriceUsd === null ? null : bundle.sol * solPriceUsd;

  let tokenUsd = 0;
  let pricedTokens = 0;
  const tokens: TokenRow[] = bundle.holdings.map((row) => {
    const profile = profiles[row.mint];
    const market = markets[row.mint];
    const uiAmount = tokenUiNumber(row.amount, row.decimals);
    const usdPrice = market?.usdPrice ?? null;
    const usdValue = usdPrice === null ? null : uiAmount * usdPrice;
    if (usdValue !== null) {
      tokenUsd += usdValue;
      pricedTokens += 1;
    }
    return {
      mint: row.mint,
      name: profile?.name ?? "Unknown token",
      symbol: profile?.symbol ?? row.mint.slice(0, 4),
      icon: profile?.icon ?? null,
      verified: profile?.verified ?? false,
      frozen: row.frozen,
      amount: row.amount.toString(),
      decimals: row.decimals,
      uiAmount,
      usdPrice,
      usdValue,
      change24h: market?.change24h ?? null,
    };
  });

  tokens.sort((a, b) => (b.usdValue ?? -1) - (a.usdValue ?? -1) || b.uiAmount - a.uiAmount);
  const unpricedTokens = tokens.length - pricedTokens;
  const portfolioUsd =
    solUsd === null && pricedTokens === 0 ? null : (solUsd ?? 0) + tokenUsd;

  if (bundle.cluster !== "mainnet-beta") {
    warnings.push(
      "USD prices come from mainnet markets. Devnet and testnet mints usually have no listed price. SOL is still priced.",
    );
  }

  return {
    ok: true,
    portfolio: {
      address: walletAddress,
      cluster: bundle.cluster,
      sol: bundle.sol,
      lamports: bundle.lamports,
      solPriceUsd,
      solChange24h,
      solUsd,
      tokenUsd: pricedTokens === 0 ? null : tokenUsd,
      portfolioUsd,
      tokens,
      hiddenZeroBalances: bundle.hiddenZeroBalances,
      unpricedTokens,
      activity: bundle.activity,
      warnings,
      fetchedAt: Date.now(),
    },
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

export async function loadHistory(walletAddress: string): Promise<BalanceHistory | null> {
  const loaded = await loadAccount(walletAddress);
  if (!loaded.ok) return null;

  const connection = rpcClient();
  if (!connection) return null;

  const owner = address(walletAddress);
  const sample = loaded.bundle.activity.slice(0, HISTORY_SAMPLE);
  const points: { t: number; sol: number }[] = [];

  await mapPool(sample, 4, async (row) => {
    if (row.time === null) return;
    const tx = await withTimeout(
      connection.client
        .getTransaction(row.signature as Signature, {
          encoding: "json",
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        })
        .send(),
      2500,
    );
    if (!tx?.meta) return;
    const loadedKeys = "loadedAddresses" in tx.meta ? tx.meta.loadedAddresses : undefined;
    const keys = [
      ...tx.transaction.message.accountKeys,
      ...(loadedKeys?.writable ?? []),
      ...(loadedKeys?.readonly ?? []),
    ];
    const index = keys.findIndex((key) => key === owner);
    const balance = tx.meta.postBalances[index];
    if (index < 0 || balance === undefined) return;
    points.push({ t: row.time * 1000, sol: lamportsToSol(balance) });
  });

  points.push({ t: Date.now(), sol: loaded.bundle.sol });
  points.sort((a, b) => a.t - b.t);

  return {
    points,
    sampled: sample.length,
    available: loaded.bundle.activity.length,
  };
}

async function mapPool<T>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (item !== undefined) await task(item);
    }
  });
  await Promise.all(workers);
}
