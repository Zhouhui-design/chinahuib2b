'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LanguageCode } from '@/lib/languages';
import { getDictionary } from '@/locales/dictionary';
import { Building2, Users, Globe, Award, Target, Rocket, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  const params = useParams();
  const locale = (params['locale'] as LanguageCode) || 'en';
  const [dict, setDict] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchDict = async () => {
      const dictionary = await getDictionary(locale);
      setDict(dictionary);
    };
    fetchDict();
  }, [locale]);

  if (!dict) return null;

  const isZh = locale === 'zh';

  const features = [
    { icon: Globe, title: isZh ? '全球覆盖' : 'Global Reach', desc: isZh ? '覆盖全球100+国家和地区的买家和卖家' : 'Connecting buyers and sellers across 100+ countries' },
    { icon: Shield, title: isZh ? '安全交易' : 'Secure Transactions', desc: isZh ? '完善的贸易保障机制，确保每笔交易安全' : 'Comprehensive trade protection for every transaction' },
    { icon: Users, title: isZh ? '认证会员' : 'Verified Members', desc: isZh ? '所有卖家经过严格认证，确保真实可靠' : 'All sellers are rigorously verified for authenticity' },
    { icon: Award, title: isZh ? '专业服务' : 'Professional Service', desc: isZh ? '24/7多语言客户支持，专业团队护航' : '24/7 multilingual customer support' },
    { icon: Target, title: isZh ? '精准匹配' : 'Precise Matching', desc: isZh ? '智能算法帮助买家快速找到合适的供应商' : 'Smart algorithms match buyers with the right suppliers' },
    { icon: Rocket, title: isZh ? '创新技术' : 'Innovative Technology', desc: isZh ? 'AI驱动的贸易解决方案，引领行业未来' : 'AI-powered trade solutions for the future' },
  ];

  const stats = [
    { value: '50K+', label: isZh ? '全球企业' : 'Global Companies' },
    { value: '100+', label: isZh ? '覆盖国家' : 'Countries Covered' },
    { value: '1M+', label: isZh ? '贸易询盘' : 'Trade Inquiries' },
    { value: '98%', label: isZh ? '客户满意度' : 'Client Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {isZh ? '关于 Global Expo Network' : 'About Global Expo Network'}
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 max-w-3xl mx-auto">
            {isZh
              ? '我们致力于打造全球领先的B2B跨境贸易展览平台，连接世界，促进贸易。'
              : 'We are committed to building the world\'s leading B2B cross-border trade exhibition platform, connecting the world and facilitating trade.'}
          </p>
        </div>
      </section>

      {/* Stats Section */}
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
                  ? 'Global Expo Network 诞生于一个简单的想法：世界应该更小，贸易应该更简单。我们的创始人看到了传统贸易展会的局限性——成本高、效率低、覆盖面有限。'
                  : 'Global Expo Network was born from a simple idea: the world should be smaller, and trade should be simpler. Our founders saw the limitations of traditional trade shows — high costs, low efficiency, limited reach.'}
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                {isZh
                  ? '我们利用互联网技术和AI创新，创建了一个全新的B2B跨境贸易平台。现在，来自全球的买家和卖家可以随时随地进行贸易，不再受限于地理位置和时间。'
                  : 'Leveraging internet technology and AI innovation, we created a new B2B cross-border trade platform. Now, buyers and sellers from around the world can trade anytime, anywhere, without being limited by geography or time.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {isZh
                  ? '从2024年成立至今，我们已经成长为全球领先的B2B贸易平台，服务来自100多个国家的50,000多家企业。'
                  : 'Since our founding in 2024, we have grown into a leading global B2B trade platform, serving over 50,000 companies from more than 100 countries.'}
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
