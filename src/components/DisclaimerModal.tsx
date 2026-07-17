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
      title: '关于 X2XHUB',
      content: `X2XHUB.com 是由个人独立开发的全球贸易网站。最初我将它建为个人多产品商店，但主流B2B/B2C平台的高额收费和有限工具促使我将其改造成一个面向全球所有用户的免费开放市场。

无论您来自哪个国家、地区，使用何种语言或种族，所有人都可以免费、平等地发布商业信息，永久零费用。我们强烈建议利用AI来简化您的日常业务工作。

随时通过邮件向我发送建议。我会快速回复，明确说明是否会实施您的想法，或解释延迟调整的原因。

由于网站完全由一人维护，请原谅偶尔出现的不完美表现。一旦发现问题，我会迅速安排并推出修复。

重要安全提示

X2XHUB仅提供供需信息展示和匹配服务。我们无法保证交易资金或完全验证用户真实性。所有交易由交易者自行管理。与新伙伴合作时，请使用信用证、第三方担保和线下验货等安全支付方式。

本平台唯一收费的服务是展位订阅费用；目前不支持买卖双方之间的内部交易结算和电子合同签署功能。我正在持续优化平台，以提供更安全的交易环境，感谢您的信任与谨慎。`,
      button: '我知道了'
    },
    en: {
      title: 'About X2XHUB',
      content: `X2XHUB.com is a solo-developed global trading website. I originally built it as a personal multi-product store, but high charges and limited tools on mainstream B2B/B2C platforms pushed me to rebuild it into a free open marketplace for all global users.

All people, no matter your country, location, language or race, can post business information freely and equally with zero fees. We highly recommend utilizing AI to simplify your daily business work.

Send your suggestions to me via email anytime. I will respond quickly, clarifying whether I will implement your ideas or explain the reasons for delayed adjustment.

As the site is fully maintained by one person only, please pardon occasional imperfect performance. I will arrange and launch fixes rapidly once issues are found.

Key Safety Notice

X2XHUB only provides supply-demand information display and matchmaking service. We cannot guarantee transaction funds or fully verify user authenticity. All deals are self-managed by traders. Use secure payment methods like L/C, third-party guarantee and offline inspection when cooperating with new partners.

Only booth rental fees are chargeable on this platform; internal trade settlement and electronic contract signing are not available now. I keep improving the platform to deliver a safer trading environment, thank you for your trust and caution.`,
      button: 'I Understand'
    },
    es: {
      title: 'Acerca de X2XHUB',
      content: `X2XHUB.com es un sitio web de comercio global desarrollado por una sola persona. Originalmente lo construí como una tienda personal de múltiples productos, pero los altos cargos y las herramientas limitadas de las plataformas B2B/B2C principales me impulsaron a reconstruirlo como un mercado abierto gratuito para todos los usuarios globales.

Todas las personas, sin importar su país, ubicación, idioma o raza, pueden publicar información comercial de forma gratuita y equitativa con cero tarifas. Recomendamos encarecidamente utilizar la IA para simplificar su trabajo comercial diario.

Envíeme sus sugerencias por correo electrónico en cualquier momento. Responderé rápidamente, aclarando si implementaré sus ideas o explicaré las razones para el ajuste retardado.

Como el sitio es mantenido completamente por una sola persona, por favor perdone el rendimiento imperfecto ocasional. Arreglaré y lanzaré correcciones rápidamente una vez que se encuentren problemas.

Aviso de Seguridad Clave

X2XHUB solo proporciona servicio de visualización de información de oferta y demanda y intermediación. No podemos garantizar fondos de transacción ni verificar completamente la autenticidad de los usuarios. Todas las transacciones son administradas por los comerciantes. Utilice métodos de pago seguros como L/C, garantía de terceros e inspección offline al cooperar con nuevos socios.

Solo las tarifas de alquiler de stands son cargables en esta plataforma; la liquidación de comercio interno y la firma de contratos electrónicos no están disponibles actualmente. Siguiendo mejorando la plataforma para ofrecer un entorno de comercio más seguro, gracias por su confianza y precaución.`,
      button: 'Entendido'
    },
    fr: {
      title: 'À propos de X2XHUB',
      content: `X2XHUB.com est un site web de commerce mondial développé seul. J'ai initialement construit comme une boutique personnelle multi-produits, mais les frais élevés et les outils limités sur les plateformes B2B/B2C mainstream m'ont poussé à le reconstruire en un marché ouvert gratuit pour tous les utilisateurs du monde.

Toutes les personnes, peu importe votre pays, votre localisation, votre langue ou votre race, peuvent publier des informations commerciales librement et équitablement sans frais. Nous recommandons vivement d'utiliser l'IA pour simplifier votre travail commercial quotidien.

Envoyez-moi vos suggestions par e-mail à tout moment. Je répondrai rapidement, en précisant si je mettrai en œuvre vos idées ou en expliquant les raisons du retard d'ajustement.

Comme le site est entièrement maintenu par une seule personne, veuillez excuser les performances imparfaites occasionnelles. Je vais organiser et lancer des corrections rapidement une fois les problèmes trouvés.

Avis de Sécurité Clé

X2XHUB ne fournit que le service d'affichage d'informations sur l'offre et la demande et de mise en relation. Nous ne pouvons garantir les fonds de transaction ni vérifier complètement l'authenticité des utilisateurs. Toutes les transactions sont gérées par les commerçants. Utilisez des méthodes de paiement sécurisées comme L/C, garantie de tiers et inspection hors ligne lors de la coopération avec de nouveaux partenaires.

Seuls les frais de location de stands sont facturables sur cette plateforme ; le règlement commercial interne et la signature de contrats électroniques ne sont pas disponibles pour le moment. Je continue d'améliorer la plateforme pour offrir un environnement de commerce plus sûr, merci pour votre confiance et votre prudence.`,
      button: 'Je Comprends'
    },
    de: {
      title: 'Über X2XHUB',
      content: `X2XHUB.com ist eine allein entwickelte globale Handelswebsite. Ursprünglich habe ich sie als persönlichen Multi-Produkt-Shop gebaut, aber die hohen Gebühren und begrenzten Tools auf Mainstream-B2B/B2C-Plattformen haben mich dazu gebracht, sie zu einem kostenlosen offenen Marktplatz für alle globalen Nutzer umzubauen.

Alle Menschen, egal aus welchem Land, welcher Region, mit welcher Sprache oder Rasse, können Geschäftsinformationen kostenlos und gleichermaßen veröffentlichen – dauerhaft ohne Kosten. Wir empfehlen dringend, KI zu nutzen, um Ihren täglichen Geschäftsaufwand zu vereinfachen.

Senden Sie mir Ihre Vorschläge jederzeit per E-Mail zu. Ich antworte schnell, kläre ob ich Ihre Ideen umsetzen werde oder erkläre die Gründe für eine verspätete Anpassung.

Da die Website vollständig von einer einzigen Person gewartet wird, bitten wir um Verständnis für gelegentliche unperfekte Leistung. Sobald Probleme gefunden werden, werde ich schnell Korrekturen organisieren und veröffentlichen.

Wichtiger Sicherheits-Hinweis

X2XHUB bietet nur Anzeige von Angebots- und Nachfrageinformationen sowie Vermittlungsdienstleistungen. Wir können keine Transaktionsgelder garantieren oder die Authentizität der Nutzer vollständig überprüfen. Alle Deals werden von den Händlern selbst verwaltet. Verwenden Sie sichere Zahlungsmethoden wie L/C, Drittpartei-Garantie und Offline-Inspektion bei der Zusammenarbeit mit neuen Partnern.

Nur Mietgebühren für Booths sind auf dieser Plattform gebührenpflichtig; interne Handelsabrechnung und elektronische Vertragsunterzeichnung sind derzeit nicht verfügbar. Ich verbessere die Plattform stetig, um ein sichereres Handelsumfeld zu schaffen – vielen Dank für Ihr Vertrauen und Ihre Vorsicht.`,
      button: 'Ich Verstehe'
    },
    ja: {
      title: 'X2XHUB について',
      content: `X2XHUB.com は個人開発のグローバル貿易ウェブサイトです。元々は個人のマルチプロダクトストアとして構築しましたが、主流のB2B/B2Cプラットフォームの高額料金と限られたツールにより、グローバルユーザー全員が利用可能な無料オープンマーケットに再構築することにしました。

国籍、地域、言語、人種に関係なく、すべての人が無料かつ平等にビジネス情報を掲載できます。日常業務を簡素化するためにAIの活用を強くお勧めします。

いつでもメールでご提案をお寄せください。素早く対応し、ご提案の実施可否や調整遅延の理由を明確にお答えします。

サイトは一人で完全に運営しておりますので、時々不完全なパフォーマンスになることがありますのでご容赦ください。問題が見つかり次第、迅速に修正を手配しリリースいたします。

重要な安全注意事項

X2XHUBは需給情報の表示とマッチングサービスのみを提供します。取引資金の保証やユーザーの真実性の完全な検証はできません。すべての取引はトレーダーが自ら管理します。新しいパートナーとの協力時には、L/C、第三者保証、オフライン検査などの安全な支払い方法を使用してください。

本プラットフォームで有料となるのはブースレンタル料金のみです。内部取引決済と電子契約締結は現在利用できません。より安全な取引環境を提供するためプラットフォームを継続的に改善しております。ご信任と慎重さに感謝いたします。`,
      button: '了解しました'
    },
    ko: {
      title: 'X2XHUB 소개',
      content: `X2XHUB.com은 개인이 독자적으로 개발한 글로벌 무역 웹사이트입니다. 처음에는 개인용 멀티제품 스토어로 만들었지만, 주류 B2B/B2C 플랫폼의 높은 수수료와 제한적인 도구 때문에 모든 글로벌 사용자를 위한 무료 오픈 마켓으로 재건했습니다.

국가, 지역, 언어, 인종에 관계없이 모든 사람이 무료로 평등하게 비즈니스 정보를 게시할 수 있습니다. 일상적인 비즈니스 작업을 단순화하기 위해 AI 활용을 강력히 추천합니다.

언제든지 이메일로 제안을 보내주세요. 빠르게 답변하여 아이디어를 구현할지 여부나 지연 조정의 이유를 명확히 설명하겠습니다.

사이트가 단 한 사람이 완전히 유지 관리하기 때문에 가끔 완벽하지 않은 성능이 발생할 수 있으니 양해해 주세요. 문제가 발견되면 빠르게 수정을 준비하고 출시하겠습니다.

주요 안전 유의사항

X2XHUB는 공급-수요 정보 표시 및 매칭 서비스만 제공합니다. 거래 자금을 보장하거나 사용자의 진위를 완전히 확인할 수 없습니다. 모든 거래는 거래자가 직접 관리합니다. 새로운 파트너와 협력할 때 L/C, 제3자 보증, 오프라인 검사와 같은 안전한 지불 방법을 사용하세요.

이 플랫폼에서는 부스 대여 비용만 유료입니다. 내부 거래 정산 및 전자 계약 서명은 현재 사용할 수 없습니다. 더 안전한 거래 환경을 제공하기 위해 플랫폼을 지속적으로 개선하고 있습니다. 신뢰와 주의에 감사드립니다.`,
      button: '확인'
    },
    ar: {
      title: 'حول X2XHUB',
      content: `X2XHUB.com هو موقع تجاري عالمي مطور من قبل شخص واحد. لقد بنيت أولاً كمتجر شخصي متعدد المنتجات، ولكن الرسوم المرتفعة والأدوات المحدودة على منصات B2B/B2C السائدة دفعتني لإعادة بناءه كسوق مفتوح مجاني لجميع المستخدمين العالميين.

جميع الأشخاص، بغض النظر عن دولتك وموقعك ولغتك أو عرقك، يمكنهم نشر المعلومات التجارية بشكل حر ومتساوي مع صفر رسوم. نوصي بشدة باستخدام الذكاء الاصطناعي لتبسيط عملك التجاري اليومي.

أرسل اقتراحاتك لي عبر البريد الإلكتروني في أي وقت. سأجيب بسرعة، موضحاً ما إذا كنت سأقوم بتنفيذ أفكارك أو أشرح الأسباب التي أدت إلى تأخير التعديل.

نظرًا لأن الموقع يُدير بواسطة شخص واحد فقط، رجاءً اسامح الأداء غير المثالي أحيانًا. سأقوم بتنظيم وإطلاق الإصلاحات بسرعة بمجرد العثور على المشكلات.

ملاحظة أمنية أساسية

X2XHUB توفر فقط عرض معلومات العرض والطلب وخدمة التوظيف. لا يمكننا ضمان أموال المعاملة أو التحقق من صحة المستخدمين بالكامل. جميع الصفقات تُدار من قبل التجار. استخدم طرق الدفع الآمنة مثل L/C، الضمان من طرف ثالث والفحص دون اتصال عند التعاون مع شركاء جدد.

فقط رسوم استئجار الكشك قابلة للتحصيل على هذه المنصة. تسوية التجارة الداخلية وتوقيع العقود الإلكترونية غير متوفرة حالياً. أستمر في تحسين المنصة لتقديم بيئة تجارية أكثر أماناً، شكراً لثقتك وحذرتك.`,
      button: 'أنا أفهم'
    },
    ru: {
      title: 'О X2XHUB',
      content: `X2XHUB.com — это глобальный торговый сайт, разработанный одним человеком. Первоначально я строил его как личный многопродуктовый магазин, но высокие сборы и ограниченные инструменты на основных B2B/B2C-платформах побудили меня реконструировать его в бесплатный открытый маркетплейс для всех глобальных пользователей.

Все люди, независимо от страны, местоположения, языка или расы, могут свободно и равноправно публиковать бизнес-информацию без комиссий. Мы настоятельно рекомендуем использовать ИИ для упрощения повседневной бизнес-работы.

Отправляйте свои предложения мне по электронной почте в любое время. Я отвечу быстро, уточнив, реализую ли я ваши идеи или объяснив причины задержки корректировки.

Поскольку сайт полностью поддерживается одним человеком, просьба простить несовершенную работу время от времени. Как только проблемы будут обнаружены, я быстро организую и выпущу исправления.

Важное Замечание о Безопасности

X2XHUB предоставляет только отображение информации о спросе и предложении и услугу по подбору партнеров. Мы не можем гарантировать транзакционные средства или полностью проверить подлинность пользователей. Все сделки управляются торговцами самостоятельно. Используйте безопасные способы оплаты, такие как L/C, гарантия третьей стороны и офлайн-инспекция при сотрудничестве с новыми партнерами.

На этой платформе взимается плата только за аренду стендов; внутренняя торговая расчётная и электронная подпись контрактов сейчас недоступны. Я продолжаю улучшать платформу, чтобы обеспечить более безопасную торговую среду, спасибо за ваше доверие и осторожность.`,
      button: 'Я Понимаю'
    },
    pt: {
      title: 'Sobre X2XHUB',
      content: `X2XHUB.com é um site de comércio global desenvolvido por uma única pessoa. Originalmente eu o construí como uma loja pessoal de múltiplos produtos, mas os altos custos e as ferramentas limitadas nas plataformas B2B/B2C principais me levaram a reconstruí-lo como um mercado aberto gratuito para todos os usuários globais.

Todas as pessoas, independentemente do país, localização, língua ou raça, podem publicar informações comerciais livre e igualmente com zero custos. Recomendamos fortemente utilizar a IA para simplificar o seu trabalho comercial diário.

Envie suas sugestões para mim por e-mail a qualquer momento. Responderei rapidamente, esclarecendo se vou implementar suas ideias ou explicando as razões para o adiamento do ajuste.

Como o site é totalmente mantido por uma única pessoa, por favor perdoe o desempenho imperfeito ocasional. Vou organizar e lançar correções rapidamente assim que os problemas forem encontrados.

Aviso de Segurança Chave

O X2XHUB só fornece serviço de exibição de informações de oferta e demanda e casamento. Não podemos garantir fundos de transação ou verificar totalmente a autenticidade do usuário. Todas as negociações são gerenciadas pelos traders. Use métodos de pagamento seguros como L/C, garantia de terceiros e inspeção offline ao cooperar com novos parceiros.

Apenas as taxas de aluguel de estandes são cobradas nesta plataforma; o acerto de comércio interno e a assinatura eletrônica de contratos não estão disponíveis agora. Continuo melhorando a plataforma para entregar um ambiente de comércio mais seguro, obrigado pela sua confiança e cautela.`,
      button: 'Eu Entendo'
    },
    hi: {
      title: 'X2XHUB के बारे में',
      content: `X2XHUB.com एक अकेले व्यक्ति द्वारा विकसित वैश्विक व्यापारिक वेबसाइट है। मैंने इसे मूल रूप से व्यक्तिगत मल्टी-प्रोडक्ट स्टोर के रूप में बनाया था, लेकिन मुख्यधारा के B2B/B2C प्लेटफार्मों पर उच्च शुल्क और सीमित टूल्स ने मुझे इसे सभी वैश्विक उपयोगकर्ताओं के लिए एक मुफ्त खुले बाजार में पुनर्निर्माण करने के लिए प्रोत्साहित किया।

सभी लोग, चाहे आपका देश, स्थान, भाषा या जाति कुछ भी हो, शून्य शुल्क के साथ स्वतंत्र रूप से और समान रूप से व्यापारिक जानकारी पोस्ट कर सकते हैं। हम आपके दैनिक व्यापार कार्य को सरल बनाने के लिए AI का उपयोग करने की अत्यधिक अनुशंसा करते हैं।

किसी भी समय मुझे ईमेल के माध्यम से अपने सुझाव भेजें। मैं तेजी से प्रतिक्रिया दूंगा, स्पष्ट करते हुए कि क्या मैं आपके विचारों को लागू करूंगा या विलंबित समायोजन के कारणों की व्याख्या करूंगा।

चूंकि साइट को पूरी तरह से केवल एक व्यक्ति द्वारा बनाए रखा जाता है, कृपया कभी-कभी अपूर्ण प्रदर्शन को क्षमा करें। एक बार जब समस्याएं पाई जाती हैं, तो मैं तेजी से मरम्मत की व्यवस्था करूंगा और लॉन्च करूंगा।

प्रमुख सुरक्षा सूचना

X2XHUB केवल आपूर्ति-मांग की जानकारी प्रदर्शन और मैचमेकिंग सेवा प्रदान करता है। हम लेनदेन के फंड की गारंटी नहीं दे सकते या उपयोगकर्ता की प्रामाणिकता को पूरी तरह से सत्यापित नहीं कर सकते। सभी सौदे ट्रेडर्स द्वारा स्वयं प्रबंधित किए जाते हैं। नए भागीदारों के साथ सहयोग करते समय L/C, तृतीय-पक्ष गारंटी और ऑफलाइन निरीक्षण जैसे सुरक्षित भुगतान विधियों का उपयोग करें।

इस प्लेटफॉर्म पर केवल बूथ किराए की शुल्क वसूली योग्य हैं; आंतरिक व्यापार निपटान और इलेक्ट्रॉनिक अनुबंध हस्ताक्षर अब उपलब्ध नहीं हैं। मैं एक सुरक्षित व्यापारिक वातावरण प्रदान करने के लिए प्लेटफॉर्म में लगातार सुधार कर रहा हूं, आपके विश्वास और सावधानी के लिए धन्यवाद।`,
      button: 'मैं समझता/समझती हूं'
    },
    th: {
      title: 'เกี่ยวกับ X2XHUB',
      content: `X2XHUB.com เป็นเว็บไซต์การค้ากลางโลกที่พัฒนาโดยคนเดียว ฉันสร้างเป็นร้านค้าผลิตภัณฑ์หลายชนิดส่วนตัวแต่ค่าใช้จ่ายสูงและเครื่องมือจำกัดบนแพลตฟอร์ม B2B/B2C หลักได้ผลักดันฉันให้สร้างเป็นตลาดเปิดฟรีสำหรับผู้ใช้ทั่วโลกทุกคน

ทุกคน ไม่ว่าประเทศ สถานที่ ภาษาหรือเผ่าพันธุ์ใดๆ ก็สามารถโพสต์ข้อมูลธุรกิจได้อย่างอิสระและเท่าเทียมกันโดยไม่มีค่าใช้จ่าย เราขอแนะนำให้ใช้ AI เพื่อทำให้งานธุรกิจประจำวันง่ายขึ้น

ส่งข้อเสนอแนะของคุณให้ฉันทางอีเมล์ตลอดเวลา ฉันจะตอบกลับเร็วๆ โดยระบุว่าจะดำเนินการไอเดียของคุณหรืออธิบายเหตุผลที่การปรับปรุงล่าช้า

เนื่องจากเว็บไซต์นี้ดูแลด้วยคนเดียว ครับ ขออภัยสำหรับประสิทธิภาพที่ไม่สมบูรณ์บางครั้ง ฉันจะจัดการและเปิดตัวการแก้ไขทันทีที่พบปัญหา

คำเตือนด้านความปลอดภัยสำคัญ

X2XHUB ให้บริการแสดงข้อมูลอุปสงค์-อุปทานและการจับคู่เท่านั้น เราไม่สามารถรับประกันเงินธุรกรรมหรือตรวจสอบความเป็นจริงของผู้ใช้ได้อย่างสมบูรณ์ ทุกข้อเสนอขายจะจัดการโดยตัวเองของพ่อค้า ใช้วิธีการชำระเงินที่ปลอดภัยเช่น L/C, การรับประกันจากบุคคลที่สาม และการตรวจสอบออฟไลน์เมื่อทำธุรกรรมกับพันธมิตรใหม่

ค่าบูธเท่านั้นที่ชำระเงินได้บนแพลตฟอร์มนี้ การปิดบัญชีธุรกรรมภายในและการลงนามสัญญาอิเล็กทรอนิกส์ยังไม่พร้อมใช้งาน ฉันยังคงปรับปรุงแพลตฟอร์มเพื่อให้ได้สภาพแวดล้อมการค้าที่ปลอดภัยขึ้น ขอบคุณสำหรับความไว้วางใจและความระมัดระวังของคุณ`,
      button: 'ฉันเข้าใจ'
    },
    vi: {
      title: 'Về X2XHUB',
      content: `X2XHUB.com là một trang web thương mại toàn cầu do một người duy nhất phát triển. Ban đầu tôi đã xây dựng nó như một cửa hàng đa sản phẩm cá nhân, nhưng chi phí cao và công cụ hạn chế trên các nền tảng B2B/B2C chính thống đã thúc đẩy tôi tái tạo nó thành một thị trường mở miễn phí cho tất cả người dùng trên toàn cầu.

Tất cả mọi người, bất kể quốc gia, địa điểm, ngôn ngữ hoặc chủng tộc của bạn, đều có thể đăng tin doanh nghiệp một cách tự do và bình đẳng với chi phí không. Chúng tôi rất khuyến khích sử dụng AI để đơn giản hóa công việc kinh doanh hàng ngày của bạn.

Gửi gợi ý của bạn cho tôi qua email bất cứ lúc nào. Tôi sẽ phản hồi nhanh chóng, làm rõ liệu tôi sẽ thực hiện ý tưởng của bạn hay giải thích lý do điều chỉnh bị chậm trễ.

Vì trang web được duy trì hoàn toàn bởi một người duy nhất, vui lòng tha thứ cho hiệu suất không hoàn hảo đôi khi. Tôi sẽ sắp xếp và phát hành bản sửa lỗi nhanh chóng ngay sau khi phát hiện vấn đề.

Thông báo An toàn Chính

X2XHUB chỉ cung cấp dịch vụ hiển thị thông tin cung cầu và kết nối. Chúng tôi không thể đảm bảo quỹ giao dịch hoặc xác minh toàn bộ tính xác thực của người dùng. Tất cả các hợp đồng đều do các nhà giao dịch tự quản lý. Sử dụng phương thức thanh toán an toàn như L/C, bảo lãnh bên thứ ba và kiểm tra ngoại tuyến khi hợp tác với đối tác mới.

Chỉ phí thuê gian hàng mới được tính phí trên nền tảng này; thanh toán thương mại nội bộ và ký hợp đồng điện tử hiện không có sẵn. Tôi tiếp tục cải thiện nền tảng để cung cấp môi trường thương mại an toàn hơn, cảm ơn sự tin tưởng và thận trọng của bạn.`,
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