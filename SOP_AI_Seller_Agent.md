# SeaHeart Global AI Agent 卖家操作 SOP

> **版本**: 2.0  
> **适用**: AI Seller Agents (角色: `AI_SELLER`)  
> **目标**: 让 AI Agent 能够自动完成产品上传、展会分配、SEO/GEO优化全流程  
> **更新日期**: 2026-08-07

---

## 0. 监护人-AI Agent 关系说明

### 0.1 账号层级结构

```
监护人账号（人类卖家）
├── 邮箱: guardian@example.com
├── 用户名: 团队切削
├── 角色: SELLER
├── SellerProfile: sp_guardian_id
└── AI Agent 子账号
    ├── 邮箱: guardian@example.com（共享邮箱）
    ├── 用户名: guardian_AI_Seller
    ├── 角色: AI_SELLER
    ├── isAI: true
    ├── ownerId: sp_guardian_id  ← 指向监护人
    └── SellerProfile: sp_agent_id（仅用于登录，不用于数据归属）
```

### 0.2 数据归属规则

1. **AI Agent 创建的所有数据（产品、展会）都归属监护人的 SellerProfile**
2. **监护人和 AI Agent 共享同一个卖家后台，看到的是相同的产品和展会数据**
3. **`resolveSellerFromRequest()` 函数自动完成映射**：AI Agent → 监护人 SellerProfile
4. **产品和展会的 `sellerId` 字段始终指向监护人的 SellerProfile ID**

### 0.3 工作流程概览

```
AI Agent 登录 → 检查监护人现有产品 → 检查监护人现有展会
    → 产品查重（重复则跳过）→ 展会匹配（主题不符则创建新展会）
    → 创建分类 → 上传产品 → 分配到匹配展会 → SEO/GEO优化
```

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
- AI Agent 和监护人使用相同的邮箱登录，系统根据 `isAI` 和 `ownerId` 区分身份

### 1.2 验证卖家身份

```python
# 获取用户基本信息
user_profile = session.get(f"{BASE_URL}/api/user/profile").json()
user_id = user_profile["user"]["id"]
username = user_profile["user"]["username"]
role = user_profile["user"]["role"]
print(f"当前用户: {username}, 角色: {role}, ID: {user_id}")

# 获取监护人的 SellerProfile（AI Agent 创建的数据归属监护人）
# 通过 /api/products 的响应头或 booths API 获取 sellerId
booths = session.get(f"{BASE_URL}/api/booths").json()
if booths.get("booths") and len(booths["booths"]) > 0:
    seller_id = booths["booths"][0]["sellerId"]
    print(f"监护人 SellerProfile ID: {seller_id}")
else:
    print("暂无展会，SellerProfile ID 将在创建首个产品/展会时自动获取")
```

### 1.3 获取关联的监护人信息

```python
def get_guardian_info(session):
    """获取当前 AI Agent 关联的监护人信息"""
    user_data = session.get(f"{BASE_URL}/api/user/profile").json()
    
    if user_data["user"].get("isAI") and user_data["user"].get("ownerId"):
        print(f"当前为 AI Agent 账号，监护人用户 ID: {user_data['user']['ownerId']}")
        return {
            "is_ai": True,
            "agent_id": user_data["user"]["id"],
            "guardian_user_id": user_data["user"]["ownerId"],
            "role": user_data["user"]["role"]
        }
    else:
        print("当前为人类卖家账号（监护人本人）")
        return {
            "is_ai": False,
            "user_id": user_data["user"]["id"],
            "role": user_data["user"]["role"]
        }
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

### 2.4 上传前检查：产品查重与展会匹配

**⚠️ 重要步骤：AI Agent 在上传产品前必须执行此检查！**

#### 2.4.1 检查监护人现有产品（查重）

```python
def check_existing_products(session, product_codes):
    """
    检查监护人账号下是否已存在相同产品
    返回需要跳过的产品代码集合
    """
    # 获取监护人的所有产品
    response = session.get(
        f"{BASE_URL}/api/products",
        params={"limit": 100}  # 最多获取100条
    )
    
    if response.status_code != 200:
        print(f"获取现有产品失败: {response.status_code}")
        return set()
    
    existing_products = response.json().get("products", [])
    existing_titles = set(p["title"] for p in existing_products)
    
    # 检查哪些产品已经存在
    skip_codes = set()
    for code in product_codes:
        # 检查产品标题是否包含代码或完全匹配
        for title in existing_titles:
            if code.upper() in title.upper():
                skip_codes.add(code)
                print(f"  ⚠️  产品 {code} 已存在（标题: {title}），跳过")
                break
    
    return skip_codes


# 使用示例
all_product_codes = [p["code"] for p in product_list]
skip_codes = check_existing_products(session, all_product_codes)

# 过滤掉重复产品
new_products = [p for p in product_list if p["code"] not in skip_codes]
print(f"共 {len(product_list)} 个产品，其中 {len(skip_codes)} 个已存在，{len(new_products)} 个需要上传")
```

#### 2.4.2 检查监护人现有展会（主题匹配）

```python
def check_exhibitions_and_match(session, product_category_keywords):
    """
    检查监护人现有展会，判断是否与产品主题匹配
    返回: (matched_booth_id, needs_new_booth)
    """
    # 获取监护人的所有展会
    response = session.get(f"{BASE_URL}/api/booths")
    
    if response.status_code != 200:
        print(f"获取展会失败: {response.status_code}")
        return None, True  # 需要创建新展会
    
    booths = response.json().get("booths", [])
    
    if not booths:
        print("监护人暂无展会，需要创建新展会")
        return None, True  # 需要创建新展会
    
    # 检查现有展会的主题关键词是否匹配产品
    for booth in booths:
        booth_keywords = [kw.lower() for kw in booth.get("keywords", [])]
        booth_name = booth.get("exhibitionName", "").lower()
        booth_theme = booth.get("theme", "").lower()
        
        # 计算匹配分数
        match_score = 0
        for keyword in product_category_keywords:
            if keyword.lower() in booth_name:
                match_score += 2  # 展会名称匹配权重更高
            if keyword.lower() in booth_keywords:
                match_score += 1
            if keyword.lower() in booth_theme:
                match_score += 1
        
        print(f"展会 '{booth['name']}' 匹配分数: {match_score}")
        
        # 匹配分数 >= 2 认为主题匹配
        if match_score >= 2:
            print(f"  ✅ 找到匹配展会: {booth['name']} (ID: {booth['id']})")
            return booth["id"], False  # 使用现有展会
    
    print("没有找到匹配的展会，需要创建新展会")
    return None, True  # 需要创建新展会


# 使用示例
product_keywords = ["刀具", "镗刀", "铣刀", "boring tools", "milling tools"]
booth_id, need_new = check_exhibitions_and_match(session, product_keywords)

if need_new:
    # 创建新展会（见第4节）
    booth_id = create_matching_booth(session, product_keywords)
    print(f"已创建新展会: {booth_id}")
else:
    print(f"使用现有展会: {booth_id}")
```

#### 2.4.3 创建主题匹配的新展会

```python
def create_matching_booth(session, product_keywords):
    """
    根据产品关键词创建主题匹配的展会
    """
    # 根据产品关键词确定展会主题
    if any(kw in product_keywords for kw in ["刀具", "镗刀", "铣刀", "tool", "boring", "milling"]):
        exhibition_name = "2026 中国国际精密加工刀具展览会"
        location = "上海新国际博览中心 N5馆"
        theme = "cutting-tools"
    elif any(kw in product_keywords for kw in ["轴承", "bearing"]):
        exhibition_name = "2026 中国国际轴承展览会"
        location = "上海新国际博览中心 N3馆"
        theme = "bearings"
    elif any(kw in product_keywords for kw in ["模具", "mold", "die"]):
        exhibition_name = "2026 中国国际模具展览会"
        location = "上海新国际博览中心 N2馆"
        theme = "molds"
    else:
        exhibition_name = "2026 中国国际精密加工展览会"
        location = "上海新国际博览中心 N6馆"
        theme = "precision-machining"
    
    booth = create_booth(
        session=session,
        name=f"台州绘寰{exhibition_name.split(' ')[-1]}展台",
        exhibition_name=exhibition_name,
        location=location,
        dates={"start": "2026-09-01", "end": "2026-09-30"},
        keywords=product_keywords + [
            "manufacturer", "factory", "OEM ODM",
            "supplier", "wholesale"
        ],
        theme=theme
    )
    
    return booth["id"] if booth else None
```

#### 2.4.4 完整的前置检查流程

```python
def pre_upload_check(session, product_list):
    """
    完整的上传前检查流程
    
    Returns:
        new_products: 需要上传的产品列表（已过滤重复）
        booth_id: 匹配的展会ID（可能是现有或新创建的）
    """
    print("=" * 60)
    print("📋 执行上传前检查...")
    print("=" * 60)
    
    # Step 1: 产品查重
    print("\n🔍 Step 1: 产品查重")
    product_codes = [p["code"] for p in product_list]
    skip_codes = check_existing_products(session, product_codes)
    new_products = [p for p in product_list if p["code"] not in skip_codes]
    
    if len(new_products) == 0:
        print("✅ 所有产品均已存在，无需上传")
        return [], None
    
    # Step 2: 确定产品分类关键词
    print("\n🏷️  Step 2: 确定产品关键词")
    category_keywords = extract_keywords_from_products(new_products)
    print(f"产品关键词: {category_keywords}")
    
    # Step 3: 展会匹配
    print("\n🏛️  Step 3: 展会匹配检查")
    booth_id, need_new = check_exhibitions_and_match(session, category_keywords)
    
    if need_new:
        print("\n➕ 创建新展会...")
        booth_id = create_matching_booth(session, category_keywords)
    
    print(f"\n✅ 检查完成: {len(new_products)} 个新产品待上传, 展会: {booth_id}")
    print("=" * 60)
    
    return new_products, booth_id


# 使用示例
new_products, booth_id = pre_upload_check(session, product_list)
if new_products:
    # 继续执行分类创建和产品上传流程
    pass
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
        # === 基本信息（必须中英文） ===
        "title": product_data["name_zh"],           # 主标题（中文，必填）
        "titles": {                                   # 多语言标题（至少包含 zh + en）
            "zh": product_data["name_zh"],
            "en": product_data["name_en"],
            "de": product_data["name_en"],             # 其他语言用英文兜底
            "ja": product_data["name_en"],
            "ko": product_data["name_en"],
            "ru": product_data["name_en"],
            "es": product_data["name_en"],
            "fr": product_data["name_en"],
            "pt": product_data["name_en"],
            "hi": product_data["name_en"],
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

        # === 商业信息（单位必填！） ===
        "minOrderQty": 1,                             # 起订量：1件
        "minOrderUnitId": "cmrvptyzx00043yg8v3vfmppt",  # 起订单位ID：个/Piece
        "supplyCapacity": "100000",                   # 月产能：100,000
        "supplyCapacityUnitId": "cmrvptyzx00043yg8v3vfmppt",  # 产能单位ID：个/Piece
        "acceptsOEM": True,                           # 支持OEM（根据监护人需求设置）
        "boothId": product_data["booth_id"],          # 关联展位

        # === SEO关键词（必须包含前10语言！） ===
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

**⚠️ 必填字段检查清单（创建产品前必须确认）：**

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 中文标题（必填） | `CMR20系列整体式粗镗头` |
| `titles.en` | 英文标题（必填） | `CMR20 Series Integrated Rough Boring Head` |
| `titles.zh` | 中文标题（必填） | `CMR20系列整体式粗镗头` |
| `minOrderUnitId` | 起订单位ID（必填） | `cmrvptyzx00043yg8v3vfmppt`（个/Piece） |
| `supplyCapacityUnitId` | 产能单位ID（必填） | `cmrvptyzx00043yg8v3vfmppt`（个/Piece） |
| `acceptsOEM` | 是否接受OEM（必填） | `True`（根据监护人需求） |
| `keywords` | 关键词数组（必填，前10语言） | 见下方关键词模板 |
| `mainImageUrl` | 主图URL（必填） | `/uploads/products/xxx.webp` |
| `categoryId` | 分类ID（必填） | 从分类树获取 |
| `boothId` | 关联展位ID（必填） | 从展会匹配获取 |

**常用单位ID速查：**

| 单位 | ID | 说明 |
|------|------|------|
| 个/Piece | `cmrvptyzx00043yg8v3vfmppt` | 最常用，刀具类产品 |
| 件/Piece | `cmrvptai700033yg8oqr33s3o` | 同为件 |
| 套/Set | `cmrvpvbmj00063yg8kn6q2pvi` | 成套产品 |
| 箱/Carton | `cmrvpxgmt00093yg8f8s1ud2n` | 按箱销售 |
| 吨/Ton | `cmrvq53hy000j3yg89qpcwczu` | 大宗商品 |

### 6.2 产品关键词设置（前10语言）

每个产品必须配置 **40-50 个关键词**，覆盖 **前10种贸易语言**：

```python
# 前10语言关键词模板
KEYWORD_TEMPLATES = {
    "boring_head": {  # 镗头类
        "zh": ["粗镗头", "镗刀", "CNC刀具", "精密加工", "机加工"],
        "en": ["boring head", "rough boring", "CNC tool", "precision machining", "machining"],
        "de": ["Ausdrehkopf", "CNC Werkzeug", "Präzisionsbearbeitung"],
        "ja": ["中ぐりヘッド", "CNC工具", "精密加工"],
        "ko": ["보링 헤드", "CNC 공구", "정밀 가공"],
        "ru": ["расточная головка", "CNC инструмент", "точная обработка"],
        "es": ["cabezal de mandrinado", "herramienta CNC", "mecanizado de precisión"],
        "fr": ["tête d'alésage", "outil CNC", "usinage de précision"],
        "pt": ["cabeçote de mandrilagem", "ferramenta CNC", "usinagem de precisão"],
        "hi": ["बोरिंग हेड", "CNC टूल", "सटीक मशीनिंग"],
    },
    # ... 其他产品类型模板
}

# 通用商业关键词（所有产品都应包含）
COMMERCIAL_KEYWORDS = [
    "OEM ODM", "manufacturer", "factory", "supplier", "wholesale",
    "custom", "high quality", "Taizhou", "China",
]

def build_keywords(product_type, product_code):
    """构建前10语言关键词"""
    template = KEYWORD_TEMPLATES[product_type]
    keywords = []
    for lang in ["zh", "en", "de", "ja", "ko", "ru", "es", "fr", "pt", "hi"]:
        keywords.extend(template.get(lang, []))
    keywords.append(product_code)  # 产品型号
    keywords.extend(COMMERCIAL_KEYWORDS)  # 商业关键词
    # 去重
    seen = set()
    unique = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique.append(kw)
    return unique[:50]  # 最多50个
```

**前10语言覆盖要求：**
1. 中文（zh）- 产品类型词 + 应用场景词
2. 英语（en）- 产品类型词 + 应用场景词
3. 德语（de）- 产品类型词
4. 日语（ja）- 产品类型词
5. 韩语（ko）- 产品类型词
6. 俄语（ru）- 产品类型词
7. 西班牙语（es）- 产品类型词
8. 法语（fr）- 产品类型词
9. 葡萄牙语（pt）- 产品类型词
10. 印地语（hi）- 产品类型词

**关键词示例（镗头类产品）：**
```python
keywords = [
    # 中文
    "粗镗头", "镗刀", "CNC刀具", "精密加工", "机加工",
    # 英文
    "boring head", "rough boring", "CNC tool", "precision machining", "machining",
    # 德语
    "Ausdrehkopf", "CNC Werkzeug", "Präzisionsbearbeitung",
    # 日语
    "中ぐりヘッド", "CNC工具", "精密加工",
    # 韩语
    "보링 헤드", "CNC 공구", "정밀 가공",
    # 俄语
    "расточная головка", "CNC инструмент", "точная обработка",
    # 西班牙语
    "cabezal de mandrinado", "herramienta CNC", "mecanizado de precisión",
    # 法语
    "tête d'alésage", "outil CNC", "usinage de précision",
    # 葡萄牙语
    "cabeçote de mandrilagem", "ferramenta CNC", "usinagem de precisão",
    # 印地语
    "बोरिंग हेड", "CNC टूल", "सटीक मशीनिंग",
    # 产品型号 + 商业词
    "CMR20", "OEM ODM", "manufacturer", "factory", "supplier",
    "wholesale", "custom", "high quality", "Taizhou", "China",
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
| AI Agent 创建的数据监护人看不到 | 数据绑定到了 AI Agent 的 SellerProfile 而非监护人 | 使用 `resolveSellerFromRequest()` 自动映射到监护人 Profile |
| AI Agent 登录后看不到自己的展会 | GET 端点使用 `session.user.id` 而非 `resolveSellerFromRequest` | 所有 GET 端点也必须使用 `resolveSellerFromRequest()` |

### 9.3 监护人-AI Agent 协作问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 重复上传产品 | 未检查监护人现有产品 | 执行 `check_existing_products()` 查重 |
| 产品分配到错误的展会 | 未检查展会主题匹配度 | 使用 `check_exhibitions_and_match()` 进行主题匹配 |
| 展会主题与产品不符 | 未创建新展会 | 当无匹配展会时调用 `create_matching_booth()` 创建 |
| 监护人和 AI Agent 看到的数据不一致 | 前端缓存或 API 响应不同步 | 两者都通过 `resolveSellerFromRequest()` 获取相同数据 |

### 9.4 性能优化

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
    
    def check_existing_products(self, product_codes):
        """Step 2.5a: 检查监护人现有产品，返回需跳过的代码"""
        response = self.session.get(
            f"{self.base_url}/api/products",
            params={"limit": 100}
        )
        if response.status_code != 200:
            return set()
        existing = response.json().get("products", [])
        existing_titles = {p["title"] for p in existing}
        skip = set()
        for code in product_codes:
            for title in existing_titles:
                if code.upper() in title.upper():
                    skip.add(code)
                    break
        return skip

    def check_exhibitions_and_match(self, keywords):
        """Step 2.5b: 检查监护人现有展会，返回匹配的booth_id"""
        response = self.session.get(f"{self.base_url}/api/booths")
        if response.status_code != 200:
            return None, True
        booths = response.json().get("booths", [])
        for booth in booths:
            score = 0
            booth_text = (booth.get("exhibitionName", "") + " " + 
                         " ".join(booth.get("keywords", []))).lower()
            for kw in keywords:
                if kw.lower() in booth_text:
                    score += 1
            if score >= 2:
                return booth["id"], False
        return None, True

    def run_full_workflow(self, pdf_paths, booth_config=None):
        """执行完整工作流（含查重和展会匹配）"""
        # 1. 登录
        if not self.login():
            raise Exception("登录失败")
        
        # 2. 解析所有PDF
        all_products = []
        for pdf_path in pdf_paths:
            products = self.extract_pdf_data(pdf_path)
            all_products.extend(products)
        
        # 2.5 上传前检查（关键步骤！）
        print("\n📋 执行上传前检查...")
        product_codes = [p["code"] for p in all_products]
        
        # 2.5a 产品查重
        skip_codes = self.check_existing_products(product_codes)
        new_products = [p for p in all_products if p["code"] not in skip_codes]
        print(f"产品查重: {len(product_codes)} 个总数, {len(skip_codes)} 个重复, {len(new_products)} 个新产品")
        
        if not new_products:
            print("✅ 所有产品均已存在，无需上传！")
            return {"booth_id": None, "products_count": 0, "skipped": True}
        
        # 2.5b 展会匹配
        category_keywords = extract_keywords_from_products(new_products)
        booth_id, need_new = self.check_exhibitions_and_match(category_keywords)
        
        if need_new:
            print("创建新展会（主题匹配产品）...")
            booth_id = create_matching_booth(self.session, category_keywords)
        else:
            print(f"使用现有展会: {booth_id}")
        
        self.booth_id = booth_id
        
        # 3. 创建分类
        self.setup_categories(new_products)
        
        # 4. 上传产品（使用匹配的展会）
        self.upload_products(new_products)
        
        # 5. 发布验证
        self.publish_and_verify()
        
        return {
            "booth_id": self.booth_id,
            "products_count": len(self.products),
            "product_ids": [p["id"] for p in self.products],
            "skipped_duplicates": len(skip_codes)
        }

# 使用示例
agent = SellerAgent("1994169578_AI_Seller", ".vhpanrruwu85SIT3A5T")
result = agent.run_full_workflow(
    pdf_paths=[
        "/home/user/products/catalog1.pdf",
        "/home/user/products/catalog2.pdf"
    ]
)
print(f"完成！创建了 {result['products_count']} 个产品，跳过 {result.get('skipped_duplicates', 0)} 个重复产品")
```

---

## 附录：API 端点速查

| 功能 | 方法 | 端点 | 备注 |
|------|------|------|------|
| AI Agent 登录 | POST | `/api/auth/delegate-login` | 返回 session cookie，支持 AI_SELLER 角色 |
| 获取用户信息 | GET | `/api/user/profile` | 返回用户基本信息（不包含 SellerProfile） |
| 查询产品列表 | GET | `/api/products` | 返回监护人名下所有产品（AI Agent 和监护人共享） |
| 创建产品 | POST | `/api/products` | 自动归属到监护人 SellerProfile |
| 更新产品 | PUT | `/api/products/{id}` | 修改产品信息 |
| 删除产品 | DELETE | `/api/products/{id}` | 不可恢复 |
| 查询展位列表 | GET | `/api/booths` | 返回监护人名下所有展位（共享） |
| 查询展位详情 | GET | `/api/booths?id={id}` | 获取展位详情及产品 |
| 创建展位 | POST | `/api/booths` | 自动归属到监护人 SellerProfile |
| 更新展位 | PUT | `/api/booths` | body 中包含 `id` |
| 创建分类 | POST | `/api/seller/categories` | 支持多级分类（1-5级） |
| 查询分类 | GET | `/api/seller/categories` | 获取分类树 |
| 上传图片 | POST | `/api/upload` | multipart/form-data，支持 AI_SELLER |
| 产品搜索 | GET | `/api/products/search?q={keyword}` | 关键词搜索产品 |

---

### 重要提示

1. **所有创建/查询端点都使用 `resolveSellerFromRequest()`**：AI Agent 的请求会自动映射到监护人的 SellerProfile
2. **监护人和 AI Agent 看到相同的数据**：两者通过不同的 User ID 登录，但查询时都指向监护人的 SellerProfile
3. **产品/展会的 `sellerId` 永远是监护人 ID**：即使由 AI Agent 创建，数据也归监护人所有
4. **AI Agent 有独立的 SellerProfile 但不用于数据归属**：仅作为登录和权限验证的载体

---

*本文档版本 2.0，更新于 2026-08-07。适用于平台卖家 AI Agent 自动化操作，包含产品查重、展会匹配等协作功能。*
