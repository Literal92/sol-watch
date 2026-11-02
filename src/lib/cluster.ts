export const CLUSTERS = ["devnet", "testnet", "mainnet-beta"] as const;

export type Cluster = (typeof CLUSTERS)[number];

export function getCluster(): Cluster {
  const raw = process.env.NEXT_PUBLIC_CLUSTER?.trim() || "devnet";
  if (raw === "mainnet" || raw === "mainnet-beta") return "mainnet-beta";
  if (raw === "testnet") return "testnet";
  return "devnet";
}

export function clusterLabel(cluster: Cluster): string {
  if (cluster === "mainnet-beta") return "Mainnet";
  if (cluster === "testnet") return "Testnet";
  return "Devnet";
}

export function solscanAccountUrl(account: string, cluster: Cluster): string {
  const base = `https://solscan.io/account/${account}`;
  return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
}

export function solscanTxUrl(signature: string, cluster: Cluster): string {
  const base = `https://solscan.io/tx/${signature}`;
  return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
}

export function solscanTokenUrl(mint: string, cluster: Cluster): string {
  const base = `https://solscan.io/token/${mint}`;
  return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
}

export function clusterMismatch(cluster: Cluster, rpcUrl: string): string | null {
  const lower = rpcUrl.toLowerCase();
  if (cluster === "devnet" && lower.includes("mainnet")) {
    return "NEXT_PUBLIC_CLUSTER is devnet, but SOLANA_RPC_URL looks like a mainnet endpoint.";
  }
  if (cluster === "mainnet-beta" && lower.includes("devnet")) {
    return "NEXT_PUBLIC_CLUSTER is mainnet, but SOLANA_RPC_URL looks like a devnet endpoint.";
  }
  if (cluster === "testnet" && (lower.includes("devnet") || lower.includes("mainnet"))) {
    return "NEXT_PUBLIC_CLUSTER is testnet, but SOLANA_RPC_URL looks like a different cluster.";
  }
  return null;
}
