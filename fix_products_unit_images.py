#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
步骤2：批量修复产品
- 对缺少 minOrderUnitId 的产品，设置为 Set (id=cmrvpvbmj00063yg8kn6q2pvi)
- 对缺少 supplyCapacityUnitId 的产品，设置为 Set
- 对缺少 mainImageUrl 但 images 数组有图的产品，设置 mainImageUrl=images[0]（修复图片显示）
幂等可重复运行。仅更新需要更新的字段。
"""
import requests
import json
import sys
import time
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://x2xhub.com"
USERNAME = "1994169579_AI_Seller"
PASSWORD = ".sboe33lwwroG8WFX81B"
SET_UNIT_ID = "cmrvpvbmj00063yg8kn6q2pvi"  # 套/Set/symbol SET

def login(session):
    r = session.get(f"{BASE}/api/auth/csrf", timeout=30)
    r.raise_for_status()
    csrf = r.json().get("csrfToken")
    data = urlencode({
        "csrfToken": csrf,
        "email": USERNAME,
        "password": PASSWORD,
        "callbackUrl": f"{BASE}/zh/seller/products",
        "json": "true",
    })
    r = session.post(f"{BASE}/api/auth/callback/credentials", data=data,
                     headers={"Content-Type": "application/x-www-form-urlencoded"},
                     timeout=30, allow_redirects=False)
    r = session.get(f"{BASE}/api/auth/session", timeout=30)
    sess = r.json()
    if sess.get("user"):
        print(f"✓ 登录成功: {sess['user'].get('name')} (isAI={sess['user'].get('isAI')})")
        return True
    print(f"❌ 登录失败: {json.dumps(sess, ensure_ascii=False)[:200]}")
    return False

def fetch_all_products(session):
    all_products = []
    page = 1
    while True:
        r = session.get(f"{BASE}/api/products?page={page}&limit=100", timeout=60)
        r.raise_for_status()
        data = r.json()
        all_products.extend(data.get("products", []))
        pg = data.get("pagination", {})
        if page >= pg.get("totalPages", 1):
            break
        page += 1
    return all_products

def patch_product(session, product, payload):
    pid = product["id"]
    try:
        r = session.patch(f"{BASE}/api/products/{pid}",
                          json=payload, timeout=45)
        if r.status_code == 200:
            body = r.json()
            return True, body.get("warnings", [])
        else:
            return False, f"HTTP {r.status_code}: {r.text[:200]}"
    except Exception as e:
        return False, str(e)

def main():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (AI-Agent-Fix) Chrome/120",
        "Accept": "application/json",
    })

    print("=" * 70)
    print("步骤2: 批量修复产品单位 + 主图")
    print("=" * 70)
    if not login(session):
        sys.exit(1)

    print("\n抓取所有产品...")
    products = fetch_all_products(session)
    print(f"共 {len(products)} 个产品")

    # 分类需要修复的产品
    to_fix = []  # (product, payload)
    for p in products:
        payload = {}
        if not p.get("minOrderUnitId"):
            payload["minOrderUnitId"] = SET_UNIT_ID
        if not p.get("supplyCapacityUnitId"):
            payload["supplyCapacityUnitId"] = SET_UNIT_ID
        # 修复 mainImageUrl
        if not p.get("mainImageUrl"):
            imgs = p.get("images") or []
            if imgs:
                payload["mainImageUrl"] = imgs[0]
        if payload:
            to_fix.append((p, payload))

    print(f"\n需要修复的产品: {len(to_fix)} 个")
    # 统计
    n_unit = sum(1 for _, pl in to_fix if "minOrderUnitId" in pl)
    n_scu = sum(1 for _, pl in to_fix if "supplyCapacityUnitId" in pl)
    n_main = sum(1 for _, pl in to_fix if "mainImageUrl" in pl)
    print(f"  - 需设 minOrderUnitId=Set: {n_unit} 个")
    print(f"  - 需设 supplyCapacityUnitId=Set: {n_scu} 个")
    print(f"  - 需补 mainImageUrl: {n_main} 个")

    if not to_fix:
        print("\n✓ 所有产品已是正确状态，无需修复")
        return

    print(f"\n开始批量更新 (并发=5)...")
    success = 0
    failed = []
    warnings_total = []
    done = 0
    start = time.time()

    def do_patch(args):
        p, pl = args
        s = requests.Session()
        s.cookies.update(session.cookies)
        s.headers.update(session.headers)
        ok, info = patch_product(s, p, pl)
        return p, pl, ok, info

    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = {ex.submit(do_patch, item): item for item in to_fix}
        for fut in as_completed(futures):
            p, pl, ok, info = fut.result()
            done += 1
            if ok:
                success += 1
                if info:
                    warnings_total.append((p["id"], info))
            else:
                failed.append((p["id"], p.get("title"), info))
            if done % 50 == 0 or done == len(to_fix):
                elapsed = time.time() - start
                print(f"  进度: {done}/{len(to_fix)} 成功={success} 失败={len(failed)} ({elapsed:.1f}s)")

    print(f"\n{'='*70}")
    print(f"完成: 成功 {success}/{len(to_fix)}, 失败 {len(failed)}")
    print(f"耗时: {time.time()-start:.1f}s")
    if warnings_total:
        print(f"\n警告(图片校验): {len(warnings_total)} 个产品有警告(前5):")
        for pid, w in warnings_total[:5]:
            print(f"  - {pid}: {w}")
    if failed:
        print(f"\n失败明细(前10):")
        for pid, title, info in failed[:10]:
            print(f"  - {pid} {title!r}: {info}")

    # 保存失败列表
    with open("/tmp/fix_failed.json", "w", encoding="utf-8") as f:
        json.dump(failed, f, ensure_ascii=False, indent=2)
    print(f"\n失败列表已保存到 /tmp/fix_failed.json")

if __name__ == "__main__":
    main()
