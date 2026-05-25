import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { sendViaWhatsApp, startWhatsAppInstance } from "../adapters/whatsapp.js";
import { createWhatsappCommunication } from "../services/erpnext.js";
import { signWebhookBody } from "../services/security.js";

export const integrationsRouter = Router();

function requireBridgeSecret(reqSecret: string | undefined) {
  if (!env.ERPNEXT_BRIDGE_SECRET) throw new HttpError(503, "ERPNext bridge secret is not configured");
  if (reqSecret !== env.ERPNEXT_BRIDGE_SECRET) throw new HttpError(401, "Invalid ERPNext bridge secret");
}

function verifyHyperMSGWebhook(req: any) {
  const signature = req.header("x-hypermsg-signature") ?? req.header("x-nextmsg-signature");
  if (!signature) throw new HttpError(401, "Missing webhook signature");
  const expected = signWebhookBody(req.rawBody ?? JSON.stringify(req.body));
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new HttpError(401, "Invalid webhook signature");
  }
}

integrationsRouter.post("/erpnext/send", async (req, res, next) => {
  try {
    requireBridgeSecret(req.header("x-hypermsg-erpnext-secret") ?? req.header("x-nextmsg-erpnext-secret"));
    const body = z.object({
      instanceId: z.string().uuid(),
      to: z.string().min(3),
      body: z.string().min(1).max(4096),
      referenceDoctype: z.string().optional(),
      referenceName: z.string().optional()
    }).parse(req.body);

    const instance = await prisma.instance.findUnique({ where: { id: body.instanceId } });
    if (!instance) throw new HttpError(404, "Instance not found");
    if (instance.status !== "CONNECTED") throw new HttpError(409, "Instance is not connected");

    let providerId: string | undefined;
    try {
      providerId = await sendViaWhatsApp(body);
    } catch (err: any) {
      if (!String(err.message).includes("not running")) throw err;
      await startWhatsAppInstance(body.instanceId);
      providerId = await sendViaWhatsApp(body);
    }

    const log = await prisma.messageLog.create({
      data: {
        userId: instance.userId,
        instanceId: body.instanceId,
        direction: "OUTBOUND",
        status: "SENT",
        to: body.to,
        body: body.body,
        providerId
      }
    });

    await createWhatsappCommunication({
      direction: "Sent",
      phone: body.to,
      content: body.body,
      referenceDoctype: body.referenceDoctype,
      referenceName: body.referenceName
    });

    res.json({ id: log.id, status: log.status, providerId });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.post("/erpnext/hypermsg-webhook", async (req, res, next) => {
  try {
    verifyHyperMSGWebhook(req);
    const body = z.object({
      event: z.string(),
      data: z.object({
        from: z.string().optional(),
        body: z.string().optional(),
        id: z.string().optional()
      }).passthrough()
    }).parse(req.body);

    if (body.event !== "message.received") {
      return res.json({ ok: true, ignored: body.event });
    }

    await createWhatsappCommunication({
      direction: "Received",
      phone: body.data.from ?? "unknown",
      content: body.data.body ?? ""
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
