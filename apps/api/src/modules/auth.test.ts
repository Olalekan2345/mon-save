/**
 * Auth nonce-lifecycle contract tests.
 * These validate the SIWE flow rules without a live database by asserting the
 * message-validation logic; full integration tests run against a disposable
 * Postgres in CI (see docker-compose.yml).
 */
import { describe, expect, it } from "vitest";
import { SiweMessage, generateNonce } from "siwe";

describe("SIWE message validation rules", () => {
  it("generates unique, sufficiently long nonces", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(8);
  });

  it("parses a structured message with domain, chain and nonce", () => {
    const msg = new SiweMessage({
      domain: "localhost:3000",
      address: "0x0000000000000000000000000000000000000001",
      statement: "Sign in to MonSave",
      uri: "http://localhost:3000",
      version: "1",
      chainId: 10143,
      nonce: generateNonce(),
      issuedAt: new Date().toISOString(),
    });
    const text = msg.prepareMessage();
    const reparsed = new SiweMessage(text);
    expect(reparsed.domain).toBe("localhost:3000");
    expect(reparsed.chainId).toBe(10143);
    expect(reparsed.nonce).toBe(msg.nonce);
  });

  it("rejects malformed messages", () => {
    expect(() => new SiweMessage("not a siwe message")).toThrow();
  });
});
