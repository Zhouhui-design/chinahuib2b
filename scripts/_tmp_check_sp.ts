import { prisma } from '@/lib/db'

async function main() {
  const ai_userId    = 'cmsn3tjfb001hiwg8cynz537n'
  const guard_userId = 'cmsn3dy57001fiwg8n3365xlm'
  const ai_sp_new_id = 'cmsnvdzgu00044yg8s5rgtqf4'
  const guard_sp_id  = 'cmsn3dy5r001giwg8ta18ntmf'
  const ai_sp_old_id = 'cmsn4h7vt001xiwg8pu5o1lik'

  console.log('\n== Users ==')
  for (const uid of [ai_userId, guard_userId]) {
    const u = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true, isAI: true, ownerId: true, role: true },
    })
    console.log(`  User(${uid.slice(0,12)}..) email=${u?.email} isAI=${u?.isAI} ownerId=${u?.ownerId} role=${u?.role}`)
  }

  console.log('\n== SellerProfiles ==')
  for (const sid of [ai_sp_new_id, guard_sp_id, ai_sp_old_id]) {
    const sp = await prisma.sellerProfile.findUnique({
      where: { id: sid },
      select: { id: true, userId: true, companyName: true, contactName: true, logoUrl: true, bannerUrl: true },
    })
    if (sp) {
      console.log(`  SP(${sid.slice(0,12)}..) userId=${sp.userId?.slice(0,12)} companyName=${sp.companyName} contact=${sp.contactName} logo=${sp.logoUrl ? '✅' : '❌'} banner=${sp.bannerUrl ? '✅' : '❌'}`)
    } else {
      console.log(`  SP(${sid.slice(0,12)}..) = null (已删除或不存在)`)
    }
  }

  // 模拟 strict 映射：用 AI Agent id 查 User.isAI/ownerId → 找到 guardian userId → 查 SP
  console.log('\n== [Strict simulation] AI → guardian mapping ==')
  const u = await prisma.user.findUnique({
    where: { id: ai_userId },
    select: { isAI: true, ownerId: true },
  })
  console.log(`  AI User: isAI=${u?.isAI} ownerId=${u?.ownerId}`)
  if (u?.isAI && u?.ownerId) {
    const sp = await prisma.sellerProfile.findUnique({
      where: { userId: u.ownerId },
      select: { id: true, userId: true, companyName: true, contactName: true },
    })
    console.log(`  Guardian SP via ownerId userId: ${JSON.stringify(sp)}`)
  } else {
    console.log('  AI user missing isAI or ownerId — owner mapping impossible!')
  }

  // 额外：监护人 SP 通过 getEffectiveUserIdStrict 拿到的 seller 正是上面 guardian SP
  console.log('\n== 通过 sellerId 反查 booths 里的 seller (验证 booth sellerId) ==')
  const booth = await prisma.booth.findUnique({
    where: { id: 'cmsn7qj4d002kiwg8wth73c14' },
    select: { id: true, sellerId: true, products: { select: { id: true, title: true } } },
  })
  console.log(`  Booth.sellerId=${booth?.sellerId}`)
  console.log(`  Booth.products count=${booth?.products?.length}`)
}
main()
  .catch(e => { console.error('ERR', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
