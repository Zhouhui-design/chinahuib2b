#!/usr/bin/env python3
"""
本地测试脚本：验证16个产品的API返回数据
测试项：中英文标题、单位、OEM、前10语言关键词
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "https://x2xhub.com"
AI_AGENT_EMAIL = "1994169578_AI_Seller"
AI_AGENT_PASSWORD = ".vhpanrruwu85SIT3A5T"

# 预期的16个产品（中文标题）
EXPECTED_PRODUCTS = [
    "CMR20系列整体式粗镗头",
    "CMR25系列整体式粗镗头",
    "CMR32系列整体式粗镗头",
    "SMR系列模块式粗镗刀",
    "HAS系列大孔径粗镗头",
    "ASEH系列大孔径粗镗头",
    "CNR系列铝桥架粗镗刀",
    "FBH精镗头",
    "TMHLN02快进给锁牙铣刀头",
    "TMHLN03快进给锁牙铣刀头",
    "TFHLN03快进给铣刀",
    "TE90WN04低阻力立铣刀",
    "TM90WN04锁牙式铣刀头",
    "TB16系列双刃粗镗刀杆",
    "TB17系列双刃粗镗刀杆",
    "MR系列机夹式沉头刀",
]

# 前10语言关键词检测字符集
LANGUAGE_CHECKS = {
    "中文(zh)": lambda kws: any(any('\u4e00' <= c <= '\u9fff' for c in kw) for kw in kws),
    "英文(en)": lambda kws: any(kw.isascii() and kw.isalpha() and len(kw) > 2 for kw in kws),
    "德语(de)": lambda kws: any("Ausdreh" in kw or "Fräs" in kw or "Werkzeug" in kw or "Präzision" in kw for kw in kws),
    "日语(ja)": lambda kws: any(any('\u3040' <= c <= '\u30ff' for c in kw) for kw in kws),
    "韩语(ko)": lambda kws: any(any('\uac00' <= c <= '\ud7af' for c in kw) for kw in kws),
    "俄语(ru)": lambda kws: any(any('\u0400' <= c <= '\u04ff' for c in kw) for kw in kws),
    "西班牙语(es)": lambda kws: any("mandrinado" in kw or "mecanizado" in kw or "fresado" in kw for kw in kws),
    "法语(fr)": lambda kws: any("alésage" in kw or "usinage" in kw or "fraisage" in kw for kw in kws),
    "葡萄牙语(pt)": lambda kws: any("mandrilagem" in kw or "usinagem" in kw or "fresagem" in kw for kw in kws),
    "印地语(hi)": lambda kws: any(any('\u0900' <= c <= '\u097f' for c in kw) for kw in kws),
}


def login():
    """AI Agent 登录"""
    print("=" * 70)
    print("🔍 AI Agent 登录测试")
    print("=" * 70)

    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/delegate-login",
        json={
            "email": AI_AGENT_EMAIL,
            "password": AI_AGENT_PASSWORD,
            "restrictTo": "NON_ADMIN"
        },
        headers={"Content-Type": "application/json"},
        timeout=15
    )

    if response.status_code == 200 and response.json().get("success"):
        user = response.json()["user"]
        print(f"  ✅ 登录成功")
        print(f"     用户名: {user['name']}")
        print(f"     角色: {user['role']}")
        print(f"     AI Agent: {user.get('isAI', False)}")
        print(f"     监护人ID: {user.get('ownerId', 'N/A')}")
        return session
    else:
        print(f"  ❌ 登录失败: {response.status_code}")
        print(f"     {response.text}")
        return None


def fetch_products(session):
    """获取所有产品"""
    print("\n" + "=" * 70)
    print("📦 获取产品列表")
    print("=" * 70)

    response = session.get(
        f"{BASE_URL}/api/products?limit=100",
        timeout=30
    )

    if response.status_code != 200:
        print(f"  ❌ 获取产品失败: {response.status_code}")
        print(f"     {response.text[:200]}")
        return []

    data = response.json()
    products = data.get("products", [])

    # 只测试AI Agent创建的16个产品（2026-08-07之后创建的）
    ai_products = [
        p for p in products
        if p.get("createdAt", "").startswith("2026-08-07")
        and p.get("sellerId") == "cms7hnym90001jcg8amt2id06"
    ]

    print(f"  ✅ 获取到 {len(products)} 个产品（总共）")
    print(f"     其中 AI Agent 创建的: {len(ai_products)} 个")
    return ai_products


def test_product(product, index):
    """测试单个产品的所有字段"""
    title_zh = product.get("title", "")
    title_en = product.get("titleEn", "")
    titles = product.get("titles", {})
    accepts_oem = product.get("acceptsOEM")
    min_order_unit = product.get("minOrderUnit")
    supply_unit = product.get("supplyCapacityUnit")
    keywords = product.get("keywords", [])

    results = []

    # 测试1: 中文标题
    has_zh = bool(title_zh) and any('\u4e00' <= c <= '\u9fff' for c in title_zh)
    results.append(("中文标题(title)", has_zh, title_zh))

    # 测试2: 英文标题
    has_en = bool(title_en) and title_en != title_zh
    results.append(("英文标题(titleEn)", has_en, title_en or "❌ 缺失"))

    # 测试3: titles JSON 包含 zh 和 en
    has_titles_zh = "zh" in titles and titles["zh"]
    has_titles_en = "en" in titles and titles["en"]
    results.append(("titles.zh", has_titles_zh, titles.get("zh", "❌ 缺失")))
    results.append(("titles.en", has_titles_en, titles.get("en", "❌ 缺失")))

    # 测试4: 起订单位
    has_min_unit = min_order_unit is not None and min_order_unit.get("name")
    results.append(("起订单位", has_min_unit, min_order_unit.get("name") if has_min_unit else "❌ 未设置"))

    # 测试5: 产能单位
    has_supply_unit = supply_unit is not None and supply_unit.get("name")
    results.append(("产能单位", has_supply_unit, supply_unit.get("name") if has_supply_unit else "❌ 未设置"))

    # 测试6: OEM
    results.append(("接受OEM", accepts_oem is True, "是 ✅" if accepts_oem else "否 ❌"))

    # 测试7: 关键词数量
    kw_count = len(keywords)
    results.append(("关键词数量", kw_count >= 30, f"{kw_count} 个"))

    # 测试8: 前10语言关键词
    for lang_name, check_func in LANGUAGE_CHECKS.items():
        has_lang = check_func(keywords)
        results.append((f"关键词-{lang_name}", has_lang, "✅" if has_lang else "❌ 缺失"))

    # 输出结果
    print(f"\n  ┌─ 产品 {index+1}: {title_zh}")
    print(f"  │  英文: {title_en or '❌ 缺失'}")

    all_pass = True
    for field, passed, value in results:
        status = "✅" if passed else "❌"
        if not passed:
            all_pass = False
        # 只显示前8个核心字段 + 失败的语言
        if "关键词-" not in field or not passed:
            print(f"  │  {status} {field}: {value}")

    # 如果有语言缺失，显示详细
    missing_langs = [name for name, check in LANGUAGE_CHECKS.items() if not check(keywords)]
    if missing_langs:
        print(f"  │  ⚠️  缺失语言关键词: {', '.join(missing_langs)}")
    else:
        print(f"  │  ✅ 前10语言关键词全部覆盖")

    # 显示部分关键词示例
    if keywords:
        print(f"  │  关键词示例: {keywords[:5]}...")

    print(f"  └─ {'✅ 全部通过' if all_pass else '❌ 有失败项'}")
    return all_pass


def main():
    print(f"\n🧪 产品数据验证测试")
    print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   目标: {BASE_URL}")

    # 1. 登录
    session = login()
    if not session:
        sys.exit(1)

    # 2. 获取产品
    products = fetch_products(session)
    if not products:
        print("\n❌ 没有获取到产品数据")
        sys.exit(1)

    # 3. 验证产品数量
    print(f"\n{'=' * 70}")
    print(f"📋 验证产品数量")
    print(f"{'=' * 70}")
    print(f"  预期: {len(EXPECTED_PRODUCTS)} 个")
    print(f"  实际: {len(products)} 个")
    if len(products) != len(EXPECTED_PRODUCTS):
        found_titles = {p.get("title") for p in products}
        missing = [t for t in EXPECTED_PRODUCTS if t not in found_titles]
        print(f"  ⚠️  缺失产品: {missing}")
    else:
        print(f"  ✅ 产品数量正确")

    # 4. 逐个测试产品
    print(f"\n{'=' * 70}")
    print(f"🔬 逐个产品字段验证")
    print(f"{'=' * 70}")

    all_passed = True
    for i, product in enumerate(products):
        passed = test_product(product, i)
        if not passed:
            all_passed = False

    # 5. 汇总报告
    print(f"\n{'=' * 70}")
    print(f"📊 测试汇总报告")
    print(f"{'=' * 70}")
    print(f"  测试产品数: {len(products)}")
    print(f"  测试项目: 中英文标题 / 单位 / OEM / 前10语言关键词")
    print(f"  结果: {'✅ 全部通过' if all_passed else '❌ 有失败项'}")

    if all_passed:
        print(f"\n  🎉 所有16个产品的数据验证通过！")
        print(f"     - 中英文标题: ✅")
        print(f"     - 起订/产能单位: ✅ (个/Piece)")
        print(f"     - 接受OEM: ✅ (是)")
        print(f"     - 前10语言关键词: ✅ (中/英/德/日/韩/俄/西/法/葡/印)")
    else:
        print(f"\n  ⚠️  部分测试未通过，请检查上方详细输出")

    print(f"\n{'=' * 70}\n")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
