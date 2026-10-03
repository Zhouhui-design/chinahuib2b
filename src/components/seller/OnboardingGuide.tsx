'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, X, HelpCircle, Lock, Store, Building2, Package, Settings, ClipboardList } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

type Step = {
  id: string
  number: number
  link: string
  status: 'completed' | 'current' | 'locked' | 'available'
}

type OnboardingGuideProps = {
  onClose: () => void
  inline?: boolean
}

// 展会创建的正确顺序：
// 1. settings  -> 完善公司资料
// 2. store     -> 完善公司店铺（第1、2步完成并审核通过后，公司才能被买家查看）
// 3. booths    -> 创建展会（一个公司可创建多个展会）
// 4. products  -> 创建单品并分配到展会
const STEP_LINKS = ['/seller/settings', '/seller/store', '/seller/booths', '/seller/products']

export default function OnboardingGuide({ onClose, inline = false }: OnboardingGuideProps) {
  const language = useSellerLanguage()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [profileStatus, setProfileStatus] = useState<string>('DRAFT')
  const [loadingStatus, setLoadingStatus] = useState(true)

  // 拉取真实审核状态（用于判断第1、2步是否真正完成）
  useEffect(() => {
    let mounted = true
    fetch('/api/seller/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (mounted && data?.profile?.profileStatus) {
          setProfileStatus(data.profile.profileStatus)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingStatus(false)
      })
    return () => { mounted = false }
  }, [])

  // 文案
  const t = {
    title: language === 'zh' ? '展会创建流程' :
           language === 'de' ? 'Messe-Erstellung' :
           language === 'es' ? 'Creación de feria' :
           language === 'fr' ? 'Création de salon' :
           language === 'ja' ? '展示会の作成' :
           language === 'ko' ? '박람회 생성' :
           language === 'pt' ? 'Criação de feira' :
           language === 'ru' ? 'Создание выставки' :
           'Booth Creation Steps',
    subtitle: language === 'zh' ? '请按顺序完成以下步骤' :
              language === 'de' ? 'Bitte führen Sie die Schritte in dieser Reihenfolge aus' :
              language === 'es' ? 'Complete los pasos en orden' :
              language === 'fr' ? 'Veuillez suivre les étapes dans l\'ordre' :
              language === 'ja' ? '以下の手順を順番に完了してください' :
              language === 'ko' ? '아래 단계를 순서대로 완료하세요' :
              language === 'pt' ? 'Complete as etapas na ordem' :
              language === 'ru' ? 'Выполните шаги по порядку' :
              'Complete the steps in order',
    step1_title: language === 'zh' ? '完善公司资料' :
                 language === 'de' ? 'Unternehmensdaten vervollständigen' :
                 language === 'es' ? 'Completar datos de la empresa' :
                 language === 'fr' ? 'Compléter les informations société' :
                 language === 'ja' ? '会社情報を完成させる' :
                 language === 'ko' ? '회사 정보 완성' :
                 language === 'pt' ? 'Completar dados da empresa' :
                 language === 'ru' ? 'Заполнить данные компании' :
                 'Complete company profile',
    step1_desc: language === 'zh' ? '填写公司名称、联系方式、地址等基本信息。' :
                language === 'de' ? 'Füllen Sie Firmenname, Kontakt und Adresse aus.' :
                language === 'es' ? 'Complete nombre, contacto y dirección de la empresa.' :
                language === 'fr' ? 'Renseignez le nom, les contacts et l\'adresse.' :
                language === 'ja' ? '会社名、連絡先、住所などの基本情報を入力します。' :
                language === 'ko' ? '회사명, 연락처, 주소 등 기본 정보를 입력합니다.' :
                language === 'pt' ? 'Preencha nome, contato e endereço da empresa.' :
                language === 'ru' ? 'Заполните название, контакты и адрес компании.' :
                'Fill in company name, contact details, and address.',
    step2_title: language === 'zh' ? '完善公司店铺' :
                 language === 'de' ? 'Store-Profil vervollständigen' :
                 language === 'es' ? 'Completar tienda' :
                 language === 'fr' ? 'Compléter la boutique' :
                 language === 'ja' ? 'ストアを完成させる' :
                 language === 'ko' ? '스토어 완성' :
                 language === 'pt' ? 'Completar loja' :
                 language === 'ru' ? 'Заполнить магазин' :
                 'Complete your store',
    step2_desc: language === 'zh' ? '设置店铺 Logo、介绍等。第 1、2 步完成并审核通过后，您的公司才会被买家查看。' :
                language === 'de' ? 'Richten Sie Logo und Beschreibung ein. Erst nach Bestätigung von Schritt 1 & 2 wird Ihr Unternehmen für Käufer sichtbar.' :
                language === 'es' ? 'Configure el logo y la descripción. Su empresa será visible para los compradores solo tras aprobar los pasos 1 y 2.' :
                language === 'fr' ? 'Définissez le logo et la description. Votre société ne sera visible qu\'après validation des étapes 1 et 2.' :
                language === 'ja' ? 'ロゴと説明を設定します。手順1・2が承認されて初めて、会社がバイヤーに表示されます。' :
                language === 'ko' ? '로고와 설명을 설정합니다. 1·2단계가 승인되어야 회사가 구매자에게 표시됩니다.' :
                language === 'pt' ? 'Configure o logotipo e a descrição. Sua empresa só fica visível após aprovação das etapas 1 e 2.' :
                language === 'ru' ? 'Настройте логотип и описание. Компания станет видна покупателям только после одобрения шагов 1 и 2.' :
                'Set up your logo and description. Your company becomes visible to buyers only after steps 1 & 2 are approved.',
    step3_title: language === 'zh' ? '创建展会' :
                 language === 'de' ? 'Messe erstellen' :
                 language === 'es' ? 'Crear feria' :
                 language === 'fr' ? 'Créer le salon' :
                 language === 'ja' ? '展示会を作成' :
                 language === 'ko' ? '박람회 생성' :
                 language === 'pt' ? 'Criar feira' :
                 language === 'ru' ? 'Создать выставку' :
                 'Create your booth',
    step3_desc: language === 'zh' ? '一个公司可以创建多个展会。创建并发布您的线上展会。' :
                language === 'de' ? 'Ein Unternehmen kann mehrere Messen erstellen. Erstellen und veröffentlichen Sie Ihre Online-Messe.' :
                language === 'es' ? 'Una empresa puede crear varias ferias. Cree y publique su feria en línea.' :
                language === 'fr' ? 'Une société peut créer plusieurs salons. Créez et publiez votre salon en ligne.' :
                language === 'ja' ? '1つの会社で複数の展示会を作成できます。オンライン展示会を作成・公開しましょう。' :
                language === 'ko' ? '하나의 회사에서 여러 박람회를 만들 수 있습니다. 온라인 박람회를 만들고 게시하세요.' :
                language === 'pt' ? 'Uma empresa pode criar várias feiras. Crie e publique sua feira online.' :
                language === 'ru' ? 'Одна компания может создать несколько выставок. Создайте и опубликуйте свою онлайн-выставку.' :
                'A company can create multiple booths. Create and publish your online booth.',
    step4_title: language === 'zh' ? '创建单品并分配' :
                 language === 'de' ? 'Produkte erstellen & zuordnen' :
                 language === 'es' ? 'Crear y asignar productos' :
                 language === 'fr' ? 'Créer et affecter les produits' :
                 language === 'ja' ? '商品を作成して割り当て' :
                 language === 'ko' ? '상품 생성 및 할당' :
                 language === 'pt' ? 'Criar e atribuir produtos' :
                 language === 'ru' ? 'Создать и назначить товары' :
                 'Create & assign products',
    step4_desc: language === 'zh' ? '创建单品并分配到您的展会中展示。' :
                language === 'de' ? 'Erstellen Sie Produkte und ordnen Sie sie Ihrer Messe zu.' :
                language === 'es' ? 'Cree productos y asígnelos a su feria.' :
                language === 'fr' ? 'Créez des produits et affectez-les à votre salon.' :
                language === 'ja' ? '商品を作成し、展示会に割り当てて展示します。' :
                language === 'ko' ? '상품을 만들고 박람회에 할당하여 전시합니다.' :
                language === 'pt' ? 'Crie produtos e atribua-os à sua feira.' :
                language === 'ru' ? 'Создайте товары и назначьте их на выставку.' :
                'Create products and assign them to your booth.',
    locked: language === 'zh' ? '需先完成前面的步骤' :
            language === 'de' ? 'Bitte zuerst die vorherigen Schritte abschließen' :
            language === 'es' ? 'Complete primero los pasos anteriores' :
            language === 'fr' ? 'Terminez d\'abord les étapes précédentes' :
            language === 'ja' ? '前の手順を先に完了してください' :
            language === 'ko' ? '이전 단계를 먼저 완료하세요' :
            language === 'pt' ? 'Conclua primeiro as etapas anteriores' :
            language === 'ru' ? 'Сначала завершите предыдущие шаги' :
            'Complete previous steps first',
    approved: language === 'zh' ? '审核通过' :
              language === 'de' ? 'Genehmigt' :
              language === 'es' ? 'Aprobado' :
              language === 'fr' ? 'Approuvé' :
              language === 'ja' ? '承認済み' :
              language === 'ko' ? '승인됨' :
              language === 'pt' ? 'Aprovado' :
              language === 'ru' ? 'Одобрено' :
              'Approved',
    pending: language === 'zh' ? '审核中' :
             language === 'de' ? 'In Prüfung' :
             language === 'es' ? 'En revisión' :
             language === 'fr' ? 'En cours de validation' :
             language === 'ja' ? '審査中' :
             language === 'ko' ? '검토 중' :
             language === 'pt' ? 'Em análise' :
             language === 'ru' ? 'На проверке' :
             'Under review',
    draft: language === 'zh' ? '待完善' :
           language === 'de' ? 'Entwurf' :
           language === 'es' ? 'Borrador' :
           language === 'fr' ? 'Brouillon' :
           language === 'ja' ? '下書き' :
           language === 'ko' ? '초안' :
           language === 'pt' ? 'Rascunho' :
           language === 'ru' ? 'Черновик' :
           'Draft',
    rejected: language === 'zh' ? '被拒绝' :
              language === 'de' ? 'Abgelehnt' :
              language === 'es' ? 'Rechazado' :
              language === 'fr' ? 'Rejeté' :
              language === 'ja' ? '却下' :
              language === 'ko' ? '거부됨' :
              language === 'pt' ? 'Rejeitado' :
              language === 'ru' ? 'Отклонено' :
              'Rejected',
    currentStep: language === 'zh' ? '当前步骤' :
                 language === 'de' ? 'Aktueller Schritt' :
                 language === 'es' ? 'Paso actual' :
                 language === 'fr' ? 'Étape actuelle' :
                 language === 'ja' ? '現在のステップ' :
                 language === 'ko' ? '현재 단계' :
                 language === 'pt' ? 'Etapa atual' :
                 language === 'ru' ? 'Текущий шаг' :
                 'Current step',
    progressLabel: language === 'zh' ? '完成进度' :
                   language === 'de' ? 'Fortschritt' :
                   language === 'es' ? 'Progreso' :
                   language === 'fr' ? 'Progression' :
                   language === 'ja' ? '進捗' :
                   language === 'ko' ? '진행 상황' :
                   language === 'pt' ? 'Progresso' :
                   language === 'ru' ? 'Прогресс' :
                   'Progress',
  }

  // 判定第1、2步是否"已完成并通过审核"
  const profileApproved = profileStatus === 'APPROVED'
  const profileUnderReview = profileStatus === 'PENDING'

  // 步骤文案与图标
  const stepDefs = [
    { icon: Settings, title: t.step1_title, desc: t.step1_desc },
    { icon: Store, title: t.step2_title, desc: t.step2_desc },
    { icon: Building2, title: t.step3_title, desc: t.step3_desc },
    { icon: Package, title: t.step4_title, desc: t.step4_desc },
  ]

  // 计算当前进行的步骤索引（基于当前路由）
  const currentRouteIndex = STEP_LINKS.findIndex(p => pathname === p || pathname.startsWith(p + '/'))
  const routeIndex = currentRouteIndex >= 0 ? currentRouteIndex : 0

  // 引导式逐步推进：真正的"完成"以 profileStatus === APPROVED 为准，
  // 但为了让用户能一路操作下去，我们用路由 + 审核状态结合判断。
  // 步骤状态：
  //  - 第1步(settings)、第2步(store)：由 profileStatus 判定是否完成
  //  - 第3、4步：允许访问（一个公司可创建多个展会/产品），不强制锁定
  const steps: Step[] = stepDefs.map((def, i) => {
    let status: Step['status'] = 'available'
    if (i === 0) {
      // 第1步：资料已通过审核 => completed；否则是当前要做的步骤
      status = profileApproved ? 'completed' : 'current'
    } else if (i === 1) {
      // 第2步：店铺随资料一起审核，profileStatus 通过即代表前两步完成
      status = profileApproved ? 'completed' : (routeIndex >= 1 ? 'current' : 'locked')
    } else if (i === 2) {
      // 第3步：创建展会（前置需审核通过）
      status = profileApproved ? (routeIndex === 2 ? 'current' : 'available') : 'locked'
    } else {
      // 第4步：创建/分配产品
      status = profileApproved ? (routeIndex === 3 ? 'current' : 'available') : 'locked'
    }
    return { id: def.title, number: i + 1, link: STEP_LINKS[i] as string, status }
  })

  const completedCount = steps.filter(s => s.status === 'completed').length
  const progress = Math.round((completedCount / steps.length) * 100)

  const statusBadge = (() => {
    if (loadingStatus) return null
    if (profileApproved) return { text: t.approved, cls: 'bg-green-100 text-green-700' }
    if (profileUnderReview) return { text: t.pending, cls: 'bg-amber-100 text-amber-700' }
    if (profileStatus === 'REJECTED') return { text: t.rejected, cls: 'bg-red-100 text-red-700' }
    return { text: t.draft, cls: 'bg-gray-100 text-gray-600' }
  })()

  if (!isExpanded) {
    if (inline) {
      return (
        <div className="w-48 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg border border-blue-200 flex items-center justify-center space-x-2 transition-all"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-sm font-medium">{t.title}</span>
          </button>
        </div>
      )
    }
    return (
      <div className="fixed left-4 bottom-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    )
  }

  const containerClasses = inline
    ? 'w-72 flex-shrink-0 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[calc(100vh-6rem)] overflow-y-auto'
    : 'fixed left-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto'

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base flex items-center">
            <ClipboardList className="w-4 h-4 mr-1.5" />
            {t.title}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs opacity-90">{t.subtitle}</p>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-xs opacity-90 flex items-center justify-between">
          <span>{t.progressLabel}: {completedCount}/{steps.length}</span>
          {statusBadge && (
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${statusBadge.cls}`}>
              {statusBadge.text}
            </span>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="p-3 space-y-2">
        {steps.map((step, i) => {
          const def = stepDefs[i]!
          const Icon = def.icon
          const isLocked = step.status === 'locked'
          const isCurrent = step.status === 'current'
          const isCompleted = step.status === 'completed'

          const inner = (
            <>
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-gray-300" />
                ) : (
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isCurrent ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'
                  }`}>
                    {step.number}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    isLocked ? 'text-gray-400' : isCompleted ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    <span className="text-xs text-blue-500 mr-1">步骤{step.number}</span>
                    {def.title}
                  </span>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isLocked ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{def.desc}</p>
                {isLocked && (
                  <span className="inline-block mt-1 text-[11px] text-gray-400 italic">{t.locked}</span>
                )}
                {isCurrent && (
                  <span className="inline-block mt-1 text-[11px] text-blue-600 font-medium">{t.currentStep}</span>
                )}
              </div>
              {!isLocked && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </>
          )

          const containerCls = `flex items-start gap-2 p-2.5 rounded-lg border transition-all ${
            isCurrent
              ? 'border-blue-500 bg-blue-50'
              : isCompleted
              ? 'border-green-200 bg-green-50'
              : isLocked
              ? 'border-gray-100 bg-gray-50 opacity-70'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`

          if (isLocked) {
            return <div key={step.id} className={containerCls}>{inner}</div>
          }
          return <Link key={step.id} href={step.link} className={containerCls}>{inner}</Link>
        })}
      </div>
    </div>
  )
}
