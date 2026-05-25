# HyperMSG Ubuntu Deployment

This guide deploys HyperMSG on an Ubuntu server using:

- Node.js for the API and workers
- Docker Compose for PostgreSQL and Redis
- PM2 for process management
- Nginx and Certbot for HTTPS
- Domain: `hypermsg.kahatech.ke`

## 1. Point DNS To The Server

Create an `A` record:

```text
hypermsg.kahatech.ke -> YOUR_SERVER_PUBLIC_IP
```

Wait until DNS resolves:

```bash
dig +short hypermsg.kahatech.ke
```

## 2. Install Server Packages

```bash
sudo apt update
sudo apt install -y git curl nginx certbot python3-certbot-nginx
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Log out and back in, then install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 3. Upload Or Clone The App

```bash
sudo mkdir -p /opt/hypermsg
sudo chown -R $USER:$USER /opt/hypermsg
cd /opt/hypermsg
git clone https://github.com/engdaacd/HyperMSG.git .
```

If GitHub auth is not configured, upload the project with `scp` or your hosting panel.

## 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Use production values:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://nextmsg:CHANGE_THIS_DB_PASSWORD@localhost:5432/nextmsg?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-at-least-32-random-characters
API_TOKEN_PEPPER=generate-another-random-secret
PUBLIC_BASE_URL=https://hypermsg.kahatech.ke
WEBHOOK_SIGNING_SECRET=generate-webhook-secret
MAX_SENDS_PER_MINUTE_PER_INSTANCE=20
```

Generate secrets:

```bash
openssl rand -hex 32
```

Update `docker-compose.yml` with the same database password. For production, bind Postgres and Redis to localhost only:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

For Redis:

```yaml
ports:
  - "127.0.0.1:6379:6379"
```

## 5. Start Database And Redis

```bash
docker compose up -d
```

## 6. Install And Build HyperMSG

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

## 7. Start API And Workers With PM2

```bash
pm2 start npm --name hypermsg-api -- start
pm2 start npm --name hypermsg-worker -- run worker
pm2 start npm --name hypermsg-webhook-worker -- run webhook-worker
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`.

Check status:

```bash
pm2 status
pm2 logs hypermsg-api
```

## 8. Configure Nginx

Create:

```bash
sudo nano /etc/nginx/sites-available/hypermsg
```

Paste:

```nginx
server {
    listen 80;
    server_name hypermsg.kahatech.ke;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/hypermsg /etc/nginx/sites-enabled/hypermsg
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Enable HTTPS

```bash
sudo certbot --nginx -d hypermsg.kahatech.ke
```

Test:

```bash
curl https://hypermsg.kahatech.ke/health
```

Expected:

```json
{"ok":true}
```

## 10. WhatsApp QR And Session Notes

The WhatsApp session is stored in:

```text
.wwebjs_auth/
.wwebjs_cache/
```

Keep these directories on persistent disk. Do not delete them after scanning the QR code.

On some Ubuntu servers, Chromium dependencies may be needed:

```bash
sudo apt install -y \
  libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libgtk-3-0
```

## 11. Firewall

Allow only SSH, HTTP, and HTTPS publicly:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Do not expose PostgreSQL `5432` or Redis `6379` publicly.

## 12. Updating The App

```bash
cd /opt/hypermsg
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart hypermsg-api hypermsg-worker hypermsg-webhook-worker
```

