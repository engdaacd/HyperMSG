import { Worker } from "bullmq";
import { connection, type WebhookJob } from "../services/queues.js";
import { prisma } from "../db/prisma.js";
import { signWebhookBody } from "../services/security.js";
import { logger } from "../config/logger.js";

new Worker<WebhookJob>("webhooks", async (job) => {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { userId: job.data.userId, enabled: true, events: { has: job.data.event } }
  });

  await Promise.all(endpoints.map(async (endpoint) => {
    const body = JSON.stringify({ event: job.data.event, data: job.data.payload });
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hypermsg-event": job.data.event,
        "x-hypermsg-signature": signWebhookBody(body),
        "x-nextmsg-event": job.data.event,
        "x-nextmsg-signature": signWebhookBody(body)
      },
      body
    });
    if (!response.ok) throw new Error(`Webhook ${endpoint.url} failed with ${response.status}`);
  }));
}, { connection, concurrency: 10 });

logger.info("webhook worker started");
