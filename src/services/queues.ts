import { Queue } from "bullmq";
import { env } from "../config/env.js";

export type SendMessageJob = {
  messageId: string;
  userId: string;
  instanceId: string;
  to: string;
  body?: string;
  mediaUrl?: string;
  filename?: string;
};

export type WebhookJob = {
  userId: string;
  event: string;
  payload: unknown;
};

export const connection = { url: env.REDIS_URL };

export const sendQueue = new Queue<SendMessageJob>("send-message", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2_000 },
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});

export const webhookQueue = new Queue<WebhookJob>("webhooks", {
  connection,
  defaultJobOptions: {
    attempts: 8,
    backoff: { type: "exponential", delay: 1_000 },
    removeOnComplete: 1000,
    removeOnFail: 5000
  }
});
