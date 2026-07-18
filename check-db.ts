import { prisma } from './src/lib/db'

async function main() {
  console.log('=== Database Data Check ===')
  console.log('Users:', await prisma.user.count())
  console.log('Products:', await prisma.product.count())
  console.log('Booths:', await prisma.exhibitionBooth.count())
  console.log('Auctions:', await prisma.auctionListing.count())
  console.log('Sellers:', await prisma.sellerProfile.count())
  console.log('Categories:', await prisma.category.count())
  await prisma.$disconnect()
}

main()
