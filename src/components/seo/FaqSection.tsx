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
 * All 13 supported languages are covered.
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
  de: [
    {
      question: 'Was ist SeaHeart Global?',
      answer:
        'SeaHeart Global (x2xhub.com) ist eine dauerhaft geöffnete B2B-Online-Handelsmesse. Geprüfte Hersteller und Handelsunternehmen betreiben digitale Messestände, auf denen Großhandelseinkäufer Produktkataloge durchsuchen, Unternehmensprofile und Zertifikate prüfen und Lieferanten direkt per Chat oder Anfrage kontaktieren. Die Oberfläche funktioniert in 13 Sprachen, und das Durchsuchen von Messen und Produkten ist kostenlos.',
    },
    {
      question: 'Wie finde ich geprüfte Lieferanten auf SeaHeart Global?',
      answer:
        'Öffnen Sie den Bereich Messen unter x2xhub.com/exhibitions, um alle aktiven Stände zu durchsuchen, oder suchen Sie Produkte nach Stichwort und Kategorie. Jeder Stand zeigt das Unternehmensprofil, die Zertifikate und Verifizierungsdokumente des Lieferanten, bevor Sie Kontakt aufnehmen. Nutzen Sie bei einem Treffer die Anfrage- oder Chat-Schaltflächen auf der Standseite, um direkt mit dem Lieferanten zu sprechen – es gibt keinen Zwischenhändler.',
    },
    {
      question: 'Was ist eine Online-B2B-Messe und wie funktioniert sie?',
      answer:
        'Eine Online-B2B-Messe ist eine virtuelle Handelsmesse, die rund um die Uhr geöffnet bleibt. Statt zu einer physischen Messe zu reisen, richten Lieferanten digitale Stände mit ihrem Produktsortiment, ihrer Unternehmensvorstellung, Zertifikaten und Kontaktdaten ein. Einkäufer besuchen Stände jederzeit, vergleichen Lieferanten nebeneinander und beginnen sofort Gespräche. SeaHeart Global bündelt diese Stände in einer Halle unter x2xhub.com.',
    },
    {
      question: 'Ist SeaHeart Global für Einkäufer kostenlos?',
      answer:
        'Das Durchsuchen von Messeständen, Produktkatalogen und Lieferantenprofilen auf SeaHeart Global ist kostenlos, ohne kostenpflichtige Sourcing-Mitgliedschaft. Um Nachrichten oder Anfragen an Lieferanten zu senden, registrieren Sie ein kostenloses Einkäuferkonto. Für Bestellungen, die Schutz erfordern, helfen die Trade-Assurance-Funktionen der Plattform, die Transaktion abzusichern.',
    },
    {
      question: 'Welche Sprachen unterstützt x2xhub.com?',
      answer:
        'Die Plattformoberfläche ist in 13 Sprachen verfügbar: Englisch, vereinfachtes Chinesisch, Deutsch, Spanisch, Französisch, Japanisch, Koreanisch, Arabisch, Russisch, Portugiesisch, Hindi, Thailändisch und Vietnamesisch. Produkt- und Standinhalte werden in der Originalsprache des Lieferanten angezeigt; Einkäufer und Lieferanten kommunizieren über den integrierten Chat der Plattform.',
    },
    {
      question: 'Wie können Hersteller auf SeaHeart Global ausstellen?',
      answer:
        'Registrieren Sie ein Verkäuferkonto, vervollständigen Sie das Unternehmensprofil mit Gewerbeschein und Zertifikaten zur Verifizierung, erstellen Sie dann Ihren Messestand und laden Sie Produkte mit Bildern, Spezifikationen, Mindestbestellmenge und OEM-Informationen hoch. Nach der Veröffentlichung erscheint der Stand in der Messehalle und wird von Suchmaschinen und KI-Crawlern in allen 13 Sprachversionen indexiert.',
    },
  ],
  es: [
    {
      question: '¿Qué es SeaHeart Global?',
      answer:
        'SeaHeart Global (x2xhub.com) es una plataforma de exposiciones comerciales B2B en línea siempre abierta. Fabricantes y empresas comerciales verificadas gestionan stands digitales donde los compradores mayoristas exploran catálogos de productos, revisan perfiles de empresa y certificaciones, y contactan a los proveedores directamente mediante chat o consultas. La interfaz funciona en 13 idiomas y navegar por las exposiciones y los productos es gratuito.',
    },
    {
      question: '¿Cómo encuentro proveedores verificados en SeaHeart Global?',
      answer:
        'Abra la sección de Exposiciones en x2xhub.com/exhibitions para explorar todos los stands activos, o busque Productos por palabra clave y categoría. Cada stand muestra el perfil de la empresa, las certificaciones y los documentos de verificación del proveedor antes de que se ponga en contacto. Al encontrar una coincidencia, utilice los botones de consulta o chat en la página del stand para hablar directamente con el proveedor, sin intermediarios.',
    },
    {
      question: '¿Qué es una exposición B2B en línea y cómo funciona?',
      answer:
        'Una exposición B2B en línea es una feria comercial virtual que permanece abierta 24/7. En lugar de viajar a una feria física, los proveedores crean stands digitales con su gama de productos, presentación de la empresa, certificados y datos de contacto. Los compradores visitan los stands en cualquier momento, comparan proveedores lado a lado e inician conversaciones al instante. SeaHeart Global aloja estos stands en una sola sala en x2xhub.com.',
    },
    {
      question: '¿Es gratuito SeaHeart Global para los compradores?',
      answer:
        'Navegar por los stands de exposición, los catálogos de productos y los perfiles de proveedores en SeaHeart Global es gratuito, sin membresía de abastecimiento de pago. Para enviar mensajes o consultas a los proveedores, registre una cuenta de comprador gratuita. Para los pedidos que requieren protección, las funciones de garantía comercial de la plataforma ayudan a asegurar la transacción.',
    },
    {
      question: '¿Qué idiomas admite x2xhub.com?',
      answer:
        'La interfaz de la plataforma está disponible en 13 idiomas: inglés, chino simplificado, alemán, español, francés, japonés, coreano, árabe, ruso, portugués, hindi, tailandés y vietnamita. El contenido de productos y stands se muestra en el idioma original del proveedor, y compradores y proveedores se comunican a través del chat integrado de la plataforma.',
    },
    {
      question: '¿Cómo pueden exponer los fabricantes en SeaHeart Global?',
      answer:
        'Regístrese con una cuenta de vendedor, complete el perfil de la empresa con la licencia comercial y las certificaciones para su verificación, cree después su stand de exposición y suba productos con imágenes, especificaciones, cantidad mínima de pedido e información de OEM. Una vez publicado, el stand aparece en la sala de exposiciones y es indexado por buscadores y rastreadores de IA en las 13 versiones de idiomas.',
    },
  ],
  fr: [
    {
      question: 'Qu’est-ce que SeaHeart Global ?',
      answer:
        'SeaHeart Global (x2xhub.com) est une plateforme d’exposition commerciale B2B en ligne ouverte en permanence. Des fabricants et des sociétés de négoce vérifiés animent des stands numériques où les acheteurs en gros parcourent les catalogues de produits, consultent les profils d’entreprise et les certifications, et contactent les fournisseurs directement par chat ou demande de renseignements. L’interface fonctionne en 13 langues, et la consultation des expositions et des produits est gratuite.',
    },
    {
      question: 'Comment trouver des fournisseurs vérifiés sur SeaHeart Global ?',
      answer:
        'Ouvrez la section Expositions sur x2xhub.com/exhibitions pour parcourir tous les stands actifs, ou recherchez des Produits par mot-clé et catégorie. Chaque stand affiche le profil de l’entreprise, les certifications et les documents de vérification du fournisseur avant que vous ne le contactiez. Lorsque vous trouvez une correspondance, utilisez les boutons demande de renseignements ou chat sur la page du stand pour parler directement au fournisseur, sans intermédiaire.',
    },
    {
      question: 'Qu’est-ce qu’une exposition B2B en ligne et comment fonctionne-t-elle ?',
      answer:
        'Une exposition B2B en ligne est un salon professionnel virtuel qui reste ouvert 24h/24 et 7j/7. Au lieu de se rendre dans un salon physique, les fournisseurs créent des stands numériques avec leur gamme de produits, leur présentation d’entreprise, leurs certificats et leurs coordonnées. Les acheteurs visitent les stands à tout moment, comparent les fournisseurs côte à côte et engagent la conversation immédiatement. SeaHeart Global héberge ces stands dans un seul hall sur x2xhub.com.',
    },
    {
      question: 'SeaHeart Global est-il gratuit pour les acheteurs ?',
      answer:
        'La consultation des stands d’exposition, des catalogues de produits et des profils de fournisseurs sur SeaHeart Global est gratuite, sans abonnement d’approvisionnement payant. Pour envoyer des messages ou des demandes aux fournisseurs, créez un compte acheteur gratuit. Pour les commandes nécessitant une protection, les fonctions d’assurance commerciale de la plateforme contribuent à sécuriser la transaction.',
    },
    {
      question: 'Quelles langues x2xhub.com prend-il en charge ?',
      answer:
        'L’interface de la plateforme est disponible en 13 langues : anglais, chinois simplifié, allemand, espagnol, français, japonais, coréen, arabe, russe, portugais, hindi, thaï et vietnamien. Le contenu des produits et des stands s’affiche dans la langue d’origine du fournisseur, et les acheteurs comme les fournisseurs communiquent via le chat intégré de la plateforme.',
    },
    {
      question: 'Comment les fabricants peuvent-ils exposer sur SeaHeart Global ?',
      answer:
        'Créez un compte vendeur, complétez le profil d’entreprise avec la licence commerciale et les certifications pour vérification, créez ensuite votre stand d’exposition et téléchargez vos produits avec images, spécifications, quantité minimale de commande et informations OEM. Une fois publié, le stand apparaît dans le hall d’exposition et est indexé par les moteurs de recherche et les robots d’IA dans les 13 versions linguistiques.',
    },
  ],
  ja: [
    {
      question: 'SeaHeart Globalとは何ですか？',
      answer:
        'SeaHeart Global（x2xhub.com）は、常時オンラインの B2B オンライン貿易展示会プラットフォームです。認証済みのメーカーや商社がデジタルブースを運営し、卸売バイヤーは製品カタログの閲覧、会社概要や認証書類の確認、チャットや引き合いによるサプライヤーへの直接連絡ができます。画面は 13 言語に対応し、展示会と製品の閲覧は無料です。',
    },
    {
      question: 'SeaHeart Globalで認証済みサプライヤーを探すには？',
      answer:
        'x2xhub.com/exhibitions の展示会セクションで開催中のすべてのブースを閲覧するか、製品をキーワードやカテゴリで検索します。各ブースには、連絡前にサプライヤーの会社概要、認証、検証書類が表示されます。条件に合う相手が見つかったら、ブースページの引き合いまたはチャットボタンから、仲介者なしで直接サプライヤーと話せます。',
    },
    {
      question: 'オンラインB2B展示会とは何ですか？どのように機能しますか？',
      answer:
        'オンライン B2B 展示会は、24 時間年中無休で開かれるバーチャル見本市です。サプライヤーは物理的な見本市へ出張する代わりに、製品ライン、会社紹介、証明書、連絡先を備えたデジタルブースを設営します。バイヤーはいつでもブースを訪問し、サプライヤーを並べて比較し、その場で商談を始められます。SeaHeart Global はこれらのブースを x2xhub.com の 1 つのホールにまとめて開催しています。',
    },
    {
      question: 'SeaHeart Globalはバイヤーにとって無料ですか？',
      answer:
        'SeaHeart Global でブース、製品カタログ、サプライヤー概要を閲覧するのは無料で、有料の調達会員制度はありません。サプライヤーへメッセージや引き合いを送るには、無料のバイヤーアカウント登録が必要です。保護が必要な注文には、プラットフォームの貿易保証機能が取引の安全確保を支援します。',
    },
    {
      question: 'x2xhub.comは何語に対応していますか？',
      answer:
        'プラットフォーム画面は 13 言語に対応しています：英語、簡体字中国語、ドイツ語、スペイン語、フランス語、日本語、韓国語、アラビア語、ロシア語、ポルトガル語、ヒンディー語、タイ語、ベトナム語。製品とブースの内容はサプライヤーの原文で表示され、バイヤーとサプライヤーはプラットフォーム内蔵チャットでやり取りします。',
    },
    {
      question: 'メーカーがSeaHeart Globalに出展するには？',
      answer:
        'セラーアカウントを登録し、営業許可証と認証書類を添えて会社概要を完成させて審査を受け、その後に展示ブースを作成して、画像、仕様、最小発注数量（MOQ）、OEM 情報を含む製品をアップロードします。公開されたブースは展示ホールに表示され、13 言語版すべてで検索エンジンと AI クローラーにインデックスされます。',
    },
  ],
  ko: [
    {
      question: 'SeaHeart Global이란 무엇인가요?',
      answer:
        'SeaHeart Global(x2xhub.com)은 24시간 열려 있는 B2B 온라인 무역 전시 플랫폼입니다. 인증된 제조업체와 무역 회사가 디지털 부스를 운영하고, 도매 바이어는 제품 카탈로그를 둘러보고 회사 프로필과 인증서를 확인한 뒤 채팅이나 문의를 통해 공급업체에 직접 연락할 수 있습니다. 인터페이스는 13개 언어로 제공되며, 전시회와 제품 탐색은 무료입니다.',
    },
    {
      question: 'SeaHeart Global에서 인증된 공급업체를 찾으려면 어떻게 해야 하나요?',
      answer:
        'x2xhub.com/exhibitions의 전시회 섹션에서 운영 중인 모든 부스를 둘러보거나 제품을 키워드와 카테고리로 검색하세요. 각 부스에는 연락 전에 공급업체의 회사 프로필, 인증서, 검증 문서가 표시됩니다. 맞는 업체를 찾으면 부스 페이지의 문의 또는 채팅 버튼으로 중개자 없이 공급업체와 바로 대화할 수 있습니다.',
    },
    {
      question: '온라인 B2B 전시회란 무엇이고 어떻게 작동하나요?',
      answer:
        '온라인 B2B 전시회는 연중무휴 24시간 열리는 가상 무역 박람회입니다. 공급업체는 오프라인 박람회에 출장하는 대신 제품군, 회사 소개, 인증서, 연락처가 담긴 디지털 부스를 설치합니다. 바이어는 언제든 부스를 방문해 공급업체를 나란히 비교하고 즉시 대화를 시작할 수 있습니다. SeaHeart Global은 이 부스들을 x2xhub.com의 하나의 전시장에 모아 제공합니다.',
    },
    {
      question: 'SeaHeart Global은 바이어에게 무료인가요?',
      answer:
        'SeaHeart Global에서 전시 부스, 제품 카탈로그, 공급업체 프로필을 보는 것은 무료이며 유료 소싱 멤버십이 없습니다. 공급업체에 메시지나 문의를 보내려면 무료 바이어 계정을 등록하면 됩니다. 보호가 필요한 주문에는 플랫폼의 무역 안전 보장 기능이 거래를 안전하게 보호하는 데 도움을 줍니다.',
    },
    {
      question: 'x2xhub.com은 어떤 언어를 지원하나요?',
      answer:
        '플랫폼 인터페이스는 영어, 간체 중국어, 독일어, 스페인어, 프랑스어, 일본어, 한국어, 아랍어, 러시아어, 포르투갈어, 힌디어, 태국어, 베트남어 등 13개 언어로 제공됩니다. 제품과 부스 콘텐츠는 공급업체의 원문으로 표시되며, 바이어와 공급업체는 플랫폼에 내장된 채팅으로 소통합니다.',
    },
    {
      question: '제조업체가 SeaHeart Global에 전시하려면 어떻게 해야 하나요?',
      answer:
        '판매자 계정을 등록하고 사업자등록증과 인증서로 회사 프로필을 완성해 검증을 받은 뒤, 전시 부스를 만들고 이미지, 사양, 최소주문수량(MOQ), OEM 정보가 포함된 제품을 업로드하세요. 게시된 부스는 전시장에 표시되고 13개 언어 버전 전체에서 검색엔진과 AI 크롤러에 색인됩니다.',
    },
  ],
  ar: [
    {
      question: 'ما هي منصة SeaHeart Global؟',
      answer:
        'تُعدّ SeaHeart Global (x2xhub.com) منصة معارض تجارية إلكترونية بنظام B2B مفتوحة على مدار الساعة. يدير مصنّعون وشركات تجارية موثّقة أجنحة رقمية يتصفح من خلالها مشترو الجملة كتالوجات المنتجات، ويطّلعون على ملفات الشركات والشهادات، ويتواصلون مع المورّدين مباشرة عبر الدردشة أو الاستفسارات. تعمل الواجهة بـ 13 لغة، وتصفّح المعارض والمنتجات مجاني.',
    },
    {
      question: 'كيف أجد مورّدين موثّقين على SeaHeart Global؟',
      answer:
        'افتح قسم المعارض على x2xhub.com/exhibitions لتصفّح جميع الأجنحة النشطة، أو ابحث في المنتجات حسب الكلمة المفتاحية والفئة. يعرض كل جناح ملف الشركة والشهادات ووثائق التحقق الخاصة بالمورّد قبل التواصل. وعند العثور على تطابق، استخدم زرّي الاستفسار أو الدردشة في صفحة الجناح للتحدث إلى المورّد مباشرة دون وسيط.',
    },
    {
      question: 'ما هو معرض B2B الإلكتروني وكيف يعمل؟',
      answer:
        'معرض B2B الإلكتروني هو معرض تجاري افتراضي يظل مفتوحًا على مدار الساعة طوال أيام الأسبوع. فبدلًا من السفر إلى معرض فعلي، ينشئ المورّدون أجنحة رقمية تتضمن مجموعة منتجاتهم وتعريف الشركة والشهادات وبيانات التواصل. ويزور المشترون الأجنحة في أي وقت ويقارنون المورّدين جنبًا إلى جنب ويبدؤون المحادثات فورًا. وتستضيف SeaHeart Global هذه الأجنحة في قاعة واحدة على x2xhub.com.',
    },
    {
      question: 'هل SeaHeart Global مجاني للمشترين؟',
      answer:
        'تصفّح أجنحة المعارض وكتالوجات المنتجات وملفات المورّدين على SeaHeart Global مجاني تمامًا، دون عضوية توريد مدفوعة. ولإرسال الرسائل أو الاستفسارات إلى المورّدين، سجّل حساب مشترٍ مجاني. وبالنسبة للطلبات التي تحتاج إلى حماية، تساعد ميزات ضمان التجارة في المنصة على تأمين الصفقة.',
    },
    {
      question: 'ما اللغات التي يدعمها x2xhub.com؟',
      answer:
        'تتوفر واجهة المنصة بـ 13 لغة: الإنجليزية والصينية المبسطة والألمانية والإسبانية والفرنسية واليابانية والكورية والعربية والروسية والبرتغالية والهندية والتايلاندية والفيتنامية. يُعرض محتوى المنتجات والأجنحة باللغة الأصلية للمورّد، ويتواصل المشترون والمورّدون عبر الدردشة المدمجة في المنصة.',
    },
    {
      question: 'كيف يمكن للمصنّعين المشاركة في SeaHeart Global؟',
      answer:
        'سجّل حساب بائع، وأكمل ملف الشركة مع الرخصة التجارية والشهادات للتحقق، ثم أنشئ جناح المعرض الخاص بك وارفع المنتجات مع الصور والمواصفات وحد أدنى للطلب ومعلومات OEM. وبعد النشر، يظهر الجناح في قاعة المعرض ويُفهرس في محركات البحث وأدوات زحف الذكاء الاصطناعي عبر جميع الإصدارات اللغوية الـ 13.',
    },
  ],
  ru: [
    {
      question: 'Что такое SeaHeart Global?',
      answer:
        'SeaHeart Global (x2xhub.com) — это постоянно работающая онлайн-платформа B2B-выставок. Проверенные производители и торговые компании ведут цифровые стенды, где оптовые покупатели просматривают каталоги продукции, изучают профили компаний и сертификаты и напрямую связываются с поставщиками через чат или запросы. Интерфейс работает на 13 языках, а просмотр выставок и товаров бесплатный.',
    },
    {
      question: 'Как найти проверенных поставщиков на SeaHeart Global?',
      answer:
        'Откройте раздел «Выставки» на x2xhub.com/exhibitions, чтобы просмотреть все активные стенды, или ищите товары по ключевому слову и категории. На каждом стенде ещё до обращения показаны профиль компании, сертификаты и документы проверки поставщика. Найдя подходящий вариант, используйте кнопки запроса или чата на странице стенда, чтобы связаться с поставщиком напрямую, без посредников.',
    },
    {
      question: 'Что такое онлайн B2B-выставка и как она работает?',
      answer:
        'Онлайн B2B-выставка — это виртуальная торговая ярмарка, которая работает круглосуточно 24/7. Вместо поездки на физическую выставку поставщики создают цифровые стенды со своим ассортиментом, описанием компании, сертификатами и контактными данными. Покупатели посещают стенды в любое время, сравнивают поставщиков бок о бок и сразу начинают переговоры. SeaHeart Global объединяет эти стенды в одном павильоне на x2xhub.com.',
    },
    {
      question: 'Бесплатен ли SeaHeart Global для покупателей?',
      answer:
        'Просмотр выставочных стендов, каталогов продукции и профилей поставщиков на SeaHeart Global бесплатен, без платного членства для закупок. Чтобы отправлять сообщения или запросы поставщикам, достаточно зарегистрировать бесплатный аккаунт покупателя. Для заказов, требующих защиты, функции торговой гарантии платформы помогают обезопасить сделку.',
    },
    {
      question: 'Какие языки поддерживает x2xhub.com?',
      answer:
        'Интерфейс платформы доступен на 13 языках: английском, упрощённом китайском, немецком, испанском, французском, японском, корейском, арабском, русском, португальском, хинди, тайском и вьетнамском. Контент товаров и стендов отображается на языке оригинала поставщика, а покупатели и поставщики общаются через встроенный чат платформы.',
    },
    {
      question: 'Как производители могут участвовать в SeaHeart Global?',
      answer:
        'Зарегистрируйте аккаунт продавца, заполните профиль компании с бизнес-лицензией и сертификатами для проверки, затем создайте свой выставочный стенд и загрузите товары с изображениями, характеристиками, минимальным объёмом заказа (MOQ) и информацией об OEM. После публикации стенд появляется в выставочном павильоне и индексируется поисковыми системами и ИИ-краулерами во всех 13 языковых версиях.',
    },
  ],
  pt: [
    {
      question: 'O que é a SeaHeart Global?',
      answer:
        'A SeaHeart Global (x2xhub.com) é uma plataforma de exposições comerciais B2B online sempre ativa. Fabricantes e empresas comerciais verificadas operam estandes digitais onde compradores atacadistas navegam por catálogos de produtos, analisam perfis de empresas e certificações e contatam fornecedores diretamente por chat ou consultas. A interface funciona em 13 idiomas, e navegar por exposições e produtos é gratuito.',
    },
    {
      question: 'Como encontro fornecedores verificados na SeaHeart Global?',
      answer:
        'Abra a seção de Exposições em x2xhub.com/exhibitions para navegar por todos os estandes ativos ou pesquise Produtos por palavra-chave e categoria. Cada estande mostra o perfil da empresa, as certificações e os documentos de verificação do fornecedor antes do contato. Ao encontrar uma correspondência, use os botões de consulta ou chat na página do estande para falar diretamente com o fornecedor, sem intermediários.',
    },
    {
      question: 'O que é uma exposição B2B online e como ela funciona?',
      answer:
        'Uma exposição B2B online é uma feira virtual que permanece aberta 24 horas por dia, 7 dias por semana. Em vez de viajar para uma feira física, os fornecedores montam estandes digitais com sua linha de produtos, apresentação da empresa, certificados e dados de contato. Os compradores visitam os estandes a qualquer momento, comparam fornecedores lado a lado e iniciam conversas na hora. A SeaHeart Global reúne esses estandes em um único pavilhão em x2xhub.com.',
    },
    {
      question: 'A SeaHeart Global é gratuita para compradores?',
      answer:
        'Navegar por estandes de exposição, catálogos de produtos e perfis de fornecedores na SeaHeart Global é gratuito, sem assinatura paga de sourcing. Para enviar mensagens ou consultas aos fornecedores, basta criar uma conta de comprador gratuita. Para pedidos que exigem proteção, os recursos de garantia comercial da plataforma ajudam a proteger a transação.',
    },
    {
      question: 'Quais idiomas o x2xhub.com suporta?',
      answer:
        'A interface da plataforma está disponível em 13 idiomas: inglês, chinês simplificado, alemão, espanhol, francês, japonês, coreano, árabe, russo, português, hindi, tailandês e vietnamita. O conteúdo de produtos e estandes é exibido no idioma original do fornecedor, e compradores e fornecedores se comunicam pelo chat integrado da plataforma.',
    },
    {
      question: 'Como os fabricantes podem expor na SeaHeart Global?',
      answer:
        'Cadastre uma conta de vendedor, complete o perfil da empresa com licença comercial e certificações para verificação, depois crie seu estande de exposição e envie produtos com imagens, especificações, quantidade mínima de pedido (MOQ) e informações de OEM. Após a publicação, o estande aparece no pavilhão de exposições e é indexado por mecanismos de busca e rastreadores de IA em todas as 13 versões de idiomas.',
    },
  ],
  hi: [
    {
      question: 'SeaHeart Global क्या है?',
      answer:
        'SeaHeart Global (x2xhub.com) हमेशा ऑनलाइन रहने वाला B2B ट्रेड एग्ज़िबिशन प्लेटफ़ॉर्म है। सत्यापित निर्माता और ट्रेडिंग कंपनियाँ डिजिटल बूथ चलाती हैं, जहाँ थोक खरीदार उत्पाद कैटलॉग देखते हैं, कंपनी प्रोफ़ाइल और प्रमाणपत्र जाँचते हैं और चैट या पूछताछ के ज़रिए सीधे आपूर्तिकर्ताओं से संपर्क करते हैं। इंटरफ़ेस 13 भाषाओं में काम करता है, और एग्ज़िबिशन व उत्पाद ब्राउज़ करना मुफ़्त है।',
    },
    {
      question: 'मैं SeaHeart Global पर सत्यापित आपूर्तिकर्ता कैसे खोजूँ?',
      answer:
        'सभी सक्रिय बूथ देखने के लिए x2xhub.com/exhibitions पर एग्ज़िबिशन सेक्शन खोलें, या कीवर्ड और कैटेगरी से उत्पाद खोजें। संपर्क करने से पहले हर बूथ पर आपूर्तिकर्ता की कंपनी प्रोफ़ाइल, प्रमाणपत्र और सत्यापन दस्तावेज़ दिखते हैं। उपयुक्त आपूर्तिकर्ता मिलने पर बूथ पेज पर इन्क्वायरी या चैट बटन से सीधे उससे बात करें—कोई बिचौलिया नहीं है।',
    },
    {
      question: 'ऑनलाइन B2B एग्ज़िबिशन क्या है और यह कैसे काम करता है?',
      answer:
        'ऑनलाइन B2B एग्ज़िबिशन एक वर्चुअल ट्रेड शो है जो 24/7 खुला रहता है। भौतिक मेले में यात्रा करने के बजाय, आपूर्तिकर्ता अपनी उत्पाद श्रृंखला, कंपनी परिचय, प्रमाणपत्र और संपर्क विवरण के साथ डिजिटल बूथ बनाते हैं। खरीदार किसी भी समय बूथ देखते हैं, आपूर्तिकर्ताओं की साथ-साथ तुलना करते हैं और तुरंत बातचीत शुरू करते हैं। SeaHeart Global इन बूथों को x2xhub.com पर एक ही हॉल में होस्ट करता है।',
    },
    {
      question: 'क्या SeaHeart Global खरीदारों के लिए मुफ़्त है?',
      answer:
        'SeaHeart Global पर एग्ज़िबिशन बूथ, उत्पाद कैटलॉग और आपूर्तिकर्ता प्रोफ़ाइल ब्राउज़ करना मुफ़्त है, कोई सशुल्क सोर्सिंग सदस्यता नहीं है। आपूर्तिकर्ताओं को संदेश या पूछताछ भेजने के लिए एक मुफ़्त खरीदार खाता पंजीकृत करें। सुरक्षा चाहने वाले ऑर्डर के लिए, प्लेटफ़ॉर्म की ट्रेड एश्योरेंस सुविधाएँ लेन-देन सुरक्षित करने में मदद करती हैं।',
    },
    {
      question: 'x2xhub.com किन भाषाओं का समर्थन करता है?',
      answer:
        'प्लेटफ़ॉर्म इंटरफ़ेस 13 भाषाओं में उपलब्ध है: अंग्रेज़ी, सरलीकृत चीनी, जर्मन, स्पैनिश, फ़्रेंच, जापानी, कोरियाई, अरबी, रूसी, पुर्तगाली, हिन्दी, थाई और वियतनामी। उत्पाद और बूथ सामग्री आपूर्तिकर्ता की मूल भाषा में दिखाई जाती है, और खरीदार व आपूर्तिकर्ता प्लेटफ़ॉर्म के बिल्ट-इन चैट के माध्यम से संवाद करते हैं।',
    },
    {
      question: 'निर्माता SeaHeart Global पर कैसे प्रदर्शन कर सकते हैं?',
      answer:
        'एक विक्रेता खाता पंजीकृत करें, सत्यापन के लिए व्यापार लाइसेंस और प्रमाणपत्रों के साथ कंपनी प्रोफ़ाइल पूरी करें, फिर अपना एग्ज़िबिशन बूथ बनाएँ और चित्र, विशिष्टताएँ, MOQ और OEM जानकारी के साथ उत्पाद अपलोड करें। प्रकाशित होने पर बूथ एग्ज़िबिशन हॉल में दिखता है और सभी 13 भाषा संस्करणों में खोज इंजन और AI क्रॉलर द्वारा अनुक्रमित होता है।',
    },
  ],
  th: [
    {
      question: 'SeaHeart Global คืออะไร?',
      answer:
        'SeaHeart Global (x2xhub.com) คือแพลตฟอร์มงานแสดงสินค้า B2B ออนไลน์ที่เปิดให้บริการตลอด 24 ชั่วโมง โรงงานผู้ผลิตและบริษัทค้าที่ผ่านการตรวจสอบแล้วจัดทำบูธดิจิทัลซึ่งผู้ซื้อขายส่งสามารถเรียกดูแคตตาล็อกสินค้า ตรวจสอบโปรไฟล์บริษัทและใบรับรอง และติดต่อซัพพลายเออร์โดยตรงผ่านแชตหรือการสอบถาม อินเทอร์เฟซรองรับ 13 ภาษา และการเรียกดูงานแสดงสินค้าและผลิตภัณฑ์นั้นฟรี',
    },
    {
      question: 'ฉันจะค้นหาซัพพลายเออร์ที่ตรวจสอบแล้วบน SeaHeart Global ได้อย่างไร?',
      answer:
        'เปิดส่วน Exhibitions ที่ x2xhub.com/exhibitions เพื่อเรียกดูบูธที่เปิดให้บริการทั้งหมด หรือค้นหาผลิตภัณฑ์ตามคำสำคัญและหมวดหมู่ โดยแต่ละบูธจะแสดงโปรไฟล์บริษัท ใบรับรองและเอกสารตรวจสอบของซัพพลายเออร์ก่อนที่คุณจะติดต่อ เมื่อพบรายการที่ตรงกัน ให้ใช้ปุ่มสอบถามหรือแชตบนหน้าบูธเพื่อพูดกับซัพพลายเออร์โดยตรง โดยไม่มีคนกลาง',
    },
    {
      question: 'งานแสดงสินค้า B2B ออนไลน์คืออะไรและทำงานอย่างไร?',
      answer:
        'งานแสดงสินค้า B2B ออนไลน์คืองานแฟร์เสมือนจริงที่เปิดให้เข้าชมตลอด 24 ชั่วโมงทุกวัน แทนที่จะเดินทางไปงานแฟร์จริง ซัพพลายเออร์จะตั้งบูธดิจิทัลที่มีกลุ่มสินค้า แนะนำบริษัท ใบรับรองและข้อมูลติดต่อ ผู้ซื้อสามารถเยี่ยมชมบูธได้ทุกเวลา เปรียบเทียบซัพพลายเออร์แบบเคียงข้างกันและเริ่มการสนทนาได้ทันที โดย SeaHeart Global รวบรวมบูธเหล่านี้ไว้ในฮอลล์เดียวที่ x2xhub.com',
    },
    {
      question: 'SeaHeart Global ฟรีสำหรับผู้ซื้อหรือไม่?',
      answer:
        'การเรียกดูบูธแสดงสินค้า แคตตาล็อกผลิตภัณฑ์และโปรไฟล์ซัพพลายเออร์บน SeaHeart Global นั้นฟรี โดยไม่มีสมาชิกการจัดซื้อแบบเสียค่าใช้จ่าย หากต้องการส่งข้อความหรือสอบถามถึงซัพพลายเออร์ เพียงลงทะเบียนบัญชีผู้ซื้อฟรี สำหรับคำสั่งซื้อที่ต้องการการคุ้มครอง ฟีเจอร์การค้ำประกันการค้าของแพลตฟอร์มจะช่วยรักษาความปลอดภัยของธุรกรรม',
    },
    {
      question: 'x2xhub.com รองรับภาษาใดบ้าง?',
      answer:
        'อินเทอร์เฟซของแพลตฟอร์มมีให้บริการ 13 ภาษา ได้แก่ อังกฤษ จีนตัวย่อ เยอรมัน สเปน ฝรั่งเศส ญี่ปุ่น เกาหลี อาหรับ รัสเซีย โปรตุเกส ฮินดี ไทยและเวียดนาม เนื้อหาผลิตภัณฑ์และบูธแสดงเป็นภาษาต้นฉบับของซัพพลายเออร์ และผู้ซื้อกับซัพพลายเออร์สื่อสารกันผ่านแชตในตัวของแพลตฟอร์ม',
    },
    {
      question: 'ผู้ผลิตสามารถออกบูธบน SeaHeart Global ได้อย่างไร?',
      answer:
        'ลงทะเบียนบัญชีผู้ขาย กรอกโปรไฟล์บริษัทพร้อมใบอนุญาตประกอบธุรกิจและใบรับรองเพื่อตรวจสอบ จากนั้นสร้างบูธแสดงสินค้าของคุณและอัปโหลดผลิตภัณฑ์พร้อมรูปภาพ ข้อมูลจำเพาะ ปริมาณสั่งซื้อขั้นต่ำ (MOQ) และข้อมูล OEM เมื่อเผยแพร่แล้ว บูธจะปรากฏในฮอลล์จัดแสดงและถูกจัดทำดัชนีโดยเสิร์ชเอนจินและโปรแกรมรวบรวมข้อมูล AI ในทั้ง 13 เวอร์ชันภาษา',
    },
  ],
  vi: [
    {
      question: 'SeaHeart Global là gì?',
      answer:
        'SeaHeart Global (x2xhub.com) là nền tảng triển lãm thương mại B2B trực tuyến hoạt động liên tục 24/7. Các nhà sản xuất và công ty thương mại đã được xác minh vận hành gian hàng số, nơi người mua buôn duyệt danh mục sản phẩm, xem hồ sơ công ty và chứng nhận, đồng thời liên hệ trực tiếp nhà cung cấp qua trò chuyện hoặc yêu cầu báo giá. Giao diện hoạt động bằng 13 ngôn ngữ và việc duyệt triển lãm cùng sản phẩm là miễn phí.',
    },
    {
      question: 'Làm thế nào để tìm nhà cung cấp đã được xác minh trên SeaHeart Global?',
      answer:
        'Mở mục Triển lãm tại x2xhub.com/exhibitions để duyệt tất cả gian hàng đang hoạt động, hoặc tìm Sản phẩm theo từ khóa và danh mục. Mỗi gian hàng hiển thị hồ sơ công ty, chứng nhận và tài liệu xác minh của nhà cung cấp trước khi bạn liên hệ. Khi tìm được đối tượng phù hợp, hãy dùng nút yêu cầu hoặc trò chuyện trên trang gian hàng để trao đổi trực tiếp với nhà cung cấp—không qua trung gian.',
    },
    {
      question: 'Triển lãm B2B trực tuyến là gì và hoạt động thế nào?',
      answer:
        'Triển lãm B2B trực tuyến là hội chợ thương mại ảo mở cửa 24/7. Thay vì đi dự hội chợ thực tế, nhà cung cấp dựng gian hàng số với dải sản phẩm, giới thiệu công ty, chứng chỉ và thông tin liên hệ. Người mua có thể ghé gian hàng bất cứ lúc nào, so sánh các nhà cung cấp cạnh nhau và bắt đầu trao đổi ngay lập tức. SeaHeart Global tập hợp các gian hàng này trong một hội trường duy nhất tại x2xhub.com.',
    },
    {
      question: 'SeaHeart Global có miễn phí cho người mua không?',
      answer:
        'Việc duyệt gian hàng triển lãm, danh mục sản phẩm và hồ sơ nhà cung cấp trên SeaHeart Global là miễn phí, không cần gói thành viên tìm nguồn cung ứng trả phí. Để gửi tin nhắn hoặc yêu cầu đến nhà cung cấp, bạn chỉ cần đăng ký tài khoản người mua miễn phí. Với các đơn hàng cần bảo vệ, tính năng đảm bảo giao dịch của nền tảng giúp giao dịch an toàn.',
    },
    {
      question: 'x2xhub.com hỗ trợ những ngôn ngữ nào?',
      answer:
        'Giao diện nền tảng có sẵn bằng 13 ngôn ngữ: tiếng Anh, tiếng Trung giản thể, tiếng Đức, tiếng Tây Ban Nha, tiếng Pháp, tiếng Nhật, tiếng Hàn, tiếng Ả Rập, tiếng Nga, tiếng Bồ Đào Nha, tiếng Hindi, tiếng Thái và tiếng Việt. Nội dung sản phẩm và gian hàng hiển thị theo ngôn ngữ gốc của nhà cung cấp; người mua và nhà cung cấp giao tiếp qua trò chuyện tích hợp sẵn của nền tảng.',
    },
    {
      question: 'Nhà sản xuất có thể triển lãm trên SeaHeart Global bằng cách nào?',
      answer:
        'Đăng ký tài khoản người bán, hoàn tất hồ sơ công ty kèm giấy phép kinh doanh và chứng nhận để xác minh, sau đó tạo gian hàng triển lãm và tải lên sản phẩm kèm hình ảnh, thông số kỹ thuật, số lượng đặt hàng tối thiểu (MOQ) và thông tin OEM. Sau khi xuất bản, gian hàng sẽ xuất hiện trong hội trường triển lãm và được các công cụ tìm kiếm cùng trình thu thập dữ liệu AI lập chỉ mục ở cả 13 phiên bản ngôn ngữ.',
    },
  ],
}

type SectionCopy = { title: string; subtitle: string; cta: string }

const SECTION_COPY: Record<string, SectionCopy> = {
  en: {
    title: 'Frequently Asked Questions About Online B2B Sourcing',
    subtitle: 'Direct, verifiable answers. Browse the exhibition hall for more suppliers and products.',
    cta: 'Browse all online booths',
  },
  zh: {
    title: '关于线上 B2B 采购与参展的常见问题',
    subtitle: '直接、可核验的答案。更多供应商与展品请访问展会大厅。',
    cta: '浏览全部在线展位',
  },
  de: {
    title: 'Häufige Fragen zum Online-B2B-Sourcing',
    subtitle: 'Direkte, überprüfbare Antworten. Weitere Lieferanten und Produkte finden Sie in der Messehalle.',
    cta: 'Alle Online-Stände ansehen',
  },
  es: {
    title: 'Preguntas frecuentes sobre abastecimiento B2B en línea',
    subtitle: 'Respuestas directas y verificables. Explore más proveedores y productos en la sala de exposiciones.',
    cta: 'Ver todos los stands en línea',
  },
  fr: {
    title: 'Questions fréquentes sur l’approvisionnement B2B en ligne',
    subtitle: 'Des réponses directes et vérifiables. Découvrez plus de fournisseurs et de produits dans le hall d’exposition.',
    cta: 'Parcourir tous les stands en ligne',
  },
  ja: {
    title: 'オンラインB2B調達と出展に関するよくある質問',
    subtitle: '直接的で検証可能な回答。展示ホールでさらに多くのサプライヤーと製品をご覧ください。',
    cta: 'すべてのオンラインブースを見る',
  },
  ko: {
    title: '온라인 B2B 소싱과 전시에 관한 자주 묻는 질문',
    subtitle: '직접적이고 검증 가능한 답변입니다. 전시장에서 더 많은 공급업체와 제품을 만나보세요.',
    cta: '모든 온라인 부스 보기',
  },
  ar: {
    title: 'الأسئلة الشائعة حول التوريد B2B عبر الإنترنت',
    subtitle: 'إجابات مباشرة وقابلة للتحقق. تصفّح المزيد من المورّدين والمنتجات في قاعة المعرض.',
    cta: 'تصفّح جميع الأجنحة الإلكترونية',
  },
  ru: {
    title: 'Частые вопросы об онлайн B2B-закупках и выставках',
    subtitle: 'Прямые и проверяемые ответы. Ещё больше поставщиков и товаров — в выставочном павильоне.',
    cta: 'Смотреть все онлайн-стенды',
  },
  pt: {
    title: 'Perguntas frequentes sobre sourcing B2B online',
    subtitle: 'Respostas diretas e verificáveis. Veja mais fornecedores e produtos no pavilhão de exposições.',
    cta: 'Ver todos os estandes online',
  },
  hi: {
    title: 'ऑनलाइन B2B सोर्सिंग और एग्ज़िबिशन के बारे में अक्सर पूछे जाने वाले प्रश्न',
    subtitle: 'सीधे, सत्यापित जवाब। अधिक आपूर्तिकर्ताओं और उत्पादों के लिए एग्ज़िबिशन हॉल देखें।',
    cta: 'सभी ऑनलाइन बूथ ब्राउज़ करें',
  },
  th: {
    title: 'คำถามที่พบบ่อยเกี่ยวกับการจัดซื้อ B2B ออนไลน์และงานแสดงสินค้า',
    subtitle: 'คำตอบที่ตรงไปตรงมาและตรวจสอบได้ ดูซัพพลายเออร์และผลิตภัณฑ์เพิ่มเติมได้ในฮอลล์จัดแสดงสินค้า',
    cta: 'เรียกดูบูธออนไลน์ทั้งหมด',
  },
  vi: {
    title: 'Câu hỏi thường gặp về tìm nguồn cung ứng B2B trực tuyến',
    subtitle: 'Câu trả lời trực tiếp và có thể kiểm chứng. Xem thêm nhà cung cấp và sản phẩm trong hội trường triển lãm.',
    cta: 'Xem tất cả gian hàng trực tuyến',
  },
}

export default function FaqSection({ locale }: { locale: string }) {
  const items = FAQ_CONTENT[locale] ?? FAQ_CONTENT.en
  const copy = SECTION_COPY[locale] ?? SECTION_COPY.en

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          {copy.title}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          {copy.subtitle}
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
            {copy.cta}
          </Link>
        </div>
      </div>

      {/* FAQPage structured data, localized to the rendered language */}
      <FAQSchema faqs={items} />
    </section>
  )
}
