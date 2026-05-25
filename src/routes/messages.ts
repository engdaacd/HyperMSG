import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../http/errors.js";
import { requireApiToken } from "../middleware/auth.js";
import { sendQueue } from "../services/queues.js";
import { env } from "../config/env.js";

export const messagesRouter = Router();
messagesRouter.use(requireApiToken);
messagesRouter.use(rateLimit({ windowMs: 60_000, limit: env.MAX_SENDS_PER_MINUTE_PER_INSTANCE * 3 }));

const sendSchema = z.object({
  instanceId: z.string().uuid(),
  to: z.string().min(3),
  body: z.string().max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  filename: z.string().max(160).optional()
}).refine((v) => v.body || v.mediaUrl, { message: "body or mediaUrl is required" });

messagesRouter.post("/send", async (req, res, next) => {
  try {
    const body = sendSchema.parse(req.body);
    const instance = await prisma.instance.findFirst({ where: { id: body.instanceId, userId: req.apiUser!.id } });
    if (!instance) throw new HttpError(404, "Instance not found");
    if (instance.status !== "CONNECTED") throw new HttpError(409, "Instance is not connected");

    const log = await prisma.messageLog.create({
      data: {
        userId: req.apiUser!.id,
        instanceId: body.instanceId,
        direction: "OUTBOUND",
        status: "QUEUED",
        to: body.to,
        body: body.body,
        mediaUrl: body.mediaUrl
      }
    });
    await sendQueue.add("send", { messageId: log.id, userId: req.apiUser!.id, ...body }, { jobId: log.id });
    res.status(202).json({ id: log.id, status: "QUEUED" });
  } catch (err) {
    next(err);
  }
});

messagesRouter.get("/:id", async (req, res, next) => {
  try {
    const message = await prisma.messageLog.findFirst({ where: { id: req.params.id, userId: req.apiUser!.id } });
    if (!message) throw new HttpError(404, "Message not found");
    res.json(message);
  } catch (err) {
    next(err);
  }
});
