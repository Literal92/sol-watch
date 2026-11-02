import { describe, expect, it } from "vitest";
import { lamportsToSol } from "@/lib/format";

describe("lamportsToSol", () => {
  it("converts one SOL", () => {
    expect(lamportsToSol(1_000_000_000n)).toBe(1);
  });

  it("converts fractional SOL", () => {
    expect(lamportsToSol(1_500_000_000n)).toBe(1.5);
  });

  it("converts a single lamport", () => {
    expect(lamportsToSol(1n)).toBe(1e-9);
  });

  it("converts zero", () => {
    expect(lamportsToSol(0n)).toBe(0);
  });
});
