'use client'

import { useSellerLanguage } from '@/hooks/useSellerLanguage'

export default function DisclaimerTicker() {
  const language = useSellerLanguage()
  
  // Translations for disclaimer ticker
  const disclaimers = {
    zh: '⚠️ 重要提醒：本平台仅提供信息展示与撮合服务，不提供交易担保 | 建议采用信用证、第三方担保等安全交易方式 | 平台不对任何交易纠纷承担责任 | 请谨慎选择交易伙伴',
    ja: '⚠️ 重要なお知らせ：本プラットフォームは情報表示とマッチングサービスのみを提供し、取引保証は提供しません | 信用状、第三者保証などの安全な取引方法を採用することをお勧めします | プラットフォームは取引紛争について一切の責任を負いません | 取引パートナーを慎重に選択してください',
    ar: '⚠️ تنبيه مهم: تقدم هذه المنصة خدمات عرض المعلومات والمطابقة فقط، ولا تقدم ضمانات للت交易 | نوصي باستخدام طرق交易 آمنة مثل خطابات الاعتماد والضمانات من طرف ثالث | المنصة لا تتحمل أي مسؤولية عن نزاعات交易 | يرجى اختيار شركاء交易 بحذر',
    es: '⚠️ Aviso importante: Esta plataforma solo proporciona servicios de exhibición de información y emparejamiento, no garantiza transacciones | Se recomienda utilizar métodos de交易 seguros como cartas de crédito y garantías de terceros | La plataforma no asume responsabilidad por disputas de交易 | Elija socios de交易 con precaución',
    fr: '⚠️ Avis important : Cette plateforme fournit uniquement des services d\'affichage d\'informations et de mise en relation, ne garantit pas les transactions | Il est recommandé d\'utiliser des méthodes de交易 sécurisées telles que les lettres de crédit et les garanties tierces | La plateforme n\'assume aucune responsabilité pour les litiges de交易 | Choisissez vos partenaires de交易 avec prudence',
    de: '⚠️ Wichtiger Hinweis: Diese Plattform bietet nur Informationsanzeige und Vermittlungsdienste an, keine Transaktionsgarantien | Es wird empfohlen, sichere Transaktionsmethoden wie Akkreditive und Drittbürgschaften zu verwenden | Die Plattform übernimmt keine Verantwortung für Transaktionsstreitigkeiten | Wählen Sie Transaktionspartner sorgfältig aus',
    ko: '⚠️ 중요 알림: 본 플랫폼은 정보 표시 및 매칭 서비스만 제공하며 거래 보장을 제공하지 않습니다 | 신용장, 제3자 보증 등 안전한 거래 방법을 채택할 것을 권장합니다 | 플랫폼은 거래 분쟁에 대해 어떠한 책임도 지지 않습니다 | 거래 파트너를 신중하게 선택하십시오',
    ru: '⚠️ Важное уведомление: Эта платформа предоставляет только услуги отображения информации и сопоставления, не гарантирует транзакции | Рекомендуется использовать безопасные методы транзакций, такие как аккредитивы и гарантии третьих сторон | Платформа не несет ответственности за споры по транзакциям | Тщательно выбирайте партнеров по транзакциям',
    pt: '⚠️ Aviso importante: Esta plataforma fornece apenas serviços de exibição de informações e correspondência, não garante transações | Recomenda-se usar métodos de交易 seguros, como cartas de crédito e garantias de terceiros | A plataforma não assume responsabilidade por disputas de交易 | Escolha parceiros de交易 com cuidado',
    hi: '⚠️ महत्वपूर्ण सूचना: यह प्लेटफॉर्म केवल जानकारी प्रदर्शन और मिलान सेवाएं प्रदान करता है, लेनदेन की गारंटी नहीं देता | लेटर ऑफ क्रेडिट, थर्ड-पार्टी गारंटी जैसी सुरक्षित लेनदेन विधियों का उपयोग करने की सलाह दी जाती है | प्लेटफॉर्म लेनदेन विवादों के लिए कोई जिम्मेदारी नहीं लेता | लेनदेन भागीदारों को सावधानी से चुनें',
    th: '⚠️ แจ้งเตือนสำคัญ: แพลตฟอร์มนี้ให้บริการแสดงข้อมูลและจับคู่เท่านั้น ไม่รับประกันการทำธุรกรรม | แนะนำให้ใช้วิธีการทำธุรกรรมที่ปลอดภัยเช่น เลตเตอร์ออฟเครดิต การค้ำประกันจากบุคคลที่สาม | แพลตฟอร์มไม่รับผิดชอบข้อพิพาทในการทำธุรกรรม | โปรดเลือกพันธมิตรการทำธุรกรรมอย่างระมัดระวัง',
    vi: '⚠️ Thông báo quan trọng: Nền tảng này chỉ cung cấp dịch vụ hiển thị thông tin và kết nối, không đảm bảo giao dịch | Khuyến nghị sử dụng các phương thức giao dịch an toàn như tín dụng thư, bảo lãnh của bên thứ ba | Nền tảng không chịu trách nhiệm về các tranh chấp giao dịch | Hãy chọn đối tác giao dịch một cách thận trọng',
    en: '⚠️ Important Notice: This platform only provides information display and matching services, does not guarantee transactions | Recommend using secure transaction methods such as letters of credit, third-party guarantees | Platform assumes no responsibility for transaction disputes | Please choose transaction partners carefully',
  }
  
  const currentDisclaimer = disclaimers[language as keyof typeof disclaimers] || disclaimers.en
  
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-ticker">
        <span className="text-sm font-medium text-yellow-800 px-4">{currentDisclaimer}</span>
      </div>
    </div>
  )
}
