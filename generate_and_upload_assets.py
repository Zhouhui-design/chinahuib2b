#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
资产生成与上传：
1. 用 PIL 生成 6 个 logo (512x512) + 6 个 banner (1600x900)
2. 登录 AI agent 账号
3. 上传 3 个展会资料文档 (boothDocument)
4. 上传 12 张图片 (6 logo + 6 banner)
5. 保存所有 URL 到 /tmp/booth_assets.json
"""
import os, json, sys, math, time, requests
from urllib.parse import urlencode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = "https://x2xhub.com"
USERNAME = "1994169579_AI_Seller"
PASSWORD = ".sboe33lwwroG8WFX81B"
ASSET_DIR = "/tmp/booth_assets"
os.makedirs(ASSET_DIR, exist_ok=True)

# 字体
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_CJK = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"
def font(path, size):
    try: return ImageFont.truetype(path, size)
    except Exception:
        try: return ImageFont.truetype(FONT_REG, size)
        except Exception: return ImageFont.load_default()

# 6个展台定义：名称 + 缩写 + 主题色(RGB) + 英文标签
BOOTHS = [
    {"name": "Jianhao Aerosol Fire Suppression Expo",          "label": "AEROSOL FIRE SUPPRESSION",       "color": (192, 35, 58)},
    {"name": "Jianhao Suspended Gas Suppression Expo",         "label": "SUSPENDED GAS SUPPRESSION",      "color": (30, 84, 158)},
    {"name": "Jianhao Fire Suppression Devices Expo",         "label": "FIRE SUPPRESSION DEVICES",       "color": (214, 110, 32)},
    {"name": "Jianhao Specialized Suppression Systems Expo",  "label": "SPECIALIZED SUPPRESSION SYSTEMS","color": (96, 55, 178)},
    {"name": "Jianhao Cabinet Gas Fire Extinguishing Expo",   "label": "CABINET GAS EXTINGUISHING",      "color": (16, 118, 102)},
    {"name": "Jianhao Fire & Life Safety Expo",                "label": "FIRE & LIFE SAFETY",             "color": (196, 34, 42)},
]

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i]-c1[i])*t) for i in range(3))

def make_gradient(size, c_top, c_bottom, vertical=True):
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(h-1, 1)
        c = lerp_color(c_top, c_bottom, t)
        for x in range(w):
            px[x, y] = c
    return img

def draw_flame(draw, cx, cy, scale, color_outer, color_inner):
    """绘制程式化火焰：外层橙红 + 内层黄"""
    # 外层火焰(水滴形)
    pts_outer = [
        (cx, cy - 60*scale), (cx+38*scale, cy-10*scale), (cx+34*scale, cy+30*scale),
        (cx+12*scale, cy+52*scale), (cx-12*scale, cy+52*scale), (cx-34*scale, cy+30*scale),
        (cx-38*scale, cy-10*scale),
    ]
    draw.polygon(pts_outer, fill=color_outer)
    # 内层火焰
    pts_inner = [
        (cx, cy - 38*scale), (cx+20*scale, cy-4*scale), (cx+18*scale, cy+22*scale),
        (cx+6*scale, cy+36*scale), (cx-6*scale, cy+36*scale), (cx-18*scale, cy+22*scale),
        (cx-20*scale, cy-4*scale),
    ]
    draw.polygon(pts_inner, fill=color_inner)

def draw_shield(draw, cx, cy, w, h, fill, outline):
    """绘制盾牌形状"""
    pts = [
        (cx, cy - h//2),
        (cx + w//2, cy - h//2 + 12),
        (cx + w//2 - 6, cy + h//4),
        (cx + w//8, cy + h//2),
        (cx - w//8, cy + h//2),
        (cx - w//2 + 6, cy + h//4),
        (cx - w//2, cy - h//2 + 12),
    ]
    draw.polygon(pts, fill=fill, outline=outline)

def make_logo(booth, idx):
    """生成 512x512 logo"""
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    col = booth["color"]
    # 外圆背景(渐变)
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bgd = ImageDraw.Draw(bg)
    for r in range(S//2, 0, -1):
        t = 1 - r / (S//2)
        c = lerp_color((30, 30, 35), col, t*0.7 + 0.15)
        bgd.ellipse([S//2-r, S//2-r, S//2+r, S//2+r], fill=(*c, 255))
    img = Image.alpha_composite(img, bg)
    d = ImageDraw.Draw(img)
    # 外环
    d.ellipse([14, 14, S-14, S-14], outline=(245, 245, 245), width=6)
    d.ellipse([30, 30, S-30, S-30], outline=(*col, 255), width=3)
    # 盾牌
    draw_shield(d, S//2, S//2-10, 200, 230, (252, 252, 252), col)
    # 火焰
    draw_flame(d, S//2, S//2-30, 1.5, (224, 65, 27), (255, 196, 37))
    # "JH" 字样
    f_jh = font(FONT_BOLD, 70)
    d.text((S//2, S//2+95), "JH", fill=col, font=f_jh, anchor="mm")
    # 底部文字
    f_small = font(FONT_BOLD, 22)
    d.text((S//2, S//2+150), "JIANHAO FIRE SAFETY", fill=(245, 245, 245), font=f_small, anchor="mm")
    return img.convert("RGB")

def make_banner(booth, idx):
    """生成 1600x900 banner"""
    W, H = 1600, 900
    col = booth["color"]
    dark = (18, 20, 26)
    img = make_gradient((W, H), lerp_color(col, dark, 0.55), dark)
    d = ImageDraw.Draw(img)
    # 左侧装饰竖条
    d.rectangle([0, 0, 18, H], fill=col)
    d.rectangle([26, 0, 34, H], fill=(245, 245, 245))
    # 盾牌+火焰徽标(左上)
    draw_shield(d, 200, 230, 220, 250, (252, 252, 252), col)
    draw_flame(d, 200, 210, 1.7, (224, 65, 27), (255, 196, 37))
    f_jh = font(FONT_BOLD, 76)
    d.text((200, 335), "JH", fill=col, font=f_jh, anchor="mm")
    # 标题
    f_title = font(FONT_BOLD, 64)
    f_sub = font(FONT_REG, 36)
    title = booth["label"]
    d.text((360, 180), "JIANHAO FIRE SAFETY", fill=(220, 220, 220), font=f_sub, anchor="lm")
    d.text((360, 250), title, fill=(255, 255, 255), font=f_title, anchor="lm")
    # 装饰横线
    d.rectangle([360, 300, 720, 306], fill=col)
    # 副信息
    f_info = font(FONT_REG, 30)
    d.text((360, 340), "Exhibition & Trade Show 2026", fill=(190, 190, 190), font=f_info, anchor="lm")
    d.text((360, 385), "Taizhou Huihuan International Trading Co., Ltd.", fill=(170, 170, 170), font=f_info, anchor="lm")
    # 右下角 OEM/MOQ 标签
    f_tag = font(FONT_BOLD, 28)
    tags = ["OEM / ODM Available", "MOQ: 100 Sets", "ISO Certified"]
    ty = H - 180
    for t in tags:
        tw = d.textlength(t, font=f_tag)
        d.rounded_rectangle([W-tw-90, ty, W-50, ty+50], radius=8, fill=(*col, 200) if False else col)
        d.text((W-tw-70, ty+25), t, fill=(255, 255, 255), font=f_tag, anchor="lm")
        ty += 64
    # 底部色带
    d.rectangle([0, H-12, W, H], fill=col)
    return img

def login(session):
    r = session.get(f"{BASE}/api/auth/csrf", timeout=30); r.raise_for_status()
    csrf = r.json()["csrfToken"]
    data = urlencode({"csrfToken": csrf, "email": USERNAME, "password": PASSWORD,
                      "callbackUrl": f"{BASE}/zh/seller/products", "json": "true"})
    session.post(f"{BASE}/api/auth/callback/credentials", data=data,
                 headers={"Content-Type": "application/x-www-form-urlencoded"},
                 timeout=30, allow_redirects=False)
    s = session.get(f"{BASE}/api/auth/session", timeout=30).json()
    if s.get("user"):
        print(f"✓ 登录: {s['user'].get('name')}"); return True
    print(f"❌ 登录失败: {s}"); return False

def upload_file(session, path, fname, mime, utype):
    with open(path, "rb") as f:
        files = {"file": (fname, f, mime)}
        data = {"type": utype}
        r = session.post(f"{BASE}/api/upload", files=files, data=data, timeout=300)
    if r.status_code == 200:
        body = r.json()
        return body.get("url"), body
    return None, f"HTTP {r.status_code}: {r.text[:200]}"

def main():
    print("="*70); print("阶段A: 生成图片 + 上传文档/图片"); print("="*70)
    # 1. 生成图片
    print("\n[1] 生成 logo + banner...")
    for i, b in enumerate(BOOTHS):
        logo = make_logo(b, i); logo.save(f"{ASSET_DIR}/logo_{i+1}.png", "PNG")
        banner = make_banner(b, i); banner.save(f"{ASSET_DIR}/banner_{i+1}.png", "PNG")
        print(f"  ✓ 展台{i+1} {b['name'][:40]}: logo+banner 已生成")
    print(f"  图片已保存到 {ASSET_DIR}/")

    # 2. 登录
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (AI-Asset) Chrome/120", "Accept": "application/json"})
    print("\n[2] 登录..."); 
    if not login(session): sys.exit(1)

    # 3. 上传文档
    docs = [
        ("/home/sardenesy/桌面/新建文件夹/消防器材/24建豪消防资质画册_redacted.pdf", "24建豪消防资质画册.pdf", "application/pdf"),
        ("/home/sardenesy/桌面/新建文件夹/消防器材/2024.10画册建豪消防_redacted.pdf", "2024建豪消防产品画册.pdf", "application/pdf"),
        ("/home/sardenesy/桌面/新建文件夹/消防器材/26.6.1_Price_List_EN(原价）.xlsx", "Jianhao_Price_List_EN.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ]
    print("\n[3] 上传 3 个文档...")
    doc_urls = []
    for path, fname, mime in docs:
        sz = os.path.getsize(path) / 1024 / 1024
        print(f"  上传 {fname} ({sz:.1f}MB)...", end=" ", flush=True)
        url, info = upload_file(session, path, fname, mime, "boothDocument")
        if url:
            print(f"✓ {url}")
            doc_urls.append({"url": url, "name": fname, "type": mime, "size": os.path.getsize(path)})
        else:
            print(f"❌ {info}")
            sys.exit(1)

    # 4. 上传图片
    print("\n[4] 上传 6 logo + 6 banner...")
    assets = {"docs": doc_urls, "booths": []}
    for i, b in enumerate(BOOTHS):
        logo_url, info = upload_file(session, f"{ASSET_DIR}/logo_{i+1}.png", f"logo_{i+1}.png", "image/png", "logo")
        if not logo_url: print(f"  ❌ logo_{i+1}: {info}"); sys.exit(1)
        banner_url, info = upload_file(session, f"{ASSET_DIR}/banner_{i+1}.png", f"banner_{i+1}.png", "image/png", "banner")
        if not banner_url: print(f"  ❌ banner_{i+1}: {info}"); sys.exit(1)
        assets["booths"].append({"name": b["name"], "label": b["label"], "color": b["color"], "logoUrl": logo_url, "bannerUrl": banner_url})
        print(f"  ✓ 展台{i+1}: logo={logo_url[-30:]} banner={banner_url[-30:]}")

    with open("/tmp/booth_assets.json", "w", encoding="utf-8") as f:
        json.dump(assets, f, ensure_ascii=False, indent=2)
    print(f"\n✓ 所有资源 URL 已保存到 /tmp/booth_assets.json")
    print(f"  文档: {len(doc_urls)} 个, 展台图片: {len(assets['booths'])} 组")

if __name__ == "__main__":
    main()
