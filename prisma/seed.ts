/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  console.log('Creating categories...')
  
  const electronics = await prisma.category.create({
    data: {
      name: '电子产品',
      nameEn: 'Electronics',
      slug: 'electronics',
      level: 1,
      children: {
        create: [
          {
            name: '消费电子',
            nameEn: 'Consumer Electronics',
            slug: 'consumer-electronics',
            level: 2,
            children: {
              create: [
                { 
                  name: '手机', 
                  nameEn: 'Mobile Phones', 
                  slug: 'mobile-phones', 
                  level: 3 
                },
                { 
                  name: '平板电脑', 
                  nameEn: 'Tablets', 
                  slug: 'tablets', 
                  level: 3 
                }
              ]
            }
          }
        ]
      }
    }
  })

  const machinery = await prisma.category.create({
    data: {
      name: '机械设备',
      nameEn: 'Machinery',
      slug: 'machinery',
      level: 1,
      children: {
        create: [
          {
            name: '工业机械',
            nameEn: 'Industrial Machinery',
            slug: 'industrial-machinery',
            level: 2,
            children: {
              create: [
                { 
                  name: '包装机', 
                  nameEn: 'Packaging Machines', 
                  slug: 'packaging-machines', 
                  level: 3 
                }
              ]
            }
          }
        ]
      }
    }
  })

  const homeGoods = await prisma.category.create({
    data: {
      name: '家居用品',
      nameEn: 'Home & Garden',
      slug: 'home-garden',
      level: 1,
      children: {
        create: [
          {
            name: '厨房用品',
            nameEn: 'Kitchen Supplies',
            slug: 'kitchen-supplies',
            level: 2
          }
        ]
      }
    }
  })

  console.log('✓ Categories created')

  // Create test sellers
  console.log('Creating test sellers...')
  
  const sellers = []
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `seller${i}@test.com`,
        username: `TestSeller${i}`,
        password: await bcrypt.hash('password123', 10),
        role: 'SELLER',
      }
    })
    
    const seller = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        companyName: `测试公司 ${i}`,
        companyType: 'MANUFACTURER',
        country: 'China',
        city: 'Shenzhen',
        address: `Industrial Zone ${i}, Shenzhen`,
        phone: `+86 755 ${1000 + i}${1000 + i}`,
        email: `contact@company${i}.com`,
        website: `https://company${i}.com`,
        description: `<p>Professional manufacturer with ${10 + i} years of experience.</p><p>Specializing in high-quality products for global markets.</p>`,
        certifications: ['ISO9001', 'CE', 'FDA'],
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isVerified: true,
      }
    })
    
    sellers.push(seller)
  }

  console.log('✓ Sellers created')

  // Create products for each seller
  console.log('Creating test products...')
  
  // Get the actual mobile phones category ID
  const mobilePhonesCategory = await prisma.category.findUnique({
    where: { slug: 'mobile-phones' }
  })
  
  if (!mobilePhonesCategory) {
    throw new Error('Mobile phones category not found!')
  }
  
  const productTitles = [
    '智能手机 XYZ-100',
    '无线蓝牙耳机 Pro',
    '便携式充电宝 20000mAh',
    '高清网络摄像头 4K',
    '智能手表 Fitness Tracker',
  ]

  for (const seller of sellers) {
    for (let j = 0; j < 5; j++) {
      await prisma.product.create({
        data: {
          sellerId: seller.id,
          categoryId: mobilePhonesCategory.id,
          title: `${productTitles[j]} - ${seller.companyName}`,
          titleEn: `${productTitles[j]} - ${seller.companyName}`,
          description: `<p>High quality product with excellent features.</p><p>Perfect for global markets.</p>`,
          specifications: {
            model: `ABC-${seller.id.slice(-3)}${j + 1}`,
            material: 'Premium Quality',
            minOrderQty: 100,
            supplyCapacity: '10000 pieces/month',
            packaging: 'Standard export packaging'
          },
          minOrderQty: 100,
          supplyCapacity: '10000 pieces/month',
          mainImageUrl: '/placeholder-product.jpg',
          images: ['/placeholder-product.jpg'],
          hasBrochure: false,
          isActive: true,
          isFeatured: j === 0, // First product is featured
        }
      })
    }
  }

  console.log('✓ Products created')

  // Create a test buyer
  console.log('Creating test buyer...')
  
  await prisma.user.create({
    data: {
      email: 'buyer@test.com',
      username: 'TestBuyer',
      password: await bcrypt.hash('password123', 10),
      role: 'BUYER',
    }
  })

  // Create test reviews
  console.log('Creating test reviews...')
  
  const products = await prisma.product.findMany({ take: 10 })
  const buyers = await prisma.user.findMany({ where: { role: 'BUYER' } })
  
  const reviewsData = [
    {
      title: 'Excellent Product Quality',
      titleEn: 'Excellent Product Quality',
      content: 'The product exceeded our expectations. The build quality is outstanding and the delivery was fast. We have been using this product for 6 months now and it still works perfectly. Highly recommend to anyone looking for reliable products.',
      contentEn: 'The product exceeded our expectations. The build quality is outstanding and the delivery was fast. We have been using this product for 6 months now and it still works perfectly. Highly recommend to anyone looking for reliable products.',
      rating: 5,
      isVerified: true,
    },
    {
      title: 'Good Value for Money',
      titleEn: 'Good Value for Money',
      content: 'Great product at a competitive price. The supplier was very responsive to our inquiries and provided excellent after-sales service. Will definitely order again in the future.',
      contentEn: 'Great product at a competitive price. The supplier was very responsive to our inquiries and provided excellent after-sales service. Will definitely order again in the future.',
      rating: 4,
      isVerified: true,
    },
    {
      title: 'Fast Delivery',
      titleEn: 'Fast Delivery',
      content: 'The shipment arrived earlier than expected. The packaging was secure and the product was in perfect condition. The communication with the seller was smooth throughout the process.',
      contentEn: 'The shipment arrived earlier than expected. The packaging was secure and the product was in perfect condition. The communication with the seller was smooth throughout the process.',
      rating: 5,
      isVerified: true,
    },
    {
      title: 'Quality meets expectations',
      titleEn: 'Quality meets expectations',
      content: 'The product is exactly as described. We have placed multiple orders with this supplier and have always been satisfied with the quality and service. Professional team to work with.',
      contentEn: 'The product is exactly as described. We have placed multiple orders with this supplier and have always been satisfied with the quality and service. Professional team to work with.',
      rating: 4,
      isVerified: true,
    },
    {
      title: 'Highly Recommended',
      titleEn: 'Highly Recommended',
      content: 'Working with this supplier has been a great experience. They understand our requirements well and always deliver on time. The product quality is consistent and the prices are fair.',
      contentEn: 'Working with this supplier has been a great experience. They understand our requirements well and always deliver on time. The product quality is consistent and the prices are fair.',
      rating: 5,
      isVerified: true,
    },
    {
      title: 'Smooth Transaction',
      titleEn: 'Smooth Transaction',
      content: 'From inquiry to delivery, everything went smoothly. The sales team was knowledgeable and provided all the information we needed. We look forward to our next collaboration.',
      contentEn: 'From inquiry to delivery, everything went smoothly. The sales team was knowledgeable and provided all the information we needed. We look forward to our next collaboration.',
      rating: 5,
      isVerified: true,
    },
    {
      title: 'Good communication',
      titleEn: 'Good communication',
      content: 'The supplier was very responsive to all our questions. They provided samples quickly and the quality was good. We are happy with our purchase and would recommend to others.',
      contentEn: 'The supplier was very responsive to all our questions. They provided samples quickly and the quality was good. We are happy with our purchase and would recommend to others.',
      rating: 4,
      isVerified: true,
    },
    {
      title: 'Reliable supplier',
      titleEn: 'Reliable supplier',
      content: 'We have been doing business with this supplier for over a year now. They are reliable, professional, and always deliver quality products. Great partner for our business.',
      contentEn: 'We have been doing business with this supplier for over a year now. They are reliable, professional, and always deliver quality products. Great partner for our business.',
      rating: 5,
      isVerified: true,
    },
  ]
  
  for (let i = 0; i < Math.min(products.length, reviewsData.length); i++) {
    await prisma.review.create({
      data: {
        productId: products[i].id,
        sellerId: products[i].sellerId,
        userId: buyers[0]?.id || sellers[0].userId,
        title: reviewsData[i].title,
        content: reviewsData[i].content,
        rating: reviewsData[i].rating,
        isVerified: reviewsData[i].isVerified,
        helpfulCount: Math.floor(Math.random() * 50),
      }
    })
  }
  
  console.log('✓ Reviews created')
  console.log('🎉 Seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('Sellers:')
  console.log('  - seller1@test.com / password123')
  console.log('  - seller2@test.com / password123')
  console.log('  - seller3@test.com / password123')
  console.log('Buyer:')
  console.log('  - buyer@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    // No need to disconnect when using shared prisma client
  })
