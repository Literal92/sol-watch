import { address } from "@solana/kit";

/** Returns the canonical address, or null when the input is not a Solana address. */
export function parseAddress(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return address(trimmed);
  } catch {
    return null;
  }
}
