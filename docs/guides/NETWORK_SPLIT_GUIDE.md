# Ubuntu 网络分流配置指南

## 📋 配置概览

| 应用/场景 | 网络连接方式 | 说明 |
|----------|------------|------|
| **Chrome** | SOCKS5 代理 (127.0.0.1:7897) | 访问 GitHub、Google、Gmail 等 |
| **Firefox** | 直连 | 访问本地网站（chinahuib2b.top） |
| **Git (GitHub)** | SOCKS5 代理 | 仅 GitHub 走代理 |
| **Git (其他)** | 直连 | Gitee、GitLab 等直连 |
| **微信/飞书** | 直连 | 国内应用正常访问 |
| **其他国外应用** | SSH 隧道 | 可选，通过 VPS 转发 |

---

## 🚀 快速开始

### 1. 启动 Chrome（带代理）

```bash
# 方法 A: 使用启动脚本（推荐）
~/chrome-proxy.sh

# 或者手动启动
google-chrome-stable --proxy-server="socks5://127.0.0.1:7897" &
```

### 2. 启动 Firefox（直连）

Firefox 已经设置为不使用代理，直接启动即可：
```bash
firefox &
```

验证设置：
- 打开 `about:preferences`
- 滚动到"网络设置"
- 确保选择"不使用代理"

### 3. 测试连接

**Chrome 中测试：**
- ✅ https://github.com - 应该能访问
- ✅ https://google.com - 应该能访问
- ✅ https://gmail.com - 应该能访问

**Firefox 中测试：**
- ✅ http://localhost:3000 - 本地开发服务器
- ✅ https://chinahuib2b.top - 你的独立站

---

## 🔧 Git 代理配置

### 当前配置

```bash
# 查看配置
git config --global --get http.https://github.com.proxy
# 输出: socks5://127.0.0.1:7897

git config --global --get http.https://gitee.com.proxy
# 输出: (空，表示直连)
```

### 工作原理

- **GitHub**: 自动通过 SOCKS5 代理访问
- **其他仓库** (Gitee, GitLab, etc.): 直连

### 测试

```bash
# GitHub (应该通过代理)
git clone https://github.com/Zhouhui-design/chinahuib2b.git

# Gitee (应该直连)
git clone https://gitee.com/some/repo.git
```

### 添加其他域名到代理（可选）

如果需要让其他域名也走代理：

```bash
# 例如：让 bitbucket.org 也走代理
git config --global http.https://bitbucket.org.proxy socks5://127.0.0.1:7897
```

### 取消某个域名的代理

```bash
git config --global --unset http.https://example.com.proxy
```

---

## 🌐 SSH 隧道（用于其他国外应用）

如果你有海外 VPS，可以创建 SSH SOCKS5 隧道：

### 创建隧道

```bash
# 用法
~/ssh-tunnel.sh user@your-vps-ip

# 示例
~/ssh-tunnel.sh root@139.59.108.156
```

这会在本地创建 SOCKS5 代理 `127.0.0.1:1080`

### 在应用中使用

配置应用的代理设置为：
- 类型: SOCKS5
- 地址: 127.0.0.1
- 端口: 1080

### 停止隧道

按 `Ctrl+C` 即可停止

---

## 📦 npm 代理配置（可选）

如果 npm 下载依赖很慢，可以设置代理：

### 设置代理

```bash
npm config set proxy socks5://127.0.0.1:7897
npm config set https-proxy socks5://127.0.0.1:7897
```

### 取消代理

```bash
npm config delete proxy
npm config delete https-proxy
```

### 查看当前配置

```bash
npm config list
```

---

## 🔍 故障排查

### 问题 1: Chrome 无法访问 GitHub

**检查步骤：**

1. 确认代理软件已启动
   ```bash
   curl -I --socks5 127.0.0.1:7897 https://github.com
   ```

2. 检查 Chrome 是否正确使用代理
   - 打开 Chrome
   - 访问 `chrome://net-internals/#sockets`
   - 查看连接信息

3. 重启 Chrome
   ```bash
   pkill chrome
   ~/chrome-proxy.sh
   ```

### 问题 2: Firefox 无法访问本地网站

**检查步骤：**

1. 确认 Firefox 未使用代理
   - 打开 `about:preferences`
   - 网络设置 -> 不使用代理

2. 清除缓存
   - `about:preferences` -> 隐私与安全 -> 清除数据

3. 测试本地服务是否运行
   ```bash
   curl -I http://localhost:3000
   ```

### 问题 3: Git push/pull 失败

**检查步骤：**

1. 确认是 GitHub 还是其他仓库
   ```bash
   git remote -v
   ```

2. 如果是 GitHub，检查代理是否运行
   ```bash
   curl -I --socks5 127.0.0.1:7897 https://github.com
   ```

3. 临时取消代理测试
   ```bash
   git config --global --unset http.https://github.com.proxy
   git pull
   # 测试后恢复
   git config --global http.https://github.com.proxy socks5://127.0.0.1:7897
   ```

### 问题 4: 代理端口不是 7897

如果你的代理软件使用不同端口，需要修改配置：

```bash
# 1. 修改 Chrome 启动脚本
nano ~/chrome-proxy.sh
# 更改端口号

# 2. 修改 Git 配置
git config --global http.https://github.com.proxy socks5://127.0.0.1:YOUR_PORT
git config --global https.https://github.com.proxy socks5://127.0.0.1:YOUR_PORT

# 3. 修改 npm 配置（如果设置了）
npm config set proxy socks5://127.0.0.1:YOUR_PORT
npm config set https-proxy socks5://127.0.0.1:YOUR_PORT
```

---

## 🛠️ 常用命令

### 检查代理状态

```bash
# 检查环境变量
env | grep -i proxy

# 检查 Git 配置
git config --global --list | grep proxy

# 检查 npm 配置
npm config list | grep proxy
```

### 测试连接

```bash
# 测试 GitHub（通过代理）
curl -I --socks5 127.0.0.1:7897 https://github.com

# 测试 Google（通过代理）
curl -I --socks5 127.0.0.1:7897 https://google.com

# 测试本地网站（直连）
curl -I http://localhost:3000
curl -I https://chinahuib2b.top
```

### 查看进程

```bash
# 查看 Chrome 进程
ps aux | grep chrome

# 查看 SSH 隧道
ps aux | grep "ssh.*-D"
```

---

## 📝 配置文件位置

| 文件 | 用途 |
|------|------|
| `~/chrome-proxy.sh` | Chrome 代理启动脚本 |
| `~/ssh-tunnel.sh` | SSH 隧道脚本 |
| `~/.gitconfig` | Git 全局配置 |
| `~/.npmrc` | npm 配置（可选） |

---

## 🔒 安全提示

1. **不要分享 Personal Access Token**
   - Token 泄露后立即撤销
   - 使用 SSH 密钥更安全

2. **SSH 隧道安全**
   - 使用强密码或密钥认证
   - 定期更换 VPS 密码

3. **代理软件**
   - 使用可信的代理服务商
   - 定期检查代理日志

---

## 🎯 总结

✅ **已完成配置：**
- Chrome 通过 SOCKS5 代理访问国外网站
- Firefox 直连访问本地网站
- Git 仅 GitHub 走代理
- SSH 隧道脚本就绪

✅ **下一步：**
1. 启动 Chrome: `~/chrome-proxy.sh`
2. 测试访问 GitHub、Google
3. 用 Firefox 访问 chinahuib2b.top
4. 根据需要配置 SSH 隧道

如有问题，请查看"故障排查"部分！
