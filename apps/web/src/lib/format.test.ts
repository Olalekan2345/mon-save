import { describe, expect, it } from "vitest";
import { formatToken, shortAddress, frequencyLabel } from "./format";

describe("formatToken", () => {
  it("formats 6-decimal amounts with separators", () => {
    expect(formatToken(100_000_000n, 6)).toBe("100");
    expect(formatToken(1_234_567_890n, 6)).toBe("1,234.56789");
  });
  it("formats 18-decimal amounts", () => {
    expect(formatToken(1_000_000_000_000_000_000n, 18)).toBe("1");
  });
  it("appends the symbol when given", () => {
    expect(formatToken(20_000_000n, 6, "tUSD")).toBe("20 tUSD");
  });
  it("handles zero", () => {
    expect(formatToken(0n, 6)).toBe("0");
  });
});

describe("shortAddress", () => {
  it("truncates the middle", () => {
    expect(shortAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234…5678");
  });
});

describe("frequencyLabel", () => {
  it("names common frequencies", () => {
    expect(frequencyLabel(86400)).toBe("Daily");
    expect(frequencyLabel(604800)).toBe("Weekly");
    expect(frequencyLabel(2592000)).toBe("Monthly");
  });
});
