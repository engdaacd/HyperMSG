import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type SessionJwt = { sub: string; email: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionJwt) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifySession(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as SessionJwt;
}

export function createApiToken() {
  const raw = `nmsg_${crypto.randomBytes(32).toString("base64url")}`;
  return { raw, hash: hashApiToken(raw), last4: raw.slice(-4) };
}

export function hashApiToken(raw: string) {
  return crypto.createHmac("sha256", env.API_TOKEN_PEPPER).update(raw).digest("hex");
}

export function signWebhookBody(body: string) {
  return crypto.createHmac("sha256", env.WEBHOOK_SIGNING_SECRET).update(body).digest("hex");
}
