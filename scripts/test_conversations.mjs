import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sellerUserId = "cmsa5y0od00029kg87ea1m8of";

const messages = await prisma.privateMessage.findMany({
  where: {
    OR: [
      { senderId: sellerUserId },
      { receiverId: sellerUserId },
    ],
  },
  orderBy: { createdAt: "desc" },
  take: 500,
});

console.log("Messages found:", messages.length);
for (const msg of messages) {
  console.log(" ", msg.id, msg.senderId, "->", msg.receiverId, msg.content);
}

const partnerIds = new Set();
for (const msg of messages) {
  partnerIds.add(msg.senderId);
  partnerIds.add(msg.receiverId);
}
partnerIds.delete(sellerUserId);
console.log("Partners:", Array.from(partnerIds));

await prisma.$disconnect();
process.exit(0);
