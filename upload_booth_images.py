#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重新上传 12 张展会图片(用 boothLogo/boothBanner 类型避免 sellerProfile 副作用)，
并与已上传的文档 URL 合并保存到 /tmp/booth_assets.json"""
import os, json, requests
from urllib.parse import urlencode

BASE = "https://x2xhub.com"
USERNAME = "1994169579_AI_Seller"
PASSWORD = ".sboe33lwwroG8WFX81B"
ASSET_DIR = "/tmp/booth_assets"

# 已上传的文档 URL(来自上一步输出)
DOCS = [
    {"url": "/uploads/booth-documents/e6292ba7-51f4-4901-b5b0-89ad29be65e2.pdf", "name": "24建豪消防资质画册.pdf", "type": "application/pdf", "size": 31555167},
    {"url": "/uploads/booth-documents/0249a64f-26ce-435c-ae98-a295c2323cec.pdf", "name": "2024建豪消防产品画册.pdf", "type": "application/pdf", "size": 85536157},
    {"url": "/uploads/booth-documents/74969d56-aac5-4745-bd69-b20643ddaffc.xlsx", "name": "Jianhao_Price_List_EN.xlsx", "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size": 77330933},
]

BOOTHS = [
    {"name": "Jianhao Aerosol Fire Suppression Expo",          "label": "AEROSOL FIRE SUPPRESSION",       "color": [192, 35, 58]},
    {"name": "Jianhao Suspended Gas Suppression Expo",         "label": "SUSPENDED GAS SUPPRESSION",      "color": [30, 84, 158]},
    {"name": "Jianhao Fire Suppression Devices Expo",         "label": "FIRE SUPPRESSION DEVICES",       "color": [214, 110, 32]},
    {"name": "Jianhao Specialized Suppression Systems Expo",  "label": "SPECIALIZED SUPPRESSION SYSTEMS","color": [96, 55, 178]},
    {"name": "Jianhao Cabinet Gas Fire Extinguishing Expo",   "label": "CABINET GAS EXTINGUISHING",      "color": [16, 118, 102]},
    {"name": "Jianhao Fire & Life Safety Expo",                "label": "FIRE & LIFE SAFETY",             "color": [196, 34, 42]},
]

def login(session):
    r = session.get(f"{BASE}/api/auth/csrf", timeout=30); r.raise_for_status()
    csrf = r.json()["csrfToken"]
    data = urlencode({"csrfToken": csrf, "email": USERNAME, "password": PASSWORD,
                      "callbackUrl": f"{BASE}/zh/seller/products", "json": "true"})
    session.post(f"{BASE}/api/auth/callback/credentials", data=data,
                 headers={"Content-Type": "application/x-www-form-urlencoded"},
                 timeout=30, allow_redirects=False)
    s = session.get(f"{BASE}/api/auth/session", timeout=30).json()
    return bool(s.get("user"))

def upload(session, path, fname, mime, utype):
    with open(path, "rb") as f:
        r = session.post(f"{BASE}/api/upload", files={"file": (fname, f, mime)}, data={"type": utype}, timeout=120)
    if r.status_code == 200:
        return r.json().get("url"), None
    return None, f"HTTP {r.status_code}: {r.text[:200]}"

def main():
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (AI-Img) Chrome/120", "Accept": "application/json"})
    if not login(session):
        print("❌ 登录失败"); exit(1)
    print("✓ 登录成功")

    assets = {"docs": DOCS, "booths": []}
    print("\n上传 6 logo (boothLogo) + 6 banner (boothBanner)...")
    for i, b in enumerate(BOOTHS):
        logo_url, err = upload(session, f"{ASSET_DIR}/logo_{i+1}.png", f"booth_logo_{i+1}.png", "image/png", "boothLogo")
        if not logo_url: print(f"  ❌ logo_{i+1}: {err}"); exit(1)
        banner_url, err = upload(session, f"{ASSET_DIR}/banner_{i+1}.png", f"booth_banner_{i+1}.png", "image/png", "boothBanner")
        if not banner_url: print(f"  ❌ banner_{i+1}: {err}"); exit(1)
        assets["booths"].append({**b, "logoUrl": logo_url, "bannerUrl": banner_url})
        print(f"  ✓ 展台{i+1} {b['name'][:42]}: logo+banner OK")

    with open("/tmp/booth_assets.json", "w", encoding="utf-8") as f:
        json.dump(assets, f, ensure_ascii=False, indent=2)
    print(f"\n✓ 已保存 /tmp/booth_assets.json (3 文档 + {len(assets['booths'])} 组展台图)")

if __name__ == "__main__":
    main()
