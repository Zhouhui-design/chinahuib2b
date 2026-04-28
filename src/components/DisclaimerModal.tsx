'use client'

import { useState, useEffect } from 'react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'
import { X } from 'lucide-react'

export default function DisclaimerModal() {
  const language = useSellerLanguage()
  const [isVisible, setIsVisible] = useState(false)
  
  // Check if user has seen the disclaimer
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('has_seen_disclaimer')
    if (!hasSeenDisclaimer) {
      setIsVisible(true)
    }
  }, [])
  
  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('has_seen_disclaimer', 'true')
  }
  
  // Translations
  const disclaimers = {
    zh: {
      title: '重要声明',
      content: `我们是一个由中国创业者初创的B2B平台。我们相信：每个商家或个人，都应该有一个向世界展示工厂、品牌与货物的机会。

但请理解：我们暂时无法为任何合同或交易金额提供担保，也无法完全验证买卖双方的真实性。因此，本平台仅用于供需信息展示与撮合。

若您找到意向伙伴，请务必采用更稳妥的交易方式（如信用证、第三方担保、线下验货等）。

我们正在努力构建更安全的交易环境。感谢您的信任与谨慎。

【平台说明】本平台只有一个付款功能：商家购买充值展位费用。暂时不开放买卖双方交易和签合同等功能。`,
      button: '我知道了'
    },
    en: {
      title: 'Important Notice',
      content: `We are a B2B platform founded by Chinese entrepreneurs. We believe that every merchant or individual should have the opportunity to showcase their factory, brand, and goods to the world.

However, please understand: we currently cannot provide guarantees for any contracts or transaction amounts, nor can we fully verify the authenticity of buyers and sellers. Therefore, this platform is only used for supply and demand information display and matching.

If you find a potential partner, please be sure to use more secure transaction methods (such as letters of credit, third-party guarantees, offline inspection, etc.).

We are working hard to build a safer trading environment. Thank you for your trust and caution.

[Platform Note] This platform has only one payment function: merchants purchasing booth fees. Trading between buyers and sellers and contract signing functions are not currently available.`,
      button: 'I Understand'
    },
    ja: {
      title: '重要なお知らせ',
      content: `私たちは中国の起業家によって設立されたB2Bプラットフォームです。すべての事業者や個人が、自社工場、ブランド、商品を世界に紹介する機会を持つべきだと信じています。

ただし、現時点では契約や取引金額の保証を提供できず、買い手と売り手の真正性を完全に検証することもできません。したがって、本プラットフォームは需給情報の表示とマッチングのみを目的としています。

潜在的なパートナーを見つけた場合は、より安全な取引方法（信用状、第三者保証、オフライン検査など）を必ず使用してください。

私たちはより安全な取引環境の構築に取り組んでいます。あなたの信頼と慎重さに感謝します。

【プラットフォーム注記】本プラットフォームには唯一の支払い機能があります：販売者のブース料金購入。買い手と売り手の間の取引および契約締結機能は現在利用できません。`,
      button: '了解しました'
    },
    // Add more languages as needed...
  }
  
  const currentDisclaimer = disclaimers[language as keyof typeof disclaimers] || disclaimers.en
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">{currentDisclaimer.title}</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6">
          <div className="prose prose-sm max-w-none">
            {currentDisclaimer.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentDisclaimer.button}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
