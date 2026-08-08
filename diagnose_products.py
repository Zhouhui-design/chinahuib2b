#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
只读诊断脚本：登录 AI agent 账号，抓取所有产品和展位，打印详细诊断报告。
不修改任何数据。
"""
import requests
import json
import sys
from urllib.parse import urlencode

BASE = "https://x2xhub.com"
USERNAME = "1994169579_AI_Seller"
PASSWORD = ".sboe33lwwroG8WFX81B"

def login(session):
    """通过 NextAuth credentials provider 登录，获取 session cookie。"""
    # 1. 获取 CSRF token
    r = session.get(f"{BASE}/api/auth/csrf", timeout=30)
    r.raise_for_status()
    csrf = r.json().get("csrfToken")
    if not csrf:
        print("❌ 无法获取 CSRF token")
        print("响应内容:", r.text[:500])
        return False
    print(f"✓ CSRF token 获取成功: {csrf[:12]}...")

    # 2. 提交凭据登录
    data = {
        "csrfToken": csrf,
        "email": USERNAME,
        "password": PASSWORD,
        "callbackUrl": f"{BASE}/zh/seller/products",
        "json": "true",
    }
    r = session.post(
        f"{BASE}/api/auth/callback/credentials",
        data=urlencode(data),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
        allow_redirects=False,
    )
    print(f"  登录响应 status={r.status_code}")
    # NextAuth credentials callback 可能返回 200 (json) 或 302 (重定向)
    if r.status_code == 200:
        try:
            body = r.json()
            print(f"  登录返回 JSON: {json.dumps(body, ensure_ascii=False)[:200]}")
            if body.get("error"):
                print(f"❌ 登录失败: {body['error']}")
                return False
        except Exception:
            print(f"  登录返回非JSON: {r.text[:200]}")
    elif r.status_code in (302, 303):
        print(f"  重定向到: {r.headers.get('Location', '')[:120]}")

    # 3. 验证 session 是否生效 —— 调用 /api/auth/session
    r = session.get(f"{BASE}/api/auth/session", timeout=30)
    sess = r.json()
    if sess.get("user"):
        u = sess["user"]
        print(f"✓ 登录成功! user={u.get('name')} email={u.get('email')} role={u.get('role')} isAI={u.get('isAI')} ownerId={u.get('ownerId')}")
        return True
    else:
        print(f"❌ Session 未生效，/api/auth/session 返回: {json.dumps(sess, ensure_ascii=False)[:300]}")
        print(f"  Cookies: {dict(session.cookies)}")
        return False


def fetch_all_products(session):
    """分页抓取所有产品。"""
    all_products = []
    page = 1
    limit = 100
    while True:
        r = session.get(f"{BASE}/api/products?page={page}&limit={limit}", timeout=60)
        if r.status_code != 200:
            print(f"❌ 获取产品失败 page={page} status={r.status_code}: {r.text[:300]}")
            return None
        data = r.json()
        products = data.get("products", [])
        pg = data.get("pagination", {})
        all_products.extend(products)
        print(f"  第{page}页: 获取 {len(products)} 个产品 (累计 {len(all_products)}/{pg.get('total')})")
        if page >= pg.get("totalPages", 1):
            break
        page += 1
    return all_products, data.get("booths", [])


def main():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (AI-Agent-Diagnostic) Chrome/120",
        "Accept": "application/json",
    })

    print("=" * 70)
    print("步骤 1: 登录")
    print("=" * 70)
    if not login(session):
        sys.exit(1)

    print()
    print("=" * 70)
    print("步骤 2: 抓取所有产品")
    print("=" * 70)
    result = fetch_all_products(session)
    if not result:
        sys.exit(1)
    products, booths = result

    print()
    print("=" * 70)
    print(f"诊断报告: 共 {len(products)} 个产品, {len(booths)} 个展位")
    print("=" * 70)

    # --- 单位(unit)统计 ---
    unit_counter = {}
    no_unit = []
    for p in products:
        u = p.get("unit")
        if u is None or u == "" or (isinstance(u, str) and u.strip() == ""):
            no_unit.append(p)
            key = "(空/null)"
        else:
            key = u
        unit_counter[key] = unit_counter.get(key, 0) + 1
    print(f"\n【单位统计】")
    for k, v in sorted(unit_counter.items(), key=lambda x: -x[1]):
        print(f"  {k!r}: {v} 个")
    print(f"  → 缺少单位的产品: {len(no_unit)} 个")

    # --- 图片统计 ---
    no_main = []
    has_main = []
    main_but_no_images = []
    for p in products:
        main = p.get("mainImageUrl")
        imgs = p.get("images", []) or []
        if not main:
            no_main.append(p)
            if not imgs:
                main_but_no_images.append(p)
        else:
            has_main.append(p)
    print(f"\n【图片统计】")
    print(f"  有 mainImageUrl: {len(has_main)} 个")
    print(f"  缺少 mainImageUrl: {len(no_main)} 个")
    print(f"    其中 images数组也空的: {len(main_but_no_images)} 个")
    print(f"    其中 images数组有图但mainImageUrl空: {len(no_main) - len(main_but_no_images)} 个 ← 这类可通过补 mainImageUrl 修复图片显示")

    # --- 展位分配统计 ---
    with_booth = [p for p in products if p.get("booth")]
    without_booth = [p for p in products if not p.get("booth")]
    print(f"\n【展位分配统计】")
    print(f"  已分配展位: {len(with_booth)} 个")
    print(f"  未分配展位: {len(without_booth)} 个")
    booth_count = {}
    for p in with_booth:
        bname = p["booth"].get("name", "?")
        booth_count[bname] = booth_count.get(bname, 0) + 1
    for k, v in sorted(booth_count.items(), key=lambda x: -x[1]):
        print(f"    {k}: {v} 个")

    # --- 展位列表 ---
    print(f"\n【展位列表】")
    if not booths:
        print("  (无展位)")
    for b in booths:
        print(f"  - id={b.get('id')} name={b.get('name')!r} exhibition={b.get('exhibitionName')!r} published={b.get('isPublished')}")

    # --- 目标展位查找 ---
    target = "Jianhao Fire Safety & Protection Expo"
    print(f"\n【查找目标展位】 {target!r}")
    found = None
    for b in booths:
        if target.lower() in (b.get("name") or "").lower() or target.lower() in (b.get("exhibitionName") or "").lower():
            found = b
            print(f"  ✓ 找到: id={b.get('id')} name={b.get('name')!r} exhibition={b.get('exhibitionName')!r}")
    if not found:
        print(f"  ✗ 未在当前卖家展位中找到完全匹配，请检查展位是否归属此账号")
        # 模糊匹配
        for b in booths:
            if "jianhao" in (b.get("name") or "").lower() or "fire" in (b.get("name") or "").lower() or "jianhao" in (b.get("exhibitionName") or "").lower():
                print(f"    模糊匹配候选: id={b.get('id')} name={b.get('name')!r} exhibition={b.get('exhibitionName')!r}")

    # --- 待处理产品明细（前10个样例）---
    print(f"\n【缺少单位的产品样例(前10)】")
    for p in no_unit[:10]:
        print(f"  - id={p.get('id')} title={p.get('title')!r} unit={p.get('unit')!r} mainImg={'有' if p.get('mainImageUrl') else '无'} imgs={len(p.get('images') or [])}张 booth={p.get('booth',{}).get('name') if p.get('booth') else '无'}")

    # 保存完整数据供下一步使用
    with open("/tmp/products_diagnosis.json", "w", encoding="utf-8") as f:
        json.dump({"products": products, "booths": booths}, f, ensure_ascii=False, indent=2)
    print(f"\n✓ 完整数据已保存到 /tmp/products_diagnosis.json")


if __name__ == "__main__":
    main()
