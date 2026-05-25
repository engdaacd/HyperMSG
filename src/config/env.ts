import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32),
  API_TOKEN_PEPPER: z.string().min(16),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:4000"),
  WEBHOOK_SIGNING_SECRET: z.string().min(16),
  MAX_SENDS_PER_MINUTE_PER_INSTANCE: z.coerce.number().int().positive().default(20),
  ERPNEXT_URL: z.string().url().optional(),
  ERPNEXT_API_KEY: z.string().optional(),
  ERPNEXT_API_SECRET: z.string().optional(),
  ERPNEXT_BRIDGE_SECRET: z.string().min(16).optional()
});

export const env = schema.parse(process.env);
