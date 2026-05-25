import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { instancesRouter } from "./routes/instances.js";
import { messagesRouter } from "./routes/messages.js";
import { integrationsRouter } from "./routes/integrations.js";
import { errorHandler, notFound } from "./http/errors.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(helmet({
  contentSecurityPolicy: false,
  hsts: env.NODE_ENV === "production" ? undefined : false
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({
  limit: "2mb",
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf.toString("utf8");
  }
}));
app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/instances", instancesRouter);
app.use("/messages", messagesRouter);
app.use("/integrations", integrationsRouter);
app.use("/", express.static(path.join(__dirname, "../public")));
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "HyperMSG API listening"));
