import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { randomUUID } from "node:crypto";
import { apiEnvSchema, parseEnv } from "@monsave/config";
import { authRoutes } from "./modules/auth.js";
import { circleRoutes } from "./modules/circles.js";
import { healthRoutes } from "./modules/health.js";
import { notificationRoutes } from "./modules/notifications.js";
import { adminRoutes } from "./modules/admin.js";

/**
 * MonSave API.
 * The blockchain is authoritative for all financial state; this API serves
 * profiles, sessions, invitations, notifications, read models and ops data.
 * It can never fabricate blockchain success or override contract balances.
 */
async function main() {
  // Fail fast and loud on missing configuration — never start half-configured.
  const env = parseEnv(apiEnvSchema, process.env);

  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      redact: ["req.headers.cookie", "req.headers.authorization"],
    },
    genReqId: () => randomUUID(), // correlation ids
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  await app.register(cookie, { secret: env.SESSION_SECRET });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: "1 minute",
  });

  await app.register(healthRoutes, { prefix: "/v1/health" });
  await app.register(authRoutes, { prefix: "/v1/auth", env });
  await app.register(circleRoutes, { prefix: "/v1/circles" });
  await app.register(notificationRoutes, { prefix: "/v1/notifications" });
  await app.register(adminRoutes, { prefix: "/v1/admin" });

  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err, reqId: req.id }, "request failed");
    const status = "statusCode" in err && typeof err.statusCode === "number" ? err.statusCode : 500;
    reply.status(status).send({
      error: status >= 500 ? "Internal error" : err.message,
      requestId: req.id,
    });
  });

  await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
  app.log.info(`MonSave API listening on :${env.API_PORT} (network: ${env.MONSAVE_NETWORK})`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal: API failed to start\n", err);
  process.exit(1);
});
