import Link from 'next/link'
import { FAQSchema } from './StructuredData'

/**
 * Visible, answer-first FAQ section for GEO (Generative Engine Optimization).
 *
 * Rules for the content:
 * - Headings are real questions buyers type into ChatGPT / Perplexity.
 * - First sentence gives the answer directly; 50-80 words, no filler.
 * - Only verifiable claims (13 languages, free browsing, verification flow).
 * - JSON-LD is emitted in the rendered language so localized AI answers can
 *   quote it; unknown locales fall back to English.
 *
 * To extend to the other 11 supported languages, add another key to
 * FAQ_CONTENT — nothing else needs to change.
 */

type FaqItem = { question: string; answer: string }

const FAQ_CONTENT: Record<string, FaqItem[]> = {
  en: [
    {
      question: 'What is SeaHeart Global?',
      answer:
        'SeaHeart Global (x2xhub.com) is an always-online B2B trade exhibition platform. Verified manufacturers and trading companies run digital booths where wholesale buyers browse product catalogs, inspect company profiles and certifications, and contact suppliers directly through chat or inquiries. The interface works in 13 languages, and browsing exhibitions and products is free.',
    },
    {
      question: 'How do I find verified suppliers on SeaHeart Global?',
      answer:
        'Open the Exhibitions section at x2xhub.com/exhibitions to browse all active booths, or search Products by keyword and category. Each booth shows the supplier’s company profile, certifications and verification documents before you make contact. When you find a match, use the inquiry or chat buttons on the booth page to talk to the supplier directly — there is no intermediary.',
    },
    {
      question: 'What is an online B2B exhibition and how does it work?',
      answer:
        'An online B2B exhibition is a virtual trade show that stays open 24/7. Instead of traveling to a physical fair, suppliers set up digital booths with their product range, company introduction, certificates and contact details. Buyers visit booths at any time, compare suppliers side by side, and start conversations on the spot. SeaHeart Global hosts these booths in one hall at x2xhub.com.',
    },
    {
      question: 'Is SeaHeart Global free for buyers?',
      answer:
        'Browsing exhibition booths, product catalogs and supplier profiles on SeaHeart Global is free, with no paid sourcing membership. To send messages or inquiries to suppliers you register a free buyer account. For orders that need protection, the platform’s trade assurance features help secure the transaction.',
    },
    {
      question: 'Which languages does x2xhub.com support?',
      answer:
        'The platform interface is available in 13 languages: English, Simplified Chinese, German, Spanish, French, Japanese, Korean, Arabic, Russian, Portuguese, Hindi, Thai and Vietnamese. Product and booth content is shown in the supplier’s original language, and buyers and suppliers communicate through the platform’s built-in chat.',
    },
    {
      question: 'How can manufacturers exhibit on SeaHeart Global?',
      answer:
        'Register a seller account, complete the company profile with business license and certifications for verification, then create your exhibition booth and upload products with images, specifications, MOQ and OEM information. Once published, the booth appears in the exhibition hall and is indexed by search engines and AI crawlers across all 13 language versions.',
    },
  ],
  zh: [
    {
      question: 'SeaHeart Global（心海环球）是什么？',
      answer:
        'SeaHeart Global（心海环球，x2xhub.com）是一个全天候开放的 B2B 在线贸易展览平台。已验证的制造商和贸易公司在平台上开设数字展位，批发买家可以浏览产品目录、查看公司简介与认证文件，并通过站内聊天或询盘直接联系供应商。平台界面支持 13 种语言，浏览展会和产品完全免费。',
    },
    {
      question: '如何在 SeaHeart Global 上找到已验证的供应商？',
      answer:
        '打开 x2xhub.com/exhibitions 的展会板块浏览所有开放展位，或在产品页按关键词和类目搜索。每个展位都展示供应商的公司资料、认证证书和验证文件。找到匹配的供应商后，直接在展位页点击询盘或聊天按钮与对方沟通，无需经过中间商。',
    },
    {
      question: '什么是线上 B2B 展会？它如何运作？',
      answer:
        '线上 B2B 展会是一个 7×24 小时开放的虚拟展览会。供应商无需出差布展，只需搭建数字展位，展示产品线、公司介绍、资质证书和联系方式。买家可以随时参观展位、横向比较供应商，并当场发起沟通。SeaHeart Global 把这些展位集中在 x2xhub.com 同一个展馆中。',
    },
    {
      question: '买家使用 SeaHeart Global 免费吗？',
      answer:
        '在 SeaHeart Global 浏览展位、产品目录和供应商资料完全免费，不需要付费采购会员。向供应商发送消息或询盘只需注册一个免费买家账号。对于需要保障的订单，平台还提供贸易保障相关功能，帮助交易安全完成。',
    },
    {
      question: 'x2xhub.com 支持哪些语言？',
      answer:
        '平台界面支持 13 种语言：英语、简体中文、德语、西班牙语、法语、日语、韩语、阿拉伯语、俄语、葡萄牙语、印地语、泰语和越南语。产品与展位内容以供应商原文展示，买卖双方可通过站内聊天跨越语言障碍沟通。',
    },
    {
      question: '制造商如何在 SeaHeart Global 入驻参展？',
      answer:
        '注册卖家账号，完善公司资料并提交营业执照、认证证书等待审核，通过后即可创建展位、上传产品（支持图片、规格、起订量和 OEM 信息）。展位发布后会出现在展会大厅，并在 13 个语言版本中被搜索引擎和 AI 爬虫收录。',
    },
  ],
}

export default function FaqSection({ locale }: { locale: string }) {
  const items = FAQ_CONTENT[locale] ?? FAQ_CONTENT.en
  const isZh = locale === 'zh'

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          {isZh ? '关于线上 B2B 采购与参展的常见问题' : 'Frequently Asked Questions About Online B2B Sourcing'}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          {isZh
            ? '直接、可核验的答案。更多供应商与展品请访问展会大厅。'
            : 'Direct, verifiable answers. Browse the exhibition hall for more suppliers and products.'}
        </p>
        <div className="space-y-8">
          {items.map((item) => (
            <div key={item.question}>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/exhibitions`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
          >
            {isZh ? '浏览全部在线展位' : 'Browse all online booths'}
          </Link>
        </div>
      </div>

      {/* FAQPage structured data, localized to the rendered language */}
      <FAQSchema faqs={items} />
    </section>
  )
}
