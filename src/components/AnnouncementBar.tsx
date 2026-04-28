'use client'

import { useState, useEffect } from 'react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

export default function AnnouncementBar() {
  const language = useSellerLanguage()
  
  // Translations for announcement
  const announcements = {
    zh: '连接全球买卖双方，从"发现"开始 | 我们是一个由中国创业者初创的B2B平台 | 我们相信：每个商家或个人，都应该有一个向世界展示工厂、品牌与货物的机会',
    ja: '世界中の買い手と売り手をつなぐ、「発見」から始めましょう | 中国の起業家によって設立されたB2Bプラットフォームです | 私たちは信じています：すべての事業者や個人が、自社工場、ブランド、商品を世界に紹介する機会を持つべきだと',
    ar: 'ربط المشترين والبائعين حول العالم، ابدأ من "الاكتشاف" | نحن منصة B2B أسسها رواد أعمال صينيون | نؤمن بأن كل تاجر أو فرد يجب أن تكون لديه فرصة لعرض مصنعه وعلامته التجارية وبضاعته للعالم',
    es: 'Conectando compradores y vendedores globales, comience desde el "descubrimiento" | Somos una plataforma B2B fundada por emprendedores chinos | Creemos que cada comerciante o individuo debe tener la oportunidad de mostrar su fábrica, marca y productos al mundo',
    fr: 'Connecter les acheteurs et vendeurs mondiaux, commencez par la "découverte" | Nous sommes une plateforme B2B fondée par des entrepreneurs chinois | Nous croyons que chaque commerçant ou individu devrait avoir l\'opportunité de présenter son usine, sa marque et ses produits au monde',
    de: 'Verbinden Sie globale Käufer und Verkäufer, beginnen Sie mit der "Entdeckung" | Wir sind eine von chinesischen Unternehmern gegründete B2B-Plattform | Wir glauben: Jeder Händler oder Einzelperson sollte die Möglichkeit haben, seine Fabrik, Marke und Waren der Welt zu präsentieren',
    ko: '전 세계 구매자와 판매자를 연결하세요, "발견"에서 시작합니다 | 중국 기업가가 설립한 B2B 플랫폼입니다 | 우리는 모든 상인이나 개인이 공장, 브랜드 및 제품을 세계에 보여줄 기회를 가져야 한다고 믿습니다',
    ru: 'Соединяя мировых покупателей и продавцов, начните с "открытия" | Мы - B2B платформа, основанная китайскими предпринимателями | Мы верим: каждый торговец или человек должен иметь возможность показать свою фабрику, бренд и товары миру',
    pt: 'Conectando compradores e vendedores globais, comece pela "descoberta" | Somos uma plataforma B2B fundada por empreendedores chineses | Acreditamos que cada comerciante ou indivíduo deve ter a oportunidade de mostrar sua fábrica, marca e produtos ao mundo',
    hi: 'वैश्विक खरीदारों और विक्रेताओं को जोड़ना, "खोज" से शुरू करें | हम चीनी उद्यमियों द्वारा स्थापित एक B2B प्लेटफॉर्म हैं | हम मानते हैं: प्रत्येक व्यापारी या व्यक्ति के पास अपनी फैक्ट्री, ब्रांड और सामान को दुनिया को दिखाने का अवसर होना चाहिए',
    th: 'เชื่อมต่อผู้ซื้อและผู้ขายทั่วโลก เริ่มต้นจาก "การค้นพบ" | เราเป็นแพลตฟอร์ม B2B ที่ก่อตั้งโดยผู้ประกอบการชาวจีน | เราเชื่อว่า: พ่อค้าหรือบุคคลทุกคนควรมีโอกาสแสดงโรงงาน แบรนด์ และสินค้าของตนต่อโลก',
    vi: 'Kết nối người mua và người bán toàn cầu, bắt đầu từ "khám phá" | Chúng tôi là nền tảng B2B được thành lập bởi các doanh nhân Trung Quốc | Chúng tôi tin rằng: mỗi thương nhân hoặc cá nhân đều nên có cơ hội giới thiệu nhà máy, thương hiệu và hàng hóa của mình với thế giới',
    en: 'Connecting global buyers and sellers, start from "discovery" | We are a B2B platform founded by Chinese entrepreneurs | We believe: every merchant or individual should have the opportunity to showcase their factory, brand, and goods to the world',
  }
  
  const currentAnnouncement = announcements[language as keyof typeof announcements] || announcements.en
  
  return (
    <div className="bg-blue-600 text-white overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee">
        <span className="text-sm font-medium px-4">{currentAnnouncement}</span>
      </div>
    </div>
  )
}
