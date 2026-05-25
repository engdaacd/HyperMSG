import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../http/errors.js";
import { hashPassword, signSession, verifyPassword } from "../services/security.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(10)
    }).parse(req.body);
    const user = await prisma.user.create({
      data: { email: body.email.toLowerCase(), passwordHash: await hashPassword(body.password) }
    });
    res.status(201).json({ token: signSession({ sub: user.id, email: user.email }), user: { id: user.id, email: user.email } });
  } catch (err: any) {
    if (err.code === "P2002") return next(new HttpError(409, "Email already registered"));
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }
    res.json({ token: signSession({ sub: user.id, email: user.email }), user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});
