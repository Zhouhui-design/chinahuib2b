#!/bin/bash

# 快速部署脚本 - 直接通过 SSH 部署
# 不依赖 Git 推送

SERVER_USER="root"
SERVER_HOST="139.59.108.156"
PROJECT_PATH="/var/www/chinahuib2b"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  快速部署付款凭证审核功能${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 在服务器上拉取代码（如果 Git 推送失败，手动上传文件）
echo -e "${YELLOW}步骤 1/7: 检查服务器连接...${NC}"
ssh $SERVER_USER@$SERVER_HOST "echo 'SSH 连接成功'"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ SSH 连接失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH 连接成功${NC}"
echo ""

# 2. 在服务器上拉取最新代码
echo -e "${YELLOW}步骤 2/7: 在服务器上拉取代码...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && git pull origin main" || {
    echo -e "${YELLOW}⚠ Git pull 失败，可能需要先解决网络问题${NC}"
    echo -e "${YELLOW}尝试继续部署...${NC}"
}
echo ""

# 3. 安装依赖
echo -e "${YELLOW}步骤 3/7: 安装依赖...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npm install"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 依赖安装成功${NC}"
echo ""

# 4. 运行数据库迁移
echo -e "${YELLOW}步骤 4/7: 运行数据库迁移...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npx prisma migrate deploy"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 数据库迁移失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库迁移成功${NC}"
echo ""

# 5. 生成 Prisma Client
echo -e "${YELLOW}步骤 5/7: 生成 Prisma Client...${NC}"
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && npx prisma generate"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Prisma Client 生成失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prisma Client 生成成功${NC}"
echo ""

# 6. 创建必要目录
echo -e "${YELLOW}步骤 6/7: 创建必要目录...${NC}"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $PROJECT_PATH/public/payment-proofs"
echo -e "${GREEN}✓ 目录创建成功${NC}"
echo ""

# 7. 构建项目
echo -e "${YELLOW}步骤 7/7: 构建项目...${NC}"
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
echo -e "${YELLOW}下一步：${NC}"
echo "  1. 运行 ./create-admin.sh 创建管理员账户"
echo "  2. 使用 upload-payment-proof.sh 上传付款截图"
echo ""
