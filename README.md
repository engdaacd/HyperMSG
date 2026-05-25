# HyperMSG WhatsApp API Platform

Self-hosted WhatsApp messaging API reference implementation with:

- user registration and login
- QR-based WhatsApp instance linking
- REST API token authentication
- text, media, and group message enqueueing
- inbound and status webhooks
- dashboard for tokens, webhooks, instances, and message logs
- SDK examples for Node.js, Python, PHP, and C#

## Quick Start

```bash
cp .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

In separate terminals:

```bash
npm run worker
npm run webhook-worker
```

Open `http://localhost:4000`, register, create an instance, click Connect, and scan the QR code.

If `docker` is not installed, install it first:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker "$USER"
newgrp docker
```

Then rerun:

```bash
docker compose up -d
npm run prisma:migrate
```

Run the API and workers in separate terminals, or under a process manager:

```bash
npm run dev
npm run worker
npm run webhook-worker
```

## Important Production Note

The included QR adapter uses WhatsApp Web automation through `whatsapp-web.js`. That is useful for controlled internal tools and prototypes, but production commercial use should be reviewed against WhatsApp terms and local messaging laws. Prefer the official WhatsApp Business Cloud API when you need compliant, scalable customer messaging.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [REST API](docs/API.md)
- [ERPNext Integration](docs/ERPNEXT.md)
- [WhatsApp Chatbot](docs/CHATBOT.md)
- [Testing Strategy](docs/TESTING.md)
