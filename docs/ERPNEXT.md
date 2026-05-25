# ERPNext / Frappe Integration

HyperMSG can integrate with ERPNext in two simple directions:

1. ERPNext sends WhatsApp messages through HyperMSG.
2. HyperMSG receives WhatsApp replies and writes them back to ERPNext as `Communication` records.

This works because Frappe/ERPNext exposes DocTypes through `/api/resource/{doctype}` and supports token authentication using:

```http
Authorization: token api_key:api_secret
```

Official docs:

- Frappe REST API: https://docs.frappe.io/framework/user/en/guides/integration/rest_api
- Frappe token authentication: https://docs.frappe.io/framework/v14/user/en/api/rest

## 1. Configure HyperMSG

In `.env`:

```bash
ERPNEXT_URL=https://erp.example.com
ERPNEXT_API_KEY=your_erpnext_api_key
ERPNEXT_API_SECRET=your_erpnext_api_secret
ERPNEXT_BRIDGE_SECRET=use-a-long-random-secret
```

Restart HyperMSG:

```bash
npm run dev
```

## 2. Send WhatsApp From ERPNext

Endpoint:

```http
POST /integrations/erpnext/send
X-HyperMSG-ERPNext-Secret: use-a-long-random-secret
Content-Type: application/json
```

Payload:

```json
{
  "instanceId": "hypermsg-instance-id",
  "to": "+15551234567",
  "body": "Hello from ERPNext",
  "referenceDoctype": "Customer",
  "referenceName": "CUST-0001"
}
```

HyperMSG sends the WhatsApp message and creates an ERPNext `Communication` linked to the reference document.

Use [examples/erpnext/client-script-send-whatsapp.js](../examples/erpnext/client-script-send-whatsapp.js) to add a **Send WhatsApp** button to ERPNext Customer.

Use [examples/erpnext/server-script-send-payment-reminder.py](../examples/erpnext/server-script-send-payment-reminder.py) for scheduled reminders.

## 3. Save Incoming WhatsApp Replies In ERPNext

Create a HyperMSG webhook pointing to:

```text
http://your-hypermsg-host:4000/integrations/erpnext/hypermsg-webhook
```

Events:

```json
["message.received"]
```

When a WhatsApp reply arrives, HyperMSG verifies its webhook signature and creates an ERPNext `Communication` with:

- `communication_medium`: `WhatsApp`
- `sent_or_received`: `Received`
- `phone_no`: sender phone/chat id
- `content`: message body

## Recommended ERPNext Use Cases

- Customer form: send manual WhatsApp messages.
- Sales Invoice: send payment reminders.
- Delivery Note: send delivery updates.
- Lead: reply to new inquiries.
- Issue: create support conversations from inbound WhatsApp replies.

## Production Notes

- Keep `ERPNEXT_BRIDGE_SECRET` private.
- Create a dedicated ERPNext API user with only the permissions needed for `Communication` and related DocTypes.
- Use queues for bulk reminders. Do not send unsolicited messages.
- Keep recipient opt-in and opt-out rules inside ERPNext.
