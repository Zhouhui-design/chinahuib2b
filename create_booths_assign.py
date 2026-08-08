#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
阶段B+C: 创建 6 个新展会 + 分配 504 个产品 + 修复 OEM/MOQ
- 关键词翻译成全球前10语言: en, zh, de, ja, ko, ru, es, fr, pt, hi
- 每个展会挂载 3 个文档 + logo + banner
- 灭火系统(375) 贪心装箱到 4 个展会(≤100), 柜式(81)+消防(48) 各一
- 通过 PATCH /api/products/[id] 分配产品(AI agent 可用, 无 100 限制)
"""
import os, json, re, sys, time, requests
from urllib.parse import urlencode
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://x2xhub.com"
USERNAME = "1994169579_AI_Seller"
PASSWORD = ".sboe33lwwroG8WFX81B"

# ============ 关键词词汇表 (10 语言) ============
# 每个概念在 10 种语言的翻译
VOCAB = {
  "fire_suppression":      {"en":"fire suppression","zh":"灭火","de":"Brandlöschung","ja":"消火","ko":"소화","ru":"пожаротушение","es":"extinción de incendios","fr":"extinction d'incendie","pt":"extinção de incêndio","hi":"अग्निशमन"},
  "fire_extinguisher":     {"en":"fire extinguisher","zh":"灭火器","de":"Feuerlöscher","ja":"消火器","ko":"소화기","ru":"огнетушитель","es":"extintor","fr":"extincteur","pt":"extintor","hi":"अग्निशामक यंत्र"},
  "fire_protection":       {"en":"fire protection","zh":"消防保护","de":"Brandschutz","ja":"消防保護","ko":"소방보호","ru":"пожарная защита","es":"protección contra incendios","fr":"protection incendie","pt":"proteção contra incêndio","hi":"अग्नि सुरक्षा"},
  "fire_safety":           {"en":"fire safety","zh":"消防安全","de":"Brandsicherheit","ja":"消防安全","ko":"소방안전","ru":"пожарная безопасность","es":"seguridad contra incendios","fr":"sécurité incendie","pt":"segurança contra incêndio","hi":"अग्नि सुरक्षा"},
  "suppression_system":   {"en":"fire extinguishing system","zh":"灭火系统","de":"Löschanlage","ja":"消火システム","ko":"소화 시스템","ru":"система пожаротушения","es":"sistema de extinción","fr":"système d'extinction","pt":"sistema de extinção","hi":"अग्निशामन प्रणाली"},
  "aerosol":               {"en":"aerosol extinguishing","zh":"气溶胶灭火","de":"Aerosollöschung","ja":"エアロゾル消火","ko":"에어로졸 소화","ru":"аэрозольное тушение","es":"extinción por aerosol","fr":"extinction par aérosol","pt":"extinção por aerossol","hi":"एरोसोल अग्निशमन"},
  "gas_suppression":       {"en":"gas fire suppression","zh":"气体灭火","de":"Gaslöschung","ja":"ガス消火","ko":"가스 소화","ru":"газовое пожаротушение","es":"extinción por gas","fr":"extinction par gaz","pt":"extinção por gás","hi":"गैस अग्निशमन"},
  "heptafluoropropane":    {"en":"heptafluoropropane","zh":"七氟丙烷","de":"Heptafluorpropan","ja":"ヘプタフルオロプロパン","ko":"헵타플루오로프로판","ru":"гептафторпропан","es":"heptafluoropropano","fr":"heptafluoropropane","pt":"heptafluoropropano","hi":"हेप्टाफ्लोरोप्रोपेन"},
  "perfluorohexanone":     {"en":"perfluorohexanone","zh":"全氟己酮","de":"Perfluorhexanon","ja":"パーフルオロヘキサノン","ko":"퍼플루오로헥산논","ru":"перфторгексанон","es":"perfluorohexanona","fr":"perfluorohexanone","pt":"perfluorohexanona","hi":"परफ्लूओरोहेक्सानोन"},
  "cabinet":               {"en":"cabinet extinguisher","zh":"柜式灭火装置","de":"Schranklöschanlage","ja":"キャビネット消火","ko":"캐비닛 소화","ru":"шкафное пожаротушение","es":"extintor de armario","fr":"extincteur d'armoire","pt":"extintor de armário","hi":"कैबिनेट अग्निशामक"},
  "suspended":             {"en":"suspended extinguisher","zh":"悬挂式灭火装置","de":"Hängelöschanlage","ja":"吊り下げ消火","ko":"현수식 소화","ru":"подвесное пожаротушение","es":"extintor suspendido","fr":"extincteur suspendu","pt":"extintor suspenso","hi":"निलंबित अग्निशामक"},
  "fire_alarm":            {"en":"fire alarm detector","zh":"火灾报警探测器","de":"Brandmelder","ja":"火災報知器","ko":"화재 경보 감지기","ru":"пожарный извещатель","es":"detector de alarma","fr":"détecteur d'alarme","pt":"detector de alarme","hi":"अग्नि अलार्म संसूचक"},
  "life_safety":           {"en":"life safety","zh":"生命安全","de":"Lebenssicherheit","ja":"生命の安全","ko":"생명 안전","ru":"безопасность жизни","es":"seguridad de vida","fr":"sécurité de vie","pt":"segurança de vida","hi":"जीवन सुरक्षा"},
  "fire_equipment":        {"en":"fire fighting equipment","zh":"消防设备","de":"Brandschutzausrüstung","ja":"消防設備","ko":"소방 장비","ru":"пожарное оборудование","es":"equipo contra incendios","fr":"équipement incendie","pt":"equipamento de incêndio","hi":"अग्नि उपकरण"},
  "oem":                   {"en":"OEM ODM manufacturing","zh":"OEM ODM 代工","de":"OEM ODM Fertigung","ja":"OEM ODM 製造","ko":"OEM ODM 제조","ru":"OEM ODM производство","es":"fabricación OEM ODM","fr":"fabrication OEM ODM","pt":"fabricação OEM ODM","hi":"OEM ODM निर्माण"},
}
LANGS = ["en","zh","de","ja","ko","ru","es","fr","pt","hi"]

def keywords_for(concepts):
    """从概念列表生成关键词(去重, ≤50)"""
    kws = []
    seen = set()
    for c in concepts:
        for lang in LANGS:
            w = VOCAB[c][lang]
            if w not in seen:
                seen.add(w); kws.append(w)
    return kws[:50]

# 6 个展会定义
BOOTHS_DEF = [
    {"name":"Jianhao Aerosol Fire Suppression Expo","theme":"Vibrant","concepts":["aerosol","fire_suppression","fire_extinguisher","suppression_system","fire_safety"]},
    {"name":"Jianhao Suspended Gas Suppression Expo","theme":"Professional","concepts":["suspended","gas_suppression","heptafluoropropane","perfluorohexanone","suppression_system"]},
    {"name":"Jianhao Fire Suppression Devices Expo","theme":"Professional","concepts":["fire_equipment","perfluorohexanone","suppression_system","fire_protection","fire_suppression"]},
    {"name":"Jianhao Specialized Suppression Systems Expo","theme":"Dark","concepts":["cabinet","suspended","fire_extinguisher","suppression_system","fire_protection"]},
    {"name":"Jianhao Cabinet Gas Fire Extinguishing Expo","theme":"Vibrant","concepts":["cabinet","gas_suppression","heptafluoropropane","fire_suppression","fire_equipment"]},
    {"name":"Jianhao Fire & Life Safety Expo","theme":"Professional","concepts":["life_safety","fire_alarm","fire_safety","fire_protection","fire_equipment"]},
]

def login(session):
    r = session.get(f"{BASE}/api/auth/csrf", timeout=30); r.raise_for_status()
    csrf = r.json()["csrfToken"]
    data = urlencode({"csrfToken": csrf, "email": USERNAME, "password": PASSWORD,
                      "callbackUrl": f"{BASE}/zh/seller/products", "json": "true"})
    session.post(f"{BASE}/api/auth/callback/credentials", data=data,
                 headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=30, allow_redirects=False)
    s = session.get(f"{BASE}/api/auth/session", timeout=30).json()
    return bool(s.get("user"))

def fetch_all_products(session):
    allp = []
    page = 1
    while True:
        r = session.get(f"{BASE}/api/products?page={page}&limit=100", timeout=60)
        r.raise_for_status()
        d = r.json()
        allp.extend(d.get("products", []))
        if page >= d.get("pagination", {}).get("totalPages", 1): break
        page += 1
    return allp

def subtype(title):
    t = title or ""
    first = re.split(r"\s*[-–—]\s*", t)[0].strip()
    return first[:40] if first else "Other"

def main():
    assets = json.load(open("/tmp/booth_assets.json", encoding="utf-8"))
    session = requests.Session()
    session.headers.update({"User-Agent":"Mozilla/5.0 (AI-Booth) Chrome/120","Accept":"application/json"})
    if not login(session):
        print("❌ 登录失败"); sys.exit(1)
    print("✓ 登录成功")

    # ===== 1. 创建 6 个展会 =====
    print("\n" + "="*70); print("创建 6 个展会"); print("="*70)
    docs_payload = [{"url": d["url"], "name": d["name"], "type": d["type"], "size": d["size"]} for d in assets["docs"]]
    created = []
    for i, bdef in enumerate(BOOTHS_DEF):
        b = assets["booths"][i]
        payload = {
            "name": bdef["name"],
            "exhibitionName": "2026 Jianhao Fire Safety International Exhibition",
            "location": "China",
            "logoUrl": b["logoUrl"],
            "bannerUrl": b["bannerUrl"],
            "keywords": keywords_for(bdef["concepts"]),
            "documents": docs_payload,
            "theme": bdef["theme"],
            "colorScheme": "fire-safety-red",
        }
        r = session.post(f"{BASE}/api/booths", json=payload, timeout=60)
        if r.status_code in (200, 201):
            body = r.json()
            booth = body.get("booth", body)
            created.append({"idx": i, "id": booth["id"], "name": bdef["name"],
                            "logoUrl": b["logoUrl"], "bannerUrl": b["bannerUrl"],
                            "kwCount": len(payload["keywords"])})
            print(f"  ✓ 展台{i+1} 创建成功: id={booth['id']} kw={len(payload['keywords'])} {bdef['name'][:40]}")
        else:
            print(f"  ❌ 展台{i+1} 创建失败: HTTP {r.status_code} {r.text[:300]}")
            sys.exit(1)

    with open("/tmp/created_booths.json", "w", encoding="utf-8") as f:
        json.dump(created, f, ensure_ascii=False, indent=2)

    # ===== 2. 抓取产品 + 分组 =====
    print("\n" + "="*70); print("抓取产品并分组"); print("="*70)
    products = fetch_all_products(session)
    print(f"  共 {len(products)} 个产品")

    # 分组: 灭火系统→贪心装箱到展台0-3, 柜式→展台4, 消防→展台5
    by_cat = defaultdict(list)
    for p in products:
        cat = (p.get("category") or {}).get("name", "").strip()
        by_cat[cat].append(p)

    huomie = by_cat.get("灭火系统", [])
    gui = by_cat.get("柜式气体灭火装置", [])
    xiao = by_cat.get("消防与生命安全", [])

    # 灭火系统贪心装箱到4个展台
    groups = defaultdict(list)
    for p in huomie:
        groups[subtype(p.get("title") or p.get("titleEn") or "")].append(p)
    sorted_groups = sorted(groups.items(), key=lambda x: -len(x[1]))
    bins = [[] for _ in range(4)]
    for gname, items in sorted_groups:
        idx = min(range(4), key=lambda i: len(bins[i]))
        bins[idx].extend([p["id"] for p in items])

    booth_products = [bins[0], bins[1], bins[2], bins[3],
                      [p["id"] for p in gui], [p["id"] for p in xiao]]

    # 检查 OEM/MOQ 需修复的产品
    needs_oem = [p for p in products if not p.get("acceptsOEM") or p.get("minOrderQty") != 100]
    print(f"  灭火系统→4展台: {[len(b) for b in bins]}, 柜式={len(gui)}, 消防={len(xiao)}")
    print(f"  需修复 OEM/MOQ 的产品: {len(needs_oem)}")

    # ===== 3. 分配产品到展台 (PATCH) =====
    print("\n" + "="*70); print("分配产品到展台 (PATCH)"); print("="*70)
    # 构建 (productId, boothId, oem_fix) 任务列表
    tasks = []
    oem_ids = {p["id"] for p in needs_oem}
    for bi, pids in enumerate(booth_products):
        booth_id = created[bi]["id"]
        for pid in pids:
            payload = {"boothId": booth_id}
            if pid in oem_ids:
                payload["acceptsOEM"] = True
                payload["minOrderQty"] = 100
            tasks.append((pid, payload))

    print(f"  总分配任务: {len(tasks)} (含 {len(oem_ids)} 个 OEM/MOQ 修复)")
    success = 0; failed = []
    done = 0; start = time.time()

    def do_patch(task):
        pid, payload = task
        s = requests.Session(); s.cookies.update(session.cookies); s.headers.update(session.headers)
        try:
            r = s.patch(f"{BASE}/api/products/{pid}", json=payload, timeout=45)
            return pid, r.status_code == 200, (r.text[:150] if r.status_code != 200 else None)
        except Exception as e:
            return pid, False, str(e)

    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(do_patch, t): t for t in tasks}
        for fut in as_completed(futs):
            pid, ok, err = fut.result()
            done += 1
            if ok: success += 1
            else: failed.append((pid, err))
            if done % 100 == 0 or done == len(tasks):
                print(f"  进度: {done}/{len(tasks)} 成功={success} 失败={len(failed)} ({time.time()-start:.0f}s)")

    print(f"\n  完成: 成功 {success}/{len(tasks)}, 失败 {len(failed)}")
    if failed:
        print("  失败明细(前5):")
        for pid, err in failed[:5]:
            print(f"    {pid}: {err}")
        json.dump(failed, open("/tmp/assign_failed.json","w"), ensure_ascii=False, indent=2)

    # ===== 4. 总结 =====
    print("\n" + "="*70); print("展会创建+产品分配总结"); print("="*70)
    for c in created:
        n = sum(1 for t in tasks if t[1].get("boothId") == c["id"])
        print(f"  展台{c['idx']+1}: {c['name'][:42]} -> {n} 产品 (id={c['id']})")
    print(f"\n  总产品分配: {success}/{len(tasks)}")
    print(f"  OEM/MOQ 修复: {len(oem_ids)} 个")

if __name__ == "__main__":
    main()
