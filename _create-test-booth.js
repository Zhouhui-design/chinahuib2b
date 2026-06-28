const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({
  connectionString: 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Find the existing seller
    const seller = await prisma.sellerProfile.findFirst();
    console.log('Existing seller:', seller ? seller.id + ' ' + seller.companyName : 'None');

    if (seller) {
      // Find or create a category
      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: {
            id: 'test-category-001',
            name: 'Test Category',
            nameEn: 'Test Category',
            slug: 'test-category',
            isActive: true,
          }
        });
        console.log('Created category:', category.id);
      } else {
        console.log('Using existing category:', category.id, category.name);
      }

      // Create a test booth
      const booth = await prisma.booth.upsert({
        where: { id: 'test-booth-001' },
        update: {},
        create: {
          id: 'test-booth-001',
          name: 'Sample Exhibition Booth',
          exhibitionName: '2026 Canton Fair',
          location: 'Guangzhou, China',
          sellerId: seller.id,
          logoUrl: 'https://ui-avatars.com/api/?name=Test&size=200&background=4f46e5&color=fff',
          bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          keywords: ['electronics', 'manufacturing', 'OEM'],
          theme: 'modern',
          layout: 'standard',
          isActive: true,
          isPublished: true,
        }
      });
      console.log('Created booth:', booth.id, booth.name);

      // Create some test products
      const products = [
        {
          id: 'test-prod-001',
          title: 'Premium LED Light Bulb - Customizable',
          description: 'High-quality LED bulb with customizable options. CE/RoHS certified.',
          mainImageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
          images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600'],
          booth: { connect: { id: booth.id } },
          seller: { connect: { id: seller.id } },
          category: { connect: { id: category.id } },
          specifications: {
            color: 'Warm White / Cool White',
            size: 'A60, E27',
            material: 'Aluminum + PC',
            model: 'LX-LED-2026',
            code: 'LX-2026-A60',
            hsCode: '85395200',
            weight: '120g',
            packageSize: '60x60x110mm',
            packageVolume: '0.0004 cbm',
            customizable: true,
            oem: true,
            odm: true,
            minOrderQty: '1000 pieces',
            supplyCapacity: '50000 pieces/month'
          },
          isActive: true,
          viewCount: 150,
          inquiryCount: 12,
          minOrderQty: 1000,
        },
        {
          id: 'test-prod-002',
          title: 'Industrial Power Tool Set',
          description: 'Professional grade power tools. OEM/ODM services available.',
          mainImageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600',
          images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600'],
          booth: { connect: { id: booth.id } },
          seller: { connect: { id: seller.id } },
          category: { connect: { id: category.id } },
          specifications: {
            color: 'Red / Black / Custom',
            material: 'High Carbon Steel',
            model: 'PT-2026-PRO',
            code: 'PT-PRO-SET',
            hsCode: '84672900',
            weight: '3.5kg',
            packageSize: '400x300x150mm',
            customizable: true,
            oem: true,
            odm: false,
            minOrderQty: '500 sets',
            supplyCapacity: '10000 sets/month'
          },
          isActive: true,
          viewCount: 89,
          inquiryCount: 5,
          minOrderQty: 500,
        }
      ];

      for (const productData of products) {
        const product = await prisma.product.upsert({
          where: { id: productData.id },
          update: {},
          create: productData
        });
        console.log('Created product:', product.id, product.title);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
