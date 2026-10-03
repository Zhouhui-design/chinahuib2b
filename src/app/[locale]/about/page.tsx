import Link from 'next/link';
import type { LanguageCode } from '@/lib/languages';
import { prisma } from '@/lib/db';
import { Building2, Users, Globe, Award, Target, Rocket, TrendingUp, Shield } from 'lucide-react';

// Counts are cheap and change as exhibitors join; revalidate hourly so the
// page stays statically served while numbers never drift far from reality.
export const revalidate = 3600;

interface LiveStats {
  exhibitors: number;
  products: number;
  countries: number;
}

// Real, auditable figures only. Never invent marketing numbers here —
// AI engines quote these verbatim and users can check them against the
// public exhibition listing.
async function getLiveStats(): Promise<LiveStats> {
  try {
    const [exhibitors, products, sellers] = await Promise.all([
      prisma.booth.count({ where: { isActive: true, isPublished: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.sellerProfile.findMany({
        where: { booths: { some: { isActive: true, isPublished: true } } },
        select: { country: true },
        distinct: ['country'],
      }),
    ]);
    const countries = new Set(
      sellers.map((s) => s.country?.trim()).filter((c): c is string => !!c)
    ).size;
    return { exhibitors, products, countries };
  } catch {
    // DB must not take the About page down; language stat is static.
    return { exhibitors: 0, products: 0, countries: 0 };
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as LanguageCode;
  const isZh = locale === 'zh';

  const live = await getLiveStats();

  const features = [
    { icon: Globe, title: isZh ? '全球在线展馆' : 'Global Online Exhibition', desc: isZh ? '一个全天候开放的在线展馆，连接全球买家与供应商，无需出差即可看展选品' : 'One always-online exhibition hall connecting buyers and suppliers worldwide — visit and source without travel' },
    { icon: Shield, title: isZh ? '安全交易' : 'Secure Transactions', desc: isZh ? '完善的贸易保障机制，确保每笔交易安全' : 'Comprehensive trade protection for every transaction' },
    { icon: Users, title: isZh ? '认证会员' : 'Verified Members', desc: isZh ? '所有卖家经过严格认证，确保真实可靠' : 'All sellers are rigorously verified for authenticity' },
    { icon: Award, title: isZh ? '专业服务' : 'Professional Service', desc: isZh ? '多语言客户支持，专业团队护航' : 'Multilingual customer support from a professional team' },
    { icon: Target, title: isZh ? '精准匹配' : 'Precise Matching', desc: isZh ? '智能算法帮助买家快速找到合适的供应商' : 'Smart algorithms match buyers with the right suppliers' },
    { icon: Rocket, title: isZh ? '创新技术' : 'Innovative Technology', desc: isZh ? 'AI驱动的贸易解决方案，引领行业未来' : 'AI-powered trade solutions for the future' },
  ];

  const stats = [
    ...(live.exhibitors > 0
      ? [{ value: String(live.exhibitors), label: isZh ? '已验证参展商' : 'Verified Exhibitors' }]
      : []),
    ...(live.products > 0
      ? [{ value: String(live.products), label: isZh ? '在展产品' : 'Products Online' }]
      : []),
    ...(live.countries > 0
      ? [{ value: String(live.countries), label: isZh ? '供应商所在国家/地区' : 'Supplier Countries' }]
      : []),
    { value: '13', label: isZh ? '界面语言' : 'Interface Languages' },
  ];

  const pl = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const storyToday = isZh
    ? `今天，SeaHeart Global（心海环球，x2xhub.com）运营着一个全天候开放的 B2B 在线展馆：来自 ${live.countries} 个国家/地区的 ${live.exhibitors} 家已验证参展商在此展出 ${live.products} 款产品，平台界面支持 13 种语言，买家可随时看展、选品、联系供应商。`
    : `Today, SeaHeart Global (x2xhub.com) runs an always-online B2B exhibition hall: ${pl(live.exhibitors, 'verified exhibitor')} from ${pl(live.countries, 'country')} present ${pl(live.products, 'product')}, the interface works in 13 languages, and buyers can visit, source and contact suppliers at any time.`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {isZh ? '关于 SeaHeart Global（心海环球）' : 'About SeaHeart Global (x2xhub.com)'}
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 max-w-3xl mx-auto">
            {isZh
              ? '我们致力于打造全球领先的B2B跨境贸易展览平台，连接世界，促进贸易。'
              : 'We are building a B2B cross-border trade exhibition platform that connects buyers with verified suppliers — online, in 13 languages, around the clock.'}
          </p>
        </div>
      </section>

      {/* Stats Section — live figures from the platform database */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {isZh ? '我们的故事' : 'Our Story'}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {isZh
                  ? 'SeaHeart Global 诞生于一个简单的想法：世界应该更小，贸易应该更简单。传统贸易展会成本高、效率低、覆盖面有限，大量优质供应商负担不起参展费用。'
                  : 'SeaHeart Global was born from a simple idea: the world should be smaller, and trade should be simpler. Traditional trade shows are expensive, inefficient and limited in reach — many quality suppliers cannot afford to exhibit at all.'}
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                {isZh
                  ? '我们利用互联网技术和AI创新，创建了一个全新的B2B跨境贸易平台。来自全球的买家和卖家可以随时随地进行贸易，不再受限于地理位置和时间。'
                  : 'Using internet technology and AI, we built a B2B cross-border trade platform where buyers and sellers can trade anytime, anywhere, without being limited by geography or time.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {storyToday}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
              <Target className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isZh ? '我们的使命' : 'Our Mission'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {isZh
                  ? '通过创新技术，让全球贸易变得简单、透明、高效。我们相信，每一家企业都应该有机会参与国际贸易。'
                  : 'Through innovative technology, make global trade simple, transparent, and efficient. We believe every business should have the opportunity to participate in international trade.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-lg">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isZh ? '我们的愿景' : 'Our Vision'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {isZh
                  ? '成为全球最受信赖的B2B贸易平台，连接世界每一个角落，让贸易无边界。'
                  : 'Become the world\'s most trusted B2B trade platform, connecting every corner of the world and making trade borderless.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {isZh ? '为什么选择我们' : 'Why Choose Us'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isZh ? '加入我们的全球贸易网络' : 'Join Our Global Trade Network'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {isZh ? '现在注册，开启您的全球贸易之旅' : 'Sign up now and start your global trade journey'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={`/${locale}/auth/register?type=seller`}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {isZh ? '注册为卖家' : 'Register as Seller'}
            </Link>
            <Link
              href={`/${locale}/auth/register?type=buyer`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              {isZh ? '注册为买家' : 'Register as Buyer'}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              {isZh ? '联系我们' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
