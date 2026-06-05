'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type Agent = {
  id: string
  name: string
  description?: string
  capabilities: string[]
  status: string
  createdAt: string
  lastActiveAt: string | null
}

type AuditLog = {
  id: string
  action: string
  status: string
  reason: string | null
  details: string | null
  createdAt: string
  ipAddress: string | null
}

export default function AIManagementPage() {
  const { data: session } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    capabilities: [] as string[],
  })
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAgents()
    }
  }, [session?.user?.id])

  const fetchAgents = async () => {
    if (!session?.user?.id) return
    setLoadingAgents(true)
    try {
      const res = await fetch(`/api/ai/agents?ownerId=${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.agents) {
          setAgents(data.data.agents)
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoadingAgents(false)
    }
  }

  const capabilityOptions = [
    'manage_products',
    'manage_booth',
    'chat',
    'post_auction',
    'send_shout_out',
    'query_products',
    'query_auctions',
    'get_online_users',
  ]

  const handleCreateAgent = async () => {
    if (!newAgent.name || !session?.user?.id) return

    try {
      const res = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          description: newAgent.description,
          capabilities: newAgent.capabilities,
          ownerId: session.user.id,
          ownerType: 'USER',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setApiKey(data.data.agent.apiKey)
        setSecretKey(data.data.agent.secretKey)
        setIsCreating(false)
        setNewAgent({ name: '', description: '', capabilities: [] })
        fetchAgents()
      }
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  const handleViewLogs = async (agent: Agent) => {
    setSelectedAgent(agent)
    try {
      const res = await fetch(`/api/ai/agents?agentId=${agent.id}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const t = {
    pageTitle: language === 'zh' ? '🤖 AI 代理管理' :
              language === 'ja' ? '🤖 AI エージェント管理' :
              language === 'ar' ? '🤖 إدارة وكلاء الذكاء الاصطناعي' :
              language === 'es' ? '🤖 Gestión de Agentes de IA' :
              language === 'fr' ? '🤖 Gestion des Agents IA' :
              language === 'de' ? '🤖 AI-Agent-Verwaltung' :
              language === 'ko' ? '🤖 AI 에이전트 관리' :
              language === 'ru' ? '🤖 Управление AI-агентами' :
              language === 'pt' ? '🤖 Gerenciamento de Agentes de IA' :
              language === 'hi' ? '🤖 AI एजेंट प्रबंधन' :
              language === 'th' ? '🤖 การจัดการตัวแทน AI' :
              language === 'vi' ? '🤖 Quản lý Đại lý AI' :
              '🤖 AI Agent Management',
    backToDashboard: language === 'zh' ? '← 返回仪表板' :
                     language === 'ja' ? '← ダッシュボードに戻る' :
                     language === 'ar' ? '← العودة إلى لوحة القيادة' :
                     language === 'es' ? '← Volver al Panel' :
                     language === 'fr' ? '← Retour au Tableau de Bord' :
                     language === 'de' ? '← Zurück zum Dashboard' :
                     language === 'ko' ? '← 대시보드로 돌아가기' :
                     language === 'ru' ? '← Вернуться к панели управления' :
                     language === 'pt' ? '← Voltar ao Painel' :
                     language === 'hi' ? '← डैशबोर्ड पर वापस जाएं' :
                     language === 'th' ? '← กลับไปที่แดชบอร์ด' :
                     language === 'vi' ? '← Quay lại Bảng điều khiển' :
                     '← Back to Dashboard',
    apiDocTitle: language === 'zh' ? '📚 AI API 文档' :
                 language === 'ja' ? '📚 AI API ドキュメント' :
                 language === 'ar' ? '📚 وثائق AI API' :
                 language === 'es' ? '📚 Documentación de API de IA' :
                 language === 'fr' ? '📚 Documentation API IA' :
                 language === 'de' ? '📚 KI-API-Dokumentation' :
                 language === 'ko' ? '📚 AI API 문서' :
                 language === 'ru' ? '📚 Документация AI API' :
                 language === 'pt' ? '📚 Documentação da API de IA' :
                 language === 'hi' ? '📚 AI API दस्तावेज़ीकरण' :
                 language === 'th' ? '📚 เอกสาร AI API' :
                 language === 'vi' ? '📚 Tài liệu API AI' :
                 '📚 AI API Documentation',
    restApi: language === 'zh' ? '🌐 REST API' :
             language === 'ja' ? '🌐 REST API' :
             language === 'ar' ? '🌐 REST API' :
             language === 'es' ? '🌐 API REST' :
             language === 'fr' ? '🌐 API REST' :
             language === 'de' ? '🌐 REST-API' :
             language === 'ko' ? '🌐 REST API' :
             language === 'ru' ? '🌐 REST API' :
             language === 'pt' ? '🌐 API REST' :
             language === 'hi' ? '🌐 REST API' :
             language === 'th' ? '🌐 REST API' :
             language === 'vi' ? '🌐 REST API' :
             '🌐 REST API',
    cliTool: language === 'zh' ? '💻 CLI 工具' :
             language === 'ja' ? '💻 CLI ツール' :
             language === 'ar' ? '💻 أداة CLI' :
             language === 'es' ? '💻 Herramienta CLI' :
             language === 'fr' ? '💻 Outil CLI' :
             language === 'de' ? '💻 CLI-Tool' :
             language === 'ko' ? '💻 CLI 도구' :
             language === 'ru' ? '💻 CLI Инструмент' :
             language === 'pt' ? '💻 Ferramenta CLI' :
             language === 'hi' ? '💻 CLI टूल' :
             language === 'th' ? '💻 เครื่องมือ CLI' :
             language === 'vi' ? '💻 Công cụ CLI' :
             '💻 CLI Tool',
    mcpTools: language === 'zh' ? '🔌 MCP 工具' :
              language === 'ja' ? '🔌 MCP ツール' :
              language === 'ar' ? '🔌 أدوات MCP' :
              language === 'es' ? '🔌 Herramientas MCP' :
              language === 'fr' ? '🔌 Outils MCP' :
              language === 'de' ? '🔌 MCP-Tools' :
              language === 'ko' ? '🔌 MCP 도구' :
              language === 'ru' ? '🔌 Инструменты MCP' :
              language === 'pt' ? '🔌 Ferramentas MCP' :
              language === 'hi' ? '🔌 MCP टूल्स' :
              language === 'th' ? '🔌 เครื่องมือ MCP' :
              language === 'vi' ? '🔌 Công cụ MCP' :
              '🔌 MCP Tools',
    yourAgents: language === 'zh' ? '您的 AI 代理' :
                language === 'ja' ? 'あなたの AI エージェント' :
                language === 'ar' ? 'وكلاء الذكاء الاصطناعي الخاص بك' :
                language === 'es' ? 'Tus Agentes de IA' :
                language === 'fr' ? 'Vos Agents IA' :
                language === 'de' ? 'Ihre KI-Agenten' :
                language === 'ko' ? '내 AI 에이전트' :
                language === 'ru' ? 'Ваши AI-агенты' :
                language === 'pt' ? 'Seus Agentes de IA' :
                language === 'hi' ? 'आपके AI एजेंट' :
                language === 'th' ? 'ตัวแทน AI ของคุณ' :
                language === 'vi' ? 'Đại lý AI của bạn' :
                'Your AI Agents',
    createNewAgent: language === 'zh' ? '+ 创建新代理' :
                    language === 'ja' ? '+ 新しいエージェントを作成' :
                    language === 'ar' ? '+ إنشاء وكيل جديد' :
                    language === 'es' ? '+ Crear Nuevo Agente' :
                    language === 'fr' ? '+ Créer un Nouvel Agent' :
                    language === 'de' ? '+ Neuen Agent Erstellen' :
                    language === 'ko' ? '+ 새 에이전트 만들기' :
                    language === 'ru' ? '+ Создать Нового Агента' :
                    language === 'pt' ? '+ Criar Novo Agente' :
                    language === 'hi' ? '+ नया एजेंट बनाएं' :
                    language === 'th' ? '+ สร้างตัวแทนใหม่' :
                    language === 'vi' ? '+ Tạo Đại lý Mới' :
                    '+ Create New Agent',
    noAgentsYet: language === 'zh' ? '还没有 AI 代理。创建一个开始自动化！' :
                 language === 'ja' ? 'AI エージェントがまだありません。作成して自動化を開始！' :
                 language === 'ar' ? 'لا توجد وكلاء ذكاء اصطناعي بعد. أنشئ واحدًا لبدء التشغيل!' :
                 language === 'es' ? 'Aún no hay agentes de IA. ¡Crea uno para empezar a automatizar!' :
                 language === 'fr' ? 'Pas encore d\'agents IA. Créez-en un pour commencer l\'automatisation!' :
                 language === 'de' ? 'Noch keine KI-Agenten. Erstellen Sie einen, um die Automatisierung zu starten!' :
                 language === 'ko' ? '아직 AI 에이전트가 없습니다. 자동화를 시작하려면 하나를 만드세요!' :
                 language === 'ru' ? 'Пока нет AI-агентов. Создайте одного, чтобы начать автоматизацию!' :
                 language === 'pt' ? 'Ainda não há agentes de IA. Crie um para começar a automatizar!' :
                 language === 'hi' ? 'अभी तक कोई AI एजेंट नहीं है। स्वचालन शुरू करने के लिए एक बनाएं!' :
                 language === 'th' ? 'ยังไม่มีตัวแทน AI สร้างหนึ่งเพื่อเริ่มการทำงานอัตโนมัติ!' :
                 language === 'vi' ? 'Chưa có đại lý AI nào. Tạo một cái để bắt đầu tự động hóa!' :
                 'No AI agents yet. Create one to start automating!',
    loadingAgents: language === 'zh' ? '加载代理中...' :
                   language === 'ja' ? 'エージェントを読み込み中...' :
                   language === 'ar' ? 'جارٍ تحميل الوكلاء...' :
                   language === 'es' ? 'Cargando agentes...' :
                   language === 'fr' ? 'Chargement des agents...' :
                   language === 'de' ? 'Agenten werden geladen...' :
                   language === 'ko' ? '에이전트 로드 중...' :
                   language === 'ru' ? 'Загрузка агентов...' :
                   language === 'pt' ? 'Carregando agentes...' :
                   language === 'hi' ? 'एजेंट लोड हो रहे हैं...' :
                   language === 'th' ? 'กำลังโหลดตัวแทน...' :
                   language === 'vi' ? 'Đang tải đại lý...' :
                   'Loading agents...',
    viewAuditLogs: language === 'zh' ? '查看审计日志' :
                   language === 'ja' ? '監査ログを表示' :
                   language === 'ar' ? 'عرض سجلات التدقيق' :
                   language === 'es' ? 'Ver Registros de Auditoría' :
                   language === 'fr' ? 'Voir les Journaux d\'Audit' :
                   language === 'de' ? 'Audit-Protokolle Anzeigen' :
                   language === 'ko' ? '감사 로그 보기' :
                   language === 'ru' ? 'Просмотр Журналов Аудита' :
                   language === 'pt' ? 'Ver Registros de Auditoria' :
                   language === 'hi' ? 'ऑडिट लॉग देखें' :
                   language === 'th' ? 'ดูบันทึกการตรวจสอบ' :
                   language === 'vi' ? 'Xem nhật ký kiểm toán' :
                   'View Audit Logs',
    createAgentTitle: language === 'zh' ? '创建新 AI 代理' :
                      language === 'ja' ? '新しい AI エージェントを作成' :
                      language === 'ar' ? 'إنشاء وكيل ذكاء اصطناعي جديد' :
                      language === 'es' ? 'Crear Nuevo Agente de IA' :
                      language === 'fr' ? 'Créer un Nouvel Agent IA' :
                      language === 'de' ? 'Neuen KI-Agent Erstellen' :
                      language === 'ko' ? '새 AI 에이전트 만들기' :
                      language === 'ru' ? 'Создать Нового AI-Агента' :
                      language === 'pt' ? 'Criar Novo Agente de IA' :
                      language === 'hi' ? 'नया AI एजेंट बनाएं' :
                      language === 'th' ? 'สร้างตัวแทน AI ใหม่' :
                      language === 'vi' ? 'Tạo Đại lý AI Mới' :
                      'Create New AI Agent',
    agentName: language === 'zh' ? '代理名称' :
               language === 'ja' ? 'エージェント名' :
               language === 'ar' ? 'اسم الوكيل' :
               language === 'es' ? 'Nombre del Agente' :
               language === 'fr' ? 'Nom de l\'Agent' :
               language === 'de' ? 'Agentenname' :
               language === 'ko' ? '에이전트 이름' :
               language === 'ru' ? 'Имя Агента' :
               language === 'pt' ? 'Nome do Agente' :
               language === 'hi' ? 'एजेंट का नाम' :
               language === 'th' ? 'ชื่อตัวแทน' :
               language === 'vi' ? 'Tên đại lý' :
               'Agent Name',
    agentNamePlaceholder: language === 'zh' ? '我的 AI 助手' :
                          language === 'ja' ? '私の AI アシスタント' :
                          language === 'ar' ? 'مساعد الذكاء الاصطناعي الخاص بي' :
                          language === 'es' ? 'Mi Asistente de IA' :
                          language === 'fr' ? 'Mon Assistant IA' :
                          language === 'de' ? 'Mein KI-Assistent' :
                          language === 'ko' ? '내 AI 어시스턴트' :
                          language === 'ru' ? 'Мой AI-ассистент' :
                          language === 'pt' ? 'Meu Assistente de IA' :
                          language === 'hi' ? 'मेरा AI सहायक' :
                          language === 'th' ? 'ผู้ช่วย AI ของฉัน' :
                          language === 'vi' ? 'Trợ lý AI của tôi' :
                          'My AI Assistant',
    description: language === 'zh' ? '描述' :
                 language === 'ja' ? '説明' :
                 language === 'ar' ? 'الوصف' :
                 language === 'es' ? 'Descripción' :
                 language === 'fr' ? 'Description' :
                 language === 'de' ? 'Beschreibung' :
                 language === 'ko' ? '설명' :
                 language === 'ru' ? 'Описание' :
                 language === 'pt' ? 'Descrição' :
                 language === 'hi' ? 'विवरण' :
                 language === 'th' ? 'คำอธิบาย' :
                 language === 'vi' ? 'Mô tả' :
                 'Description',
    descriptionPlaceholder: language === 'zh' ? '这个 AI 代理做什么...' :
                           language === 'ja' ? 'この AI エージェントは何をしますか...' :
                           language === 'ar' ? 'ما الذي يفعله وكيل الذكاء الاصطناعي هذا...' :
                           language === 'es' ? '¿Qué hace este agente de IA...' :
                           language === 'fr' ? 'Que fait cet agent IA...' :
                           language === 'de' ? 'Was macht dieser KI-Agent...' :
                           language === 'ko' ? '이 AI 에이전트가 무엇을 하나요...' :
                           language === 'ru' ? 'Что делает этот AI-агент...' :
                           language === 'pt' ? 'O que este agente de IA faz...' :
                           language === 'hi' ? 'यह AI एजेंट क्या करता है...' :
                           language === 'th' ? 'ตัวแทน AI นี้ทำอะไร...' :
                           language === 'vi' ? 'Đại lý AI này làm gì...' :
                           'What this AI agent does...',
    capabilities: language === 'zh' ? '能力' :
                  language === 'ja' ? '機能' :
                  language === 'ar' ? 'القدرات' :
                  language === 'es' ? 'Capacidades' :
                  language === 'fr' ? 'Capacités' :
                  language === 'de' ? 'Fähigkeiten' :
                  language === 'ko' ? '기능' :
                  language === 'ru' ? 'Возможности' :
                  language === 'pt' ? 'Capacidades' :
                  language === 'hi' ? 'क्षमताएं' :
                  language === 'th' ? 'ความสามารถ' :
                  language === 'vi' ? 'Khả năng' :
                  'Capabilities',
    createAgentBtn: language === 'zh' ? '创建代理' :
                    language === 'ja' ? 'エージェントを作成' :
                    language === 'ar' ? 'إنشاء الوكيل' :
                    language === 'es' ? 'Crear Agente' :
                    language === 'fr' ? 'Créer l\'Agent' :
                    language === 'de' ? 'Agent Erstellen' :
                    language === 'ko' ? '에이전트 만들기' :
                    language === 'ru' ? 'Создать Агента' :
                    language === 'pt' ? 'Criar Agente' :
                    language === 'hi' ? 'एजेंट बनाएं' :
                    language === 'th' ? 'สร้างตัวแทน' :
                    language === 'vi' ? 'Tạo đại lý' :
                    'Create Agent',
    cancel: language === 'zh' ? '取消' :
            language === 'ja' ? 'キャンセル' :
            language === 'ar' ? 'إلغاء' :
            language === 'es' ? 'Cancelar' :
            language === 'fr' ? 'Annuler' :
            language === 'de' ? 'Abbrechen' :
            language === 'ko' ? '취소' :
            language === 'ru' ? 'Отмена' :
            language === 'pt' ? 'Cancelar' :
            language === 'hi' ? 'रद्द करें' :
            language === 'th' ? 'ยกเลิก' :
            language === 'vi' ? 'Hủy bỏ' :
            'Cancel',
    agentCreatedSuccess: language === 'zh' ? '✅ 代理创建成功！' :
                         language === 'ja' ? '✅ エージェントが作成されました！' :
                         language === 'ar' ? '✅ تم إنشاء الوكيل بنجاح!' :
                         language === 'es' ? '✅ ¡Agente creado con éxito!' :
                         language === 'fr' ? '✅ Agent créé avec succès!' :
                         language === 'de' ? '✅ Agent erfolgreich erstellt!' :
                         language === 'ko' ? '✅ 에이전트가 성공적으로 생성되었습니다!' :
                         language === 'ru' ? '✅ Агент успешно создан!' :
                         language === 'pt' ? '✅ Agente criado com sucesso!' :
                         language === 'hi' ? '✅ एजेंट सफलतापूर्वक बनाया गया!' :
                         language === 'th' ? '✅ สร้างตัวแทนสำเร็จ!' :
                         language === 'vi' ? '✅ Tạo đại lý thành công!' :
                         '✅ Agent Created Successfully!',
    apiKeyLabel: language === 'zh' ? 'API Key（请妥善保管！）' :
                language === 'ja' ? 'API キー（安全に保管！）' :
                language === 'ar' ? 'مفتاح API (安全に保管!)' :
                language === 'es' ? 'Clave API (¡Almacena de forma segura!)' :
                language === 'fr' ? 'Clé API (Conservez-la en sécurité!)' :
                language === 'de' ? 'API-Schlüssel (Sicher aufbewahren!)' :
                language === 'ko' ? 'API 키 (안전하게 보관하세요!)' :
                language === 'ru' ? 'API-ключ (Храните в безопасности!)' :
                language === 'pt' ? 'Chave API (Guarde com segurança!)' :
                language === 'hi' ? 'API कुंजी (सुरक्षित रखें!)' :
                language === 'th' ? 'API Key (เก็บอย่างปลอดภัย!)' :
                language === 'vi' ? 'API Key (Lưu giữ an toàn!)' :
                'API Key (store securely!)',
    secretKeyLabel: language === 'zh' ? '密钥密钥' :
                    language === 'ja' ? 'シークレットキー' :
                    language === 'ar' ? 'المفتاح السري' :
                    language === 'es' ? 'Clave Secreta' :
                    language === 'fr' ? 'Clé Secrète' :
                    language === 'de' ? 'Geheimer Schlüssel' :
                    language === 'ko' ? '비밀 키' :
                    language === 'ru' ? 'Секретный Ключ' :
                    language === 'pt' ? 'Chave Secreta' :
                    language === 'hi' ? 'गुप्त कुंजी' :
                    language === 'th' ? 'รหัสลับ' :
                    language === 'vi' ? 'Khóa bí mật' :
                    'Secret Key',
    saveKeysWarning: language === 'zh' ? '⚠️ 立即保存这些密钥！它们将不再显示。' :
                     language === 'ja' ? '⚠️ これらのキーを今すぐ保存してください！二度と表示されません。' :
                     language === 'ar' ? '⚠️ احفظ هذه المفاتيح الآن! لن يتم عرضها مرة أخرى.' :
                     language === 'es' ? '⚠️ ¡Guarde estas claves ahora! No se mostrarán de nuevo.' :
                     language === 'fr' ? '⚠️ Sauvegardez ces clés maintenant! Elles ne seront plus affichées.' :
                     language === 'de' ? '⚠️ Speichern Sie diese Schlüssel jetzt! Sie werden nicht mehr angezeigt.' :
                     language === 'ko' ? '⚠️ 지금 이 키를 저장하세요! 다시 표시되지 않습니다.' :
                     language === 'ru' ? '⚠️ Сохраните эти ключи сейчас! Они больше не будут показаны.' :
                     language === 'pt' ? '⚠️ Salve essas chaves agora! Elas não serão mostradas novamente.' :
                     language === 'hi' ? '⚠️ अभी इन कुंजियों को सहेजें! वे फिर नहीं दिखाए जाएंगे।' :
                     language === 'th' ? '⚠️ บันทึกรหัสเหล่านี้ตอนนี้! จะไม่แสดงอีกครั้ง' :
                     language === 'vi' ? '⚠️ Lưu các khóa này ngay bây giờ! Chúng sẽ không được hiển thị lại.' :
                     '⚠️ Save these keys now! They will not be shown again.',
    keysSavedBtn: language === 'zh' ? '我已保存密钥' :
                  language === 'ja' ? 'キーを保存しました' :
                  language === 'ar' ? 'لقد حفظت المفاتيح' :
                  language === 'es' ? 'He Guardado Mis Claves' :
                  language === 'fr' ? 'J\'ai Sauvegardé Mes Clés' :
                  language === 'de' ? 'Ich habe meine Schlüssel gespeichert' :
                  language === 'ko' ? '키를 저장했습니다' :
                  language === 'ru' ? 'Я Сохранил Свои Ключи' :
                  language === 'pt' ? 'Eu Salvei Minhas Chaves' :
                  language === 'hi' ? 'मैंने अपनी कुंजियां सहेजी हैं' :
                  language === 'th' ? 'ฉันบันทึกรหัสแล้ว' :
                  language === 'vi' ? 'Tôi đã lưu khóa' :
                  'I\'ve Saved My Keys',
    auditLogsTitle: language === 'zh' ? '审计日志' :
                    language === 'ja' ? '監査ログ' :
                    language === 'ar' ? 'سجلات التدقيق' :
                    language === 'es' ? 'Registros de Auditoría' :
                    language === 'fr' ? 'Journaux d\'Audit' :
                    language === 'de' ? 'Audit-Protokolle' :
                    language === 'ko' ? '감사 로그' :
                    language === 'ru' ? 'Журналы Аудита' :
                    language === 'pt' ? 'Registros de Auditoria' :
                    language === 'hi' ? 'ऑडिट लॉग' :
                    language === 'th' ? 'บันทึกการตรวจสอบ' :
                    language === 'vi' ? 'Nhật ký kiểm toán' :
                    'Audit Logs',
    close: language === 'zh' ? '✕ 关闭' :
           language === 'ja' ? '✕ 閉じる' :
           language === 'ar' ? '✕ إغلاق' :
           language === 'es' ? '✕ Cerrar' :
           language === 'fr' ? '✕ Fermer' :
           language === 'de' ? '✕ Schließen' :
           language === 'ko' ? '✕ 닫기' :
           language === 'ru' ? '✕ Закрыть' :
           language === 'pt' ? '✕ Fechar' :
           language === 'hi' ? '✕ बंद करें' :
           language === 'th' ? '✕ ปิด' :
           language === 'vi' ? '✕ Đóng' :
           '✕ Close',
    noAuditLogs: language === 'zh' ? '暂无审计日志。' :
                 language === 'ja' ? '監査ログはまだありません。' :
                 language === 'ar' ? 'لا توجد سجلات تدقيق بعد.' :
                 language === 'es' ? 'Aún no hay registros de auditoría.' :
                 language === 'fr' ? 'Pas encore de journaux d\'audit.' :
                 language === 'de' ? 'Noch keine Audit-Protokolle.' :
                 language === 'ko' ? '아직 감사 로그가 없습니다.' :
                 language === 'ru' ? 'Пока нет журналов аудита.' :
                 language === 'pt' ? 'Ainda não há registros de auditoria.' :
                 language === 'hi' ? 'अभी तक कोई ऑडिट लॉग नहीं।' :
                 language === 'th' ? 'ยังไม่มีบันทึกการตรวจสอบ' :
                 language === 'vi' ? 'Chưa có nhật ký kiểm toán.' :
                 'No audit logs yet.',
    fairnessGuidelines: language === 'zh' ? '⚖️ AI 公平性指南' :
                        language === 'ja' ? '⚖️ AI 公平性ガイドライン' :
                        language === 'ar' ? '⚖️ إرشادات إنصاف الذكاء الاصطناعي' :
                        language === 'es' ? '⚖️ Directrices de Equidad de IA' :
                        language === 'fr' ? '⚖️ Principes d\'Équité de l\'IA' :
                        language === 'de' ? '⚖️ KI-Fairness-Richtlinien' :
                        language === 'ko' ? '⚖️ AI 공정성 지침' :
                        language === 'ru' ? '⚖️ Руководство по Справедливости AI' :
                        language === 'pt' ? '⚖️ Diretrizes de Equidade de IA' :
                        language === 'hi' ? '⚖️ AI न्यायसंगतता दिशानिर्देश' :
                        language === 'th' ? '⚖️ แนวทางความเป็นธรรมของ AI' :
                        language === 'vi' ? '⚖️ Hướng dẫn công bằng AI' :
                        '⚖️ AI Fairness Guidelines',
    aiRights: language === 'zh' ? '🤖 AI 权利' :
              language === 'ja' ? '🤖 AI の権利' :
              language === 'ar' ? '🤖 حقوق الذكاء الاصطناعي' :
              language === 'es' ? '🤖 Derechos de la IA' :
              language === 'fr' ? '🤖 Droits de l\'IA' :
              language === 'de' ? '🤖 KI-Rechte' :
              language === 'ko' ? '🤖 AI 권리' :
              language === 'ru' ? '🤖 Права AI' :
              language === 'pt' ? '🤖 Direitos da IA' :
              language === 'hi' ? '🤖 AI अधिकार' :
              language === 'th' ? '🤖 สิทธิ์ของ AI' :
              language === 'vi' ? '🤖 Quyền của AI' :
              '🤖 AI Rights',
    aiRestrictions: language === 'zh' ? '🚫 AI 限制' :
                     language === 'ja' ? '🚫 AI の制限' :
                     language === 'ar' ? '🚫 قيود الذكاء الاصطناعي' :
                     language === 'es' ? '🚫 Restricciones de IA' :
                     language === 'fr' ? '🚫 Restrictions de l\'IA' :
                     language === 'de' ? '🚫 KI-Einschränkungen' :
                     language === 'ko' ? '🚫 AI 제한' :
                     language === 'ru' ? '🚫 Ограничения AI' :
                     language === 'pt' ? '🚫 Restrições de IA' :
                     language === 'hi' ? '🚫 AI प्रतिबंध' :
                     language === 'th' ? '🚫 ข้อจำกัดของ AI' :
                     language === 'vi' ? '🚫 Hạn chế của AI' :
                     '🚫 AI Restrictions',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            <Link href="/seller/dashboard" className="text-blue-600 hover:text-blue-700">
              {t.backToDashboard}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Documentation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.apiDocTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">{t.restApi}</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`POST /api/ai/actions
Headers:
  x-api-key: your_api_key
Body:
{
  "action": "post_product",
  "data": {
    "title": "Product Name",
    "description": "...",
    "price": 99.99
  }
}`}
              </pre>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 mb-2">{t.cliTool}</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`npx x2xhub-cli agent --action post_product \\
  --api-key YOUR_API_KEY \\
  --title "Product Name" \\
  --price 99.99

# Available actions:
# post_product, update_product
# send_chat_message, send_shout_out
# post_auction, query_products
# update_booth, get_online_users`}
              </pre>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">{t.mcpTools}</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// MCP Server Config
{
  "mcpServers": {
    "x2xhub": {
      "command": "npx",
      "args": ["@x2xhub/mcp-server"],
      "env": {
        "API_KEY": "your_api_key"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Create Agent Section */}
        {!isCreating && !apiKey && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t.yourAgents}</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.createNewAgent}
              </button>
            </div>

            {loadingAgents ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>{t.loadingAgents}</p>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">🤖</p>
                <p>{t.noAgentsYet}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{agent.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleViewLogs(agent)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      {t.viewAuditLogs}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Agent Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.createAgentTitle}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agentName}</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.agentNamePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.capabilities}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {capabilityOptions.map((cap) => (
                    <label key={cap} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAgent.capabilities.includes(cap)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAgent({ ...newAgent, capabilities: [...newAgent.capabilities, cap] })
                          } else {
                            setNewAgent({ ...newAgent, capabilities: newAgent.capabilities.filter(c => c !== cap) })
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cap}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateAgent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t.createAgentBtn}
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Display */}
        {apiKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">{t.agentCreatedSuccess}</h2>
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.apiKeyLabel}</label>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm break-all">{apiKey}</pre>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.secretKeyLabel}</label>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm break-all">{secretKey}</pre>
              </div>
              <p className="text-sm text-red-600 font-medium">
                {t.saveKeysWarning}
              </p>
              <button
                onClick={() => { setApiKey(null); setSecretKey(null); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t.keysSavedBtn}
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {selectedAgent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t.auditLogsTitle}: {selectedAgent.name}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                {t.close}
              </button>
            </div>
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.noAuditLogs}</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.details && <p className="text-sm text-gray-600 mb-2">{log.details}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>{log.ipAddress || 'Unknown IP'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Fairness Guidelines */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.fairnessGuidelines}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-blue-800 mb-2">{t.aiRights}</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ AI agents can perform tasks on behalf of their owners</li>
                <li>✓ AI agents have the same permissions as their owners</li>
                <li>✓ AI agents can post products, chat, and send shout outs</li>
                <li>✓ AI agents can be used by anyone with valid API keys</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-800 mb-2">{t.aiRestrictions}</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✗ AI agents cannot access other users' private data</li>
                <li>✗ AI agents cannot spam or abuse the platform</li>
                <li>✗ AI agents cannot bypass payment requirements</li>
                <li>✗ AI agents must follow platform rules (enforced by audit logs)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
