/**
 * Update Admin Password Script
 * 
 * This script:
 * 1. Updates admin account email to 1994169577@qq.com
 * 2. Generates a secure 16-character password
 * 3. Sends the password to the email
 */

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Email configuration
// SECURITY: MUST use environment variable for SMTP password
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false, // TLS
  requireTLS: true,
  auth: {
    user: '1994169577@qq.com',
    pass: process.env.EMAIL_PASSWORD, // SMTP authorization code - MUST set in environment variable
  },
});

// Generate secure password (16 characters)
function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  // Ensure at least one from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill remaining
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Send email
async function sendPasswordEmail(email, password, username) {
  const mailOptions = {
    from: '"Global Expo Network 管理系统" <1994169577@qq.com>',
    to: email,
    subject: '管理员账号密码 - Global Expo Network',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Global Expo Network</h1>
          <p style="margin: 10px 0 0;">管理员账号密码通知</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <p style="color: #333; font-size: 16px;">您好，</p>
          <p style="color: #333; font-size: 16px;">您的管理员账号已创建/更新，以下是登录信息：</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 10px; color: #666;">登录邮箱：</td>
                <td style="padding: 10px; color: #333; font-weight: bold;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #666;">用户名：</td>
                <td style="padding: 10px; color: #333; font-weight: bold;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #666;">新密码：</td>
                <td style="padding: 10px;">
                  <code style="background: #e8f4f8; padding: 8px 12px; border-radius: 4px; font-size: 16px; color: #2196F3; display: inline-block;">${password}</code>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ 安全提示：</strong>
            </p>
            <ul style="color: #856404; margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li>请妥善保管此密码，不要泄露给他人</li>
              <li>建议登录后立即修改密码</li>
              <li>此密码为16位随机生成，包含大小写字母、数字和符号</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://x2xhub.com/auth/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">立即登录</a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            此邮件由系统自动发送，请勿回复。<br>
            Global Expo Network - 连接全球买卖双方
          </p>
        </div>
      </div>
    `,
    text: `
Global Expo Network 管理员账号密码通知

您的管理员账号已创建/更新，以下是登录信息：

登录邮箱：${email}
用户名：${username}
新密码：${password}

⚠️ 安全提示：
- 请妥善保管此密码，不要泄露给他人
- 建议登录后立即修改密码
- 此密码为16位随机生成，包含大小写字母、数字和符号

登录地址：https://x2xhub.com/auth/login

此邮件由系统自动发送，请勿回复。
Global Expo Network - 连接全球买卖双方
    `,
  };

  return await transporter.sendMail(mailOptions);
}

async function updateAdminPassword() {
  const targetEmail = '1994169577@qq.com';
  const targetUsername = 'admin';

  try {
    console.log('🔐 开始更新管理员账号...\n');

    // Verify SMTP connection
    console.log('1. 验证 SMTP 连接...');
    await transporter.verify();
    console.log('   ✅ SMTP 连接成功\n');

    // Generate secure password
    console.log('2. 生成安全密码...');
    const newPassword = generateSecurePassword(16);
    console.log(`   ✅ 密码已生成: ${newPassword}\n`);

    // Hash password
    console.log('3. 加密密码...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('   ✅ 密码已加密\n');

    // Find or create admin user
    console.log('4. 更新管理员账号...');
    
    // Check if target email is already used
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    let admin;
    if (existingUserWithEmail) {
      // Update existing user to admin
      admin = await prisma.user.update({
        where: { id: existingUserWithEmail.id },
        data: {
          username: targetUsername,
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
      console.log('   ✅ 已将现有用户升级为管理员\n');
    } else {
      // Check if there's an existing admin
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (existingAdmin) {
        // Update existing admin
        admin = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            email: targetEmail,
            username: targetUsername,
            password: hashedPassword,
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
        console.log('   ✅ 已更新现有管理员账号\n');
      } else {
        // Create new admin
        admin = await prisma.user.create({
          data: {
            email: targetEmail,
            username: targetUsername,
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            displayName: '系统管理员',
          },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
          }
        });
        console.log('   ✅ 已创建新管理员账号\n');
      }
    }

    // Send email
    console.log('5. 发送密码邮件...');
    const info = await sendPasswordEmail(targetEmail, newPassword, targetUsername);
    console.log(`   ✅ 邮件发送成功！Message ID: ${info.messageId}\n`);

    // Summary
    console.log('========================================');
    console.log('✅ 管理员账号更新完成！');
    console.log('========================================\n');
    console.log('账号信息:');
    console.log(`  邮箱: ${admin.email}`);
    console.log(`  用户名: ${admin.username}`);
    console.log(`  角色: ${admin.role}`);
    console.log(`  状态: ${admin.isActive ? '已激活' : '已禁用'}\n`);
    console.log(`密码已发送到邮箱: ${targetEmail}`);
    console.log('请检查邮箱获取登录密码。\n');

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateAdminPassword();