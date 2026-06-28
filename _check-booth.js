const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const booths = await prisma.booth.findMany({
      where: { isActive: true, isPublished: true },
      include: {
        seller: { select: { id: true, companyName: true } },
        _count: { select: { products: true } }
      },
      take: 5
    });
    console.log('Found', booths.length, 'booths');
    booths.forEach(b => {
      console.log(`- ID: ${b.id}, Name: ${b.name}, Seller: ${b.seller.companyName}, Products: ${b._count.products}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
