import { describe, expect, it } from "vitest";
import { parseAddress } from "@/lib/address";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const EXAMPLE = "4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF";

describe("parseAddress", () => {
  it("accepts a Solana address", () => {
    expect(parseAddress(EXAMPLE)).toBe(EXAMPLE);
  });

  it("accepts the system program address", () => {
    expect(parseAddress(SYSTEM_PROGRAM)).toBe(SYSTEM_PROGRAM);
  });

  it("trims surrounding whitespace", () => {
    expect(parseAddress(`  ${EXAMPLE}  `)).toBe(EXAMPLE);
  });

  it("rejects empty and invalid input", () => {
    expect(parseAddress("")).toBeNull();
    expect(parseAddress("   ")).toBeNull();
    expect(parseAddress("not-an-address")).toBeNull();
    expect(parseAddress("0xabc")).toBeNull();
    expect(parseAddress("So111")).toBeNull();
  });
});
