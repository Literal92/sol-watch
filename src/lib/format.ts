const LAMPORTS_PER_SOL = 1_000_000_000;

const solFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const tinyUsdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 6,
});

const utcFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Convert lamports to SOL. `Number(bigint)` is exact for normal wallet balances. */
export function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

export function formatSol(sol: number): string {
  if (!Number.isFinite(sol)) return "—";
  if (sol !== 0 && Math.abs(sol) < 0.0001) return sol.toExponential(2);
  return solFormat.format(sol);
}

export function formatUsd(usd: number | null): string {
  if (usd === null || !Number.isFinite(usd)) return "—";
  if (usd !== 0 && Math.abs(usd) < 0.01) return tinyUsdFormat.format(usd);
  return usdFormat.format(usd);
}

export function formatChange(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function shortenAddress(value: string, chars = 4): string {
  if (value.length <= chars * 2 + 1) return value;
  return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}

export function formatUtc(ms: number): string {
  return utcFormat.format(new Date(ms));
}

export function formatTokenAmount(amount: string, decimals: number): string {
  const text = rawToUiString(amount, decimals);
  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  const [whole = "0", frac = ""] = unsigned.split(".");
  if (whole.length > 15) return text;
  const grouped = Number(whole).toLocaleString("en-US");
  const shown = frac.slice(0, 6);
  const body = shown ? `${grouped}.${shown}` : grouped;
  return negative ? `-${body}` : body;
}

export function rawToUiString(amount: string, decimals: number): string {
  const negative = amount.startsWith("-");
  const digits = (negative ? amount.slice(1) : amount).replace(/\D/g, "") || "0";
  if (decimals <= 0) {
    const whole = digits.replace(/^0+(?=\d)/, "");
    return negative && whole !== "0" ? `-${whole}` : whole;
  }
  const padded = digits.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals).replace(/^0+(?=\d)/, "");
  const frac = padded.slice(-decimals).replace(/0+$/, "");
  const body = frac ? `${whole}.${frac}` : whole;
  return negative && body !== "0" ? `-${body}` : body;
}

export function tokenUiNumber(amount: bigint, decimals: number): number {
  if (decimals <= 0) return Number(amount);
  return Number(amount) / 10 ** decimals;
}
