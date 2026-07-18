/**
 * Zod-validated environment configuration.
 * Production startup MUST fail clearly when mandatory configuration is missing —
 * never fall back silently, never swap networks behind the user's back.
 */
import { z } from "zod";

const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "must be a 0x-prefixed 20-byte hex address")
  .transform((v) => v as `0x${string}`);

export const networkSchema = z.enum(["monad-mainnet", "monad-testnet", "local"]);

/** Shared by web/api/worker/indexer. */
export const baseEnvSchema = z.object({
  MONSAVE_NETWORK: networkSchema,
  MONAD_RPC_URL: z.string().url(),
  MONAD_RPC_FALLBACK_URL: z.string().url().optional(),
  MONAD_RPC_WS_URL: z.string().url().optional(),
  RPC_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  RPC_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  CONFIRMATIONS: z.coerce.number().int().min(1).max(64).default(2),
  CIRCLE_FACTORY_ADDRESS: address.optional(),
});

export const apiEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 chars"),
  COOKIE_DOMAIN: z.string().optional(),
  API_PORT: z.coerce.number().int().default(4000),
  CORS_ORIGIN: z.string().url(),
  SIWE_DOMAIN: z.string().min(1),
  SIWE_URI: z.string().url(),
  RATE_LIMIT_MAX: z.coerce.number().int().default(60),
  SENTRY_DSN: z.string().url().optional(),
});

export const workerEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  /**
   * Encrypted keystore path + password env for the automation signer.
   * The signer has minimal privileges: it can only call permissionless
   * settleRound() — it holds no protocol roles and no user principal.
   */
  AUTOMATION_KEYSTORE_PATH: z.string().optional(),
  AUTOMATION_KEYSTORE_PASSWORD_ENV: z.string().optional(),
  SETTLEMENT_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  SETTLEMENT_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(5),
});

export const webEnvSchema = z.object({
  NEXT_PUBLIC_MONSAVE_NETWORK: networkSchema,
  NEXT_PUBLIC_MONAD_RPC_URL: z.string().url(),
  NEXT_PUBLIC_CIRCLE_FACTORY_ADDRESS: address.optional(),
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

export function parseEnv<S extends z.ZodTypeAny>(schema: S, source: NodeJS.ProcessEnv): z.infer<S> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration — refusing to start:\n${issues}`);
  }
  return result.data;
}
