import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";
import { SiweMessage, generateNonce } from "siwe";
import { z } from "zod";
import type { ApiEnv } from "@monsave/config";
import { prisma } from "../lib/prisma.js";

const SESSION_COOKIE = "monsave_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const NONCE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const verifySchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
});

/**
 * Wallet authentication (SIWE / EIP-4361):
 * 1. Server issues a cryptographically secure single-use nonce.
 * 2. Client signs a structured message (domain, uri, address, chainId, nonce,
 *    issuedAt, expirationTime).
 * 3. Server verifies signature + domain + chain, invalidates the nonce
 *    immediately, and issues an HTTP-only session cookie.
 * We never authenticate by trusting an address in a JSON body.
 */
export async function authRoutes(app: FastifyInstance, opts: { env: ApiEnv }) {
  const { env } = opts;

  app.get("/nonce", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (_req, reply) => {
    const nonce = generateNonce();
    await prisma.authNonce.create({
      data: { nonce, expiresAt: new Date(Date.now() + NONCE_TTL_MS) },
    });
    reply.send({ nonce });
  });

  app.post("/verify", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    const body = verifySchema.parse(req.body);
    const siwe = new SiweMessage(body.message);

    // Bind to our domain and the single active chain — reject anything else.
    const expectedChainId =
      env.MONSAVE_NETWORK === "monad-mainnet" ? 143 : env.MONSAVE_NETWORK === "monad-testnet" ? 10143 : 31337;
    if (siwe.domain !== env.SIWE_DOMAIN) return reply.status(401).send({ error: "Wrong domain" });
    if (siwe.chainId !== expectedChainId) return reply.status(401).send({ error: "Wrong chain" });

    // Single-use nonce: consume atomically before signature work completes.
    const nonceRow = await prisma.authNonce.findUnique({ where: { nonce: siwe.nonce } });
    if (!nonceRow || nonceRow.usedAt || nonceRow.expiresAt < new Date()) {
      return reply.status(401).send({ error: "Invalid or expired nonce" });
    }
    await prisma.authNonce.update({ where: { nonce: siwe.nonce }, data: { usedAt: new Date() } });

    const result = await siwe.verify({ signature: body.signature, domain: env.SIWE_DOMAIN, nonce: siwe.nonce });
    if (!result.success) return reply.status(401).send({ error: "Signature verification failed" });

    const address = siwe.address;
    // find-or-create user by wallet
    const wallet = await prisma.wallet.upsert({
      where: { address },
      update: {},
      create: {
        address,
        chainId: siwe.chainId,
        user: { create: {} },
      },
      include: { user: true },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.create({
      data: { token, userId: wallet.userId, address, chainId: siwe.chainId, expiresAt },
    });

    reply
      .setCookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: env.MONSAVE_NETWORK !== "local",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
        ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
      })
      .send({ address, userId: wallet.userId });
  });

  app.get("/session", async (req, reply) => {
    const session = await getSession(req.cookies[SESSION_COOKIE]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });
    reply.send({ address: session.address, userId: session.userId, expiresAt: session.expiresAt });
  });

  app.post("/logout", async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) {
      await prisma.session.updateMany({ where: { token }, data: { revokedAt: new Date() } });
    }
    reply.clearCookie(SESSION_COOKIE, { path: "/" }).send({ ok: true });
  });
}

export async function getSession(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  return session;
}
