-- 需求2：游客消息表（手动建表，勿跑 prisma migrate deploy）
CREATE TABLE IF NOT EXISTS "GuestMessage" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "guestKey" TEXT NOT NULL,
    "senderName" TEXT,
    "senderContact" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuestMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuestMessage_sellerId_guestKey_idx" ON "GuestMessage"("sellerId", "guestKey");
CREATE INDEX IF NOT EXISTS "GuestMessage_sellerId_createdAt_idx" ON "GuestMessage"("sellerId", "createdAt");
