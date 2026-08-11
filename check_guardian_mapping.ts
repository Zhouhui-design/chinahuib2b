import { prisma } from './src/lib/db'

async function main() {
  console.log('=== All AI users (isAI=true) ===')
  const allAI = await prisma.user.findMany({
    where: { isAI: true },
    select: {
      id: true, username: true, email: true, role: true,
      isAI: true, ownerId: true, isActive: true
    }
  })
  console.table(allAI)

  const aiUser = allAI.find(u => (u.username || '').includes('2_AI_Seller') || (u.username || '').toLowerCase().includes('zhuohao'))
  if (!aiUser) {
    console.log('\nNo 2_AI_Seller found, will use first AI user...')
  }
  const targetAi = aiUser || allAI[0]

  if (targetAi) {
    console.log('\n=== Selected AI User ===')
    console.log(targetAi)

    console.log('\n=== Guardian User (ownerId) ===')
    const guardian = targetAi.ownerId ? await prisma.user.findUnique({
      where: { id: targetAi.ownerId },
      select: { id: true, username: true, email: true, role: true, isAI: true, ownerId: true }
    }) : null
    console.log(guardian)

    console.log('\n=== SellerProfiles (by userId) ===')
    if (guardian) {
      const guardianSP = await prisma.sellerProfile.findUnique({
        where: { userId: guardian.id },
        select: { id: true, userId: true, companyName: true, contactName: true, createdAt: true }
      })
      console.log('Guardian SP (by userId=' + guardian.id + '):', guardianSP)
    }

    const aiSP = await prisma.sellerProfile.findUnique({
      where: { userId: targetAi.id },
      select: { id: true, userId: true, companyName: true, contactName: true, createdAt: true }
    })
    console.log('AI Agent SP (by userId=' + targetAi.id + '):', aiSP)

    console.log('\n=== Direct Query SP.id=cmsn3dy5r001giwg8ta18ntmf ===')
    const directSP = await prisma.sellerProfile.findUnique({
      where: { id: 'cmsn3dy5r001giwg8ta18ntmf' },
      select: { id: true, userId: true, companyName: true, contactName: true, createdAt: true }
    })
    console.log(directSP)

    console.log('\n=== Booth cmsn7qj4d002kiwg8wth73c14 ===')
    const booth = await prisma.booth.findUnique({
      where: { id: 'cmsn7qj4d002kiwg8wth73c14' },
      select: { id: true, sellerId: true, name: true, products: { select: { id: true, title: true } } }
    })
    if (booth) {
      console.log('booth.id=', booth.id)
      console.log('booth.sellerId (归属 SellerProfile.id)=', booth.sellerId)
      console.log('booth.name=', booth.name)
      console.log('booth.products count=', booth.products.length)
      if (booth.products.length <= 20) {
        booth.products.forEach(p => console.log('  - ', p.id, '|', p.title?.slice(0, 50)))
      }
    } else {
      console.log('Booth NOT FOUND')
    }
  }

  console.log('\n=== All SellerProfiles with company containing 卓浩 or Zhuohao ===')
  const zhuohaoSps = await prisma.sellerProfile.findMany({
    where: {
      OR: [
        { companyName: { contains: '卓浩' } },
        { companyName: { contains: 'Zhuohao' } },
        { companyName: { contains: 'zhuohao' } }
      ]
    },
    select: { id: true, userId: true, companyName: true, contactName: true }
  })
  console.table(zhuohaoSps)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
