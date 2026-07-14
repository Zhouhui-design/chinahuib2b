import { prisma } from './src/lib/db'

async function checkBooth() {
  const booths = await prisma.booth.findMany({
    include: { products: true },
    take: 10
  })
  
  console.log('All Booths:', booths.map(b => ({
    id: b.id,
    name: b.name,
    isActive: b.isActive,
    isPublished: b.isPublished,
    productCount: b.products.length
  })))
  
  await prisma.$disconnect()
}

checkBooth()