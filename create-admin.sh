#!/bin/bash

# 创建管理员账户脚本

SERVER_USER="root"
SERVER_HOST="139.59.108.156"
PROJECT_PATH="/var/www/chinahuib2b"

echo "=========================================="
echo "  创建管理员账户"
echo "=========================================="
echo ""

# 询问管理员信息
read -p "请输入管理员邮箱: " ADMIN_EMAIL
read -p "请输入管理员用户名: " ADMIN_USERNAME
read -sp "请输入管理员密码: " ADMIN_PASSWORD
echo ""
read -sp "请确认密码: " ADMIN_PASSWORD_CONFIRM
echo ""

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    echo "❌ 两次输入的密码不一致！"
    exit 1
fi

echo "正在创建管理员账户..."
echo ""

# 在服务器上执行创建命令
ssh $SERVER_USER@$SERVER_HOST << ENDSSH
cd $PROJECT_PATH

# 使用 Node.js 脚本创建用户
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: '$ADMIN_EMAIL' }
    });
    
    if (existingUser) {
      console.log('用户已存在，更新为管理员角色...');
      
      // 更新为管理员
      await prisma.user.update({
        where: { email: '$ADMIN_EMAIL' },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ 已成功设置为管理员');
    } else {
      // 创建新用户
      const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);
      
      const user = await prisma.user.create({
        data: {
          email: '$ADMIN_EMAIL',
          username: '$ADMIN_USERNAME',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ 管理员账户创建成功');
      console.log('   ID: ' + user.id);
      console.log('   邮箱: ' + user.email);
      console.log('   用户名: ' + user.username);
      console.log('   角色: ' + user.role);
    }
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    await prisma.\$disconnect();
    process.exit(1);
  }
}

createAdmin();
"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 管理员账户创建成功！"
    echo "=========================================="
    echo ""
    echo "登录信息："
    echo "  邮箱: $ADMIN_EMAIL"
    echo "  用户名: $ADMIN_USERNAME"
    echo ""
    echo "访问地址："
    echo "  登录页面: https://chinahuib2b.top/auth/login"
    echo "  管理后台: https://chinahuib2b.top/admin/payment-proofs"
    echo ""
else
    echo ""
    echo "❌ 创建管理员账户失败"
    exit 1
fi
