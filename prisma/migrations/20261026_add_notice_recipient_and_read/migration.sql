-- Notice 表缺失 recipientId 和 isRead 字段（源码引用但 schema 未定义）。
-- 表当前 0 行，纯加列无数据风险。recipientId 可空（null 表示全局通知）。
ALTER TABLE "Notice" ADD COLUMN "recipientId" TEXT;
ALTER TABLE "Notice" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "Notice_recipientId_idx" ON "Notice"("recipientId");
