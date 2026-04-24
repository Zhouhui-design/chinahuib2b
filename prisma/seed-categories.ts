import { prisma } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding categories with 4-level hierarchy...')

  // Level 1: Furniture
  const furniture = await prisma.category.create({
    data: {
      name: 'Furniture',
      slug: 'furniture',
      level: 1,
    },
  })

  // Level 2: Under Furniture
  const displayProps = await prisma.category.create({
    data: {
      name: 'Display Props',
      slug: 'display-props',
      level: 2,
      parentId: furniture.id,
    },
  })

  const jewelryProps = await prisma.category.create({
    data: {
      name: 'Jewelry Props',
      slug: 'jewelry-props',
      level: 2,
      parentId: furniture.id,
    },
  })

  const sofas = await prisma.category.create({
    data: {
      name: 'Sofas',
      slug: 'sofas',
      level: 2,
      parentId: furniture.id,
    },
  })

  const chairs = await prisma.category.create({
    data: {
      name: 'Chairs',
      slug: 'chairs',
      level: 2,
      parentId: furniture.id,
    },
  })

  const residentialFurniture = await prisma.category.create({
    data: {
      name: 'Residential Furniture',
      slug: 'residential-furniture',
      level: 2,
      parentId: furniture.id,
    },
  })

  const outdoorFurniture = await prisma.category.create({
    data: {
      name: 'Outdoor Furniture',
      slug: 'outdoor-furniture',
      level: 2,
      parentId: furniture.id,
    },
  })

  const labFurniture = await prisma.category.create({
    data: {
      name: 'Lab Furniture',
      slug: 'lab-furniture',
      level: 2,
      parentId: furniture.id,
    },
  })

  // Level 3: Under Sofas
  const leatherSofas = await prisma.category.create({
    data: {
      name: 'Leather Sofas',
      slug: 'leather-sofas',
      level: 3,
      parentId: sofas.id,
    },
  })

  const fabricSofas = await prisma.category.create({
    data: {
      name: 'Fabric Sofas',
      slug: 'fabric-sofas',
      level: 3,
      parentId: sofas.id,
    },
  })

  // Level 3: Under Chairs
  const officeChairs = await prisma.category.create({
    data: {
      name: 'Office Chairs',
      slug: 'office-chairs',
      level: 3,
      parentId: chairs.id,
    },
  })

  const diningChairs = await prisma.category.create({
    data: {
      name: 'Dining Chairs',
      slug: 'dining-chairs',
      level: 3,
      parentId: chairs.id,
    },
  })

  // Level 4: Under Office Chairs
  const executiveChairs = await prisma.category.create({
    data: {
      name: 'Executive Chairs',
      slug: 'executive-chairs',
      level: 4,
      parentId: officeChairs.id,
    },
  })

  const taskChairs = await prisma.category.create({
    data: {
      name: 'Task Chairs',
      slug: 'task-chairs',
      level: 4,
      parentId: officeChairs.id,
    },
  })

  // Level 1: Textiles
  const textiles = await prisma.category.create({
    data: {
      name: 'Textiles',
      slug: 'textiles',
      level: 1,
    },
  })

  // Level 2: Under Textiles
  const fabrics = await prisma.category.create({
    data: {
      name: 'Fabrics',
      slug: 'fabrics',
      level: 2,
      parentId: textiles.id,
    },
  })

  const curtains = await prisma.category.create({
    data: {
      name: 'Curtains',
      slug: 'curtains',
      level: 2,
      parentId: textiles.id,
    },
  })

  // Level 1: Clothing
  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      level: 1,
    },
  })

  // Level 2: Under Clothing
  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      level: 2,
      parentId: clothing.id,
    },
  })

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      level: 2,
      parentId: clothing.id,
    },
  })

  // Level 1: Shoes
  const shoes = await prisma.category.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      level: 1,
    },
  })

  // Level 2: Under Shoes
  const sportsShoes = await prisma.category.create({
    data: {
      name: 'Sports Shoes',
      slug: 'sports-shoes',
      level: 2,
      parentId: shoes.id,
    },
  })

  const casualShoes = await prisma.category.create({
    data: {
      name: 'Casual Shoes',
      slug: 'casual-shoes',
      level: 2,
      parentId: shoes.id,
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
