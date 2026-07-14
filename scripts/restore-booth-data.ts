/**
 * Data restoration script for production database
 * Creates Booth entries for existing sellers and their products
 */
import { prisma } from '../src/lib/db'

async function main() {
  console.log('🔍 Checking existing data...')

  // Get all sellers
  const sellers = await prisma.sellerProfile.findMany()
  console.log(`Found ${sellers.length} sellers`)

  for (const seller of sellers) {
    console.log(`\n📦 Seller: ${seller.companyName} (${seller.id})`)

    // Check existing booths for this seller
    const existingBooths = await prisma.booth.findMany({
      where: { sellerId: seller.id },
      include: { products: true }
    })
    console.log(`  Existing booths: ${existingBooths.length}`)

    // If no booth exists, create one
    if (existingBooths.length === 0) {
      console.log(`  Creating new booth for ${seller.companyName}...`)

      // Get products for this seller
      const products = await prisma.product.findMany({
        where: { sellerId: seller.id, isActive: true }
      })

      const booth = await prisma.booth.create({
        data: {
          sellerId: seller.id,
          boothNumber: `BTH-${String(Date.now()).slice(-6)}`,
          name: `${seller.companyName} - Products Showcase`,
          exhibitionName: `${seller.companyName} Exhibition`,
          location: `${seller.city}, ${seller.country}`,
          isActive: true,
          isPublished: true,
          theme: 'Vibrant',
          layout: 'Minimal',
          keywords: ['Manufacturer', 'B2B', 'Global Trade', 'Export'],
          products: {
            connect: products.map(p => ({ id: p.id }))
          }
        }
      })

      console.log(`  ✅ Created booth: ${booth.id} with ${products.length} products`)
    } else {
      for (const booth of existingBooths) {
        console.log(`  Booth: ${booth.name} (${booth.products.length} products)`)

        // Check if there are products not linked to any booth
        const unlinkedProducts = await prisma.product.findMany({
          where: {
            sellerId: seller.id,
            isActive: true,
            boothId: null
          }
        })

        if (unlinkedProducts.length > 0) {
          console.log(`  Linking ${unlinkedProducts.length} unlinked products to booth ${booth.id}...`)
          for (const product of unlinkedProducts) {
            await prisma.product.update({
              where: { id: product.id },
              data: { boothId: booth.id }
            })
          }
          console.log(`  ✅ Linked ${unlinkedProducts.length} products`)
        }
      }
    }
  }

  console.log('\n🎉 Data restoration complete!')
}

main()
  .catch((e) => {
    console.error('❌ Restoration failed:', e)
    process.exit(1)
  })
