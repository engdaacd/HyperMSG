import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../http/errors.js";
import { requireDashboardAuth } from "../middleware/auth.js";
import { startWhatsAppInstance, stopWhatsAppInstance } from "../adapters/whatsapp.js";

export const instancesRouter = Router();
instancesRouter.use(requireDashboardAuth);

instancesRouter.get("/", async (req, res) => {
  const data = await prisma.instance.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});

instancesRouter.post("/", async (req, res) => {
  const body = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
  const instance = await prisma.instance.create({ data: { userId: req.user!.id, name: body.name } });
  res.status(201).json(instance);
});

instancesRouter.post("/:id/connect", async (req, res, next) => {
  try {
    const instance = await prisma.instance.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!instance) throw new HttpError(404, "Instance not found");
    void startWhatsAppInstance(instance.id);
    res.status(202).json({ status: "starting", instanceId: instance.id });
  } catch (err) {
    next(err);
  }
});

instancesRouter.get("/:id/qr", async (req, res, next) => {
  try {
    const instance = await prisma.instance.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!instance) throw new HttpError(404, "Instance not found");
    res.json({ status: instance.status, qr: instance.lastQrDataUrl });
  } catch (err) {
    next(err);
  }
});

instancesRouter.post("/:id/disconnect", async (req, res, next) => {
  try {
    const instance = await prisma.instance.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!instance) throw new HttpError(404, "Instance not found");
    await stopWhatsAppInstance(instance.id);
    res.json({ status: "disconnected" });
  } catch (err) {
    next(err);
  }
});
