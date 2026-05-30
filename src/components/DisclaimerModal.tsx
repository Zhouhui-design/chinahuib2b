'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { LanguageCode } from '@/lib/languages'

type DisclaimerModalProps = {
  locale?: LanguageCode
}

export default function DisclaimerModal({ locale = 'en' }: DisclaimerModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const hasSeenDisclaimer = sessionStorage.getItem('has_seen_disclaimer_session')
    if (!hasSeenDisclaimer) {
      setIsVisible(true)
    }
  }, [])
  
  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('has_seen_disclaimer_session', 'true')
  }
  
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
    es: {
      title: 'Aviso Importante',
      content: `Somos una plataforma B2B fundada por emprendedores chinos. Creemos que cada comerciante o individuo debe tener la oportunidad de mostrar su fábrica, marca y productos al mundo.

Sin embargo, por favor entienda: actualmente no podemos garantizar ningún contrato o monto de transacción, ni podemos verificar completamente la autenticidad de compradores y vendedores. Por lo tanto, esta plataforma solo se utiliza para la exhibición de información de oferta y demanda y la intermediación.

Si encuentra un socio potencial, asegúrese de utilizar métodos de transacción más seguros (como cartas de crédito, garantías de terceros, inspección presencial, etc.).

Estamos trabajando duro para construir un entorno comercial más seguro. Gracias por su confianza y precaución.

[Nota de la Plataforma] Esta plataforma tiene solo una función de pago: comerciantes que compran tarifas de stand. Las funciones de торговли entre compradores y vendedores y firma de contratos no están disponibles actualmente.`,
      button: 'Entendido'
    },
    fr: {
      title: 'Avis Important',
      content: `Nous sommes une plateforme B2B fondée par des entrepreneurs chinois. Nous croyons que chaque commerçant ou individu devrait avoir l'occasion de présenter son usine, sa marque et ses produits au monde.

Cependant, veuillez comprendre: nous ne pouvons actuellement pas garantir aucun contrat ou montant de transaction, et nous ne pouvons pas vérifier pleinement l'authenticité des acheteurs et des vendeurs. Par conséquent, cette plateforme est uniquement utilisée pour l'affichage d'informations sur l'offre et la demande et la mise en relation.

Si vous trouvez un partenaire potentiel, assurez-vous d'utiliser des méthodes de transaction plus sécurisées (telles que lettres de crédit, garanties tierces, inspection hors ligne, etc.).

Nous travaillons dur pour construire un environnement commercial plus sûr. Merci pour votre confiance et votre prudence.

[Note de la Plateforme] Cette plateforme n'a qu'une seule fonction de paiement: les commerçants achetant des frais de stand. Les fonctions de trading entre acheteurs et vendeurs et de signature de contrats ne sont actuellement pas disponibles.`,
      button: 'Je Comprends'
    },
    de: {
      title: 'Wichtiger Hinweis',
      content: `Wir sind eine B2B-Plattform, die von chinesischen Unternehmern gegründet wurde. Wir glauben, dass jeder Händler oder jede Person die Möglichkeit haben sollte, ihre Fabrik, Marke und Waren der Welt zu präsentieren.

Bitte haben Sie jedoch Verständnis dafür: Wir können derzeit keine Garantien für Verträge oder Transaktionsbeträge übernehmen und können die Echtheit von Käufern und Verkäufern nicht vollständig verifizieren. Daher wird diese Plattform nur für die Anzeige von Angebot und Nachfrage sowie für die Vermittlung verwendet.

Wenn Sie einen potenziellen Partner finden, verwenden Sie bitte unbedingt sicherere Transaktionsmethoden (wie Akkreditive, Drittgarantien, Offline-Inspektion usw.).

Wir arbeiten hart daran, eine sicherere Handelsumgebung aufzubauen. Vielen Dank für Ihr Vertrauen und Ihre Vorsicht.

[Plattform-Hinweis] Diese Plattform hat nur eine Zahlungsfunktion: Händler kaufen Booth-Gebühren. Funktionen für den Handel zwischen Käufern und Verkäufern sowie Vertragsunterzeichnungen sind derzeit nicht verfügbar.`,
      button: 'Ich Verstehe'
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
    ko: {
      title: '중요 안내',
      content: `저희는 중국 기업가들이 설립한 B2B 플랫폼입니다. 모든 상인이나 개인이 자신의 공장, 브랜드, 상품을 세계에 소개할 수 있는 기회를 가져야 한다고 믿습니다.

그러나 이해해 주세요: 현재로서는 어떠한 계약이나 거래 금액에 대한 보증을 제공할 수 없으며, 매수인과 매도인의 진정성을 완전히 확인할 수도 없습니다. 따라서 이 플랫폼은 수급 정보 표시 및 매칭 용도로만 사용됩니다.

잠재적 파트너를 찾으시면 반드시 더 안전한 거래 방법(신용장, 제3자 보증, 오프라인 검사 등)을 사용하시기 바랍니다.

저희는 더 안전한 거래 환경 구축을 위해 노력하고 있습니다. 신뢰와 신중함에 감사드립니다.

[플랫폼 참고] 이 플랫폼에는唯一的 결제 기능이 있습니다: 판매자가 부스 비용을 구매하는 것입니다. 매수인과 매도인 간의 거래 및 계약 서명 기능은 현재 사용할 수 없습니다.`,
      button: '확인'
    },
    ar: {
      title: 'إشعار هام',
      content: `نحن منصة B2B أسسها رواد أعمال صينيون. نؤمن بأن كل تاجر أو فرد يجب أن يحصل على فرصة لعرض مصنعه وعلامته التجارية وسلعه على العالم.

لكن يرجى الفهم: لا يمكننا حاليًا تقديم ضمانات لأي عقود أو مبالغ معاملات، ولا يمكننا التحقق تمامًا من أصالة المشترين والبائعين. لذلك، تُستخدم هذه المنصة فقط لعرض معلومات العرض والطلب والوساطة.

إذا وجدت شريكًا محتملاً، يرجى التأكد من استخدام طرق دفع أكثر أمانًا (مثل خطابات الاعتماد وضمانات الطرف الثالث والتفتيش غير المتصل).

نحن نعمل بجد لبناء بيئة تجارية أكثر أمانًا. شكرًا لثقتك وحذرتك.

[ملاحظة المنصة] لا تحتوي هذه المنصة إلا على وظيفة دفع واحدة: شراء التجار لرسوم الكشك. وظائف التداول بين المشترين والبائعين وتوقيع العقود غير متاحة حاليًا.`,
      button: 'أنا أفهم'
    },
    ru: {
      title: 'Важное Уведомление',
      content: `Мы — B2B платформа, основанная китайскими предпринимателями. Мы верим, что каждый торговец или частное лицо должен иметь возможность продемонстрировать свою фабрику, бренд и товары миру.

Однако, пожалуйста, понимайте: в настоящее время мы не можем предоставлять гарантии по любым контрактам или суммам транзакций, а также не можем полностью проверить подлинность покупателей и продавцов. Поэтому эта платформа используется только для отображения информации о спросе и предложении и посредничества.

Если вы найдете потенциального партнера, обязательно используйте более безопасные методы транзакций (такие как аккредитивы, гарантии третьих лиц, офлайн-проверка и т.д.).

Мы усердно работаем над созданием более безопасной торговой среды. Спасибо за ваше доверие и осторожность.

[Примечание платформы] Эта платформа имеет только одну платежную функцию: продавцы приобретают плату за стенд. Функции торговли между покупателями и продавцами и подписания контрактов в настоящее время недоступны.`,
      button: 'Я Понимаю'
    },
    pt: {
      title: 'Aviso Importante',
      content: `Somos uma plataforma B2B fundada por empreendedores chineses. Acreditamos que todo comerciante ou indivíduo deve ter a oportunidade de apresentar sua fábrica, marca e produtos ao mundo.

No entanto, por favor, entenda: atualmente não podemos fornecer garantias para quaisquer contratos ou valores de transações, nem podemos verificar totalmente a autenticidade de compradores e vendedores. Portanto, esta plataforma é usada apenas para exibição de informações de oferta e demanda e correspondência.

Se você encontrar um potencial parceiro, certifique-se de usar métodos de transação mais seguros (como cartas de crédito, garantias de terceiros, inspeção offline, etc.).

Estamos trabalhando duro para construir um ambiente comercial mais seguro. Obrigado pela sua confiança e cautela.

[Nota da Plataforma] Esta plataforma tem apenas uma função de pagamento: comerciantes comprando taxas de estande. Funções de negociação entre compradores e vendedores e assinatura de contratos não estão disponíveis atualmente.`,
      button: 'Eu Entendo'
    },
    hi: {
      title: 'महत्वपूर्ण सूचना',
      content: `हम एक B2B प्लेटफॉर्म हैं जिसकी स्थापना चीनी उद्यमियों ने की है। हम मानते हैं कि प्रत्येक व्यापारी या व्यक्ति को अपनी फैक्ट्री, ब्रांड और सामान को दुनिया के सामने प्रस्तुत करने का अवसर मिलना चाहिए।

हालांकि, कृपया समझें: हम वर्तमान में किसी भी अनुबंध या लेनदेन राशि के लिए गारंटी प्रदान नहीं कर सकते, न ही हम खरीदारों और विक्रेताओं की प्रामाणिकता को पूरी तरह से सत्यापित कर सकते हैं। इसलिए, इस प्लेटफॉर्म का उपयोग केवल आपूर्ति और मांग की जानकारी प्रदर्शित करने और मिलान के लिए किया जाता है।

यदि आपको एक संभावित भागीदार मिलता है, तो कृपया अधिक सुरक्षित लेनदेन विधियों का उपयोग करना सुनिश्चित करें (जैसे लेटर ऑफ क्रेडिट, तृतीय-पक्ष गारंटी, ऑफलाइन निरीक्षण, आदि)।

हम एक सुरक्षित व्यापारिक वातावरण बनाने के लिए कड़ी मेहनत कर रहे हैं। आपके विश्वास और सावधानी के लिए धन्यवाद।

[प्लेटफॉर्म नोट] इस प्लेटफॉर्म का केवल एक भुगतान कार्य है: व्यापारी बूथ शुल्क खरीदते हैं। खरीदारों और विक्रेताओं के बीच व्यापार और अनुबंध हस्ताक्षर कार्य वर्तमान में उपलब्ध नहीं हैं।`,
      button: 'मैं समझता/समझती हूं'
    },
    th: {
      title: 'ประกาศสำคัญ',
      content: `เราเป็นแพลตฟอร์ม B2B ที่ก่อตั้งโดยนักธุรกิจชาวจีน เราเชื่อว่าพ่อค้าหรือบุคคลทั่วไปทุกคนควรมีโอกาสแสดงโรงงาน แบรนด์ และสินค้าของตนต่อโลก

อย่างไรก็ตาม โปรดเข้าใจว่า: ในปัจจุบันเราไม่สามารถให้การรับประกันสำหรับสัญญาหรือจำนวนเงินที่ทำธุรกรรมได้ และเราก็ไม่สามารถตรวจสอบความถูกต้องของผู้ซื้อและผู้ขายได้อย่างสมบูรณ์ ดังนั้นแพลตฟอร์มนี้ใช้สำหรับการแสดงข้อมูลอุปสงค์และอุปทานและการจับคู่เท่านั้น

หากคุณพบคู่ค้าที่มีศักยภาพ โปรดตรวจสอบให้แน่ใจว่าได้ใช้วิธีการทำธุรกรรมที่ปลอดภัยกว่า (เช่น หนังสือสัญญาค้ำประกัน การรับประกันจากบุคคลที่สาม การตรวจสอบแบบออฟไลน์ ฯลฯ)

เรากำลังทำงานอย่างหนักเพื่อสร้างสภาพแวดล้อมการค้าที่ปลอดภัยยิ่งขึ้น ขอบคุณสำหรับความไว้วางใจและความระมัดระวังของคุณ

[หมายเหตุแพลตฟอร์ม] แพลตฟอร์มนี้มีฟังก์ชันการชำระเงินเพียงอย่างเดียว: ผู้ขายซื้อค่าบูธ ไม่มีฟังก์ชันการซื้อขายระหว่างผู้ซื้อและผู้ขายและการลงนามในสัญญาในขณะนี้`,
      button: 'ฉันเข้าใจ'
    },
    vi: {
      title: 'Thông Báo Quan Trọng',
      content: `Chúng tôi là một nền tảng B2B được thành lập bởi các doanh nhân Trung Quốc. Chúng tôi tin rằng mọi thương nhân hoặc cá nhân đều nên có cơ hội giới thiệu nhà máy, thương hiệu và hàng hóa của mình ra thế giới.

Tuy nhiên, xin hãy hiểu: hiện tại chúng tôi không thể cung cấp bảo đảm cho bất kỳ hợp đồng hoặc số tiền giao dịch nào, cũng như không thể xác minh đầy đủ tính xác thực của người mua và người bán. Do đó, nền tảng này chỉ được sử dụng để hiển thị thông tin cung cầu và kết nối.

Nếu bạn tìm thấy đối tác tiềm năng, hãy chắc chắn sử dụng các phương thức giao dịch an toàn hơn (như thư tín dụng, bảo lãnh của bên thứ ba, kiểm tra trực tiếp, v.v.).

Chúng tôi đang nỗ lực xây dựng một môi trường giao dịch an toàn hơn. Cảm ơn bạn đã tin tưởng và thận trọng.

[Lưu ý Nền tảng] Nền tảng này chỉ có một chức năng thanh toán: người bán mua phí gian hàng. Các chức năng giao dịch giữa người mua và người bán và ký hợp đồng hiện không khả dụng.`,
      button: 'Tôi Hiểu'
    },
  }
  
  const currentDisclaimer = disclaimers[locale as keyof typeof disclaimers] || disclaimers.en
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">{currentDisclaimer.title}</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <div className="prose prose-sm max-w-none">
            {currentDisclaimer.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
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
