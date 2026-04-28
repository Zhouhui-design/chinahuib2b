#!/bin/bash

# 部署脚本 - 付款凭证审核功能
# 将新功能部署到生产服务器

# 配置
SERVER_USER="root"
SERVER_HOST="139.59.108.156"
PROJECT_PATH="/var/www/chinahuib2b"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  部署付款凭证审核功能${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 推送代码到 Git
echo -e "${YELLOW}步骤 1/6: 提交代码到 Git...${NC}"
git add -A
git commit -m "feat: 添加支付宝收款和付款凭证审核功能

- 集成支付宝收款二维码
- 创建付款凭证提交页面
- 创建管理员审核界面
- 添加 SCP 上传脚本
- 数据库 PaymentProof 模型
- 审核 API (approve/reject)"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Git 提交失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 代码已提交${NC}"
echo ""

# 推送到远程仓库
echo -e "${YELLOW}推送到远程仓库...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Git 推送失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 代码已推送${NC}"
echo ""

# 2. SSH 连接到服务器并拉取代码
echo -e "${YELLOW}步骤 2/6: 在服务器上拉取最新代码...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && git pull origin main"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 代码拉取失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 代码拉取成功${NC}"
echo ""

# 3. 安装依赖
echo -e "${YELLOW}步骤 3/6: 安装依赖...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npm install"

if [ $? -ne 0 ]; then
    echo -e "${RED} 依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 依赖安装成功${NC}"
echo ""

# 4. 运行数据库迁移
echo -e "${YELLOW}步骤 4/6: 运行数据库迁移...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npx prisma migrate deploy"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 数据库迁移失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库迁移成功${NC}"
echo ""

# 5. 生成 Prisma Client
echo -e "${YELLOW}步骤 5/6: 生成 Prisma Client...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npx prisma generate"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Prisma Client 生成失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prisma Client 生成成功${NC}"
echo ""

# 6. 创建必要的目录
echo -e "${YELLOW}步骤 6/6: 创建必要目录...${NC}"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $PROJECT_PATH/public/payment-proofs"
echo -e "${GREEN}✓ 目录创建成功${NC}"
echo ""

# 7. 构建项目
echo -e "${YELLOW}构建项目...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npm run build"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 构建失败${NC}"
    echo -e "${YELLOW}查看构建日志:${NC}"
    ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && pm2 logs nextjs-app --lines 50"
    exit 1
fi
echo -e "${GREEN}✓ 构建成功${NC}"
echo ""

# 8. 重启 PM2
echo -e "${YELLOW}重启应用...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && pm2 restart nextjs-app"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 应用重启失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 应用重启成功${NC}"
echo ""

# 9. 验证部署
echo -e "${YELLOW}验证部署...${NC}"
sleep 3

# 检查 PM2 状态
ssh $SERVER_USER@$SERVER_HOST "pm2 status nextjs-app"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "新功能已部署到生产环境："
echo "  ✓ 支付宝收款页面"
echo "  ✓ 付款凭证提交"
echo "  ✓ 管理员审核界面"
echo "  ✓ 数据库 PaymentProof 表"
echo ""
echo "访问地址："
echo "  充值页面: https://chinahuib2b.top/zh/seller/subscription-required"
echo "  管理员审核: https://chinahuib2b.top/admin/payment-proofs"
echo ""
echo -e "${YELLOW}注意事项：${NC}"
echo "  1. 确保管理员账户的 role 设置为 'ADMIN'"
echo "  2. 使用 upload-payment-proof.sh 脚本上传付款截图"
echo "  3. 在管理员界面审核并激活商家账户"
echo ""
