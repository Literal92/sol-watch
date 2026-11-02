import type { Cluster } from "@/lib/cluster";

export type ActivityStatus = "success" | "failed";

export type ActivityRow = {
  signature: string;
  time: number | null;
  status: ActivityStatus;
  confirmation: string | null;
};

export type TokenRow = {
  mint: string;
  name: string;
  symbol: string;
  icon: string | null;
  verified: boolean;
  frozen: boolean;
  amount: string;
  decimals: number;
  uiAmount: number;
  usdPrice: number | null;
  usdValue: number | null;
  change24h: number | null;
};

export type Portfolio = {
  address: string;
  cluster: Cluster;
  sol: number;
  lamports: string;
  solPriceUsd: number | null;
  solChange24h: number | null;
  solUsd: number | null;
  tokenUsd: number | null;
  portfolioUsd: number | null;
  tokens: TokenRow[];
  hiddenZeroBalances: number;
  unpricedTokens: number;
  activity: ActivityRow[];
  warnings: string[];
  fetchedAt: number;
};

export type HistoryPoint = {
  t: number;
  sol: number;
};

export type BalanceHistory = {
  points: HistoryPoint[];
  sampled: number;
  available: number;
};
