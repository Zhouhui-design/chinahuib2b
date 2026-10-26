-- Topic.guestName: guest posting without login (commit eafa5be).
-- The column exists in the local dev DB (created via db push) but never
-- had a migration file, so production DB is missing it. Prisma selects
-- all scalar fields on findMany, so every Topic query would 500 without
-- this column once the new build is live. Additive, nullable, safe.
ALTER TABLE "Topic" ADD COLUMN "guestName" TEXT;
