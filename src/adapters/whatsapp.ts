import qrcode from "qrcode";
import pkg from "whatsapp-web.js";
import { prisma } from "../db/prisma.js";
import { webhookQueue } from "../services/queues.js";
import { logger } from "../config/logger.js";
import { normalizeChatId } from "../services/chatIds.js";
import { handleChatbotReply } from "../services/chatbot.js";

const { Client, LocalAuth, MessageMedia } = pkg;

type ClientInstance = InstanceType<typeof Client>;
const clients = new Map<string, ClientInstance>();
const readyInstances = new Set<string>();
const readyWaiters = new Map<string, Promise<void>>();
const readyResolvers = new Map<string, () => void>();

function createReadyWaiter(instanceId: string) {
  if (readyWaiters.has(instanceId)) return readyWaiters.get(instanceId)!;

  const waiter = new Promise<void>((resolve) => {
    readyResolvers.set(instanceId, resolve);
  });
  readyWaiters.set(instanceId, waiter);
  return waiter;
}

function markReady(instanceId: string) {
  readyInstances.add(instanceId);
  readyResolvers.get(instanceId)?.();
  readyResolvers.delete(instanceId);
}

async function waitUntilReady(instanceId: string, timeoutMs = 45_000) {
  if (clients.has(instanceId) && readyInstances.has(instanceId)) return;

  const waiter = createReadyWaiter(instanceId);
  await Promise.race([
    waiter,
    new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error("WhatsApp instance is still starting. Wait for CONNECTED, then try again.")), timeoutMs);
    })
  ]);
}

export async function startWhatsAppInstance(instanceId: string) {
  if (clients.has(instanceId)) return waitUntilReady(instanceId);

  const instance = await prisma.instance.findUniqueOrThrow({ where: { id: instanceId } });
  createReadyWaiter(instanceId);

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: instanceId }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", async (qr: string) => {
    const dataUrl = await qrcode.toDataURL(qr);
    await prisma.instance.update({
      where: { id: instanceId },
      data: { status: "QR_PENDING", lastQrDataUrl: dataUrl }
    });
  });

  client.on("ready", async () => {
    const phoneNumber = client.info?.wid?.user;
    await prisma.instance.update({
      where: { id: instanceId },
      data: { status: "CONNECTED", phoneNumber, lastQrDataUrl: null }
    });
    markReady(instanceId);
  });

  client.on("message", async (message: any) => {
    const log = await prisma.messageLog.create({
      data: {
        userId: instance.userId,
        instanceId,
        direction: "INBOUND",
        status: "RECEIVED",
        from: message.from,
        chatId: message.from,
        body: message.body,
        providerId: message.id?._serialized
      }
    });
    await webhookQueue.add("message.received", {
      userId: instance.userId,
      event: "message.received",
      payload: { id: log.id, instanceId, from: message.from, body: message.body, timestamp: Date.now() }
    });
    await handleChatbotReply({
      userId: instance.userId,
      instanceId,
      from: message.from,
      body: message.body
    });
  });

  client.on("disconnected", async (reason: string) => {
    logger.warn({ instanceId, reason }, "WhatsApp client disconnected");
    clients.delete(instanceId);
    readyInstances.delete(instanceId);
    readyWaiters.delete(instanceId);
    readyResolvers.delete(instanceId);
    await prisma.instance.update({ where: { id: instanceId }, data: { status: "DISCONNECTED" } });
  });

  clients.set(instanceId, client);
  await client.initialize();
}

export async function stopWhatsAppInstance(instanceId: string) {
  const client = clients.get(instanceId);
  if (client) {
    await client.destroy();
    clients.delete(instanceId);
    readyInstances.delete(instanceId);
    readyWaiters.delete(instanceId);
    readyResolvers.delete(instanceId);
  }
  await prisma.instance.update({ where: { id: instanceId }, data: { status: "DISCONNECTED" } });
}

export async function sendViaWhatsApp(input: {
  instanceId: string;
  to: string;
  body?: string;
  mediaUrl?: string;
  filename?: string;
}) {
  const client = clients.get(input.instanceId);
  if (!client) throw new Error("WhatsApp instance is not running");
  await waitUntilReady(input.instanceId);

  const chatId = normalizeChatId(input.to);
  if (input.mediaUrl) {
    const media = await MessageMedia.fromUrl(input.mediaUrl, { unsafeMime: false, filename: input.filename });
    const sent = await client.sendMessage(chatId, media, { caption: input.body });
    return sent.id?._serialized as string | undefined;
  }
  const sent = await client.sendMessage(chatId, input.body ?? "");
  return sent.id?._serialized as string | undefined;
}
