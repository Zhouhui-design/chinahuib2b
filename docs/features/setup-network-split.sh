#!/bin/bash

# 网络分流配置脚本
# Chrome: 通过代理访问国外网站
# Firefox: 直连访问本地网站
# 本地应用: 正常访问

echo "=========================================="
echo "Ubuntu 网络分流配置"
echo "=========================================="
echo ""

# 检测代理端口（假设使用 Clash/V2Ray 等，默认端口 7890）
PROXY_HTTP_PORT=7890
PROXY_SOCKS_PORT=7897

echo "1. 检查代理是否运行..."
if curl -s --connect-timeout 3 http://127.0.0.1:$PROXY_HTTP_PORT > /dev/null 2>&1; then
    echo "✅ HTTP 代理运行在端口 $PROXY_HTTP_PORT"
else
    echo "⚠️  HTTP 代理未运行在端口 $PROXY_HTTP_PORT"
    echo "   请确保你的代理软件（Clash/V2Ray）已启动"
fi

if curl -s --connect-timeout 3 socks5://127.0.0.1:$PROXY_SOCKS_PORT > /dev/null 2>&1; then
    echo "✅ SOCKS5 代理运行在端口 $PROXY_SOCKS_PORT"
else
    echo "⚠️  SOCKS5 代理未运行在端口 $PROXY_SOCKS_PORT"
fi

echo ""
echo "2. 配置 Chrome 浏览器代理..."
echo ""
echo "方法 A: 使用命令行启动 Chrome（推荐）"
echo "----------------------------------------"
echo "创建启动脚本："
cat > ~/chrome-proxy.sh << 'EOF'
#!/bin/bash
# Chrome 通过代理启动
google-chrome-stable \
  --proxy-server="socks5://127.0.0.1:7897" \
  --host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE 127.0.0.1" \
  "$@" &
EOF
chmod +x ~/chrome-proxy.sh
echo "✅ 已创建 ~/chrome-proxy.sh"
echo "   使用方法: ./chrome-proxy.sh"
echo ""

echo "方法 B: 使用 SwitchyOmega 扩展（更灵活）"
echo "----------------------------------------"
echo "1. 在 Chrome 中安装 SwitchyOmega 扩展"
echo "2. 创建两个情景模式："
echo "   - Direct (直连): 用于本地网站"
echo "   - Proxy (代理): SOCKS5 127.0.0.1:7897"
echo "3. 设置自动切换规则："
echo "   - *.github.com -> Proxy"
echo "   - *.google.com -> Proxy"
echo "   - *.gmail.com -> Proxy"
echo "   - chinahuib2b.top -> Direct"
echo "   - localhost -> Direct"
echo "   - 127.0.0.1 -> Direct"
echo ""

echo "3. 配置 Firefox 浏览器（直连）..."
echo "----------------------------------------"
echo "Firefox 已经设置为不连接代理 ✅"
echo "验证设置："
echo "  about:preferences -> 网络设置 -> 不使用代理"
echo ""

echo "4. 配置 Git 代理（仅 GitHub）..."
echo "----------------------------------------"
echo "为 GitHub 设置代理，其他仓库直连："
git config --global http.https://github.com.proxy socks5://127.0.0.1:7897
git config --global https.https://github.com.proxy socks5://127.0.0.1:7897
echo "✅ Git 已配置：GitHub 通过代理，其他直连"
echo ""
echo "测试："
echo "  git config --global --get http.https://github.com.proxy"
echo ""

echo "5. 配置 SSH 隧道（用于其他国外应用）..."
echo "----------------------------------------"
echo "如果你有海外 VPS，可以创建 SSH 隧道："
echo ""
cat > ~/ssh-tunnel.sh << 'EOF'
#!/bin/bash
# SSH 动态端口转发（SOCKS5 代理）
# 用法: ./ssh-tunnel.sh user@your-vps-ip

if [ -z "$1" ]; then
    echo "用法: $0 user@vps-ip"
    exit 1
fi

echo "创建 SSH SOCKS5 隧道..."
echo "监听端口: 1080"
echo "按 Ctrl+C 停止"

ssh -D 1080 -C -N $1
EOF
chmod +x ~/ssh-tunnel.sh
echo "✅ 已创建 ~/ssh-tunnel.sh"
echo "   使用方法: ./ssh-tunnel.sh user@your-vps-ip"
echo ""
echo "然后在应用中使用 SOCKS5 127.0.0.1:1080"
echo ""

echo "6. 配置 npm 代理（可选）..."
echo "----------------------------------------"
echo "如果 npm 下载慢，可以设置代理："
echo "  npm config set proxy socks5://127.0.0.1:7897"
echo "  npm config set https-proxy socks5://127.0.0.1:7897"
echo ""
echo "取消代理："
echo "  npm config delete proxy"
echo "  npm config delete https-proxy"
echo ""

echo "7. 验证配置..."
echo "----------------------------------------"
echo "测试 GitHub 连接（应该通过代理）："
echo "  curl -I --socks5 127.0.0.1:7897 https://github.com"
echo ""
echo "测试本地网站（应该直连）："
echo "  curl -I http://localhost:3000"
echo "  curl -I https://chinahuib2b.top"
echo ""

echo "=========================================="
echo "配置完成！"
echo "=========================================="
echo ""
echo "总结："
echo "  ✅ Chrome: 使用 ~/chrome-proxy.sh 启动（带代理）"
echo "  ✅ Firefox: 直连（已配置）"
echo "  ✅ Git: GitHub 通过代理，其他直连"
echo "  ✅ SSH 隧道: ~/ssh-tunnel.sh（可选）"
echo ""
echo "下一步："
echo "  1. 重启 Chrome（使用 chrome-proxy.sh）"
echo "  2. 测试访问 GitHub、Google"
echo "  3. 测试访问 chinahuib2b.top（用 Firefox）"
echo ""
