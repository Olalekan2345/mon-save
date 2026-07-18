import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { getSession } from "./auth.js";

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const session = await getSession(req.cookies["monsave_session"]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    reply.send({ notifications });
  });

  app.post("/:id/read", async (req, reply) => {
    const session = await getSession(req.cookies["monsave_session"]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });
    const { id } = z.object({ id: z.string() }).parse(req.params);
    await prisma.notification.updateMany({
      where: { id, userId: session.userId },
      data: { readAt: new Date() },
    });
    reply.send({ ok: true });
  });

  app.put("/preferences", async (req, reply) => {
    const session = await getSession(req.cookies["monsave_session"]);
    if (!session) return reply.status(401).send({ error: "Not authenticated" });
    const body = z.object({ emailEnabled: z.boolean(), pushEnabled: z.boolean() }).parse(req.body);
    const pref = await prisma.notificationPreference.upsert({
      where: { userId: session.userId },
      update: body,
      create: { userId: session.userId, ...body },
    });
    reply.send({ preference: pref });
  });
}
