import type { ChatbotMatchType } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { logger } from "../config/logger.js";
import { webhookQueue } from "./queues.js";

type IncomingMessageInput = {
  userId: string;
  instanceId: string;
  from: string;
  body?: string | null;
};

function matchesRule(matchType: ChatbotMatchType, trigger: string, incoming: string) {
  const normalizedTrigger = trigger.trim().toLowerCase();
  const normalizedIncoming = incoming.trim().toLowerCase();

  if (matchType === "DEFAULT") return true;
  if (!normalizedTrigger) return false;
  if (matchType === "EXACT") return normalizedIncoming === normalizedTrigger;
  if (matchType === "STARTS_WITH") return normalizedIncoming.startsWith(normalizedTrigger);
  return normalizedIncoming.includes(normalizedTrigger);
}

export async function handleChatbotReply(input: IncomingMessageInput) {
  if (!input.body?.trim()) return null;

  const rules = await prisma.chatbotRule.findMany({
    where: {
      userId: input.userId,
      enabled: true,
      OR: [{ instanceId: input.instanceId }, { instanceId: null }]
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  });

  const matchedRule = rules.find((rule) => matchesRule(rule.matchType, rule.trigger, input.body ?? ""));
  if (!matchedRule) return null;

  try {
    const { sendViaWhatsApp } = await import("../adapters/whatsapp.js");
    const providerId = await sendViaWhatsApp({
      instanceId: input.instanceId,
      to: input.from,
      body: matchedRule.response
    });

    const log = await prisma.messageLog.create({
      data: {
        userId: input.userId,
        instanceId: input.instanceId,
        direction: "OUTBOUND",
        status: "SENT",
        to: input.from,
        body: matchedRule.response,
        providerId
      }
    });

    await webhookQueue.add("message.status", {
      userId: input.userId,
      event: "message.status",
      payload: {
        id: log.id,
        instanceId: input.instanceId,
        status: log.status,
        to: input.from,
        providerId,
        chatbotRuleId: matchedRule.id
      }
    });

    return { rule: matchedRule, message: log };
  } catch (err: any) {
    logger.error({ err, instanceId: input.instanceId, ruleId: matchedRule.id }, "chatbot auto-reply failed");
    await prisma.messageLog.create({
      data: {
        userId: input.userId,
        instanceId: input.instanceId,
        direction: "OUTBOUND",
        status: "FAILED",
        to: input.from,
        body: matchedRule.response,
        error: err.message
      }
    });
    return null;
  }
}
