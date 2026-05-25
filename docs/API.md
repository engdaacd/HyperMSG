# REST API Specification

Base URL: `https://your-host.example`

Dashboard endpoints use a login JWT. Messaging endpoints use an API token:

```http
Authorization: Bearer nmsg_xxx
```

## Authentication

### Register

`POST /auth/register`

```json
{ "email": "admin@example.com", "password": "correct horse battery staple" }
```

Response:

```json
{ "token": "jwt", "user": { "id": "uuid", "email": "admin@example.com" } }
```

### Login

`POST /auth/login`

```json
{ "email": "admin@example.com", "password": "correct horse battery staple" }
```

## Instances

### Create Instance

`POST /instances`

```json
{ "name": "Support Inbox" }
```

### Start QR Linking

`POST /instances/{id}/connect`

Response:

```json
{ "status": "starting", "instanceId": "uuid" }
```

### Get QR Code

`GET /instances/{id}/qr`

Response:

```json
{ "status": "QR_PENDING", "qr": "data:image/png;base64,..." }
```

## API Tokens

### Create Token

`POST /dashboard/tokens`

```json
{ "name": "Production API" }
```

Response includes the raw token once:

```json
{ "id": "uuid", "name": "Production API", "token": "nmsg_...", "last4": "AbCd" }
```

## Messages

### Send Text

`POST /messages/send`

```json
{
  "instanceId": "uuid",
  "to": "+15551234567",
  "body": "Hello from HyperMSG"
}
```

Response:

```json
{ "id": "message_uuid", "status": "QUEUED" }
```

### Send Media

```json
{
  "instanceId": "uuid",
  "to": "+15551234567",
  "body": "Invoice attached",
  "mediaUrl": "https://example.com/invoice.pdf",
  "filename": "invoice.pdf"
}
```

### Send Group Message

Use a WhatsApp group chat ID or the `group:` prefix:

```json
{
  "instanceId": "uuid",
  "to": "group:120363000000000000",
  "body": "Team update"
}
```

### Get Message Status

`GET /messages/{id}`

Response:

```json
{
  "id": "message_uuid",
  "direction": "OUTBOUND",
  "status": "SENT",
  "to": "+15551234567",
  "providerId": "whatsapp_message_id"
}
```

## Webhooks

Create endpoint:

`POST /dashboard/webhooks`

```json
{
  "url": "https://customer.example/webhooks/hypermsg",
  "events": ["message.received", "message.status"]
}
```

Webhook payload:

```json
{
  "event": "message.received",
  "data": {
    "id": "message_uuid",
    "instanceId": "uuid",
    "from": "15551234567@c.us",
    "body": "Hi",
    "timestamp": 1734550000000
  }
}
```

Headers:

```http
x-hypermsg-event: message.received
x-hypermsg-signature: hex_hmac_sha256
```

Verify by computing `HMAC_SHA256(raw_request_body, WEBHOOK_SIGNING_SECRET)`.
