'use client'

import { useState, useEffect } from 'react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

export default function AnnouncementBar() {
  const language = useSellerLanguage()
  
  // Translations for announcement
  const announcements = {
    zh: '连接全球买卖双方，从"发现"开始 | 我们是一个由中国创业者初创的B2B平台 | 我们相信：每个商家或个人，都应该有一个向世界展示工厂、品牌与货物的机会 | 本平台仅用于供需信息展示与撮合，不提供交易担保',
    ja: '世界中の買い手と売り手をつなぐ、「発見」から始めましょう | 中国の起業家によって設立されたB2Bプラットフォームです | すべての事業者や個人が、自社工場、ブランド、商品を世界に紹介する機会を持つべきだと信じています | 本プラットフォームは需給情報の表示とマッチングのみを目的としています',
    ar: 'ربط المشترين والبائعين حول العالم، ابدأ من "الاكتشاف" | منصة B2B أسسها رواد أعمال صينيون | نؤمن بأن كل تاجر أو فرد يجب أن تكون لديه فرصة لعرض مصنعه وعلامته التجارية وبضاعته للعالم | هذه المنصة مخصصة فقط لعرض ومطابقة معلومات العرض والطلب',
    es: 'Conectando compradores y vendedores globales, comience desde el "descubrimiento" | Plataforma B2B fundada por emprendedores chinos | Creemos que cada comerciante debe tener la oportunidad de mostrar su fábrica, marca y productos al mundo | Esta plataforma solo se utiliza para mostrar y combinar información de oferta y demanda',
    fr: 'Connecter les acheteurs et vendeurs mondiaux, commencez par la "découverte" | Plateforme B2B fondée par des entrepreneurs chinois | Nous croyons que chaque commerçant devrait avoir l\'opportunité de présenter son usine, sa marque et ses produits au monde | Cette plateforme est uniquement utilisée pour afficher et apparier les informations d\'offre et de demande',
    de: 'Verbinden Sie globale Käufer und Verkäufer, beginnen Sie mit der "Entdeckung" | Von chinesischen Unternehmern gegründete B2B-Plattform | Wir glauben: Jeder Händler sollte die Möglichkeit haben, seine Fabrik, Marke und Waren der Welt zu präsentieren | Diese Plattform dient nur zur Anzeige und Abstimmung von Angebots- und Nachfrageinformationen',
    ko: '전 세계 구매자와 판매자를 연결하세요, "발견"에서 시작합니다 | 중국 기업가가 설립한 B2B 플랫폼입니다 | 모든 상인이나 개인이 공장, 브랜드 및 제품을 세계에 보여줄 기회를 가져야 한다고 믿습니다 | 이 플랫폼은 수요와 공급 정보 표시 및 매칭에만 사용됩니다',
    ru: 'Соединяя мировых покупателей и продавцов, начните с "открытия" | B2B платформа, основанная китайскими предпринимателями | Мы верим: каждый торговец должен иметь возможность показать свою фабрику, бренд и товары миру | Эта платформа используется только для отображения и сопоставления информации о спросе и предложении',
    pt: 'Conectando compradores e vendedores globais, comece pela "descoberta" | Plataforma B2B fundada por empreendedores chineses | Acreditamos que cada comerciante deve ter a oportunidade de mostrar sua fábrica, marca e produtos ao mundo | Esta plataforma é usada apenas para exibir e combinar informações de oferta e demanda',
    hi: 'वैश्विक खरीदारों और विक्रेताओं को जोड़ना, "खोज" से शुरू करें | चीनी उद्यमियों द्वारा स्थापित B2B प्लेटफॉर्म | हम मानते हैं: प्रत्येक व्यापारी को अपनी फैक्ट्री, ब्रांड और सामान को दुनिया को दिखाने का अवसर होना चाहिए | यह प्लेटफॉर्म केवल आपूर्ति और मांग जानकारी प्रदर्शन और मिलान के लिए उपयोग किया जाता है',
    th: 'เชื่อมต่อผู้ซื้อและผู้ขายทั่วโลก เริ่มต้นจาก "การค้นพบ" | แพลตฟอร์ม B2B ที่ก่อตั้งโดยผู้ประกอบการชาวจีน | เราเชื่อว่าพ่อค้าทุกคนควรมีโอกาสแสดงโรงงาน แบรนด์ และสินค้าของตนต่อโลก | แพลตฟอร์มนี้ใช้สำหรับการแสดงและจับคู่ข้อมูลอุปสงค์และอุปทานเท่านั้น',
    vi: 'Kết nối người mua và người bán toàn cầu, bắt đầu từ "khám phá" | Nền tảng B2B được thành lập bởi các doanh nhân Trung Quốc | Chúng tôi tin rằng mỗi thương nhân nên có cơ hội giới thiệu nhà máy, thương hiệu và hàng hóa của mình với thế giới | Nền tảng này chỉ được sử dụng để hiển thị và kết hợp thông tin cung cầu',
    en: 'Connecting global buyers and sellers, start from "discovery" | We are a B2B platform founded by Chinese entrepreneurs | We believe every merchant should have the opportunity to showcase their factory, brand, and goods to the world | This platform is only used for supply and demand information display and matching',
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
