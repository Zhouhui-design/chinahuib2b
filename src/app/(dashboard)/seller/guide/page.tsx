'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Book, Package, Store, Image, FileText, Settings, CheckCircle } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

export default function SellerGuidePage() {
  const language = useSellerLanguage()
  
  // Translations
  const t = {
    title: language === 'zh' ? '商家操作说明书' :
           language === 'ja' ? '販売者操作ガイド' :
           language === 'ar' ? 'دليل تشغيل البائع' :
           language === 'es' ? 'Guía del Vendedor' :
           language === 'fr' ? 'Guide du Vendeur' :
           language === 'de' ? 'Verkäuferhandbuch' :
           language === 'ko' ? '판매자 가이드' :
           language === 'ru' ? 'Руководство продавца' :
           language === 'pt' ? 'Guia do Vendedor' :
           language === 'hi' ? 'विक्रेता गाइड' :
           language === 'th' ? 'คู่มือผู้ขาย' :
           language === 'vi' ? 'Hướng dẫn Người bán' :
           'Seller Operation Guide',
    backToDashboard: language === 'zh' ? '返回仪表板' : 'Back to Dashboard',
    
    sections: {
      gettingStarted: language === 'zh' ? '入门指南' : 'Getting Started',
      storeSetup: language === 'zh' ? '店铺设置' : 'Store Setup',
      productManagement: language === 'zh' ? '产品管理' : 'Product Management',
      brochureManagement: language === 'zh' ? '宣传册管理' : 'Brochure Management',
      profileCustomization: language === 'zh' ? '个人资料定制' : 'Profile Customization',
      accountSettings: language === 'zh' ? '账户设置' : 'Account Settings',
    },
    
    content: {
      gettingStarted: language === 'zh' ? 
        '欢迎使用 Global Expo Network 卖家平台！本指南将帮助您快速上手。' :
        'Welcome to Global Expo Network Seller Platform! This guide will help you get started quickly.',
      
      storeSetup: language === 'zh' ?
        '1. 点击左侧菜单的 "Store" 选项\n2. 填写您的公司信息\n3. 上传公司 Logo（建议尺寸：200x200px）\n4. 添加店铺头图（建议尺寸：1200x400px）\n5. 编写公司简介和联系方式' :
        '1. Click "Store" in the left menu\n2. Fill in your company information\n3. Upload company logo (recommended: 200x200px)\n4. Add store header image (recommended: 1200x400px)\n5. Write company description and contact info',
      
      productManagement: language === 'zh' ?
        '1. 点击 "Products" > "Add Product"\n2. 填写产品基本信息（名称、描述、价格）\n3. 选择产品分类\n4. 上传产品图片（最多 10 张，建议尺寸：800x800px）\n5. 上传产品宣传册（PDF 格式）\n6. 点击 "Publish" 发布产品' :
        '1. Click "Products" > "Add Product"\n2. Fill in product details (name, description, price)\n3. Select product category\n4. Upload product images (max 10, recommended: 800x800px)\n5. Upload product brochure (PDF format)\n6. Click "Publish" to publish product',
      
      brochureManagement: language === 'zh' ?
        '1. 在产品编辑页面找到 "Brochures" 部分\n2. 点击 "Upload Brochure"\n3. 选择 PDF 文件（最大 10MB）\n4. 等待上传完成\n5. 可以预览和删除已上传的宣传册' :
        '1. Find "Brochures" section in product edit page\n2. Click "Upload Brochure"\n3. Select PDF file (max 10MB)\n4. Wait for upload to complete\n5. You can preview and delete uploaded brochures',
      
      profileCustomization: language === 'zh' ?
        '1. 点击 "Store" > "Customize Profile"\n2. 选择展位主题颜色\n3. 选择布局风格\n4. 自定义展示字段\n5. 预览并保存更改' :
        '1. Click "Store" > "Customize Profile"\n2. Choose booth theme color\n3. Select layout style\n4. Customize display fields\n5. Preview and save changes',
      
      accountSettings: language === 'zh' ?
        '1. 点击右上角的用户名\n2. 选择 "Account Settings"\n3. 修改密码\n4. 更新联系信息\n5. 设置通知偏好' :
        '1. Click your username in top right\n2. Select "Account Settings"\n3. Change password\n4. Update contact information\n5. Set notification preferences',
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/seller"
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t.backToDashboard}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Getting Started */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Book className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.gettingStarted}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.gettingStarted}</p>
          </section>

          {/* Store Setup */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Store className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.storeSetup}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.storeSetup}</p>
          </section>

          {/* Product Management */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.productManagement}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.productManagement}</p>
          </section>

          {/* Brochure Management */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.brochureManagement}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.brochureManagement}</p>
          </section>

          {/* Profile Customization */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Image className="w-6 h-6 text-pink-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.profileCustomization}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.profileCustomization}</p>
          </section>

          {/* Account Settings */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.sections.accountSettings}</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{t.content.accountSettings}</p>
          </section>

          {/* Quick Tips */}
          <section className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'zh' ? '定期更新产品信息以保持竞争力' : 'Regularly update product information to stay competitive'}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'zh' ? '使用高质量的产品图片吸引更多买家' : 'Use high-quality product images to attract more buyers'}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'zh' ? '及时回复买家咨询以提高转化率' : 'Respond to buyer inquiries promptly to improve conversion rates'}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
