# 📁 文件上传系统配置指南

## ✅ 已完成的功能

### 1. 本地文件系统存储（默认）

**目录结构**:
```
public/uploads/
├── products/      # 产品图片
├── logos/         # 公司 Logo
├── banners/       # 横幅图片
├── brochures/     # PDF 手册
└── others/        # 其他文件
```

**特性**:
- ✅ 自动创建目录
- ✅ 图片优化（Sharp - 转换为 WebP，质量 80%）
- ✅ 文件大小限制（20MB）
- ✅ 唯一文件名生成（UUID）
- ✅ 支持格式：JPG, PNG, WebP, PDF

### 2. DigitalOcean Spaces 云存储（可选）

**优势**:
- 🌍 CDN 加速
- 💾 无限存储空间
- 🔒 高可用性
- 🚀 全球访问速度快

**配置步骤**:

#### Step 1: 创建 DigitalOcean Spaces Bucket

1. 登录 [DigitalOcean](https://cloud.digitalocean.com/)
2. 进入 **Spaces** 页面
3. 点击 **Create a Space**
4. 选择区域（推荐：Singapore SGP1）
5. 命名 bucket：`global-expo-storage`
6. 设置权限：**Public**

#### Step 2: 生成 API Keys

1. 进入 **API** 页面
2. 点击 **Generate New Key**
3. 命名 key：`chinahuib2b-spaces`
4. 复制 **Access Key** 和 **Secret Key**

#### Step 3: 配置环境变量

编辑 `.env.local`（开发环境）或 `.env.production`（生产环境）：

```bash
# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="global-expo-storage"
DO_SPACES_ACCESS_KEY="your_access_key_here"
DO_SPACES_SECRET_KEY="your_secret_key_here"
```

#### Step 4: 重启应用

```bash
# 开发环境
npm run dev

# 生产环境（PM2）
pm2 restart chinahuib2b
```

---

## 🎯 API 使用示例

### 上传产品图片

```javascript
const formData = new FormData()
formData.append('file', imageFile)
formData.append('type', 'product_image')
formData.append('productId', 'product_id_here')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
console.log('Uploaded URL:', result.url)
```

### 上传公司 Logo

```javascript
const formData = new FormData()
formData.append('file', logoFile)
formData.append('type', 'logo')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

### 上传 PDF 手册

```javascript
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('type', 'brochure')
formData.append('productId', 'product_id_here') // 产品手册
// 或者
formData.append('type', 'store_brochure') // 店铺手册

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

---

## 📊 支持的上传类型

| 类型 | 说明 | 最大大小 | 处理方式 |
|------|------|----------|----------|
| `product_image` | 产品图片 | 20MB | 转换为 WebP，质量 80% |
| `logo` | 公司 Logo | 20MB | 转换为 WebP，质量 80% |
| `banner` | 横幅图片 | 20MB | 转换为 WebP，质量 80% |
| `brochure` | 产品手册 | 20MB | 保持原格式（PDF） |
| `store_brochure` | 店铺手册 | 20MB | 保持原格式（PDF） |

---

## 🔧 技术实现

### 核心库

- **Sharp**: 图片处理和优化
- **@aws-sdk/client-s3**: DigitalOcean Spaces SDK
- **uuid**: 生成唯一文件名

### 工作流程

```
用户上传文件
    ↓
验证身份（必须是卖家）
    ↓
检查文件大小（≤20MB）
    ↓
确定存储目录（根据类型）
    ↓
如果是图片 → Sharp 优化（转 WebP）
    ↓
如果配置了 Spaces → 上传到云端
否则 → 保存到本地文件系统
    ↓
创建数据库记录
    ↓
返回公共 URL
```

### 错误处理

- ❌ 未登录 → 401 Unauthorized
- ❌ 非卖家用户 → 403 Forbidden
- ❌ 文件过大 → 400 File too large
- ❌ 上传失败 → 500 Internal Server Error

---

## 🚀 性能优化建议

### 1. 启用 CDN（如果使用 Spaces）

DigitalOcean Spaces 自带 CDN，无需额外配置。

### 2. 浏览器缓存

在 Nginx 配置中添加：

```nginx
location /uploads/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 懒加载图片

在前端使用 Next.js Image 组件：

```jsx
<Image
  src={imageUrl}
  alt={productName}
  width={800}
  height={600}
  loading="lazy"
/>
```

---

## 📝 故障排除

### 问题 1: 上传失败，提示 "Failed to upload to cloud storage"

**原因**: DigitalOcean Spaces 凭证配置错误

**解决**:
1. 检查 `.env.local` 中的密钥是否正确
2. 确认 Bucket 名称和区域匹配
3. 查看服务器日志获取详细错误信息

### 问题 2: 图片上传后无法显示

**原因**: 文件路径错误或权限问题

**解决**:
1. 检查 `public/uploads/` 目录是否存在
2. 确认文件已正确保存
3. 检查 URL 路径是否正确

### 问题 3: 图片质量太差

**原因**: Sharp 压缩比例过高

**解决**:
修改 `src/app/api/upload/route.ts` 中的质量参数：

```javascript
.webp({ quality: 90, effort: 6 }) // 从 80 改为 90
```

---

## 🎨 前端集成示例

### React 上传组件

```jsx
import { useState } from 'react'

export default function ImageUploader({ productId, onUpload }) {
  const [uploading, setUploading] = useState(false)
  
  const handleUpload = async (file) => {
    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'product_image')
    formData.append('productId', productId)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        onUpload(result.url)
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

---

## 📈 监控和维护

### 检查上传目录大小

```bash
du -sh public/uploads/*
```

### 清理旧文件（可选）

创建定时任务清理未使用的文件：

```bash
# 删除 30 天前的文件
find public/uploads -type f -mtime +30 -delete
```

### 备份上传文件

```bash
# 备份到远程服务器
rsync -avz public/uploads/ user@backup-server:/backup/uploads/
```

---

**最后更新**: 2026-05-17  
**版本**: 1.0.0
