const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    console.log('所有用户账号:');
    console.log(JSON.stringify(users, null, 2));
    console.log(`\n总用户数: ${users.length}`);
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

getAllUsers();