#!/bin/bash

# Cloudflare CDN 自动配置脚本
# 用途: 自动清除缓存、验证配置、监控性能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量（需要替换为实际值）
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-your_api_token_here}"
CHINAHUIB_ZONE_ID="${CHINAHUIB_ZONE_ID:-your_zone_id_here}"
FIXTURER_ZONE_ID="${FIXTURER_ZONE_ID:-your_zone_id_here}"

# 域名
CHINAHUIB_DOMAIN="chinahuib2b.top"
CHAT_DOMAIN="chat.fixr2026.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Cloudflare CDN 管理工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 函数: 清除缓存
purge_cache() {
    local zone_id=$1
    local domain=$2
    
    echo -e "${YELLOW}🗑️  清除 ${domain} 的缓存...${NC}"
    
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${zone_id}/purge_cache" \
         -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}')
    
    success=$(echo $response | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ 缓存清除成功${NC}"
    else
        echo -e "${RED}❌ 缓存清除失败${NC}"
        echo $response | jq '.'
        return 1
    fi
}

# 函数: 检查 CDN 状态
check_cdn_status() {
    local domain=$1
    
    echo -e "${YELLOW}🔍 检查 ${domain} 的 CDN 状态...${NC}"
    
    headers=$(curl -sI "https://${domain}")
    
    cf_cache=$(echo "$headers" | grep -i "cf-cache-status" | awk '{print $2}' | tr -d '\r')
    cf_ray=$(echo "$headers" | grep -i "cf-ray" | awk '{print $2}' | tr -d '\r')
    server=$(echo "$headers" | grep -i "server:" | awk '{print $2}' | tr -d '\r')
    
    echo ""
    echo -e "  CF-Cache-Status: ${cf_cache:-N/A}"
    echo -e "  CF-Ray: ${cf_ray:-N/A}"
    echo -e "  Server: ${server:-N/A}"
    echo ""
    
    if [ "$cf_cache" != "N/A" ]; then
        echo -e "${GREEN}✅ CDN 已启用${NC}"
    else
        echo -e "${RED}❌ CDN 未启用或配置错误${NC}"
    fi
}

# 函数: 测试响应时间
test_response_time() {
    local domain=$1
    
    echo -e "${YELLOW}⏱️  测试 ${domain} 的响应时间...${NC}"
    
    for i in {1..5}; do
        time=$(curl -o /dev/null -s -w "%{time_total}" "https://${domain}")
        echo -e "  请求 $i: ${time}s"
    done
    
    avg=$(curl -o /dev/null -s -w "%{time_total}" "https://${domain}")
    echo -e "\n${GREEN}平均响应时间: ${avg}s${NC}"
}

# 函数: 验证 SSL 配置
check_ssl() {
    local domain=$1
    
    echo -e "${YELLOW}🔒 检查 ${domain} 的 SSL 配置...${NC}"
    
    result=$(curl -sI "https://${domain}" | grep -i "strict-transport-security")
    
    if [ -n "$result" ]; then
        echo -e "${GREEN}✅ HSTS 已启用${NC}"
        echo "   $result"
    else
        echo -e "${YELLOW}⚠️  HSTS 未启用${NC}"
    fi
}

# 函数: 显示菜单
show_menu() {
    echo -e "${BLUE}请选择操作:${NC}"
    echo "1. 清除 chinahuib2b.top 缓存"
    echo "2. 清除 chat.fixr2026.com 缓存"
    echo "3. 清除所有缓存"
    echo "4. 检查 CDN 状态"
    echo "5. 测试响应时间"
    echo "6. 验证 SSL 配置"
    echo "7. 完整诊断"
    echo "0. 退出"
    echo ""
}

# 主循环
while true; do
    show_menu
    read -p "请输入选项 (0-7): " choice
    
    case $choice in
        1)
            purge_cache "$CHINAHUIB_ZONE_ID" "$CHINAHUIB_DOMAIN"
            ;;
        2)
            purge_cache "$FIXTURER_ZONE_ID" "$CHAT_DOMAIN"
            ;;
        3)
            purge_cache "$CHINAHUIB_ZONE_ID" "$CHINAHUIB_DOMAIN"
            purge_cache "$FIXTURER_ZONE_ID" "$CHAT_DOMAIN"
            ;;
        4)
            check_cdn_status "$CHINAHUIB_DOMAIN"
            check_cdn_status "$CHAT_DOMAIN"
            ;;
        5)
            test_response_time "$CHINAHUIB_DOMAIN"
            test_response_time "$CHAT_DOMAIN"
            ;;
        6)
            check_ssl "$CHINAHUIB_DOMAIN"
            check_ssl "$CHAT_DOMAIN"
            ;;
        7)
            echo -e "${BLUE}========================================${NC}"
            echo -e "${BLUE}  完整诊断${NC}"
            echo -e "${BLUE}========================================${NC}"
            echo ""
            
            check_cdn_status "$CHINAHUIB_DOMAIN"
            echo ""
            check_ssl "$CHINAHUIB_DOMAIN"
            echo ""
            test_response_time "$CHINAHUIB_DOMAIN"
            echo ""
            
            check_cdn_status "$CHAT_DOMAIN"
            echo ""
            check_ssl "$CHAT_DOMAIN"
            echo ""
            test_response_time "$CHAT_DOMAIN"
            ;;
        0)
            echo -e "${GREEN}再见!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}----------------------------------------${NC}"
    echo ""
done
