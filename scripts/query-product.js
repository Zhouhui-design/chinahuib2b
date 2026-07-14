import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      mainImageUrl: true,
      images: true,
      videos: true,
      documents: true,
      isActive: true
    },
    take: 10
  });
  console.log(JSON.stringify(products, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { 
  console.error(e); 
  process.exit(1); 
});