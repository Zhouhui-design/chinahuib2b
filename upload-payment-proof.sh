#!/bin/bash

# 付款凭证截图上传脚本
# 使用 SCP 命令将截图上传到生产服务器

# 配置信息
SERVER_USER="root"
SERVER_HOST="108.62.199.221"
SERVER_PATH="/home/sardenesy/projects/chinahuib2b/public/payment-proofs"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  付款凭证截图上传工具${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 检查是否提供了文件参数
if [ -z "$1" ]; then
    echo -e "${RED}错误：请提供要上传的文件路径${NC}"
    echo "用法: ./upload-payment-proof.sh <文件路径> [proofId]"
    echo ""
    echo "示例:"
    echo "  ./upload-payment-proof.sh screenshot.jpg cm12345"
    echo "  ./upload-payment-proof.png cm12345"
    exit 1
fi

FILE_PATH="$1"
PROOF_ID="${2:-}"

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}错误：文件不存在: $FILE_PATH${NC}"
    exit 1
fi

# 获取文件名
FILE_NAME=$(basename "$FILE_PATH")

# 如果提供了 proofId，重命名文件
if [ -n "$PROOF_ID" ]; then
    UPLOAD_NAME="proof-${PROOF_ID}-${FILE_NAME}"
else
    UPLOAD_NAME="${FILE_NAME}"
fi

echo -e "${GREEN}准备上传:${NC}"
echo "  文件: $FILE_PATH"
echo "  服务器: $SERVER_USER@$SERVER_HOST"
echo "  路径: $SERVER_PATH/$UPLOAD_NAME"
echo ""

# 创建远程目录（如果不存在）
echo -e "${YELLOW}步骤 1/3: 创建远程目录...${NC}"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 目录创建成功${NC}"
else
    echo -e "${RED}✗ 目录创建失败${NC}"
    exit 1
fi

echo ""

# 上传文件
echo -e "${YELLOW}步骤 2/3: 上传文件...${NC}"
scp "$FILE_PATH" $SERVER_USER@$SERVER_HOST:$SERVER_PATH/$UPLOAD_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 文件上传成功${NC}"
else
    echo -e "${RED} 文件上传失败${NC}"
    exit 1
fi

echo ""

# 验证上传
echo -e "${YELLOW}步骤 3/3: 验证上传...${NC}"
FILE_SIZE=$(ssh $SERVER_USER@$SERVER_HOST "stat -c%s $SERVER_PATH/$UPLOAD_NAME 2>/dev/null")

if [ -n "$FILE_SIZE" ] && [ "$FILE_SIZE" -gt 0 ]; then
    echo -e "${GREEN}✓ 文件验证成功 (大小: ${FILE_SIZE} bytes)${NC}"
else
    echo -e "${RED}✗ 文件验证失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  上传完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "访问地址: https://chinahuib2b.top/payment-proofs/$UPLOAD_NAME"
echo ""

# 如果提供了 proofId，生成更新命令
if [ -n "$PROOF_ID" ]; then
    echo -e "${YELLOW}下一步：更新数据库记录${NC}"
    echo "请在服务器上执行以下命令："
    echo ""
    echo "UPDATE \"PaymentProof\""
    echo "SET \"screenshotUrl\" = 'https://chinahuib2b.top/payment-proofs/$UPLOAD_NAME'"
    echo "WHERE id = '$PROOF_ID';"
    echo ""
fi
