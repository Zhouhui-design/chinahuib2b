/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding categories with 5-level hierarchy (Chinese + English)...')

  const existingCount = await prisma.category.count()
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing categories. Skipping seeding to avoid duplicates.`)
    return
  }

  // ============================================
  // Level 1: 电子产品 / Electronics
  // ============================================
  const electronics = await prisma.category.create({
    data: {
      name: '电子产品',
      nameEn: 'Electronics',
      slug: 'electronics',
      level: 1,
    },
  })

  // Level 2: 消费电子
  const consumerElectronics = await prisma.category.create({
    data: {
      name: '消费电子',
      nameEn: 'Consumer Electronics',
      slug: 'consumer-electronics',
      level: 2,
      parentId: electronics.id,
    },
  })

  // Level 3: 手机
  const mobilePhones = await prisma.category.create({
    data: {
      name: '手机',
      nameEn: 'Mobile Phones',
      slug: 'mobile-phones',
      level: 3,
      parentId: consumerElectronics.id,
    },
  })

  // Level 4: 智能手机
  const smartPhones = await prisma.category.create({
    data: {
      name: '智能手机',
      nameEn: 'Smart Phones',
      slug: 'smart-phones',
      level: 4,
      parentId: mobilePhones.id,
    },
  })

  // Level 5: 旗舰手机
  await prisma.category.create({
    data: {
      name: '旗舰手机',
      nameEn: 'Flagship Phones',
      slug: 'flagship-phones',
      level: 5,
      parentId: smartPhones.id,
    },
  })

  // Level 5: 中端手机
  await prisma.category.create({
    data: {
      name: '中端手机',
      nameEn: 'Mid-range Phones',
      slug: 'mid-range-phones',
      level: 5,
      parentId: smartPhones.id,
    },
  })

  // Level 4: 功能手机
  await prisma.category.create({
    data: {
      name: '功能手机',
      nameEn: 'Feature Phones',
      slug: 'feature-phones',
      level: 4,
      parentId: mobilePhones.id,
    },
  })

  // Level 3: 平板电脑
  const tablets = await prisma.category.create({
    data: {
      name: '平板电脑',
      nameEn: 'Tablets',
      slug: 'tablets',
      level: 3,
      parentId: consumerElectronics.id,
    },
  })

  // Level 4: 安卓平板
  await prisma.category.create({
    data: {
      name: '安卓平板',
      nameEn: 'Android Tablets',
      slug: 'android-tablets',
      level: 4,
      parentId: tablets.id,
    },
  })

  // Level 4: iPad
  await prisma.category.create({
    data: {
      name: 'iPad',
      nameEn: 'iPad',
      slug: 'ipad',
      level: 4,
      parentId: tablets.id,
    },
  })

  // Level 3: 笔记本电脑
  const laptops = await prisma.category.create({
    data: {
      name: '笔记本电脑',
      nameEn: 'Laptops',
      slug: 'laptops',
      level: 3,
      parentId: consumerElectronics.id,
    },
  })

  // Level 4: 游戏本
  await prisma.category.create({
    data: {
      name: '游戏本',
      nameEn: 'Gaming Laptops',
      slug: 'gaming-laptops',
      level: 4,
      parentId: laptops.id,
    },
  })

  // Level 4: 轻薄本
  await prisma.category.create({
    data: {
      name: '轻薄本',
      nameEn: 'Ultrabooks',
      slug: 'ultrabooks',
      level: 4,
      parentId: laptops.id,
    },
  })

  // Level 3: 耳机
  const headphones = await prisma.category.create({
    data: {
      name: '耳机',
      nameEn: 'Headphones',
      slug: 'headphones',
      level: 3,
      parentId: consumerElectronics.id,
    },
  })

  // Level 4: 无线耳机
  await prisma.category.create({
    data: {
      name: '无线耳机',
      nameEn: 'Wireless Headphones',
      slug: 'wireless-headphones',
      level: 4,
      parentId: headphones.id,
    },
  })

  // Level 4: 有线耳机
  await prisma.category.create({
    data: {
      name: '有线耳机',
      nameEn: 'Wired Headphones',
      slug: 'wired-headphones',
      level: 4,
      parentId: headphones.id,
    },
  })

  // Level 2: 智能穿戴
  const wearables = await prisma.category.create({
    data: {
      name: '智能穿戴',
      nameEn: 'Wearables',
      slug: 'wearables',
      level: 2,
      parentId: electronics.id,
    },
  })

  // Level 3: 智能手表
  await prisma.category.create({
    data: {
      name: '智能手表',
      nameEn: 'Smart Watches',
      slug: 'smart-watches',
      level: 3,
      parentId: wearables.id,
    },
  })

  // Level 3: 运动手环
  await prisma.category.create({
    data: {
      name: '运动手环',
      nameEn: 'Fitness Bands',
      slug: 'fitness-bands',
      level: 3,
      parentId: wearables.id,
    },
  })

  // ============================================
  // Level 1: 机械设备 / Machinery
  // ============================================
  const machinery = await prisma.category.create({
    data: {
      name: '机械设备',
      nameEn: 'Machinery',
      slug: 'machinery',
      level: 1,
    },
  })

  // Level 2: 工业机械
  const industrialMachinery = await prisma.category.create({
    data: {
      name: '工业机械',
      nameEn: 'Industrial Machinery',
      slug: 'industrial-machinery',
      level: 2,
      parentId: machinery.id,
    },
  })

  // Level 3: 包装机械
  const packagingMachines = await prisma.category.create({
    data: {
      name: '包装机械',
      nameEn: 'Packaging Machines',
      slug: 'packaging-machines',
      level: 3,
      parentId: industrialMachinery.id,
    },
  })

  // Level 4: 封口机
  await prisma.category.create({
    data: {
      name: '封口机',
      nameEn: 'Sealing Machines',
      slug: 'sealing-machines',
      level: 4,
      parentId: packagingMachines.id,
    },
  })

  // Level 4: 打包机
  await prisma.category.create({
    data: {
      name: '打包机',
      nameEn: 'Packaging Machines',
      slug: 'packing-machines',
      level: 4,
      parentId: packagingMachines.id,
    },
  })

  // Level 3: 印刷机械
  const printingMachines = await prisma.category.create({
    data: {
      name: '印刷机械',
      nameEn: 'Printing Machines',
      slug: 'printing-machines',
      level: 3,
      parentId: industrialMachinery.id,
    },
  })

  // Level 4: 数码印刷机
  await prisma.category.create({
    data: {
      name: '数码印刷机',
      nameEn: 'Digital Printing Machines',
      slug: 'digital-printing-machines',
      level: 4,
      parentId: printingMachines.id,
    },
  })

  // Level 2: 建筑机械
  const constructionMachinery = await prisma.category.create({
    data: {
      name: '建筑机械',
      nameEn: 'Construction Machinery',
      slug: 'construction-machinery',
      level: 2,
      parentId: machinery.id,
    },
  })

  // Level 3: 挖掘机
  await prisma.category.create({
    data: {
      name: '挖掘机',
      nameEn: 'Excavators',
      slug: 'excavators',
      level: 3,
      parentId: constructionMachinery.id,
    },
  })

  // Level 3: 装载机
  await prisma.category.create({
    data: {
      name: '装载机',
      nameEn: 'Loaders',
      slug: 'loaders',
      level: 3,
      parentId: constructionMachinery.id,
    },
  })

  // ============================================
  // Level 1: 原材料 / Raw Materials
  // ============================================
  const rawMaterials = await prisma.category.create({
    data: {
      name: '原材料',
      nameEn: 'Raw Materials',
      slug: 'raw-materials',
      level: 1,
    },
  })

  // Level 2: 金属材料
  const metalMaterials = await prisma.category.create({
    data: {
      name: '金属材料',
      nameEn: 'Metal Materials',
      slug: 'metal-materials',
      level: 2,
      parentId: rawMaterials.id,
    },
  })

  // Level 3: 钢材
  const steel = await prisma.category.create({
    data: {
      name: '钢材',
      nameEn: 'Steel',
      slug: 'steel',
      level: 3,
      parentId: metalMaterials.id,
    },
  })

  // Level 4: 钢板
  await prisma.category.create({
    data: {
      name: '钢板',
      nameEn: 'Steel Plates',
      slug: 'steel-plates',
      level: 4,
      parentId: steel.id,
    },
  })

  // Level 4: 钢管
  await prisma.category.create({
    data: {
      name: '钢管',
      nameEn: 'Steel Pipes',
      slug: 'steel-pipes',
      level: 4,
      parentId: steel.id,
    },
  })

  // Level 4: 钢筋
  await prisma.category.create({
    data: {
      name: '钢筋',
      nameEn: 'Steel Rebar',
      slug: 'steel-rebar',
      level: 4,
      parentId: steel.id,
    },
  })

  // Level 3: 铝材
  const aluminum = await prisma.category.create({
    data: {
      name: '铝材',
      nameEn: 'Aluminum',
      slug: 'aluminum',
      level: 3,
      parentId: metalMaterials.id,
    },
  })

  // Level 4: 铝板
  await prisma.category.create({
    data: {
      name: '铝板',
      nameEn: 'Aluminum Sheets',
      slug: 'aluminum-sheets',
      level: 4,
      parentId: aluminum.id,
    },
  })

  // Level 4: 铝型材
  await prisma.category.create({
    data: {
      name: '铝型材',
      nameEn: 'Aluminum Profiles',
      slug: 'aluminum-profiles',
      level: 4,
      parentId: aluminum.id,
    },
  })

  // Level 2: 化工原料
  const chemicalMaterials = await prisma.category.create({
    data: {
      name: '化工原料',
      nameEn: 'Chemical Materials',
      slug: 'chemical-materials',
      level: 2,
      parentId: rawMaterials.id,
    },
  })

  // Level 3: 塑料原料
  const plasticRaw = await prisma.category.create({
    data: {
      name: '塑料原料',
      nameEn: 'Plastic Raw Materials',
      slug: 'plastic-raw-materials',
      level: 3,
      parentId: chemicalMaterials.id,
    },
  })

  // Level 4: PP
  await prisma.category.create({
    data: {
      name: 'PP',
      nameEn: 'PP',
      slug: 'pp-plastic',
      level: 4,
      parentId: plasticRaw.id,
    },
  })

  // Level 4: PE
  await prisma.category.create({
    data: {
      name: 'PE',
      nameEn: 'PE',
      slug: 'pe-plastic',
      level: 4,
      parentId: plasticRaw.id,
    },
  })

  // Level 4: PVC
  await prisma.category.create({
    data: {
      name: 'PVC',
      nameEn: 'PVC',
      slug: 'pvc-plastic',
      level: 4,
      parentId: plasticRaw.id,
    },
  })

  // ============================================
  // Level 1: 家居用品 / Home & Garden
  // ============================================
  const homeAndGarden = await prisma.category.create({
    data: {
      name: '家居用品',
      nameEn: 'Home & Garden',
      slug: 'home-garden',
      level: 1,
    },
  })

  // Level 2: 厨房用品
  const kitchenSupplies = await prisma.category.create({
    data: {
      name: '厨房用品',
      nameEn: 'Kitchen Supplies',
      slug: 'kitchen-supplies',
      level: 2,
      parentId: homeAndGarden.id,
    },
  })

  // Level 3: 餐具
  const tableware = await prisma.category.create({
    data: {
      name: '餐具',
      nameEn: 'Tableware',
      slug: 'tableware',
      level: 3,
      parentId: kitchenSupplies.id,
    },
  })

  // Level 4: 碗盘
  await prisma.category.create({
    data: {
      name: '碗盘',
      nameEn: 'Bowls & Plates',
      slug: 'bowls-plates',
      level: 4,
      parentId: tableware.id,
    },
  })

  // Level 4: 餐具套装
  await prisma.category.create({
    data: {
      name: '餐具套装',
      nameEn: 'Tableware Sets',
      slug: 'tableware-sets',
      level: 4,
      parentId: tableware.id,
    },
  })

  // Level 3: 厨具
  const kitchenTools = await prisma.category.create({
    data: {
      name: '厨具',
      nameEn: 'Kitchen Tools',
      slug: 'kitchen-tools',
      level: 3,
      parentId: kitchenSupplies.id,
    },
  })

  // Level 4: 锅具
  await prisma.category.create({
    data: {
      name: '锅具',
      nameEn: 'Cookware',
      slug: 'cookware',
      level: 4,
      parentId: kitchenTools.id,
    },
  })

  // Level 4: 刀具
  await prisma.category.create({
    data: {
      name: '刀具',
      nameEn: 'Knives',
      slug: 'knives',
      level: 4,
      parentId: kitchenTools.id,
    },
  })

  // Level 2: 家具
  const furniture = await prisma.category.create({
    data: {
      name: '家具',
      nameEn: 'Furniture',
      slug: 'furniture',
      level: 2,
      parentId: homeAndGarden.id,
    },
  })

  // Level 3: 沙发
  const sofas = await prisma.category.create({
    data: {
      name: '沙发',
      nameEn: 'Sofas',
      slug: 'sofas',
      level: 3,
      parentId: furniture.id,
    },
  })

  // Level 4: 真皮沙发
  await prisma.category.create({
    data: {
      name: '真皮沙发',
      nameEn: 'Leather Sofas',
      slug: 'leather-sofas',
      level: 4,
      parentId: sofas.id,
    },
  })

  // Level 4: 布艺沙发
  await prisma.category.create({
    data: {
      name: '布艺沙发',
      nameEn: 'Fabric Sofas',
      slug: 'fabric-sofas',
      level: 4,
      parentId: sofas.id,
    },
  })

  // Level 3: 椅子
  const chairs = await prisma.category.create({
    data: {
      name: '椅子',
      nameEn: 'Chairs',
      slug: 'chairs',
      level: 3,
      parentId: furniture.id,
    },
  })

  // Level 4: 办公椅
  await prisma.category.create({
    data: {
      name: '办公椅',
      nameEn: 'Office Chairs',
      slug: 'office-chairs',
      level: 4,
      parentId: chairs.id,
    },
  })

  // Level 4: 餐椅
  await prisma.category.create({
    data: {
      name: '餐椅',
      nameEn: 'Dining Chairs',
      slug: 'dining-chairs',
      level: 4,
      parentId: chairs.id,
    },
  })

  // ============================================
  // Level 1: 服装 / Clothing
  // ============================================
  const clothing = await prisma.category.create({
    data: {
      name: '服装',
      nameEn: 'Clothing',
      slug: 'clothing',
      level: 1,
    },
  })

  // Level 2: 男装
  const mensClothing = await prisma.category.create({
    data: {
      name: '男装',
      nameEn: "Men's Clothing",
      slug: 'mens-clothing',
      level: 2,
      parentId: clothing.id,
    },
  })

  // Level 3: 衬衫
  await prisma.category.create({
    data: {
      name: '衬衫',
      nameEn: 'Shirts',
      slug: 'shirts',
      level: 3,
      parentId: mensClothing.id,
    },
  })

  // Level 3: T恤
  await prisma.category.create({
    data: {
      name: 'T恤',
      nameEn: 'T-shirts',
      slug: 't-shirts',
      level: 3,
      parentId: mensClothing.id,
    },
  })

  // Level 2: 女装
  const womensClothing = await prisma.category.create({
    data: {
      name: '女装',
      nameEn: "Women's Clothing",
      slug: 'womens-clothing',
      level: 2,
      parentId: clothing.id,
    },
  })

  // Level 3: 连衣裙
  await prisma.category.create({
    data: {
      name: '连衣裙',
      nameEn: 'Dresses',
      slug: 'dresses',
      level: 3,
      parentId: womensClothing.id,
    },
  })

  // Level 3: 上衣
  await prisma.category.create({
    data: {
      name: '上衣',
      nameEn: 'Tops',
      slug: 'tops',
      level: 3,
      parentId: womensClothing.id,
    },
  })

  // ============================================
  // Level 1: 鞋靴 / Shoes
  // ============================================
  const shoes = await prisma.category.create({
    data: {
      name: '鞋靴',
      nameEn: 'Shoes',
      slug: 'shoes',
      level: 1,
    },
  })

  // Level 2: 运动鞋
  const sportsShoes = await prisma.category.create({
    data: {
      name: '运动鞋',
      nameEn: 'Sports Shoes',
      slug: 'sports-shoes',
      level: 2,
      parentId: shoes.id,
    },
  })

  // Level 3: 跑鞋
  await prisma.category.create({
    data: {
      name: '跑鞋',
      nameEn: 'Running Shoes',
      slug: 'running-shoes',
      level: 3,
      parentId: sportsShoes.id,
    },
  })

  // Level 3: 篮球鞋
  await prisma.category.create({
    data: {
      name: '篮球鞋',
      nameEn: 'Basketball Shoes',
      slug: 'basketball-shoes',
      level: 3,
      parentId: sportsShoes.id,
    },
  })

  // Level 2: 休闲鞋
  const casualShoes = await prisma.category.create({
    data: {
      name: '休闲鞋',
      nameEn: 'Casual Shoes',
      slug: 'casual-shoes',
      level: 2,
      parentId: shoes.id,
    },
  })

  // Level 3: 皮鞋
  await prisma.category.create({
    data: {
      name: '皮鞋',
      nameEn: 'Leather Shoes',
      slug: 'leather-shoes',
      level: 3,
      parentId: casualShoes.id,
    },
  })

  // Level 3: 帆布鞋
  await prisma.category.create({
    data: {
      name: '帆布鞋',
      nameEn: 'Canvas Shoes',
      slug: 'canvas-shoes',
      level: 3,
      parentId: casualShoes.id,
    },
  })

  // ============================================
  // Level 1: 纺织品 / Textiles
  // ============================================
  const textiles = await prisma.category.create({
    data: {
      name: '纺织品',
      nameEn: 'Textiles',
      slug: 'textiles',
      level: 1,
    },
  })

  // Level 2: 面料
  const fabrics = await prisma.category.create({
    data: {
      name: '面料',
      nameEn: 'Fabrics',
      slug: 'fabrics',
      level: 2,
      parentId: textiles.id,
    },
  })

  // Level 3: 棉面料
  await prisma.category.create({
    data: {
      name: '棉面料',
      nameEn: 'Cotton Fabric',
      slug: 'cotton-fabric',
      level: 3,
      parentId: fabrics.id,
    },
  })

  // Level 3: 涤纶面料
  await prisma.category.create({
    data: {
      name: '涤纶面料',
      nameEn: 'Polyester Fabric',
      slug: 'polyester-fabric',
      level: 3,
      parentId: fabrics.id,
    },
  })

  // Level 2: 窗帘
  await prisma.category.create({
    data: {
      name: '窗帘',
      nameEn: 'Curtains',
      slug: 'curtains',
      level: 2,
      parentId: textiles.id,
    },
  })

  // ============================================
  // Level 1: 建材 / Building Materials
  // ============================================
  const buildingMaterials = await prisma.category.create({
    data: {
      name: '建材',
      nameEn: 'Building Materials',
      slug: 'building-materials',
      level: 1,
    },
  })

  // Level 2: 瓷砖
  const tiles = await prisma.category.create({
    data: {
      name: '瓷砖',
      nameEn: 'Tiles',
      slug: 'tiles',
      level: 2,
      parentId: buildingMaterials.id,
    },
  })

  // Level 3: 地砖
  await prisma.category.create({
    data: {
      name: '地砖',
      nameEn: 'Floor Tiles',
      slug: 'floor-tiles',
      level: 3,
      parentId: tiles.id,
    },
  })

  // Level 3: 墙砖
  await prisma.category.create({
    data: {
      name: '墙砖',
      nameEn: 'Wall Tiles',
      slug: 'wall-tiles',
      level: 3,
      parentId: tiles.id,
    },
  })

  // Level 2: 涂料
  const paints = await prisma.category.create({
    data: {
      name: '涂料',
      nameEn: 'Paints',
      slug: 'paints',
      level: 2,
      parentId: buildingMaterials.id,
    },
  })

  // Level 3: 乳胶漆
  await prisma.category.create({
    data: {
      name: '乳胶漆',
      nameEn: 'Latex Paint',
      slug: 'latex-paint',
      level: 3,
      parentId: paints.id,
    },
  })

  // Level 3: 防水涂料
  await prisma.category.create({
    data: {
      name: '防水涂料',
      nameEn: 'Waterproof Paint',
      slug: 'waterproof-paint',
      level: 3,
      parentId: paints.id,
    },
  })

  // ============================================
  // Level 1: 汽车配件 / Auto Parts
  // ============================================
  const autoParts = await prisma.category.create({
    data: {
      name: '汽车配件',
      nameEn: 'Auto Parts',
      slug: 'auto-parts',
      level: 1,
    },
  })

  // Level 2: 轮胎
  await prisma.category.create({
    data: {
      name: '轮胎',
      nameEn: 'Tires',
      slug: 'tires',
      level: 2,
      parentId: autoParts.id,
    },
  })

  // Level 2: 机油
  await prisma.category.create({
    data: {
      name: '机油',
      nameEn: 'Engine Oil',
      slug: 'engine-oil',
      level: 2,
      parentId: autoParts.id,
    },
  })

  // ============================================
  // Level 1: 医疗器械 / Medical Devices
  // ============================================
  const medicalDevices = await prisma.category.create({
    data: {
      name: '医疗器械',
      nameEn: 'Medical Devices',
      slug: 'medical-devices',
      level: 1,
    },
  })

  // Level 2: 诊断设备
  await prisma.category.create({
    data: {
      name: '诊断设备',
      nameEn: 'Diagnostic Equipment',
      slug: 'diagnostic-equipment',
      level: 2,
      parentId: medicalDevices.id,
    },
  })

  // Level 2: 治疗设备
  await prisma.category.create({
    data: {
      name: '治疗设备',
      nameEn: 'Treatment Equipment',
      slug: 'treatment-equipment',
      level: 2,
      parentId: medicalDevices.id,
    },
  })

  // ============================================
  // Level 1: 农产品 / Agricultural Products
  // ============================================
  const agriculturalProducts = await prisma.category.create({
    data: {
      name: '农产品',
      nameEn: 'Agricultural Products',
      slug: 'agricultural-products',
      level: 1,
    },
  })

  // Level 2: 粮食
  await prisma.category.create({
    data: {
      name: '粮食',
      nameEn: 'Grain',
      slug: 'grain',
      level: 2,
      parentId: agriculturalProducts.id,
    },
  })

  // Level 2: 水果
  await prisma.category.create({
    data: {
      name: '水果',
      nameEn: 'Fruits',
      slug: 'fruits',
      level: 2,
      parentId: agriculturalProducts.id,
    },
  })

  // ============================================
  // Level 1: 能源 / Energy
  // ============================================
  const energy = await prisma.category.create({
    data: {
      name: '能源',
      nameEn: 'Energy',
      slug: 'energy',
      level: 1,
    },
  })

  // Level 2: 太阳能
  await prisma.category.create({
    data: {
      name: '太阳能',
      nameEn: 'Solar Energy',
      slug: 'solar-energy',
      level: 2,
      parentId: energy.id,
    },
  })

  // Level 2: 风能
  await prisma.category.create({
    data: {
      name: '风能',
      nameEn: 'Wind Energy',
      slug: 'wind-energy',
      level: 2,
      parentId: energy.id,
    },
  })

  // ============================================
  // Level 1: 包装 / Packaging
  // ============================================
  const packaging = await prisma.category.create({
    data: {
      name: '包装',
      nameEn: 'Packaging',
      slug: 'packaging',
      level: 1,
    },
  })

  // Level 2: 纸箱
  await prisma.category.create({
    data: {
      name: '纸箱',
      nameEn: 'Carton Boxes',
      slug: 'carton-boxes',
      level: 2,
      parentId: packaging.id,
    },
  })

  // Level 2: 塑料包装
  await prisma.category.create({
    data: {
      name: '塑料包装',
      nameEn: 'Plastic Packaging',
      slug: 'plastic-packaging',
      level: 2,
      parentId: packaging.id,
    },
  })

  // ============================================
  // Level 1: 玩具 / Toys
  // ============================================
  const toys = await prisma.category.create({
    data: {
      name: '玩具',
      nameEn: 'Toys',
      slug: 'toys',
      level: 1,
    },
  })

  // Level 2: 益智玩具
  await prisma.category.create({
    data: {
      name: '益智玩具',
      nameEn: 'Educational Toys',
      slug: 'educational-toys',
      level: 2,
      parentId: toys.id,
    },
  })

  // Level 2: 电子玩具
  await prisma.category.create({
    data: {
      name: '电子玩具',
      nameEn: 'Electronic Toys',
      slug: 'electronic-toys',
      level: 2,
      parentId: toys.id,
    },
  })

  // ============================================
  // Level 1: 礼品 / Gifts
  // ============================================
  const gifts = await prisma.category.create({
    data: {
      name: '礼品',
      nameEn: 'Gifts',
      slug: 'gifts',
      level: 1,
    },
  })

  // Level 2: 节日礼品
  await prisma.category.create({
    data: {
      name: '节日礼品',
      nameEn: 'Holiday Gifts',
      slug: 'holiday-gifts',
      level: 2,
      parentId: gifts.id,
    },
  })

  // Level 2: 商务礼品
  await prisma.category.create({
    data: {
      name: '商务礼品',
      nameEn: 'Business Gifts',
      slug: 'business-gifts',
      level: 2,
      parentId: gifts.id,
    },
  })

  console.log('✅ Categories seeded successfully!')
  console.log(`Created ${await prisma.category.count()} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
