import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../http/errors.js";
import { hashApiToken, verifySession } from "../services/security.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
      apiUser?: { id: string };
      apiTokenId?: string;
    }
  }
}

function bearer(req: Request) {
  const header = req.header("authorization") ?? "";
  const [scheme, value] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? value : undefined;
}

export async function requireDashboardAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = bearer(req);
    if (!token) throw new HttpError(401, "Missing bearer token");
    const payload = verifySession(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session"));
  }
}

export async function requireApiToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const raw = bearer(req) ?? req.header("x-api-key");
    if (!raw) throw new HttpError(401, "Missing API token");
    const token = await prisma.apiToken.findUnique({ where: { tokenHash: hashApiToken(raw) } });
    if (!token || token.revokedAt) throw new HttpError(401, "Invalid API token");
    req.apiUser = { id: token.userId };
    req.apiTokenId = token.id;
    next();
  } catch (err) {
    next(err);
  }
}
