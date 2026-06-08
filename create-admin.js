const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  try {
    // 检查是否已存在管理员账号
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('管理员账号已存在:', existingAdmin.username);
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('用户名 admin 已被使用');
      return;
    }

    // 创建管理员账号
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        displayName: '系统管理员'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('✅ 管理员账号创建成功:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\n登录信息:');
    console.log('用户名: admin');
    console.log('密码: admin123');

  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdminUser();