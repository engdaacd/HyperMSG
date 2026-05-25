import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireDashboardAuth } from "../middleware/auth.js";
import { createApiToken, hashApiToken } from "../services/security.js";
import { HttpError } from "../http/errors.js";
import { sendViaWhatsApp, startWhatsAppInstance } from "../adapters/whatsapp.js";
import { webhookQueue } from "../services/queues.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireDashboardAuth);

function chatbotSetupError(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && ["P2021", "P2022"].includes(err.code)) {
    return new HttpError(503, "Chatbot database table is missing. Run: npx prisma migrate deploy");
  }
  return err;
}

dashboardRouter.get("/me", (req, res) => {
  res.json({ user: req.user });
});

dashboardRouter.get("/tokens", async (req, res) => {
  const tokens = await prisma.apiToken.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, last4: true, revokedAt: true, createdAt: true }
  });
  res.json({ data: tokens });
});

dashboardRouter.post("/tokens", async (req, res) => {
  const body = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
  const token = createApiToken();
  const record = await prisma.apiToken.create({
    data: { userId: req.user!.id, name: body.name, tokenHash: token.hash, last4: token.last4 }
  });
  res.status(201).json({ id: record.id, name: record.name, token: token.raw, last4: record.last4 });
});

dashboardRouter.delete("/tokens/:id", async (req, res) => {
  await prisma.apiToken.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { revokedAt: new Date(), tokenHash: `${hashApiToken(req.params.id)}:revoked:${Date.now()}` }
  });
  res.status(204).send();
});

dashboardRouter.get("/webhooks", async (req, res) => {
  const data = await prisma.webhookEndpoint.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});

dashboardRouter.post("/webhooks", async (req, res) => {
  const body = z.object({
    url: z.string().url(),
    events: z.array(z.string()).default(["message.received", "message.status"])
  }).parse(req.body);
  const item = await prisma.webhookEndpoint.create({ data: { userId: req.user!.id, ...body } });
  res.status(201).json(item);
});

dashboardRouter.patch("/webhooks/:id", async (req, res) => {
  const body = z.object({ enabled: z.boolean().optional(), url: z.string().url().optional(), events: z.array(z.string()).optional() }).parse(req.body);
  const item = await prisma.webhookEndpoint.update({ where: { id: req.params.id }, data: body });
  res.json(item);
});

dashboardRouter.get("/messages", async (req, res) => {
  const data = await prisma.messageLog.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(req.query.limit ?? 100), 500)
  });
  res.json({ data });
});

dashboardRouter.get("/chatbot-rules", async (req, res, next) => {
  try {
    const data = await prisma.chatbotRule.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }]
    });
    res.json({ data });
  } catch (err) {
    next(chatbotSetupError(err));
  }
});

dashboardRouter.post("/chatbot-rules", async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(1).max(80),
      instanceId: z.string().uuid().optional().or(z.literal("")),
      matchType: z.enum(["CONTAINS", "EXACT", "STARTS_WITH", "DEFAULT"]).default("CONTAINS"),
      trigger: z.string().max(500).default(""),
      response: z.string().min(1).max(4096),
      priority: z.coerce.number().int().min(1).max(10000).default(100),
      enabled: z.boolean().default(true)
    }).parse(req.body);

    if (body.matchType !== "DEFAULT" && !body.trigger.trim()) {
      throw new HttpError(400, "Trigger is required unless match type is DEFAULT");
    }

    if (body.instanceId) {
      const instance = await prisma.instance.findFirst({
        where: { id: body.instanceId, userId: req.user!.id }
      });
      if (!instance) throw new HttpError(404, "Instance not found");
    }

    const item = await prisma.chatbotRule.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        instanceId: body.instanceId || null,
        matchType: body.matchType,
        trigger: body.matchType === "DEFAULT" ? "" : body.trigger,
        response: body.response,
        priority: body.priority,
        enabled: body.enabled
      }
    });
    res.status(201).json(item);
  } catch (err) {
    next(chatbotSetupError(err));
  }
});

dashboardRouter.patch("/chatbot-rules/:id", async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(1).max(80).optional(),
      instanceId: z.string().uuid().optional().nullable().or(z.literal("")),
      matchType: z.enum(["CONTAINS", "EXACT", "STARTS_WITH", "DEFAULT"]).optional(),
      trigger: z.string().max(500).optional(),
      response: z.string().min(1).max(4096).optional(),
      priority: z.coerce.number().int().min(1).max(10000).optional(),
      enabled: z.boolean().optional()
    }).parse(req.body);

    const existing = await prisma.chatbotRule.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!existing) throw new HttpError(404, "Chatbot rule not found");

    const nextMatchType = body.matchType ?? existing.matchType;
    const nextTrigger = body.trigger ?? existing.trigger;
    if (nextMatchType !== "DEFAULT" && !nextTrigger.trim()) {
      throw new HttpError(400, "Trigger is required unless match type is DEFAULT");
    }

    if (body.instanceId) {
      const instance = await prisma.instance.findFirst({
        where: { id: body.instanceId, userId: req.user!.id }
      });
      if (!instance) throw new HttpError(404, "Instance not found");
    }

    const item = await prisma.chatbotRule.update({
      where: { id: req.params.id },
      data: {
        ...body,
        instanceId: body.instanceId === "" ? null : body.instanceId,
        trigger: nextMatchType === "DEFAULT" ? "" : body.trigger
      }
    });
    res.json(item);
  } catch (err) {
    next(chatbotSetupError(err));
  }
});

dashboardRouter.delete("/chatbot-rules/:id", async (req, res, next) => {
  try {
    await prisma.chatbotRule.deleteMany({
      where: { id: req.params.id, userId: req.user!.id }
    });
    res.status(204).send();
  } catch (err) {
    next(chatbotSetupError(err));
  }
});

dashboardRouter.post("/test-message", async (req, res, next) => {
  try {
    const body = z.object({
      instanceId: z.string().uuid(),
      to: z.string().min(3),
      body: z.string().min(1).max(4096)
    }).parse(req.body);

    const instance = await prisma.instance.findFirst({
      where: { id: body.instanceId, userId: req.user!.id }
    });
    if (!instance) throw new HttpError(404, "Instance not found");
    if (instance.status !== "CONNECTED") {
      throw new HttpError(409, "Instance is not connected. Scan the QR code first, then try again.");
    }

    const log = await prisma.messageLog.create({
      data: {
        userId: req.user!.id,
        instanceId: body.instanceId,
        direction: "OUTBOUND",
        status: "QUEUED",
        to: body.to,
        body: body.body
      }
    });

    try {
      let providerId: string | undefined;
      try {
        providerId = await sendViaWhatsApp(body);
      } catch (err: any) {
        if (!String(err.message).includes("not running")) throw err;
        await startWhatsAppInstance(body.instanceId);
        providerId = await sendViaWhatsApp(body);
      }

      const sent = await prisma.messageLog.update({
        where: { id: log.id },
        data: { status: "SENT", providerId }
      });

      await webhookQueue.add("message.status", {
        userId: req.user!.id,
        event: "message.status",
        payload: { id: sent.id, instanceId: sent.instanceId, status: sent.status, to: sent.to, providerId }
      });

      res.status(200).json({ id: sent.id, status: sent.status, providerId });
    } catch (err: any) {
      await prisma.messageLog.update({
        where: { id: log.id },
        data: { status: "FAILED", error: err.message }
      });
      throw new HttpError(502, `WhatsApp send failed: ${err.message}`);
    }
  } catch (err) {
    next(err);
  }
});
