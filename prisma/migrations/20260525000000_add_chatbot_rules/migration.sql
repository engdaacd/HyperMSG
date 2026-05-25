CREATE TYPE "ChatbotMatchType" AS ENUM ('CONTAINS', 'EXACT', 'STARTS_WITH', 'DEFAULT');

CREATE TABLE "ChatbotRule" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "instanceId" TEXT,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "matchType" "ChatbotMatchType" NOT NULL DEFAULT 'CONTAINS',
  "trigger" TEXT NOT NULL,
  "response" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChatbotRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatbotRule_userId_enabled_priority_idx" ON "ChatbotRule"("userId", "enabled", "priority");
CREATE INDEX "ChatbotRule_instanceId_enabled_priority_idx" ON "ChatbotRule"("instanceId", "enabled", "priority");

ALTER TABLE "ChatbotRule" ADD CONSTRAINT "ChatbotRule_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatbotRule" ADD CONSTRAINT "ChatbotRule_instanceId_fkey"
  FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
