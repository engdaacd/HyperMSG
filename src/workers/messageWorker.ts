import { Worker } from "bullmq";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { prisma } from "../db/prisma.js";
import { connection, type SendMessageJob, webhookQueue } from "../services/queues.js";
import { sendViaWhatsApp } from "../adapters/whatsapp.js";

new Worker<SendMessageJob>("send-message", async (job) => {
  const data = job.data;
  try {
    const providerId = await sendViaWhatsApp(data);
    const log = await prisma.messageLog.update({
      where: { id: data.messageId },
      data: { status: "SENT", providerId }
    });
    await webhookQueue.add("message.status", {
      userId: data.userId,
      event: "message.status",
      payload: { id: log.id, instanceId: log.instanceId, status: log.status, to: log.to, providerId }
    });
  } catch (err: any) {
    const failedPermanently = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    await prisma.messageLog.update({
      where: { id: data.messageId },
      data: { status: failedPermanently ? "FAILED" : "QUEUED", error: err.message }
    });
    throw err;
  }
}, {
  connection,
  concurrency: 3,
  limiter: {
    max: env.MAX_SENDS_PER_MINUTE_PER_INSTANCE,
    duration: 60_000
  }
});

logger.info("message worker started");
