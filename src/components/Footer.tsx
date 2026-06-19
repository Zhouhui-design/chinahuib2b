/**
 * Footer Component
 * 页脚组件 - 包含导航链接、招募合伙人、投资、联系信息和社交媒体
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDictionary } from '@/locales/dictionary';
import type { LanguageCode } from '@/lib/languages';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, Instagram, Github, Globe, Users, DollarSign } from 'lucide-react';

type FooterProps = {
  locale: LanguageCode;
};

export default function Footer({ locale }: FooterProps) {
  const [dict, setDict] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchDict = async () => {
      const dictionary = await getDictionary(locale);
      setDict(dictionary);
    };
    fetchDict();
  }, [locale]);

  if (!dict) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* 招募合伙人横幅 */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">{dict.footer?.partnerRecruitment || '招募合伙人'}</h3>
                <p className="text-white/80 text-sm">{dict.footer?.partnerDesc || '全球招募 - 不限地区，不限种族'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/${locale}/partner-recruitment`}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                {dict.footer?.joinUs || '加入我们'}
              </Link>
              <Link
                href={`/${locale}/investment`}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                {dict.footer?.investNow || '欢迎投资'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 主页脚内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-xl font-bold text-white">Global Expo</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {dict.footer?.about || 'Global Expo Network 是全球领先的B2B跨境贸易展览平台，连接全球买家和卖家，促进国际贸易发展。'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{dict.footer?.quickLinks || '快速链接'}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.products}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/stores`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.exhibitors}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/marketplace`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.marketplace}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/chat-hall`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.chatHall}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/auction-screen`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.auction}
                </Link>
              </li>
            </ul>
          </div>

          {/* 服务 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{dict.footer?.services || '服务'}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/api-docs`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.apiDocs}
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.sellerPortal}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/ai-register`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.nav.aiRegister}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/partner-recruitment`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.footer?.partnerRecruitment || '招募合伙人'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/investment`} className="text-gray-400 hover:text-white transition-colors">
                  {dict.footer?.invest || '投资机会'}
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{dict.footer?.contact || '联系我们'}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">+86 18627407019</p>
                  <p className="text-gray-400 text-sm">24小时服务热线</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white">aardenx@outlook.com</p>
                  <p className="text-gray-400 text-sm">商务合作邮箱</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white">Shanghai, China</p>
                  <p className="text-gray-400 text-sm">国际业务总部</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white">Global Coverage</p>
                  <p className="text-gray-400 text-sm">覆盖全球100+国家</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Global Expo Network. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                {dict.footer?.privacy || '隐私政策'}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                {dict.footer?.terms || '服务条款'}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                {dict.footer?.cookies || 'Cookie设置'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}