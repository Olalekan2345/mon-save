import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function healthRoutes(app: FastifyInstance) {
  /** Liveness: process is up. */
  app.get("/live", async (_req, reply) => {
    reply.send({ status: "ok", time: new Date().toISOString() });
  });

  /** Readiness: database reachable. Fails loudly rather than pretending. */
  app.get("/ready", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      reply.send({ status: "ready" });
    } catch {
      reply.status(503).send({ status: "not-ready", reason: "database unreachable" });
    }
  });
}
