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
      title: '关于 心海环球',
      content: `心海环球 (SeaHeart Global) 为个人独立全程自研、独自运维的全球化线上贸易平台。项目最初搭建定位为个人综合货品店铺，在深切体会主流 B2B、B2C 平台高额服务费、工具权限受限、规则束缚过多等行业痛点后，平台正式迭代升级，转型为面向全球所有用户开放的公共商贸集市。

平台基础核心功能永久免费：无论国籍、地域、语种、种族，所有商户、采购商、外贸从业者均可平等使用基础功能，免费注册账号、免费发布供需、采购、招商、合作等商业资讯、免费浏览检索商家与货源、免费普通询盘对接，基础板块永久不收取任何费用。

随着平台用户规模持续扩张，服务器租赁、带宽、运维、安全防护等硬性成本会同步上涨，若个人独自承担压力超限，平台未来仅会针对增值推广类服务适度收取费用，基础发布、检索、基础沟通等刚需功能始终保持永久免费。

预设增值收费细则（仅为预案，当前全程免费）：
• 展会展位入驻订阅：1 美元 / 月；
• 商品置顶挂卖服务费：按货品申报货值的万分之一收取单次挂卖费用；
• 全站全域喊话、面向全部用户批量公告推送：0.1 美元 / 单次。

收费变更公示承诺：任何新增收费项目、调整收费标准，正式生效前提前 100 天，通过网站首页公告、全体用户邮件、站内通知三重渠道全员公示，充分留给用户选择、适应、账号迁出的缓冲周期，绝不会临时突击收费、暗地加价。

欢迎所有用户通过邮箱提交功能建议、优化构想与问题反馈，我会快速查阅并及时回信，清晰告知方案是否落地执行，若暂缓调整会详细说明延迟原因。

平台全程单人独立开发维护，精力有限，偶尔会出现界面卡顿、小 bug 等不完美情况，敬请理解包容；一旦收到故障、漏洞反馈，我会第一时间加急排查、快速迭代修复。

重要安全提示 & 正式免责声明

平台核心服务仅为商业信息展示、供需智能匹配、商家与货源曝光对接，不介入买卖双方线上线下实际交易流程；平台无能力全额核验所有注册用户身份、企业资质、履约信用，无法对货款、订单履约做担保兜底，全部交易洽谈、资金往来、合同拟定、履约交割，均由交易双方自主决策、独立承担全部风险与责任。

初次与陌生商家、新合作方开展合作时，强烈优先选用信用证、第三方资金担保、线下实地验货、正规公证签约等风控手段，谨慎预付定金、私下转账，主动核查合作方资质，规避贸易诈骗。

现阶段平台唯一付费项目仅为展位增值订阅，暂未上线平台内部资金结算、官方电子合同签署、货款托管履约等交易功能，平台不充当交易担保方，不承担交易违约、货款亏损、货不对版等纠纷责任。

平台将长期持续迭代系统架构、风控审核机制、智能匹配工具，不断优化交易环境、提升信息可信度。感谢每一位用户的信任，也恳请全体交易者时刻保持理性警惕，审慎完成每一笔商业合作。`,
      button: '我知道了'
    },
    en: {
      title: 'About SeaHeart Global',
      content: `SeaHeart Global is a global trade platform independently developed and maintained by an individual developer. It was initially built as a personal multi-product store. After deeply experiencing the pain points of mainstream B2B and B2C platforms — high service fees, limited tool permissions, and excessive rule constraints — the platform was officially upgraded and transformed into an open public trading marketplace for users worldwide.

All basic core functions of the platform are permanently free: regardless of nationality, region, language, or race, all merchants, buyers, and foreign trade practitioners can equally use basic features — free account registration, free posting of supply, demand, procurement, investment, and cooperation information, free browsing and searching for businesses and products, free basic inquiry matching. Basic sections will never charge any fees.

As the platform's user base continues to expand, hard costs such as server rental, bandwidth, maintenance, and security will rise accordingly. If the individual developer can no longer bear the burden, only value-added promotional services will be appropriately charged in the future. Basic publishing, searching, and basic communication functions will always remain permanently free.

Preset value-added fee schedule (preliminary plan only, currently entirely free):
• Exhibition booth subscription: $1 per month;
• Featured product listing service: 0.01% of the declared product value per single listing;
• Site-wide broadcast / batch announcement push to all users: $0.1 per dispatch.

Fee change commitment: Any new fee items or fee adjustments will be publicly announced to all users 100 days before the effective date through three channels: homepage notice, user email, and in-site notification, providing ample buffer period for users to choose, adapt, or migrate their accounts. No sudden surprise charges or hidden price increases will ever occur.

All users are welcome to submit feature suggestions, optimization ideas, and feedback via email. I will review promptly and respond in a timely manner, clearly informing you whether the proposal will be implemented, or explaining in detail the reasons for delayed adjustment if not immediately feasible.

The platform is independently developed and maintained by a single person. With limited energy, occasional interface lag or minor bugs may occur. Your understanding and tolerance are appreciated; upon receiving fault or vulnerability feedback, I will prioritize urgent investigation and rapid iterative fixes.

Important Safety Notice & Official Disclaimer

The platform's core services are limited to commercial information display, intelligent supply-demand matching, and business/product exposure. We do not intervene in actual online or offline transactions between buyers and sellers. The platform cannot fully verify all registered users' identities, enterprise qualifications, or performance credibility, and cannot guarantee or underwrite payment or order performance. All transaction negotiations, fund transfers, contract drafting, and delivery fulfillment are independently decided and fully risk-bearing by both parties.

When cooperating with unfamiliar merchants or new partners, strongly prioritize risk control measures such as letters of credit, third-party fund guarantees, offline on-site inspection, and formal notarized contracts. Exercise caution with prepayment deposits and private transfers, and proactively verify partner qualifications to prevent trade fraud.

At this stage, the only paid service on the platform is booth value-added subscription. Internal fund settlement, official electronic contract signing, payment escrow, and other transaction functions have not been launched. The platform does not act as a transaction guarantor and assumes no liability for disputes such as transaction breaches, payment losses, or product mismatches.

The platform will continuously iterate on system architecture, risk control review mechanisms, and intelligent matching tools to optimize the trading environment and improve information credibility. Thank you for every user's trust, and please remain rationally vigilant and cautious in every business cooperation.`,
      button: 'I Understand'
    },
    es: {
      title: 'Acerca de SeaHeart Global',
      content: `SeaHeart Global es una plataforma comercial global desarrollada y mantenida independientemente por un desarrollador individual. Originalmente se construyó como una tienda personal de múltiples productos. Después de experimentar profundamente los puntos débiles de las plataformas B2B y B2C principales — altas tarifas de servicio, permisos de herramientas limitados y restricciones excesivas de reglas — la plataforma se actualizó y transformó oficialmente en un mercado comercial público abierto para usuarios globales.

Todas las funciones básicas de la plataforma son permanentemente gratuitas: sin importar la nacionalidad, región, idioma o raza, todos los comerciantes, compradores y profesionales del comercio exterior pueden utilizar las funciones básicas de manera equitativa — registro de cuenta gratuito, publicación gratuita de información de oferta, demanda, adquisición, inversión y cooperación, navegación y búsqueda gratuita de empresas y productos, emparejamiento de consultas básico gratuito. Las secciones básicas nunca cobrarán tarifas.

A medida que la base de usuarios de la plataforma continúe expandiéndose, los costos duros como el alquiler de servidores, el ancho de banda, el mantenimiento y la seguridad aumentarán en consecuencia. Si el desarrollador individual ya no puede soportar la carga, solo los servicios promocionales de valor añadido se cobrarán adecuadamente en el futuro. Las funciones básicas de publicación, búsqueda y comunicación básica siempre permanecerán permanentemente gratuitas.

Plan de tarifas de valor añadido predeterminado (solo plan preliminar, actualmente totalmente gratuito):
• Suscripción de stand de exposición: $1 por mes;
• Servicio de listado destacado de productos: 0,01% del valor del producto declarado por listado único;
• Transmisión a todo el sitio / anuncio por lotes a todos los usuarios: $0,1 por envío.

Compromiso de cambio de tarifas: Cualquier nuevo elemento de tarifa o ajuste de tarifas se anunciará públicamente a todos los usuarios 100 días antes de la fecha efectiva a través de tres canales: aviso en la página principal, correo electrónico al usuario y notificación en el sitio, brindando un período de amortiguación amplio para que los usuarios elijan, se adapten o migren sus cuentas. Nunca habrá cargos sorpresa repentinos ni aumentos de precios ocultos.

Todos los usuarios son bienvenidos a enviar sugerencias de funciones, ideas de optimización y comentarios por correo electrónico. Revisaré rápidamente y responderé de manera oportuna, informándole claramente si la propuesta se implementará, o explicando en detalle las razones del ajuste retrasado si no es inmediatamente factible.

La plataforma es desarrollada y mantenida independientemente por una sola persona. Con energía limitada, pueden ocurrir retrasos ocasionales en la interfaz o errores menores. Se aprecia su comprensión y tolerancia; al recibir comentarios de fallas o vulnerabilidades, priorizaré la investigación urgente y las correcciones iterativas rápidas.

Aviso de Seguridad Importante y Descargo de Responsabilidad Oficial

Los servicios principales de la plataforma se limitan a la exhibición de información comercial, el emparejamiento inteligente de oferta y demanda y la exposición de empresas/productos. No intervenimos en transacciones reales en línea o fuera de línea entre compradores y vendedores. La plataforma no puede verificar completamente las identidades de todos los usuarios registrados, las calificaciones empresariales o la credibilidad de rendimiento, y no puede garantizar ni suscribir pagos o rendimiento de pedidos. Todas las negociaciones de transacciones, transferencias de fondos, redacción de contratos y cumplimiento de entregas son decididas independientemente y asumidas en su totalidad por ambas partes.

Al cooperar con comerciantes desconocidos o nuevos socios, priorice medidas de control de riesgos como cartas de crédito, garantías de fondos de terceros, inspección presencial fuera de línea y contratos notarizados formales. Tenga precaución con los depósitos de prepago y las transferencias privadas, y verifique proactivamente las calificaciones de los socios para prevenir el fraude comercial.

En esta etapa, el único servicio de pago en la plataforma es la suscripción de valor añadido de stands. La liquidación interna de fondos, la firma de contratos electrónicos oficiales, el depósito de pagos y otras funciones de transacción no se han lanzado. La plataforma no actúa como garante de transacciones y no asume responsabilidad por disputas como incumplimientos de transacciones, pérdidas de pagos o discrepancias de productos.

La plataforma iterará continuamente en la arquitectura del sistema, los mecanismos de revisión de control de riesgos y las herramientas de emparejamiento inteligente para optimizar el entorno comercial y mejorar la credibilidad de la información. Gracias por la confianza de cada usuario, y manténgase alerta racionalmente y sea cauteloso en cada cooperación comercial.`,
      button: 'Entendido'
    },
    fr: {
      title: 'À propos de SeaHeart Global',
      content: `SeaHeart Global est une plateforme commerciale mondiale développée et maintenue indépendamment par un développeur individuel. Elle a été initialement construite comme une boutique personnelle de multiples produits. Après avoir profondément ressenti les points douloureux des plateformes B2B et B2C principales — frais de service élevés, autorisations d'outils limitées et contraintes de règles excessives — la plateforme a été officiellement mise à niveau et transformée en un marché commercial public ouvert pour les utilisateurs mondiaux.

Toutes les fonctions de base de la plateforme sont définitivement gratuites : sans distinction de nationalité, de région, de langue ou de race, tous les commerçants, acheteurs et praticiens du commerce extérieur peuvent utiliser les fonctions de base de manière égale — inscription de compte gratuite, publication gratuite d'informations d'offre, de demande, d'approvisionnement, d'investissement et de coopération, navigation et recherche gratuites d'entreprises et de produits, mise en relation gratuite des demandes de base. Les sections de base ne percevront jamais de frais.

À mesure que la base d'utilisateurs de la plateforme continue de se développer, les coûts fixes tels que la location de serveurs, la bande passante, la maintenance et la sécurité augmenteront en conséquence. Si le développeur individuel ne peut plus supporter la charge, seuls les services promotionnels à valeur ajoutée seront facturés de manière appropriée à l'avenir. Les fonctions de base de publication, de recherche et de communication de base resteront toujours définitivement gratuites.

Barème des frais à valeur ajoutée prédéfini (plan préliminaire uniquement, actuellement entièrement gratuit) :
• Abonnement de stand d'exposition : 1 $ par mois ;
• Service de référencement de produit en vedette : 0,01 % de la valeur du produit déclarée par référencement unique ;
• Diffusion à l'échelle du site / annonce par lots à tous les utilisateurs : 0,1 $ par envoi.

Engagement sur la modification des frais : Tout nouvel élément de frais ou ajustement de frais sera annoncé publiquement à tous les utilisateurs 100 jours avant la date d'entrée en vigueur effective via trois canaux : avis sur la page d'accueil, courriel de l'utilisateur et notification sur le site, offrant une période tampon suffisante pour que les utilisateurs choisissent, s'adaptent ou migrent leurs comptes. Aucune charge surprise soudaine ni augmentation de prix cachée ne se produira jamais.

Tous les utilisateurs sont invités à soumettre des suggestions de fonctionnalités, des idées d'optimisation et des commentaires par courriel. Je réviserai rapidement et répondrai en temps opportun, en vous informant clairement si la proposition sera mise en œuvre, ou en expliquant en détail les raisons du retard si elle n'est pas immédiatement réalisable.

La plateforme est développée et maintenue indépendamment par une seule personne. Avec une énergie limitée, des ralentissements d'interface ou des bogues mineurs occasionnels peuvent se produire. Votre compréhension et votre tolérance sont appréciées ; lors de la réception de commentaires sur des pannes ou des vulnérabilités, je donnerai la priorité à une investigation urgente et à des corrections itératives rapides.

Avis de sécurité important et disclaimer officiel

Les services principaux de la plateforme se limitent à l'affichage d'informations commerciales, à la mise en relation intelligente de l'offre et de la demande, et à l'exposition des entreprises/produits. Nous n'intervenons pas dans les transactions réelles en ligne ou hors ligne entre acheteurs et vendeurs. La plateforme ne peut pas vérifier complètement les identités de tous les utilisateurs inscrits, les qualifications entrepreneuriales ou la crédibilité de performance, et ne peut pas garantir ni souscrire les paiements ou les performances de commandes. Toutes les négociations de transaction, transferts de fonds, rédaction de contrats et exécution de livraisons sont décidés indépendamment et assumés pleinement par les deux parties.

Lorsque vous coopérez avec des commerçants inconnus ou de nouveaux partenaires, priorisez les mesures de contrôle des risques telles que les lettres de crédit, les garanties de fonds de tiers, l'inspection sur place hors ligne et les contrats notariés officiels. Soyez prudent avec les dépôts de prépaiement et les transferts privés, et vérifiez proactivement les qualifications des partenaires pour prévenir la fraude commerciale.

À ce stade, le seul service payant sur la plateforme est l'abonnement à valeur ajoutée de stand. Le règlement interne des fonds, la signature officielle de contrats électroniques, le dépôt de paiement et autres fonctions de transaction n'ont pas été lancés. La plateforme ne agit pas en tant que garant de transaction et n'assume aucune responsabilité pour les litiges tels que les manquements aux transactions, les pertes de paiement ou les écarts de produits.

La plateforme itérera en permanence sur l'architecture du système, les mécanismes de révision du contrôle des risques et les outils de mise en relation intelligente pour optimiser l'environnement commercial et améliorer la crédibilité des informations. Merci de la confiance de chaque utilisateur, et veuillez rester rationnellement vigilant et prudent dans chaque coopération commerciale.`,
      button: 'Je Comprends'
    },
    de: {
      title: 'Über SeaHeart Global',
      content: `SeaHeart Global ist eine globalen Handelsplattform, die von einem einzelnen Entwickler unabhängig entwickelt und gewartet wird. Ursprünglich als persönlicher Multiprodukt-Shop gebaut. Nach tiefem Erleben der Schwachstellen Mainstream-B2B/B2C-Plattformen — hohe Gebühren, eingeschränkte Tool-Berechtigungen und übermäßige Regelbeschränkungen — wurde die Plattform offiziell升级 und zu einem offenen öffentlichen Handelsmarkt für globale Nutzer umgewandelt.

Alle Kernfunktionen der Plattform sind dauerhaft kostenlos: unabhängig von Nationalität, Region, Sprache oder Rasse können alle Händler, Käufer und Außenhandelsfachleute die Basisfunktionen gleichberechtigt nutzen — kostenlose Kontoregistrierung, kostenlose Veröffentlichung von Angebots-, Nachfrage-, Beschaffungs-, Investitions- und Kooperationsinformationen, kostenloses Durchsuchen und Suchen von Unternehmen und Produkten, kostenlose grundlegende Anfragevermittlung. Basisbereiche werden niemals Gebühren erheben.

Mit zunehmender Nutzerzahl der Plattform steigen die harten Kosten wie Servermiete, Bandbreite, Wartung und Sicherheit entsprechend an. Wenn der einzelne Entwickler die Last nicht mehr tragen kann, werden in Zukunft nur wertschöpfende Werbedienste angemessen berechnet. Basisveröffentlichung, Suche und Basiskommunikationsfunktionen bleiben stets dauerhaft kostenlos.

Vorgegebener Gebührenplan für Mehrwertdienste (nur vorläufiger Plan, derzeit vollständig kostenlos):
• Messestand-Abonnement: 1 $ pro Monat;
• Herausragendes Produktlistungsservice: 0,01 % des erklärten Produktwerts pro Listung;
• Standortweite Übertragung / Massenankündigung an alle Nutzer: 0,1 $ pro Versand.

Gebührenänderungsverpflichtung: Alle neuen Gebührenposten oder Gebührenanpassungen werden allen Nutzern 100 Tage vor dem Wirksamkeitsdatum über drei Kanäle öffentlich angekündigt: Startseitenhinweis, Nutzer-E-Mail und In-Notify, was einen ausreichenden Puffer für Nutzer bietet, um zu wählen, sich anzupassen oder Konten zu migrieren. Es wird niemals plötzliche Überraschungsgebühren oder versteckte Preiserhöhungen geben.

Alle Nutzer sind willkommen, Funktionsvorschläge, Optimierungsideen und Feedback per E-Mail einzureichen. Ich werde zeitnah prüfen und rechtzeitig antworten, klar angeben, ob der Vorschlag umgesetzt wird, oder ausführlich die Gründe für eine verzögerte Anpassung erklären, falls nicht sofort durchführbar.

Die Plattform wird unabhängig von einer einzelnen Person entwickelt und gewartet. Bei begrenzter Energie können gelegentliche Oberflächenverzögerungen oder kleinere Fehler auftreten. Ihr Verständnis und Ihre Toleranz werden geschätzt; bei Erhalt von Fehler- oder Schwachstellenmeldungen werde ich dringende Untersuchungen und schnelle iterative Priorität einräumen.

Wichtige Sicherheitswarnung und offizielles Haftungsausschluss

Die Kernleistungen der Plattform beschränken sich auf die Anzeige kommerzieller Informationen, die intelligente Angebots-Nachfrage-Matching und die Unternehmen/Produkt-Belichtung. Wir greifen nicht in tatsächliche Online- oder Offline-Transaktionen zwischen Käufern und Verkäufern ein. Die Plattform kann nicht alle registrierten Nutzeridentitäten, Unternehmensqualifikationen oder Leistungsglaubwürdigkeit vollständig prüfen und kann Zahlungen oder Auftragsleistungen nicht garantieren oder absichern. Alle Transaktionsverhandlungen, Geldtransfers, Vertragsgestaltungen und Lieferungserfüllungen werden von beiden Parteien unabhängig entschieden und vollständig riskiert.

Bei der Zusammenarbeit mit unbekannten Händlern oder neuen Partnern sollten Sie prioritäre Risikokontrollmaßnahmen wie Akkreditive, Drittmittelgarantien, Offline-Inspektionen vor Ort und formelle notarielle Verträge ergreifen. Seien Sie vorsichtig mit Vorauszahlungen und privaten Überweisungen und prüfen Sie proaktiv die Partnerqualifikationen, um Handelsbetrug vorzubeugen.

Derzeit ist der einzige bezahlte Dienst auf der Plattform das Messestand-Mehrwert-Abonnement. Interne Geldabrechnung, offizielle elektronische Vertragsunterzeichnung, Zahlungsverwaltung und andere Transaktionsfunktionen wurden nicht gestartet. Die Plattform fungiert nicht als Transaktionsgarant und übernimmt keine Verantwortung für Streitigkeiten wie Transaktionsverletzungen, Zahlungsverluste oder Produktabweichungen.

Die Plattform wird kontinuierlich die Systemarchitektur, Risikoprüfungsmechanismen und intelligente Matching-Tools weiterentwickeln, um das Handelsumfeld zu optimieren und die Informationsglaubwürdigkeit zu verbessern. Vielen Dank für das Vertrauen jedes Nutzers und bleiben Sie bei jeder Handelskooperation rational wachsam und vorsichtig.`,
      button: 'Ich Verstehe'
    },
    ja: {
      title: 'SeaHeart Global について',
      content: `SeaHeart Global は個人開発者によって独立して開発・運営されるグローバル貿易プラットフォームです。元々は個人の多品目ストアとして構築されました。主流のB2B/B2Cプラットフォームの課題 — 高額なサービス料金、ツール権限の制限、過度な規則制約 — を深く経験した後、プラットフォームは公式にアップグレードされ、世界中のユーザー向けの公開貿易マーケットに変革されました。

プラットフォームのすべての基本コア機能は永久に無料です:国籍、地域、言語、人種に関係なく、すべての商人、買い手、貿易実務家が基本機能を平等に利用できます — 無料アカウント登録、無料の供需・調達・投資・提携情報の投稿、無料の企業と製品の閲覧・検索、無料の基本引き合いマッチング。基本セクションは一切料金を請求しません。

プラットフォームのユーザー数が継続的に拡大するにつれ、サーバーレンタル、帯域幅、メンテナンス、セキュリティなどの固定費用が相応に増加します。個人開発者が負担しきれなくなった場合、将来的に付加価値販促サービスのみ適切に課金します。基本の投稿、検索、基本コミュニケーション機能は常に永久に無料です。

予定されている付加価値料金表（現時点では全額無料、予備計画のみ）:
• 展示会ブースサブスクリプション: 月額1ドル;
• 商品固定掲載サービス: 1回の掲載につき申告商品金額の0.01%;
• サイト全域一斉送信 / 全ユーザー一括告知: 1回につき0.1ドル.

料金変更のコミットメント: 新規料金項目または料金調整は、効力発生日の100日前までに、ホームページ告知、ユーザーメール、サイト内通知の3つのチャネルを通じてすべてのユーザーに公開告知し、ユーザーが選択、適応、アカウント移行を行うための十分な猶予期間を提供します。突発的な料金請求や隠れた値上げは一切行いません。

すべてのユーザーは、メールで機能提案、最適化アイデア、フィードバックを送信することを歓迎します。迅速に確認し、タイムリーに返信し、提案が実装されるかどうかを明確にお知らせするか、即座に実行不可能な場合は遅延調整の理由を詳しく説明します。

プラットフォームは1人の個人によって独立して開発・運営されています。限られたエネルギーのため、インターフェースの遅延や小さなバグが発生する場合があります。ご理解とご容赦をお願いいたします。障害や脆弱性のフィードバックを受け取った場合は、緊急調査と迅速な反復修正を最優先に行います。

重要な安全上の注意事項と公式免責事項

プラットフォームのコアサービスは、商業情報の表示、需給のスマートマッチング、企業/製品の露出に限られます。売買間の実際のオンラインまたはオフライン取引には介入しません。プラットフォームは、すべての登録ユーザーの身元、企業資格、履行信用を完全に確認することはできず、代金や注文履行を保証または引き受けることもできません。すべての取引交渉、資金移動、契約起草、履行引渡しは、双方が独立して決定し、全責任を負います。

未知の商人や新規パートナーと提携する場合は、信用状、第三者資金保証、オフライン現地検査、正式な公正契約などのリスク管理措置を優先的に選択してください。前払い金や個人間振込には注意し、パートナーの資格を積極的に確認して貿易詐欺を防いでください。

現時点で、プラットフォーム上の唯一の有料サービスはブース付加価値サブスクリプションです。内部資金決済、公式電子契約締結、代金預託履行などの取引機能はまだ開始されていません。プラットフォームは取引保証人として機能せず、取引違反、代金損失、商品不一致などの紛争について責任を負いません。

プラットフォームは、取引環境を最適化し、情報の信頼性を高めるために、システムアーキテクチャ、リスク管理審査メカニズム、スマートマッチングツールを継続的に反復します。すべてのユーザーの信頼に感謝いたします。また、すべての貿易提携において理性的に警戒し、慎重になることをお願いいたします。`,
      button: '了解しました'
    },
    ko: {
      title: 'SeaHeart Global 소개',
      content: `SeaHeart Global은 개인 개발자가 독립적으로 개발 및 운영하는 글로벌 무역 플랫폼입니다. 처음에는 개인 멀티제품 스토어로 만들어졌습니다. 주류 B2B/B2C 플랫폼의 고충 — 높은 서비스 수수료, 제한된 도구 권한, 과도한 규칙 제약 — 을 깊이 경험한 후 플랫폼이 공식적으로 업그레이드되어 전 세계 사용자를 위한 공개 무역 시장으로 변모했습니다.

플랫폼의 모든 기본 핵심 기능은 영구적으로 무료입니다: 국적, 지역, 언어, 인종에 관계없이 모든 상인, 구매자, 대외 무역 종사자는 기본 기능을 동등하게 사용할 수 있습니다 — 무료 계정 등록, 무료 공급/수요/조달/투자/협력 정보 게시, 무료 기업 및 제품 검색, 무료 기본 문의 매칭. 기본 섹션은 결코 요금을 부과하지 않습니다.

플랫폼 사용자 기반이 계속 확장됨에 따라 서버 임대, 대역폭, 유지보수 및 보안과 같은 고정 비용이 상승할 것입니다. 개인 개발자가 더 이상 부담을 감당할 수 없는 경우 장기적으로 부가 가치 판촉 서비스만 적절하게 요금을 부과할 예정입니다. 기본 게시, 검색 및 기본 커뮤니케이션 기능은 항상 영구적으로 무료입니다.

사전 설정된 부가 가치 요금표 (현재 전체 무료, 예비 계획만):
• 전시회 부스 구독: 월 $1;
• 주요 제품 목록 서비스: 단일 목록당 신고된 제품 가치의 0.01%;
• 사이트 전체 방송 / 모든 사용자에게 일괄 공지: 발송당 $0.1.

요금 변경 약속: 새로운 요금 항목이나 요금 조정은 발효일 100일 전에 메인 페이지 공지, 사용자 이메일, 사이트 내 알림의 세 가지 채널을 통해 모든 사용자에게 공식 발표하여 사용자가 선택, 적응 또는 계정 이전을 할 수 있는 충분한 완충 기간을 제공합니다. 갑작스러운 요금 인상이나 숨은 가격 인상은 결코 없을 것입니다.

모든 사용자는 이메일로 기능 제안, 최적화 아이디어 및 피드백을 제출하는 것을 환영합니다. 신속히 검토하고 적시에 답변하여 제안이 구현될지 여부를 명확히 알리거나, 즉시 실행 불가능한 경우 지연 조정 사유를 상세히 설명하겠습니다.

플랫폼은 한 사람이 독립적으로 개발 및 유지보수합니다. 제한된 에너지로 인해 가끔 인터페이스 지연이나 작은 버그가 발생할 수 있습니다. 양해와 관용을 부탁드립니다. 장애나 취약점 피드백을 받으면 긴급 조사와 빠른 반복 수정을 최우선으로 진행하겠습니다.

중요한 안전 고지 및 공식 면책 조항

플랫폼의 핵심 서비스는 상업 정보 표시, 지능형 수요-공급 매칭, 기업/제품 노출로 제한됩니다. 매수자와 매도자 간의 실제 온라인 또는 오프라인 거래에 개입하지 않습니다. 플랫폼은 모든 등록 사용자의 신원, 기업 자격, 성과 신뢰성을 완전히 확인할 수 없으며, 결제나 주문 이행을 보장하거나 인수할 수 없습니다. 모든 거래 협상, 자금 이체, 계약 초안 작성, 납품 이행은 당사자들이 독립적으로 결정하고 전적으로 책임을집니다.

낯선 상인이나 새로운 파트너와 협력할 때는 신용장, 제3자 자금 보증, 오프라인 현장 검사, 정식 공증 계약과 같은 위험 관리 조치를 우선적으로 선택하십시오. 선금이나 개인 송금에 주의하고 파트너 자격을 적극적으로 확인하여 무역 사기를 방지하십시오.

현재 플랫폼의 유일한 유료 서비스는 부스 부가 가치 구독입니다. 내부 자금 결제, 공식 전자 계약 서명, 결제 에스크로우 및 기타 거래 기능은 아직 출시되지 않았습니다. 플랫폼은 거래 보증인으로 행동하지 않으며 거래 위반, 결제 손실 또는 제품 불일치와 같은 분쟁에 대해 책임을 지지 않습니다.

플랫폼은 거래 환경을 최적화하고 정보 신뢰성을 높이기 위해 시스템 아키텍처, 위험 관리 심사 메커니즘 및 지능형 매칭 도구를 지속적으로 개선할 것입니다. 모든 사용자의 신뢰에 감사드리며, 모든 비즈니스 협력에서 합리적으로 경계하고 신중하게 임해 주시기 바랍니다.`,
      button: '확인'
    },
    ar: {
      title: 'حول SeaHeart Global',
      content: `SeaHeart Global هي منصة تجارية عالمية تم تطويرها وصيانتها بشكل مستقل من قبل مطور واحد. تم بناؤها في الأصل كمتجر شخصي متعدد المنتجات. بعد تجربة عميقة لنقاط الضعف في منصات B2B و B2C السائدة — رسوم خدمة عالية، وصلاحيات أدوات محدودة، وقيود قواعد مفرطة — تمت ترقية المنصة رسمياً وتحويلها إلى سوق تجاري عام مفتوح للمستخدمين العالميين.

جميع الوظائف الأساسية للمنصة مجانية بشكل دائم: بغض النظر عن الجنسية أو المنطقة أو اللغة أو العرق، يمكن لجميع التجار والمشترين وممارسو التجارة الخارجية استخدام الوظائف الأساسية بالتساوي — تسجيل حساب مجاني، نشر مجاني لمعلومات العرض والطلب والشراء والاستثمار والتعاون، تصفح وبحث مجاني عن الشركات والمنتجات، مطابقة استفسارات أساسية مجانية. لن تفرض الأقسام الأساسية أي رسوم أبداً.

مع استمرار توسع قاعدة مستخدمي المنصة، سترتفع التكاليف الثابتة مثل استئجار الخادم وعرض النطاق الترددي والصيانة والأمن وفقاً لذلك. إذا لم يعد المطور الفردي قادراً على تحمل العبء، فسيتم فرض رسوم فقط على خدمات الترويج ذات القيمة المضافة بشكل مناسب في المستقبل. ستظل وظائف النشر والبحث والتواصل الأساسية مجانية بشكل دائم دائماً.

جدول الرسوم المضافة مسبقاً (خطة أولية فقط، مجانية بالكامل حالياً):
• اشتراك جناح المعرض: 1 دولار شهرياً;
• خدمة إدراج المنتج البارز: 0.01% من قيمة المنتج المعلنة لكل إدراج;
• البث على مستوى الموقع / إعلان مجمع لجميع المستخدمين: 0.1 دولار لكل إرسال.

التزام بتغيير الرسوم: سيتم الإعلان علناً عن أي عناصر رسوم جديدة أو تعديلات رسوم لجميع المستخدمين قبل 100 يوم من تاريخ السريان الفعلي عبر ثلاث قنوات: إشعار على الصفحة الرئيسية، بريد إلكتروني للمستخدم، وإشعار داخل الموقع، مما يوفر فترة عازلة كافية للمستخدمين للاختيار والتكيف أو ترحيل حساباتهم. لن تكون هناك رسوم مفاجئة فورية أو زيادات أسعار مخفية أبداً.

جميع المستخدمين مدعوون لتقديم اقتراحات الميزات وأفكار التحسين والتعليقات عبر البريد الإلكتروني. سأقوم بالمراجعة فوراً وسأستجيب في الوقت المناسب، مع إخبارك بوضوح ما إذا كان سيتم تنفيذ الاقتراح، أو شرح الأسباب بالتفصيل للتأخر إذا لم يكن قابلاً للتنفيذ فوراً.

تم تطوير المنصة وصيانتها بشكل مستقل من قبل شخص واحد فقط. مع طاقة محدودة، قد تحدث تأخيرات في الواجهة أو أخطاء طفيفة في بعض الأحيان. يتم تقدير تفهمك وتسامحك؛ عند تلقي تعليقات حول الأعطال أو الثغرات الأمنية، سأعطي الأولوية للتحقيق العاجل والإصلاحات التكرارية السريعة.

إشعار أمني مهم وإخلاء مسؤولية رسمي

تقتصر الخدمات الأساسية للمنصة على عرض المعلومات التجارية، والمطابقة الذكية للعرض والطلب، وعرض الشركات/المنتجات. نحن لا نتدخل في المعاملات الفعلية عبر الإنترنت أو خارج الإنترنت بين المشترين والبائعين. لا يمكن للمنصة التحقق الكامل من هويات جميع المستخدمين المسجلين أو المؤهلات المؤسسية أو مصداقية الأداء، ولا يمكنها ضمان أو دفع المدفوعات أو أداء الطلبات. جميع مفاوضات المعاملات وتحويلات الأموال وصياغة العقود وتنفيذ التسليمات يتم تحديدها بشكل مستقل من قبل الطرفين وتتحمل المسؤولية الكاملة.

عند التعاون مع تجار غير معروفين أو شركاء جدد، قم بإعطاء الأولوية لتدابير التحكم في المخاطر مثل خطابات الاعتماد وضمانات الأموال من طرف ثالث والتفتيش الموقعي خارج الإنترنت والعقود الرسمية الموثقة. كن حذراً مع الودائع المسبقة والتحويلات الخاصة، وتحقق بشكل استباقي من مؤهلات الشركاء لمنع الاحتيال التجاري.

في هذه المرحلة، الخدمة الوحيدة المدفوعة على المنصة هي اشتراك القيمة المضافة للجناح. لم يتم إطلاق التسوية الداخلية للأموال، وتوقيع العقود الإلكترونية الرسمية، والاحتفاظ بالمدفوعات وغيرها من وظائف المعاملات. لا تعمل المنصة كضامن للمعاملات ولا تتحمل أي مسؤولية عن النزاعات مثل الخروقات التجارية أو خسائر المدفوعات أو التناقضات في المنتجات.

ستستمر المنصة في التكرار على بنية النظام، وآليات مراجعة التحكم في المخاطر، وأدوات المطابقة الذكية لتحسين البيئة التجارية وتعزيز مصداقية المعلومات. شكراً لثقة كل مستخدم، ويرجى البقاء يقظين بشكل عقلاني وحذرين في كل تعاون تجاري.`,
      button: 'أنا أفهم'
    },
    ru: {
      title: 'О SeaHeart Global',
      content: `SeaHeart Global — это глобальная торговая платформа, независимо разработанная и поддерживаемая индивидуальным разработчиком. Изначально она была построена как личный многопродуктовый магазин. После глубокого опыта проблем основных B2B и B2C платформ — высоких комиссий за услуги, ограниченных разрешений на инструменты и чрезмерных ограничений правил — платформа была официально обновлена и преобразована в открытый публичный торговый рынок для глобальных пользователей.

Все основные функции платформы постоянно бесплатны: независимо от национальности, региона, языка или расы все торговцы, покупатели и специалисты по внешней торговле могут равноправно использовать базовые функции — бесплатная регистрация аккаунта, бесплатная публикация информации о спросе, предложении, закупках, инвестициях и сотрудничестве, бесплатный просмотр и поиск компаний и продуктов, бесплатное базовое сопоставление запросов. Базовые разделы никогда не будут взимать плату.

По мере расширения пользовательской базы платформы будут соответственно расти фиксированные расходы на аренду серверов, пропускную способность, техническое обслуживание и безопасность. Если индивидуальный разработчик больше не сможет нести эту нагрузку, в будущем будут взиматься только соответствующие комиссии за дополнительные рекламные услуги. Базовые функции публикации, поиска и базовой коммуникации всегда останутся постоянно бесплатными.

Предварительный график дополнительных услуг (только предварительный план, в настоящее время полностью бесплатно):
• Подписка на выставочный стенд: 1 доллар в месяц;
• Услуга размещения товаров в верхней части списка: 0,01% от объявленной стоимости товара за одно размещение;
• Общесайтовая рассылка / массовое объявление всем пользователям: 0,1 доллар за отправку.

Обязательство по изменению комиссий: Любые новые позиции взимания платы или корректировки комиссий будут публично объявлены всем пользователям за 100 дней до даты вступления в силу через три канала: уведомление на главной странице, электронная почта пользователю и внутриплатформенное уведомление, обеспечивая достаточный переходный период для выбора, адаптации или миграции аккаунтов. Никогда не будет внезапных скрытых платежей или скрытого повышения цен.

Все пользователи могут отправлять предложения по функциональности, идеи по оптимизации и отзывы по электронной почте. Я быстро рассмотрю и своевременно отвечу, четко сообщив, будет ли предложение реализовано, или подробно объясню причины задержки, если оно не может быть немедленно реализовано.

Платформа независимо разработана и поддерживается одним человеком. С ограниченной энергией иногда могут возникать задержки интерфейса или незначительные ошибки. Ценится ваше понимание и терпение; при получении отзывов о сбоях или уязвимостях я в первую очередь проведу срочное исследование и быстрые итерационные исправления.

Важное уведомление о безопасности и официальный отказ от ответственности

Основные услуги платформы ограничены отображением коммерческой информации, интеллектуальным сопоставлением спроса и предложения и продвижением компаний/продуктов. Мы не вмешиваемся в реальные онлайн или офлайн транзакции между покупателями и продавцами. Платформа не может полностью проверить личности всех зарегистрированных пользователей, корпоративные квалификации или кредитоспособность, а также не может гарантировать или обеспечить платежи или выполнение заказов. Все переговоры по транзакциям, переводы средств, составление договоров и исполнение поставок независимо принимаются обеими сторонами с полной ответственностью.

При сотрудничестве с незнакомыми торговцами или новыми партнерами в первую очередь используйте меры контроля риска, такие как аккредитивы, гарантии третьих лиц, выездная проверка на месте и официальные нотариально заверенные договоры. Будьте осторожны с предоплатами и частными переводами, а также активно проверяйте квалификацию партнеров для предотвращения торгового мошенничества.

На данном этапе единственная платная услуга на платформе — это дополнительная подписка на стенды. Внутренний расчет средств, официальное подписание электронных договоров, удержание платежей и другие транзакционные функции не запущены. Платформа не выступает гарантом транзакций и не несет ответственности за споры, такие как нарушения условий сделки, убытки по платежам или несоответствие товаров.

Платформа будет постоянно развиваться в архитектурном плане, механизмах проверки рисков и инструментах интеллектуального сопоставления для оптимизации торговой среды и повышения доверия к информации. Благодарим за доверие каждого пользователя и просим сохранять разумную бдительность и осторожность при любом коммерческом сотрудничестве.`,
      button: 'Я Понимаю'
    },
    pt: {
      title: 'Sobre SeaHeart Global',
      content: `SeaHeart Global é uma plataforma comercial global desenvolvida e mantida independentemente por um desenvolvedor individual. Foi inicialmente construída como uma loja pessoal de múltiplos produtos. Depois de experimentar profundamente os pontos problemáticos das plataformas B2B e B2C principais — altas taxas de serviço, permissões de ferramentas limitadas e restrições excessivas de regras — a plataforma foi oficialmente atualizada e transformada em um mercado comercial público aberto para usuários globais.

Todas as funções principais da plataforma são permanentemente gratuitas: independentemente de nacionalidade, região, idioma ou raça, todos os comerciantes, compradores e profissionais de comércio exterior podem usar as funções básicas de forma equitativa — registro de conta gratuito, publicação gratuita de informações de oferta, demanda, aquisição, investimento e cooperação, navegação e busca gratuitas de empresas e produtos, correspondência básica gratuita de consultas. As seções básicas nunca cobrarão taxas.

À medida que a base de usuários da plataforma continua a se expandir, os custos fixos, como aluguel de servidores, largura de banda, manutenção e segurança, aumentarão proporcionalmente. Se o desenvolvedor individual não puder mais suportar a carga, apenas os serviços promocionais de valor agregado serão cobrados adequadamente no futuro. As funções básicas de publicação, busca e comunicação básica sempre permanecerão permanentemente gratuitas.

Tabela de taxas de valor agregado predeterminada (apenas plano preliminar, atualmente totalmente gratuito):
• Assinatura de estande de exposição: $1 por mês;
• Serviço de listagem de produto em destaque: 0,01% do valor declarado do produto por listagem única;
• Transmissão em todo o site / anúncio em lote para todos os usuários: $0,1 por envio.

Compromisso com mudança de taxas: Quaisquer novos itens de taxa ou ajustes de taxas serão anunciados publicamente a todos os usuários 100 dias antes da data de vigência efetiva por meio de três canais: aviso na página inicial, e-mail do usuário e notificação no site, fornecendo um período de buffer suficiente para os usuários escolherem, se adaptarem ou migrarem suas contas. Nunca haverá cobranças surpresa repentinas ou aumentos de preços ocultos.

Todos os usuários são bem-vindos a enviar sugestões de recursos, ideias de otimização e feedback por e-mail. Vou revisar prontamente e responder em tempo hábil, informando claramente se a proposta será implementada ou explicando em detalhe as razões do atraso se não for imediatamente viável.

A plataforma é desenvolvida e mantida independentemente por uma única pessoa. Com energia limitada, podem ocorrer atrasos de interface ou pequenos bugs ocasionalmente. Sua compreensão e tolerância são apreciadas; ao receber feedback de falhas ou vulnerabilidades, priorizarei investigação urgente e correções iterativas rápidas.

Aviso de segurança importante e isenção de responsabilidade oficial

Os serviços principais da plataforma limitam-se à exibição de informações comerciais, correspondência inteligente entre oferta e demanda e exposição de empresas/produtos. Não intervimos em transações reais online ou offline entre compradores e vendedores. A plataforma não pode verificar totalmente as identidades de todos os usuários registrados, qualificações empresariais ou credibilidade de desempenho, e não pode garantir ou subscrever pagamentos ou desempenho de pedidos. Todas as negociações de transação, transferências de fundos, redação de contratos e cumprimento de entrega são decididos independentemente por ambas as partes e assumidos com total responsabilidade.

Ao cooperar com comerciantes desconhecidos ou novos parceiros, priorize medidas de controle de risco, como cartas de crédito, garantias de fundos de terceiros, inspeção presencial offline e contratos notariais formais. Tenha cautela com depósitos prévios e transferências privadas e verifique proativamente as qualificações dos parceiros para evitar fraudes comerciais.

Nesta fase, o único serviço pago na plataforma é a assinatura de valor agregado de estande. A liquidação interna de fundos, assinatura oficial de contratos eletrônicos, garantia de pagamento e outras funções de transação não foram lançadas. A plataforma não atua como garantidora de transações e não assume responsabilidade por disputas como violações de transações, perdas de pagamento ou discrepâncias de produtos.

A plataforma iterará continuamente na arquitetura do sistema, mecanismos de revisão de controle de risco e ferramentas de correspondência inteligente para otimizar o ambiente comercial e aumentar a credibilidade da informação. Obrigado pela confiança de cada usuário e permaneça racionalmente vigilante e cauteloso em cada cooperação comercial.`,
      button: 'Eu Entendo'
    },
    hi: {
      title: 'SeaHeart Global के बारे में',
      content: `SeaHeart Global एक वैश्विक व्यापार मंच है जो एक व्यक्तिगत डेवलपर द्वारा स्वतंत्र रूप से विकसित और अनुरक्षित है। इसे मूल रूप से व्यक्तिगत बहु-उत्पाद स्टोर के रूप में बनाया गया था। मुख्यधारा के B2B और B2C प्लेटफार्मों की समस्याओं — उच्च सेवा शुल्क, सीमित उपकरण अनुमतियां, और अत्यधिक नियम बाधाएं — को गहराई से अनुभव करने के बाद, प्लेटफार्म को आधिकारिक रूप से अपग्रेड किया गया और दुनिया भर के उपयोगकर्ताओं के लिए एक खुले सार्वजनिक व्यापार बाजार में बदल दिया गया।

प्लेटफार्म के सभी बुनियादी मुख्य कार्य स्थायी रूप से मुफ्त हैं: राष्ट्रीयता, क्षेत्र, भाषा या जाति की परवाह किए बिना, सभी व्यवसायी, खरीदार और विदेश व्यापार व्यवसायी बुनियादी सुविधाओं का समान रूप से उपयोग कर सकते हैं — मुफ्त खाता पंजीकरण, मुफ्त आपूर्ति, मांग, खरीद, निवेश और सहयोग की जानकारी पोस्ट करना, मुफ्त ब्राउज़िंग और कंपनियों और उत्पादों की खोज, मुफ्त बुनियादी पूछताछ मिलान। बुनियादी अनुभाग कभी कोई शुल्क नहीं लेंगे।

जैसे-जैसे प्लेटफार्म के उपयोगकर्ता आधार का विस्तार जारी रहेगा, वैसे-वैसे सर्वर किराया, बैंडविड्थ, रखरखाव और सुरक्षा जैसी कठोर लागतें तदनुसार बढ़ेंगी। यदि व्यक्तिगत डेवलपर बोझ को और वहन नहीं कर सकता है, तो भविष्य में केवल मूल्यवर्धित प्रोमोशनल सेवाओं को उचित रूप से चार्ज किया जाएगा। बुनियादी प्रकाशन, खोज और बुनियादी संचार कार्य हमेशा स्थायी रूप से मुफ्त रहेंगे।

पूर्व-निर्धारित मूल्यवर्धित शुल्क अनुसूची (केवल प्रारंभिक योजना, वर्तमान में पूरी तरह से मुफ्त):
• प्रदर्शनी बूस सदस्यता: $1 प्रति माह;
• विशेष उत्पाद सूचीकरण सेवा: एक सूचीकरण per घोषित उत्पाद मूल्य का 0.01%;
• साइट-विस्तृत प्रसारण / सभी उपयोगकर्ताओं को बैच घोषणा: $0.1 प्रति प्रेषण।

शुल्क परिवर्तन प्रतिबद्धता: कोई भी नई शुल्क मद या शुल्क समायोजन प्रभावी तिथि से 100 दिन पहले तीन चैनलों के माध्यम से सभी उपयोगकर्ताओं को सार्वजनिक रूप से घोषित किया जाएगा: होमपेज नोटिस, उपयोगकर्ता ईमेल, और साइट में अधिसूचना, उपयोगकर्ताओं को चुनने, अनुकूलित करने या अपने खातों को माइग्रेट करने के लिए पर्याप्त बफर अवधि प्रदान करेगा। कभी भी अचानक आश्चर्यजनक शुल्क या छिपी कीमत वृद्धि नहीं होगी।

सभी उपयोगकर्ताओं को ईमेल के माध्यम से सुविधा सुझाव, अनुकूलन विचार और प्रतिक्रिया भेजने के लिए आमंत्रित किया जाता है। मैं तुरंत समीक्षा करूंगा और समय पर जवाब दूंगा, स्पष्ट रूप से बताऊंगा कि क्या प्रस्ताव लागू किया जाएगा, या विलंबित समायोजन के कारणों को विस्तार से बताऊंगा यदि यह तुरंत व्यवहार्य नहीं है।

प्लेटफार्म एक व्यक्ति द्वारा स्वतंत्र रूप से विकसित और अनुरक्षित है। सीमित ऊर्जा के साथ, कभी-कभी इंटरफ़ेस विलंब या छोटे बग हो सकते हैं। आपकी समझ और सहिष्णुता की सराहना की जाती है; फॉल्ट या कमजोरी प्रतिक्रिया प्राप्त होने पर, मैं तुरंत जांच और तीव्र पुनरावृत्ति सुधार को प्राथमिकता दूंगा।

महत्वपूर्ण सुरक्षा सूचना और आधिकारिक अस्वीकरण

प्लेटफार्म की मुख्य सेवाएं वाणिज्यिक जानकारी प्रदर्शन, बुद्धिमान आपूर्ति-मांग मिलान, और कंपनियों/उत्पादों के प्रदर्शन तक सीमित हैं। हम खरीदारों और विक्रेताओं के बीच वास्तविक ऑनलाइन या ऑफलाइन लेनदेन में हस्तक्षेप नहीं करते हैं। प्लेटफार्म सभी पंजीकृत उपयोगकर्ताओं की पहचान, उद्यम योग्यता या प्रदर्शन विश्वसनीयता की पूरी तरह से पुष्टि नहीं कर सकता है, और भुगतान या ऑर्डर प्रदर्शन की गारंटी या बैकस्टॉप नहीं कर सकता है। सभी लेनदेन बातचीत, निधि हस्तांतरण, अनुबंध मसौदा तैयारी, और वितरण पूर्ति दोनों पक्षों द्वारा स्वतंत्र रूप से निर्णय ली जाती है और पूरी तरह से जोखिम वहन की जाती है।

अज्ञात व्यवसायियों या नए भागीदारों के साथ सहयोग करते समय, क्रेडिट पत्र, तृतीय-पक्ष निधि गारंटी, ऑफलाइन साइट पर निरीक्षण, और औपचारिक नोटरीकृत अनुबंध जैसे जोखिम नियंत्रण उपायों को प्राथमिकता दें। पूर्व भुगतान जमा और निजी हस्तांतरण के साथ सावधान रहें, और व्यापार धोखाधड़ी को रोकने के लिए भागीदार योग्यताओं की सक्रिय रूप से पुष्टि करें।

इस चरण में, प्लेटफार्म पर एकमात्र भुगतान सेवा बूथ मूल्यवर्धित सदस्यता है। आंतरिक निधि निपटान, आधिकारिक इलेक्ट्रॉनिक अनुबंध हस्ताक्षर, भुगतान एस्क्रो, और अन्य लेनदेन सुविधाएं लॉन्च नहीं की गई हैं। प्लेटफार्म लेनदेन गारंटर के रूप में कार्य नहीं करता है और लेनदेन उल्लंघन, भुगतान हानि, या उत्पाद बेमेल जैसे विवादों के लिए कोई जिम्मेदारी नहीं लेता है।

प्लेटफार्म सिस्टम वास्तुकला, जोखिम नियंत्रण समीक्षा तंत्र, और बुद्धिमान मिलान उपकरणों पर निरंतर पुनरावृत्ति करेगी ताकि व्यापार वातावरण को अनुकूलित किया जा सके और सूचना विश्वसनीयता बढ़ाई जा सके। हर उपयोगकर्ता के विश्वास के लिए धन्यवाद, और कृपया हर व्यापार सहयोग में तर्कसंगत रूप से सतर्क और सावधान रहें।`,
      button: 'मैं समझता/समझती हूं'
    },
    th: {
      title: 'เกี่ยวกับ SeaHeart Global',
      content: `SeaHeart Global เป็นแพลตฟอร์มการค้าโลกที่พัฒนาและดูแลโดยนักพัฒนาแต่เพียงผู้เดียว เดิมสร้างเป็นร้านค้าหลายผลิตภัณฑ์ส่วนตัว หลังจากได้สัมผัสปัญหาของแพลตฟอร์ม B2B และ B2C หลัก — ค่าบริการสูง สิทธิ์เครื่องมือจำกัด และข้อจำกัดกฎเกณฑ์ที่มากเกินไป — แพลตฟอร์มได้รับการอัปเกรดอย่างเป็นทางการและเปลี่ยนเป็นตลาดการค้าสาธารณะแบบเปิดสำหรับผู้ใช้ทั่วโลก

ฟังก์ชันหลักทั้งหมดของแพลตฟอร์มฟรีถาวร: ไม่ว่าจะสัญชาติ ภาษา เชื้อชาติ หรือพื้นที่ ผู้ค้า ผู้ซื้อ และผู้ประกอบการค้าต่างประเทศทุกคนสามารถใช้ฟังก์ชันพื้นฐานได้อย่างเท่าเทียมกัน — สมัครบัญชีฟรี โพสต์ข้อมูลอุปทาน อุปสงค์ การจัดหา การลงทุน และความร่วมมือฟรี ค้นหาและเรียกดูบริษัทและผลิตภัณฑ์ฟรี การจับคู่สอบถามพื้นฐานฟรี ส่วนพื้นฐานจะไม่เรียกเก็บค่าใดๆ

เมื่อฐานผู้ใช้ของแพลตฟอร์มขยายตัวต่อไป ค่าใช้จ่ายคงที่ เช่าเซิร์ฟเวอร์ แบนด์วิดท์ การดูแลและความปลอดภัยจะเพิ่มขึ้นตามสัดส่วน หากนักพัฒนาแต่เพียงผู้เดียวไม่สามารถรับภาระได้อีกต่อไป จะเรียกเก็บเฉพาะบริการส่งเสริมการขายที่มีมูลค่าเพิ่มอย่างเหมาะสมในอนาคต ฟังก์ชันการโพสต์ การค้นหา และการสื่อสารพื้นฐานจะยังคงฟรีถาวรเสมอ

ตารางค่าบริการมูลค่าเพิ่มที่กำหนดไว้ล่วงหน้า (เฉพาะแผนเบื้องต้น ปัจจุบันฟรีทั้งหมด):
• การสมัครสมาชิกบูธแสดงงาน: $1 ต่อเดือน;
• บริการรายการผลิตภัณฑ์แนะนำ: 0.01% ของมูลค่าผลิตภัณฑ์ที่ประกาศต่อรายการเดียว;
• การส่งข้อความทั่วทั้งเว็บไซต์ / การประกาศชุดให้ผู้ใช้ทุกคน: $0.1 ต่อการส่ง

คำมั่นสัญญาเรื่องการเปลี่ยนแปลงค่าใช้จ่าย: รายการค่าใช้จ่ายใหม่หรือการปรับค่าใช้จ่ายใดๆ จะได้รับการประกาศสาธารณะให้ผู้ใช้ทุกคนทราบล่วงหน้า 100 วันก่อนวันมีผลบังคับใช้ ผ่านช่องทาง 3 ช่องทาง: แจ้งบนหน้าแรก อีเมลผู้ใช้ และการแจ้งเตือนในเว็บไซต์ ซึ่งให้ระยะเวลาบัฟเฟอร์เพียงพอสำหรับผู้ใช้ในการเลือก ปรับตัว หรือย้ายบัญชี จะไม่มีการเรียกเก็บค่าใช้จ่ายอย่างกะทันหันหรือการเพิ่มราคาที่ซ่อนเร้น

ผู้ใช้ทุกคนยินดีที่จะส่งข้อเสนอแนะฟีเจอร์ แนวคิดการปรับปรุง และข้อเสนอแนะผ่านอีเมล ฉันจะตรวจสอบทันทีและตอบกลับทันที แจ้งอย่างชัดเจนว่าข้อเสนอจะถูกนำไปใช้หรือไม่ หรืออธิบายเหตุผลของความล่าช้าโดยละเอียดหากไม่สามารถดำเนินการได้ทันที

แพลตฟอร์มได้รับการพัฒนาและดูแลโดยคนเพียงคนเดียว ด้วยพลังงานที่จำกัด อาจมีปัญหาความล่าช้าในอินเทอร์เฟซหรือบั๊กเล็กๆ บางครั้ง ขอขอบคุณสำหรับความเข้าใจและความอดทนของคุณ เมื่อได้รับข้อเสนอแนะเกี่ยวกับความเสียหายหรือช่องโหว่ ฉันจะจัดลำดับความสำคัญของการตรวจสอบอย่างเร่งด่วนและการแก้ไขแบบวนซ้ำอย่างรวดเร็ว

คำเตือนด้านความปลอดภัยที่สำคัญและข้อจำกัดความรับผิดชอบอย่างเป็นทางการ

บริการหลักของแพลตฟอร์มจำกัดอยู่ที่การแสดงข้อมูลเชิงพาณิชย์ การจับคู่อุปทาน-อุปสงค์อย่างชาญฉลาด และการนำเสนอบริษัท/ผลิตภัณฑ์ เราไม่แทรกแซงการทำธุรกรรมจริงทางออนไลน์หรือออฟไลน์ระหว่างผู้ซื้อและผู้ขาย แพลตฟอร์มไม่สามารถตรวจสอบยืนยันตัวตนของผู้ใช้ทุกคนที่ลงทะเบียน คุณวุฒิทางองค์กร หรือความน่าเชื่อถือของการปฏิบัติงานได้อย่างสมบูรณ์ และไม่สามารถรับประกันหรือรับผิดชอบค่าชำระหรือการปฏิบัติตามคำสั่งซื้อได้ การเจรจาธุรกรรม การโอนเงิน การร่างสัญญา และการปฏิบัติการจัดส่งทั้งหมดได้รับการตัดสินใจโดยคู่กรณีอย่างอิสระและรับผิดชอบความเสี่ยงอย่างเต็มที่

เมื่อทำงานร่วมกับผู้ค้าที่ไม่คุ้นเคยหรือพาร์ทเนอร์ใหม่ ให้จัดลำดับความสำคัญของมาตรการควบคุมความเสี่ยง เช่น เลตเตอร์ออฟเครดิต การรับประกันเงินจากบุคคลที่สาม การตรวจสอบสถานที่ออฟไลน์ และสัญญาที่รับรองโดยทนายความ ขอให้ระมัดระวังเกี่ยวกับเงินฝากล่วงหน้าและการโอนเงินส่วนตัว และตรวจสอบคุณวุฒิของพาร์ทเนอร์อย่างแข็งขันเพื่อป้องกันการฉ้อโกงทางการค้า

ในขั้นตอนนี้ บริการที่ต้องชำระเพียงอย่างเดียวบนแพลตฟอร์มคือการสมัครสมาชิกมูลค่าเพิ่มของบูธ การชำระเงินภายใน การลงนามสัญญาอิเล็กทรอนิกส์อย่างเป็นทางการ การคงเงินชำระ และฟังก์ชันธุรกรรมอื่นๆ ยังไม่ได้เปิดตัว แพลตฟอร์มไม่ทำหน้าที่เป็นผู้ค้ำประกันธุรกรรมและไม่รับผิดชอบต่อข้อพิพาท เช่น การละเมิดธุรกรรม การสูญเสียการชำระเงิน หรือความไม่ตรงกันของผลิตภัณฑ์

แพลตฟอร์มจะดำเนินการวนซ้ำอย่างต่อเนื่องเกี่ยวกับสถาปัตยกรรมระบบ กลไกการตรวจสอบควบคุมความเสี่ยง และเครื่องมือจับคู่ที่ชาญฉลาดเพื่อปรับสภาพแวดล้อมการค้าและเพิ่มความน่าเชื่อถือของข้อมูล ขอขอบคุณสำหรับความไว้วางใจของผู้ใช้ทุกคน และขอให้ระมัดระวังและมีวิจารณญาณในการทำงานร่วมกันทางการค้าทุกครั้ง`,
      button: 'ฉันเข้าใจ'
    },
    vi: {
      title: 'Về SeaHeart Global',
      content: `SeaHeart Global là một nền tảng thương mại toàn cầu được phát triển và duy trì độc lập bởi một nhà phát triển cá nhân. Ban đầu được xây dựng như một cửa hàng đa sản phẩm cá nhân. Sau khi trải nghiệm sâu sắc các điểm đau của các nền tảng B2B và B2C chính thống — phí dịch vụ cao, quyền công cụ hạn chế và ràng buộc quy định quá mức — nền tảng đã được nâng cấp chính thức và biến đổi thành thị trường thương mại công cộng mở cho người dùng toàn cầu.

Tất cả các chức năng cốt lõi cơ bản của nền tảng đều miễn phí vĩnh viễn: bất kể quốc gia, khu vực, ngôn ngữ hay chủng tộc, tất cả thương nhân, người mua và người làm thương mại nước ngoài đều có thể sử dụng các chức năng cơ bản một cách bình đẳng — đăng ký tài khoản miễn phí, đăng thông tin cung ứng, cầu mua, đầu tư và hợp tác miễn phí, duyệt và tìm kiếm doanh nghiệp và sản phẩm miễn phí, kết nối yêu cầu cơ bản miễn phí. Các phần cơ bản sẽ không bao giờ thu phí.

Khi cơ sở người dùng của nền tảng tiếp tục mở rộng, các chi phí cứng như thuê máy chủ, băng thông, bảo trì và bảo mật sẽ tăng lên tương ứng. Nếu nhà phát triển cá nhân không còn có thể gánh chịu gánh nặng, chỉ các dịch vụ quảng bá giá trị gia tăng sẽ được thu phí phù hợp trong tương lai. Các chức năng đăng, tìm kiếm và giao tiếp cơ bản sẽ luôn miễn phí vĩnh viễn.

Lịch phí dịch vụ giá trị gia tăng đặt trước (chỉ là kế hoạch sơ bộ, hiện tại hoàn toàn miễn phí):
• Đăng ký gian hàng triển lãm: $1 mỗi tháng;
• Dịch vụ liệt kê sản phẩm nổi bật: 0.01% giá trị sản phẩm khai báo cho mỗi lần liệt kê;
• Phát sóng toàn trang web / thông báo hàng loạt cho tất cả người dùng: $0.1 mỗi lần gửi.

Cam kết thay đổi phí: Bất kỳ mặt hàng phí mới hoặc điều chỉnh phí nào sẽ được thông báo công khai cho tất cả người dùng 100 ngày trước ngày hiệu lực thực tế qua ba kênh: thông báo trên trang chủ, email người dùng và thông báo trong trang web, cung cấp đủ thời gian đệm để người dùng lựa chọn, thích ứng hoặc di chuyển tài khoản. Sẽ không bao giờ có phí bất ngờ đột ngột hoặc tăng giá ẩn.

Tất cả người dùng được chào đón gửi đề xuất tính năng, ý tưởng tối ưu hóa và phản hồi qua email. Tôi sẽ xem xét kịp thời và trả lời đúng thời điểm, thông báo rõ ràng liệu đề xuất sẽ được thực hiện hay giải thích chi tiết lý do trì hoãn nếu không thể thực hiện ngay.

Nền tảng được phát triển và duy trì độc lập bởi một người duy nhất. Với năng lượng hạn chế, đôi khi có thể xảy ra độ trễ giao diện hoặc lỗi nhỏ. Sự hiểu biết và tha thứ của bạn được đánh giá cao; khi nhận được phản hồi về lỗi hoặc lỗ hổng, tôi sẽ ưu tiên điều tra khẩn cấp và sửa chữa lặp lại nhanh chóng.

Thông báo an toàn quan trọng và tuyên bố miễn trừ trách nhiệm chính thức

Các dịch vụ cốt lõi của nền tảng được giới hạn trong hiển thị thông tin thương mại, kết nối cung-cầu thông minh và tiếp xúc doanh nghiệp/sản phẩm. Chúng tôi không can thiệp vào các giao dịch thực tế trực tuyến hoặc ngoại tuyến giữa người mua và người bán. Nền tảng không thể xác minh hoàn toàn danh tính của tất cả người dùng đăng ký, trình độ doanh nghiệp hoặc uy tín hiệu suất, và không thể đảm bảo hoặc bảo lãnh thanh toán hoặc thực hiện đơn hàng. Tất cả đàm phán giao dịch, chuyển tiền, soạn thảo hợp đồng và thực hiện giao hàng được quyết định độc lập và gánh chịu rủi ro hoàn toàn bởi cả hai bên.

Khi hợp tác với thương nhân không quen biết hoặc đối tác mới, hãy ưu tiên các biện pháp kiểm soát rủi ro như thư tín dụng, bảo lãnh tiền từ bên thứ ba, kiểm tra tại chỗ ngoại tuyến và hợp đồng công chứng chính thức. Hãy thận trọng với tiền đặt cọc trước và chuyển khoản riêng, và chủ động xác minh trình độ đối tác để ngăn chặn gian lận thương mại.

Ở giai đoạn này, dịch vụ duy nhất bị thu phí trên nền tảng là đăng ký giá trị gia tăng gian hàng. Thanh toán nội bộ, ký kết hợp đồng điện tử chính thức, giữ tiền thanh toán và các chức năng giao dịch khác chưa được triển khai. Nền tảng không hoạt động như một bên bảo lãnh giao dịch và không chịu trách nhiệm về các tranh chấp như vi phạm giao dịch, mất thanh toán hoặc sản phẩm không phù hợp.

Nền tảng sẽ liên tục lặp lại kiến trúc hệ thống, cơ chế xem xét kiểm soát rủi ro và công cụ kết nối thông minh để tối ưu hóa môi trường thương mại và nâng cao độ tin cậy thông tin. Cảm ơn sự tin tưởng của mỗi người dùng, và xin hãy luôn tỉnh táo và thận trọng trong mỗi hợp tác thương mại`,
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