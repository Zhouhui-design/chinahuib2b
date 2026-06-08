const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// The password that was sent to email
const password = '8I,*pfk4k%QkXm>B';

async function syncAdminToServer() {
  try {
    console.log('同步管理员账号到服务器数据库...\n');

    const hashedPassword = await bcrypt.hash(password, 10);

    // First, check all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true }
    });
    console.log('当前用户列表:', JSON.stringify(allUsers, null, 2));

    // Delete existing admin account (created earlier)
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin && existingAdmin.email !== '1994169577@qq.com') {
      console.log(`删除旧管理员账号: ${existingAdmin.username} (${existingAdmin.email})`);
      await prisma.user.delete({ where: { id: existingAdmin.id } });
    }

    // Find existing user with target email
    const existingUser = await prisma.user.findUnique({
      where: { email: '1994169577@qq.com' }
    });

    if (existingUser) {
      // Update to admin (keep original username if different)
      const admin = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
        }
      });
      console.log('\n✅ 已将用户升级为管理员:');
      console.log(JSON.stringify(admin, null, 2));
    }

    console.log('\n========================================');
    console.log('登录信息:');
    console.log('邮箱: 1994169577@qq.com');
    console.log(`密码: ${password}`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

syncAdminToServer();