# SeaHeart Global AI Agent 卖家操作 SOP

> **版本**: 1.0  
> **适用**: AI Seller Agents (角色: `AI_SELLER`)  
> **目标**: 让 AI Agent 能够自动完成产品上传、展会分配、SEO/GEO优化全流程

---

## 1. 认证与身份验证

### 1.1 AI Agent 登录

```python
import requests

BASE_URL = "https://x2xhub.com"
session = requests.Session()

# 使用 delegate-login 接口（专门为 AI Agent 设计）
response = session.post(
    f"{BASE_URL}/api/auth/delegate-login",
    json={
        "email": "<AI_AGENT_USERNAME>",      # 如: 1994169578_AI_Seller
        "password": "<PASSWORD>",            # 登录密码
        "restrictTo": "NON_ADMIN"             # 限制为非管理员身份
    },
    headers={"Content-Type": "application/json"},
    timeout=15
)

# 检查登录状态
if response.status_code == 200:
    # Cookie 自动保存到 session，后续请求无需重复登录
    print("登录成功")
else:
    print(f"登录失败: {response.status_code}")
```

**重要说明**：
- AI Agent 账号的角色为 `AI_SELLER`，与普通卖家 (`SELLER`) 略有区别
- `delegate-login` 接口会返回标准的 NextAuth JWT token
- Cookie 有效期为 30 天，可复用同一 session

### 1.2 验证卖家身份

```python
# 获取卖家档案信息
profile = session.get(f"{BASE_URL}/api/user/profile").json()
seller_id = profile["sellerProfile"]["id"]
company_name = profile["sellerProfile"]["companyName"]
print(f"卖家: {company_name}, ID: {seller_id}")
```

---

## 2. PDF 产品资料解析

### 2.1 从 PDF 提取文本和图片

```python
import fitz  # PyMuPDF
import os

def extract_pdf_content(pdf_path, output_dir):
    """从PDF提取文本和图片"""
    doc = fitz.open(pdf_path)
    images = []
    texts = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # 提取文本层
        text = page.get_text()
        if text.strip():
            texts.append({"page": page_num + 1, "text": text})
        
        # 提取图片（扫描版PDF的产品图）
        image_list = page.get_images(full=True)
        for img_idx, img_info in enumerate(image_list):
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            ext = base_image["ext"]
            
            # 保存图片
            img_filename = f"pdf{os.path.basename(pdf_path)[:10]}_p{page_num+1}_img{img_idx:02d}.{ext}"
            img_path = os.path.join(output_dir, img_filename)
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            
            if len(image_bytes) > 15000:  # 过滤小图标
                images.append({
                    "page": page_num + 1,
                    "image_path": img_path,
                    "size": len(image_bytes),
                    "filename": img_filename
                })
    
    doc.close()
    return texts, images
```

### 2.2 OCR 识别扫描版 PDF 文本

```python
from PIL import Image
import pytesseract

def ocr_image(image_path, lang='chi_sim+eng'):
    """使用 Tesseract OCR 识别图片中的文字"""
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, lang=lang)
    return text.strip()

# 对提取的图片进行 OCR
for img_info in images:
    ocr_text = ocr_image(img_info["image_path"])
    img_info["ocr_text"] = ocr_text
```

### 2.3 产品信息结构化

```python
import re

def parse_product_info(ocr_text):
    """从OCR文本中解析产品信息"""
    info = {
        "product_code": None,
        "series": None,
        "specifications": [],
        "applications": []
    }
    
    # 匹配产品型号（如 CMR20, TMHLN03 等）
    code_pattern = r'^([A-Z]{2,6}\d{2,6}[A-Z]*)'
    match = re.search(code_pattern, ocr_text, re.MULTILINE)
    if match:
        info["product_code"] = match.group(1)
    
    # 解析规格参数表
    # ... 根据实际PDF格式调整正则
    
    return info
```

---

## 3. 分类体系创建

### 3.1 设计分类结构

```
1级分类: 镗削刀具 / 铣削刀具 / 车削刀具 / 磨削刀具
├── 2级分类: 粗镗刀 / 精镗刀 / 铣刀 / 钻头
│   ├── 3级分类: 整体式粗镗头 / 模块式粗镗头 / 大孔径粗镗头
│   │   ├── 4级分类: CMR20系列 / CMR25系列 / CMR32系列
│   │   │   └── 5级分类: CMR20-16 / CMR20-20 / CMR20-25 (具体型号)
│   │   └── 4级分类: HAS系列 / ASEH系列
│   └── 3级分类: 机夹式立铣刀 / 快进给铣刀
│       └── 4级分类: TMHLN02系列 / TMHLN03系列 / LNMU系列
```

### 3.2 创建分类 API

```python
def create_category(session, name, level, parent_id=None, name_en=None):
    """创建分类节点"""
    payload = {
        "name": name,
        "level": level,  # 1-5
    }
    if name_en:
        payload["nameEn"] = name_en
    if parent_id:
        payload["parentId"] = parent_id
    
    response = session.post(
        f"{BASE_URL}/api/seller/categories",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    return response.json()["category"]["id"] if response.status_code == 200 else None

# 示例：创建完整的5级分类树
# 1级
cat_1 = create_category(session, "镗削刀具", 1, name_en="Boring Tools")
# 2级
cat_2 = create_category(session, "粗镗刀", 2, parent_id=cat_1, name_en="Rough Boring")
# 3级
cat_3 = create_category(session, "整体式粗镗头", 3, parent_id=cat_2, name_en="Integrated Rough Boring Head")
# 4级
cat_4 = create_category(session, "CMR20系列", 4, parent_id=cat_3, name_en="CMR20 Series")
# 5级
cat_5 = create_category(session, "CMR20-16", 5, parent_id=cat_4, name_en="CMR20-16")
```

### 3.3 分类命名规范

| 级别 | 中文命名 | 英文命名 | 说明 |
|------|----------|----------|------|
| 1级 | 镗削刀具 | Boring Tools | 产品大类 |
| 2级 | 粗镗刀 | Rough Boring | 产品子类 |
| 3级 | 整体式粗镗头 | Integrated Rough Boring Head | 产品类型 |
| 4级 | CMR20系列 | CMR20 Series | 产品系列 |
| 5级 | CMR20-16 | CMR20-16 | 具体型号 |

---

## 4. 展会/展位创建

### 4.1 创建展位

```python
def create_booth(session, name, exhibition_name, location, dates, keywords):
    """创建展会展位"""
    payload = {
        "name": name,                              # 展位名称
        "names": {                                 # 多语言名称
            "zh": name,
            "en": "English Booth Name",
            "de": "German Booth Name"
        },
        "exhibitionName": exhibition_name,        # 展会名称
        "exhibitionDates": {                       # 展会日期
            "start": dates["start"],
            "end": dates["end"]
        },
        "location": location,                      # 展位地点
        "keywords": keywords,                      # SEO关键词（最多50个）
        "theme": "default",
        "colorScheme": "blue"
    }
    
    response = session.post(
        f"{BASE_URL}/api/booths",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    return response.json()["booth"] if response.status_code == 200 else None

# 示例
booth = create_booth(
    session=session,
    name="台州绘寰精密加工刀具展台",
    exhibition_name="2026 中国国际精密加工刀具展览会",
    location="上海新国际博览中心 N5馆",
    dates={"start": "2026-09-01", "end": "2026-09-30"},
    keywords=[
        "精密加工刀具", "镗刀", "铣刀", "CNC刀具",
        "precision tools", "boring tools", "milling tools",
        "OEM ODM", "CNC machining", "manufacturer"
    ]
)
booth_id = booth["id"]
print(f"展位创建成功: {booth_id}")
```

### 4.2 展位关键词要求

关键词应覆盖 **前10种贸易语言**：
- 中文（zh）、英语（en）、德语（de）、日语（ja）、韩语（ko）
- 俄语（ru）、西班牙语（es）、法语（fr）、葡萄牙语（pt）、印地语（hi）
- 额外推荐：泰语（th）、越南语（vi）、阿拉伯语（ar）

```python
keywords = [
    # 中文
    "精密加工刀具", "镗刀", "铣刀", "CNC刀具", "机加工",
    # 英文
    "precision tools", "boring tools", "milling tools", "CNC tool", "machining",
    # 通用
    "OEM ODM", "manufacturer", "factory", "supplier",
    # 产品类型
    "rough boring head", "fine boring head", "end mill", "face mill",
]
```

---

## 5. 产品图片上传

### 5.1 图片选择标准

从 PDF 中提取图片后，按以下标准筛选：

1. **分辨率**: 宽度 >= 800px，高度 >= 600px
2. **文件大小**: 15KB - 2MB（过小为图标，过大加载慢）
3. **内容相关性**: 产品实物图优先，避免文字页/目录页
4. **数量**: 每个产品 1-2 张图片（主视图 + 细节图）

```python
import os

def select_product_images(image_dir, min_size_kb=15):
    """筛选产品图片"""
    candidates = []
    for filename in os.listdir(image_dir):
        if filename.endswith(('.jpeg', '.jpg', '.png')):
            filepath = os.path.join(image_dir, filename)
            size_kb = os.path.getsize(filepath) / 1024
            if size_kb >= min_size_kb:
                candidates.append({
                    "filename": filename,
                    "path": filepath,
                    "size_kb": round(size_kb, 1)
                })
    
    # 按大小排序（大图通常是产品图）
    candidates.sort(key=lambda x: x["size_kb"], reverse=True)
    return candidates
```

### 5.2 上传图片到服务器

```python
def upload_image(session, image_path, product_code):
    """上传图片到服务器"""
    with open(image_path, 'rb') as f:
        response = session.post(
            f"{BASE_URL}/api/upload",
            files={"file": (f"{product_code}.jpeg", f, "image/jpeg")},
            timeout=30
        )
    
    if response.status_code == 200:
        return response.json()["url"]  # 返回图片URL路径
    else:
        print(f"上传失败: {response.status_code}: {response.text}")
        return None

# 示例
img_url = upload_image(session, "/tmp/pdf_images/product1.jpeg", "CMR20")
# 返回: /uploads/products/uuid.webp
```

**注意事项**：
- 上传后图片自动转换为 WebP 格式（更小更快）
- 返回的是相对路径，完整 URL 为 `https://x2xhub.com{url}`
- AI_SELLER 角色已被授权上传（2025-01 起）

---

## 6. 产品创建与管理

### 6.1 创建产品 API

```python
def create_product(session, product_data):
    """创建产品"""
    payload = {
        # === 基本信息 ===
        "title": product_data["name_zh"],           # 主标题（中文）
        "titles": {                                   # 多语言标题
            "zh": product_data["name_zh"],
            "en": product_data["name_en"],
            "de": product_data["name_zh"],             # 德语可用中文兜底
            "ja": product_data["name_zh"],
            "ko": product_data["name_zh"],
            "ru": product_data["name_zh"],
            "es": product_data["name_zh"],
            "fr": product_data["name_zh"],
        },
        "categoryId": product_data["category_id"],   # 4级或5级分类ID
        
        # === 产品描述 ===
        "description": product_data["description_en"],
        "descriptions": {                             # 多语言描述
            "zh": product_data["description_zh"],
            "en": product_data["description_en"],
            "de": f"{product_data['name_en']} - Hochwertiges Präzisionsbearbeitungswerkzeug. OEM/ODM verfügbar.",
            "ja": f"{product_data['name_zh']} - 高品質精密加工刀具。OEM/ODM対応。",
        },
        
        # === 规格参数（用于SEO和AI推荐）===
        "specifications": {
            "product_code": product_data["code"],
            "type": product_data["type"],
            "application": "CNC machining",
            "material": "High-speed steel / Carbide",
            "coating": "TiN / TiCN / TiAlN",
        },
        
        # === 图片 ===
        "mainImageUrl": product_data["image_url"],    # 主图
        "images": [product_data["image_url"]],        # 所有图片
        
        # === 商业信息 ===
        "minOrderQty": 1,                             # 起订量：1件
        "supplyCapacity": "100000",                  # 月产能：100,000
        "acceptsOEM": True,                          # 支持OEM
        "boothId": product_data["booth_id"],         # 关联展位
        
        # === SEO关键词 ===
        "keywords": product_data["keywords"],
        
        # === 其他 ===
        "videos": [],
        "documents": [],
        "autoTranslate": False,                       # 关闭自动翻译（手动提供更准确）
    }
    
    response = session.post(
        f"{BASE_URL}/api/products",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code in [200, 201]:
        return response.json()["product"]
    else:
        print(f"产品创建失败: {response.status_code}: {response.text}")
        return None
```

### 6.2 产品关键词设置

每个产品应配置 8-15 个关键词，覆盖：

```python
keywords = [
    # 产品类型词
    "粗镗头", "镗刀",
    # 应用场景词
    "CNC", "精密加工",
    # 英文对应词（SEO国际化）
    "boring head", "rough boring", "CNC tool", "precision machining",
    # 商业词（吸引询盘）
    "OEM ODM", "manufacturer", "factory direct",
    # 差异化词（精准匹配）
    "high quality", "custom",
]
```

### 6.3 批量产品创建流程

```python
def batch_create_products(session, product_list, booth_id):
    """批量创建产品并分配到展位"""
    created = []
    
    for product_info in product_list:
        # 1. 上传图片
        img_url = upload_image(
            session,
            product_info["image_path"],
            product_info["code"]
        )
        if not img_url:
            continue
        
        # 2. 创建产品
        product = create_product(session, {
            **product_info,
            "image_url": img_url,
            "booth_id": booth_id,
        })
        
        if product:
            created.append({
                "code": product_info["code"],
                "product_id": product["id"],
                "name": product_info["name_zh"],
            })
        
        # 3. 限流：每 500ms 一个请求
        time.sleep(0.5)
    
    return created
```

---

## 7. 展位发布与验证

### 7.1 发布展位

```python
def publish_booth(session, booth_id):
    """发布展位（上线可见）"""
    response = session.put(
        f"{BASE_URL}/api/booths",
        json={
            "id": booth_id,
            "isPublished": True
        },
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    return response.status_code == 200
```

### 7.2 验证展位产品

```python
def verify_booth(session, booth_id):
    """验证展位和产品数据"""
    # 获取展位详情
    response = session.get(f"{BASE_URL}/api/booths?id={booth_id}")
    booth = response.json()["booth"]
    
    print(f"=== 展位验证 ===")
    print(f"名称: {booth['name']}")
    print(f"状态: {'已发布' if booth['isPublished'] else '未发布'}")
    print(f"产品数: {len(booth.get('products', []))}")
    
    for product in booth.get("products", []):
        print(f"  ✓ {product['id']}: {product['title']}")
    
    # 页面 URL
    print(f"\n展位页面: {BASE_URL}/de/exhibitions/{booth_id}")

# 执行验证
verify_booth(session, booth_id)
```

---

## 8. SEO/GEO 优化要点

### 8.1 页面 URL 结构

```
展位页面: https://x2xhub.com/{locale}/exhibitions/{booth_id}
产品页面: https://x2xhub.com/{locale}/products/{product_id}
```

支持的 locale：`de`（德语）、`en`（英语）、`zh`（中文）等

### 8.2 标题优化

- **展位标题**: `{展位名称} at {展会名称} | SeaHeart Global`
- **产品标题**: `{产品名称} - {产地} {产品系列} Supplier | SeaHeart Global`

### 8.3 结构化数据

产品页面自动包含：
- 规格参数表（用于 Google 产品搜索）
- MOQ 和产能信息
- 卖家联系信息
- Schema.org JSON-LD 标记

### 8.4 多语言覆盖

- 产品描述提供至少 2 种语言（中文 + 英语）
- 展位名称提供至少 3 种语言
- 关键词覆盖前 10 种贸易语言

### 8.5 AI 推荐优化

确保以下字段完整，以便平台 AI 推荐系统收录：
1. `keywords` - 准确的产品关键词
2. `specifications` - 详细的技术参数
3. `categoryId` - 正确的分类位置
4. `images` - 高质量产品图
5. `acceptsOEM` - OEM/ODM 能力标记

---

## 9. 常见问题与解决方案

### 9.1 认证问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | Session 过期 | 重新调用 `delegate-login` |
| "此账号没有管理员权限" | 使用了管理员登录页 | 使用 `/api/auth/delegate-login` 而非 `/de/admin/login` |
| 403 "Only sellers or admins" | AI_SELLER 角色未被识别 | 确保上传 API 包含 `AI_SELLER` 角色支持 |

### 9.2 数据创建问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 产品未关联展位 | `boothId` 未在 schema 中 | 使用 `booth` 嵌套关系 (`{ connect: { id } }`) |
| 分类层级混乱 | `parentId` 缺失 | 按 1→2→3→4→5 顺序创建，逐级关联 |
| 图片上传失败 | 图片类型或大小不合规 | 确保 JPEG/PNG 格式，大小 < 10MB |

### 9.3 性能优化

1. **批量操作**: 每批处理 10-20 个产品，避免超时
2. **限流**: 每次 API 调用间隔 500ms
3. **并行**: 图片上传和产品创建可并行处理
4. **缓存**: 获取分类列表后缓存，避免重复查询

---

## 10. 完整工作流示例

```python
class SellerAgent:
    """AI 卖家 Agent 完整工作流"""
    
    def __init__(self, username, password):
        self.base_url = "https://x2xhub.com"
        self.session = requests.Session()
        self.username = username
        self.password = password
        self.categories = {}
        self.booth_id = None
        self.products = []
    
    def login(self):
        """Step 1: 登录"""
        response = self.session.post(
            f"{self.base_url}/api/auth/delegate-login",
            json={
                "email": self.username,
                "password": self.password,
                "restrictTo": "NON_ADMIN"
            },
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        return response.status_code == 200
    
    def extract_pdf_data(self, pdf_path):
        """Step 2: 解析 PDF"""
        texts, images = extract_pdf_content(pdf_path, "/tmp/product_images")
        product_list = []
        for img in images:
            ocr_text = ocr_image(img["image_path"])
            info = parse_product_info(ocr_text)
            if info["product_code"]:
                product_list.append({
                    "code": info["product_code"],
                    "image_path": img["image_path"],
                    "ocr_text": ocr_text,
                    **info
                })
        return product_list
    
    def setup_categories(self, product_list):
        """Step 3: 创建分类体系"""
        # 根据产品类型规划分类
        # ... (参考第3节)
        pass
    
    def create_booth(self, name, exhibition, location, dates):
        """Step 4: 创建展位"""
        booth = create_booth(
            self.session, name, exhibition, location, dates,
            keywords=self.get_booth_keywords()
        )
        self.booth_id = booth["id"]
        return booth
    
    def upload_products(self, product_list):
        """Step 5: 上传产品"""
        for product in product_list:
            # 上传图片
            img_url = upload_image(
                self.session,
                product["image_path"],
                product["code"]
            )
            
            # 创建产品
            product_data = self.build_product_data(product, img_url)
            created = create_product(self.session, product_data)
            
            if created:
                self.products.append(created)
    
    def publish_and_verify(self):
        """Step 6: 发布并验证"""
        publish_booth(self.session, self.booth_id)
        verify_booth(self.session, self.booth_id)
    
    def run_full_workflow(self, pdf_paths, booth_config):
        """执行完整工作流"""
        # 1. 登录
        if not self.login():
            raise Exception("登录失败")
        
        # 2. 解析所有PDF
        all_products = []
        for pdf_path in pdf_paths:
            products = self.extract_pdf_data(pdf_path)
            all_products.extend(products)
        
        # 3. 创建分类
        self.setup_categories(all_products)
        
        # 4. 创建展位
        self.create_booth(**booth_config)
        
        # 5. 上传产品
        self.upload_products(all_products)
        
        # 6. 发布验证
        self.publish_and_verify()
        
        return {
            "booth_id": self.booth_id,
            "products_count": len(self.products),
            "product_ids": [p["id"] for p in self.products]
        }

# 使用示例
agent = SellerAgent("1994169578_AI_Seller", ".vhpanrruwu85SIT3A5T")
result = agent.run_full_workflow(
    pdf_paths=[
        "/home/user/products/catalog1.pdf",
        "/home/user/products/catalog2.pdf"
    ],
    booth_config={
        "name": "我的刀具展台",
        "exhibition_name": "2026 国际刀具展",
        "location": "上海新国际博览中心",
        "dates": {"start": "2026-09-01", "end": "2026-09-30"}
    }
)
print(f"完成！创建了 {result['products_count']} 个产品")
```

---

## 附录：API 端点速查

| 功能 | 方法 | 端点 | 备注 |
|------|------|------|------|
| AI Agent 登录 | POST | `/api/auth/delegate-login` | 返回 session cookie |
| 卖家档案 | GET | `/api/user/profile` | 获取卖家信息 |
| 创建分类 | POST | `/api/seller/categories` | 支持多级分类 |
| 查询分类 | GET | `/api/seller/categories` | 获取分类树 |
| 创建展位 | POST | `/api/booths` | 支持多语言 |
| 查询展位 | GET | `/api/booths?id={id}` | 获取展位详情 |
| 更新展位 | PUT | `/api/booths` | body 中包含 `id` |
| 上传图片 | POST | `/api/upload` | multipart/form-data |
| 创建产品 | POST | `/api/products` | 支持关键词、OEM等 |
| 查询产品 | GET | `/api/products` | 卖家所有产品 |
| 更新产品 | PUT | `/api/products/{id}` | 修改产品信息 |
| 删除产品 | DELETE | `/api/products/{id}` | 不可恢复 |

---

*本文档由 SeaHeart Global AI Agent 自动生成，适用于平台卖家 AI Agent 自动化操作。*
