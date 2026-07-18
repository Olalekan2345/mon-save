import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import { getSession } from "./auth.js";

/**
 * Admin/operations endpoints.
 * Access requires BOTH a valid wallet session AND an AdminUser row for that
 * address — never obscurity alone. Admins can observe and annotate; they have
 * no endpoint that can move funds, alter payout order or fake blockchain state
 * (such endpoints simply do not exist).
 */
async function requireAdmin(req: FastifyRequest) {
  const session = await getSession(req.cookies["monsave_session"]);
  if (!session) return null;
  const admin = await prisma.adminUser.findUnique({ where: { address: session.address } });
  if (!admin) return null;
  return { session, admin };
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    const ctx = await requireAdmin(req);
    if (!ctx) return reply.status(403).send({ error: "Admin access required" });
    (req as FastifyRequest & { admin: unknown }).admin = ctx.admin;
  });

  app.get("/overview", async (_req, reply) => {
    const [circles, events, jobs, flags] = await Promise.all([
      prisma.circle.count(),
      prisma.contractEvent.count(),
      prisma.settlementJob.count({ where: { status: "failed" } }),
      prisma.riskFlag.count({ where: { resolvedAt: null } }),
    ]);
    reply.send({ circles, indexedEvents: events, failedSettlementJobs: jobs, openRiskFlags: flags });
  });

  app.get("/settlement-jobs/failed", async (_req, reply) => {
    const jobs = await prisma.settlementJob.findMany({
      where: { status: "failed" },
      include: { circle: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    reply.send({ jobs });
  });

  app.get("/risk-flags", async (_req, reply) => {
    const flags = await prisma.riskFlag.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    reply.send({ flags });
  });

  app.get("/indexer-checkpoints", async (_req, reply) => {
    const checkpoints = await prisma.indexerCheckpoint.findMany();
    reply.send({ checkpoints });
  });

  app.get("/deployments", async (_req, reply) => {
    const deployments = await prisma.deploymentRecord.findMany({ orderBy: { deployedAt: "desc" } });
    reply.send({ deployments });
  });

  app.get("/audit-log", async (_req, reply) => {
    const entries = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { admin: { select: { address: true, role: true } } },
    });
    reply.send({ entries });
  });
}
