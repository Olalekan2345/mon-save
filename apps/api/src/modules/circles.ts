import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { getSession } from "./auth.js";

const paginationSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Read-optimized circle metadata + indexed events.
 * Financial truth lives onchain; these endpoints serve names, descriptions,
 * invitations and indexed history. They never override contract state.
 */
export async function circleRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const session = await getSession(req.cookies["monsave_session"]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });

    const { offset, limit } = paginationSchema.parse(req.query);
    const circles = await prisma.circle.findMany({
      where: { members: { some: { address: session.address } } },
      include: { members: true },
      orderBy: { createdAtBlock: "desc" },
      skip: offset,
      take: limit,
    });
    reply.send({ circles, offset, limit });
  });

  app.get("/:address/events", async (req, reply) => {
    const params = z.object({ address: z.string().regex(/^0x[0-9a-fA-F]{40}$/) }).parse(req.params);
    const { offset, limit } = paginationSchema.parse(req.query);
    const events = await prisma.contractEvent.findMany({
      where: { contract: params.address.toLowerCase(), confirmed: true },
      orderBy: [{ blockNumber: "desc" }, { logIndex: "desc" }],
      skip: offset,
      take: limit,
    });
    reply.send({ events, offset, limit });
  });

  app.get("/transactions/mine", async (req, reply) => {
    const session = await getSession(req.cookies["monsave_session"]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });
    const { offset, limit } = paginationSchema.parse(req.query);
    const transactions = await prisma.indexedTransaction.findMany({
      where: { from: session.address },
      orderBy: { blockNumber: "desc" },
      skip: offset,
      take: limit,
    });
    reply.send({ transactions, offset, limit });
  });
}
