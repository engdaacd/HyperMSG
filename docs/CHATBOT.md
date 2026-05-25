# WhatsApp Chatbot

HyperMSG includes a simple rule-based WhatsApp chatbot for fast automation.

## How It Works

1. A WhatsApp message arrives on a connected instance.
2. HyperMSG logs the inbound message.
3. Enabled chatbot rules are checked by priority.
4. The first matching rule sends an automatic WhatsApp reply.
5. The bot reply is saved in message logs and emits a `message.status` webhook.

## Match Types

- `CONTAINS`: incoming text contains the trigger.
- `EXACT`: incoming text exactly equals the trigger.
- `STARTS_WITH`: incoming text starts with the trigger.
- `DEFAULT`: fallback reply when no specific trigger is needed.

Rules can apply to all instances or only one instance.

## Dashboard

Open the dashboard and use **WhatsApp Chatbot**:

- Rule name: readable label.
- Instance: all instances or one specific instance.
- Match type: contains, exact, starts with, or fallback.
- Trigger: keyword such as `hi`, `price`, `help`.
- Priority: lower number runs first.
- Response: WhatsApp auto-reply text.

## Website Chat Button

The landing page includes a floating WhatsApp chat button for public visitors.

How it connects to the bot:

1. Edit `public/index.html` and set `data-whatsapp-phone` on `#siteChatWidget` to your connected WhatsApp number without `+`, spaces, or dashes.
2. A visitor clicks the website chat button or quick reply.
3. The browser opens `wa.me` with a pre-filled message to your WhatsApp number.
4. When the visitor sends the message in WhatsApp, your connected HyperMSG instance receives it.
5. The dashboard chatbot rules match the incoming text and send the auto-reply.

Example:

```html
<aside id="siteChatWidget" data-whatsapp-phone="15551234567">
```

Use the same phone number that appears as `CONNECTED` in the dashboard instance card.

## Example Rules

Greeting:

```text
Match: CONTAINS
Trigger: hi
Response: Hello, thanks for contacting us. Reply 1 for sales or 2 for support.
Priority: 10
```

Pricing:

```text
Match: CONTAINS
Trigger: price
Response: Our starter package is $39/month. Would you like us to call you?
Priority: 20
```

Fallback:

```text
Match: DEFAULT
Response: Thanks for your message. A team member will respond shortly.
Priority: 999
```

## ERPNext Use Case

Use chatbot rules for immediate replies while your ERPNext integration logs the conversation as `Communication` records.

Examples:

- Customer asks `invoice`: reply with instructions and notify accounts.
- Customer asks `delivery`: reply with support steps.
- New lead says `price`: reply with pricing and create a follow-up task in ERPNext using webhooks.

## Production Notes

- Keep rules short and deterministic.
- Put specific rules at lower priority numbers than fallback rules.
- Avoid sending repetitive promotional replies to every message.
- Use opt-in/opt-out handling for marketing flows.
- For complex bot logic, replace rule matching with a workflow engine or LLM service behind the same inbound handler.
