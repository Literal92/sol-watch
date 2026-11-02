import { cacheLife } from "next/cache";

export const WSOL_MINT = "So11111111111111111111111111111111111111112";

export type Market = {
  usdPrice: number | null;
  change24h: number | null;
};

export type TokenProfile = {
  name: string;
  symbol: string;
  icon: string | null;
  verified: boolean;
};

type PriceRow = {
  usdPrice?: unknown;
  priceChange24h?: unknown;
};

type SearchToken = {
  id?: unknown;
  name?: unknown;
  symbol?: unknown;
  icon?: unknown;
  isVerified?: unknown;
};

function jupiterHeaders(): HeadersInit {
  const key = process.env.JUPITER_API_KEY?.trim();
  return key ? { "x-api-key": key } : {};
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function chunks(ids: readonly string[], size: number): string[][] {
  const groups: string[][] = [];
  for (let index = 0; index < ids.length; index += size) {
    groups.push(ids.slice(index, index + size));
  }
  return groups;
}

async function readMarkets(ids: string): Promise<Record<string, Market>> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });

  const mints = ids.split(",").filter(Boolean);
  const markets: Record<string, Market> = {};
  if (mints.length === 0) return markets;

  try {
    for (const group of chunks(mints, 50)) {
      const response = await fetch(`https://api.jup.ag/price/v3?ids=${group.join(",")}`, {
        headers: jupiterHeaders(),
      });
      if (!response.ok) continue;
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) continue;
      for (const mint of group) {
        const row = (body as Record<string, PriceRow>)[mint];
        markets[mint] = {
          usdPrice: asNumber(row?.usdPrice),
          change24h: asNumber(row?.priceChange24h),
        };
      }
    }
  } catch {
    return markets;
  }

  return markets;
}

async function readProfiles(ids: string): Promise<Record<string, TokenProfile>> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });

  const mints = ids.split(",").filter(Boolean);
  const profiles: Record<string, TokenProfile> = {};
  if (mints.length === 0) return profiles;

  try {
    for (const group of chunks(mints, 100)) {
      const response = await fetch(
        `https://api.jup.ag/tokens/v2/search?query=${group.join(",")}`,
        { headers: jupiterHeaders() },
      );
      if (!response.ok) continue;
      const body: unknown = await response.json();
      if (!Array.isArray(body)) continue;
      for (const entry of body as SearchToken[]) {
        if (typeof entry.id !== "string") continue;
        profiles[entry.id] = {
          name: typeof entry.name === "string" && entry.name ? entry.name : "Unknown token",
          symbol: typeof entry.symbol === "string" && entry.symbol ? entry.symbol : "???",
          icon: typeof entry.icon === "string" ? entry.icon : null,
          verified: entry.isVerified === true,
        };
      }
    }
  } catch {
    return profiles;
  }

  return profiles;
}

export async function getMarkets(mints: readonly string[]): Promise<Record<string, Market>> {
  const ids = [...new Set([WSOL_MINT, ...mints])].sort().join(",");
  return readMarkets(ids);
}

export async function getTokenProfiles(
  mints: readonly string[],
): Promise<Record<string, TokenProfile>> {
  const ids = [...new Set(mints)].sort().join(",");
  return readProfiles(ids);
}
