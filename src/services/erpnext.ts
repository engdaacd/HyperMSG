import { env } from "../config/env.js";
import { HttpError } from "../http/errors.js";

function requireErpNextConfig() {
  if (!env.ERPNEXT_URL || !env.ERPNEXT_API_KEY || !env.ERPNEXT_API_SECRET) {
    throw new HttpError(503, "ERPNext integration is not configured");
  }
  return {
    baseUrl: env.ERPNEXT_URL.replace(/\/$/, ""),
    token: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`
  };
}

export async function createErpNextDocument<T extends object>(doctype: string, data: T) {
  const config = requireErpNextConfig();
  const response = await fetch(`${config.baseUrl}/api/resource/${encodeURIComponent(doctype)}`, {
    method: "POST",
    headers: {
      "authorization": config.token,
      "accept": "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status, "ERPNext API request failed", payload);
  }
  return payload;
}

export async function createWhatsappCommunication(input: {
  direction: "Sent" | "Received";
  phone: string;
  content: string;
  referenceDoctype?: string;
  referenceName?: string;
}) {
  return createErpNextDocument("Communication", {
    communication_type: "Communication",
    communication_medium: "WhatsApp",
    sent_or_received: input.direction,
    subject: `WhatsApp ${input.direction}`,
    content: input.content,
    phone_no: input.phone,
    sender: input.direction === "Received" ? input.phone : undefined,
    reference_doctype: input.referenceDoctype,
    reference_name: input.referenceName
  });
}
