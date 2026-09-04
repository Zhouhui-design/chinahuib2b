'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'
import MultilingualInput from '@/components/ui/MultilingualInput'

interface Booth {
  id: string
  boothNumber: string
  boothCode?: string
  name: string
  names?: Record<string, string>
  descriptions?: Record<string, string>
  exhibitionName: string
  exhibitionDates?: { start: string; end: string }
  location?: string
  logoUrl?: string
  bannerUrl?: string
  keywords?: string[]
  documents?: Array<{ url: string; name: string; type: string; size: number }>
  theme?: string
  colorScheme?: string
  layout?: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function BoothsPage() {
  const language = useSellerLanguage()
  const searchParams = useSearchParams()
  
  // Translation object
  const t = {
    myBooths: language === 'zh' ? '我的展位' :
              language === 'ja' ? 'マイブース' :
              language === 'ko' ? '내 부스' :
              language === 'ar' ? 'الأكشاك الخاصة' :
              language === 'es' ? 'Mis Puestos' :
              language === 'fr' ? 'Mes Stands' :
              language === 'de' ? 'Meine Stände' :
              language === 'it' ? 'I Miei Stand' :
              language === 'pt' ? 'Meus Stands' :
              language === 'ru' ? 'Мои Стенды' :
              language === 'hi' ? 'मेरे बूथ' :
              'My Booths',
    
    manageBooths: language === 'zh' ? '管理您在不同贸易展会的展位' :
                  language === 'ja' ? '異なるトレードショー向けの展示ブースを管理' :
                  language === 'ko' ? '다양한 무역 박람회의 부스 관리' :
                  language === 'ar' ? 'إدارة أكشاك العرض في المعارض المختلفة' :
                  language === 'es' ? 'Administre sus puestos de exhibición para diferentes ferias comerciales' :
                  language === 'fr' ? 'Gérez vos stands d\'exposition pour différents salons' :
                  language === 'de' ? 'Verwalten Sie Ihre Messestände für verschiedene Messen' :
                  language === 'it' ? 'Gestisci i tuoi stand espositivi per diverse fiere' :
                  language === 'pt' ? 'Gerencie seus stands de exposição para diferentes feiras' :
                  language === 'ru' ? 'Управляйте своими выставочными стендами для разных ярмарок' :
                  language === 'hi' ? 'विभिन्न व्यापार मेलों के लिए अपने प्रदर्शन बूथ प्रबंधित करें' :
                  'Manage your exhibition booths for different trade shows',
    
    createNew: language === 'zh' ? '创建新展位' :
               language === 'ja' ? '新規ブース作成' :
               language === 'ko' ? '새 부스 만들기' :
               language === 'ar' ? 'إنشاء كشاك جديد' :
               language === 'es' ? 'Crear Nuevo Puesto' :
               language === 'fr' ? 'Créer un Nouveau Stand' :
               language === 'de' ? 'Neuen Stand Erstellen' :
               language === 'it' ? 'Crea Nuovo Stand' :
               language === 'pt' ? 'Criar Novo Stand' :
               language === 'ru' ? 'Создать Новый Стенд' :
               language === 'hi' ? 'नया बूथ बनाएं' :
               'Create New Booth',
    
    noBooths: language === 'zh' ? '暂无展位' :
              language === 'ja' ? 'ブースなし' :
              language === 'ko' ? '부스 없음' :
              language === 'ar' ? 'لا توجد أكشاك' :
              language === 'es' ? 'Sin puestos' :
              language === 'fr' ? 'Pas de stands' :
              language === 'de' ? 'Keine Stände' :
              language === 'it' ? 'Nessun stand' :
              language === 'pt' ? 'Sem stands' :
              language === 'ru' ? 'Нет стендов' :
              language === 'hi' ? 'कोई बूथ नहीं' :
              'No booths yet',
    
    createFirst: language === 'zh' ? '创建您的第一个展位，在不同展会展示您的产品' :
                  language === 'ja' ? '異なる展示会で製品を展示する最初のブースを作成' :
                  language === 'ko' ? '다양한 박람회에서 제품을 전시할 첫 번째 부스 만들기' :
                  language === 'ar' ? 'أنشئ أول كشاك لك لعرض منتجاتك في المعارض المختلفة' :
                  language === 'es' ? 'Cree su primer puesto para exhibir sus productos en diferentes exposiciones' :
                  language === 'fr' ? 'Créez votre premier stand pour présenter vos produits dans différentes expositions' :
                  language === 'de' ? 'Erstellen Sie Ihren ersten Stand, um Ihre Produkte auf verschiedenen Messen zu präsentieren' :
                  language === 'it' ? 'Crea il tuo primo stand per mostrare i tuoi prodotti in diverse esposizioni' :
                  language === 'pt' ? 'Crie seu primeiro stand para exibir seus produtos em diferentes exposições' :
                  language === 'ru' ? 'Создайте свой первый стенд для демонстрации продуктов на разных выставках' :
                  language === 'hi' ? 'विभिन्न प्रदर्शनी में अपने उत्पादों को प्रदर्शित करने के लिए अपना पहला बूथ बनाएं' :
                  'Create your first booth to showcase your products at different exhibitions',
    
    createFirstBtn: language === 'zh' ? '创建第一个展位' :
                    language === 'ja' ? '最初のブースを作成' :
                    language === 'ko' ? '첫 번째 부스 만들기' :
                    language === 'ar' ? 'إنشاء أول كشاك' :
                    language === 'es' ? 'Crear Primer Puesto' :
                    language === 'fr' ? 'Créer Premier Stand' :
                    language === 'de' ? 'Ersten Stand Erstellen' :
                    language === 'it' ? 'Crea Primo Stand' :
                    language === 'pt' ? 'Criar Primeiro Stand' :
                    language === 'ru' ? 'Создать Первый Стенд' :
                    language === 'hi' ? 'पहला बूथ बनाएं' :
                    'Create First Booth',
    
    published: language === 'zh' ? '已上架' :
               language === 'ja' ? '公開済み' :
               language === 'ko' ? '게시됨' :
               language === 'ar' ? 'منشور' :
               language === 'es' ? 'Publicado' :
               language === 'fr' ? 'Publié' :
               language === 'de' ? 'Veröffentlicht' :
               language === 'it' ? 'Pubblicato' :
               language === 'pt' ? 'Publicado' :
               language === 'ru' ? 'Опубликовано' :
               language === 'hi' ? 'प्रकाशित' :
               'Published',
    
    unpublished: language === 'zh' ? '未上架' :
                 language === 'ja' ? '非公開' :
                 language === 'ko' ? '게시 안 됨' :
                 language === 'ar' ? 'غير منشور' :
                 language === 'es' ? 'No Publicado' :
                 language === 'fr' ? 'Non Publié' :
                 language === 'de' ? 'Nicht Veröffentlicht' :
                 language === 'it' ? 'Non Pubblicato' :
                 language === 'pt' ? 'Não Publicado' :
                 language === 'ru' ? 'Не Опубликовано' :
                 language === 'hi' ? 'अप्रकाशित' :
                 'Unpublished',
    
    draft: language === 'zh' ? '草稿' :
            language === 'ja' ? '下書き' :
            language === 'ko' ? '초안' :
            language === 'ar' ? 'مسودة' :
            language === 'es' ? 'Borrador' :
            language === 'fr' ? 'Brouillon' :
            language === 'de' ? 'Entwurf' :
            language === 'it' ? 'Bozza' :
            language === 'pt' ? 'Rascunho' :
            language === 'ru' ? 'Черновик' :
            language === 'hi' ? 'ड्राफ्ट' :
            'Draft',
    
    created: language === 'zh' ? '创建时间' :
             language === 'ja' ? '作成日' :
             language === 'ko' ? '생성일' :
             language === 'ar' ? 'تاريخ الإنشاء' :
             language === 'es' ? 'Creado' :
             language === 'fr' ? 'Créé' :
             language === 'de' ? 'Erstellt' :
             language === 'it' ? 'Creato' :
             language === 'pt' ? 'Criado' :
             language === 'ru' ? 'Создано' :
             language === 'hi' ? 'निर्मित' :
             'Created',
    
    unpublish: language === 'zh' ? '取消发布' :
               language === 'ja' ? '非公開' :
               language === 'ko' ? '게시 취소' :
               language === 'ar' ? 'إلغاء النشر' :
               language === 'es' ? 'Despublicar' :
               language === 'fr' ? 'Dépublier' :
               language === 'de' ? 'Veröffentlichung aufheben' :
               language === 'it' ? 'Rimuovi pubblicazione' :
               language === 'pt' ? 'Despublicar' :
               language === 'ru' ? 'Отменить публикацию' :
               language === 'hi' ? 'अप्रकाशित करें' :
               'Unpublish',
    
    publish: language === 'zh' ? '发布' :
             language === 'ja' ? '公開' :
             language === 'ko' ? '게시' :
             language === 'ar' ? 'نشر' :
             language === 'es' ? 'Publicar' :
             language === 'fr' ? 'Publier' :
             language === 'de' ? 'Veröffentlichen' :
             language === 'it' ? 'Pubblica' :
             language === 'pt' ? 'Publicar' :
             language === 'ru' ? 'Опубликовать' :
             language === 'hi' ? 'प्रकाशित करें' :
             'Publish',
    
    edit: language === 'zh' ? '编辑' :
          language === 'ja' ? '編集' :
          language === 'ko' ? '편집' :
          language === 'ar' ? 'تعديل' :
          language === 'es' ? 'Editar' :
          language === 'fr' ? 'Modifier' :
          language === 'de' ? 'Bearbeiten' :
          language === 'it' ? 'Modifica' :
          language === 'pt' ? 'Editar' :
          language === 'ru' ? 'Редактировать' :
          language === 'hi' ? 'संपादित करें' :
          'Edit',
    
    delete: language === 'zh' ? '删除' :
            language === 'ja' ? '削除' :
            language === 'ko' ? '삭제' :
            language === 'ar' ? 'حذف' :
            language === 'es' ? 'Eliminar' :
            language === 'fr' ? 'Supprimer' :
            language === 'de' ? 'Löschen' :
            language === 'it' ? 'Elimina' :
            language === 'pt' ? 'Excluir' :
            language === 'ru' ? 'Удалить' :
            language === 'hi' ? 'हटाएं' :
            'Delete',
    
    viewBooth: language === 'zh' ? '查看展位' :
               language === 'ja' ? 'ブースを見る' :
               language === 'ko' ? '부스 보기' :
               language === 'ar' ? 'عرض الكشاك' :
               language === 'es' ? 'Ver Puesto' :
               language === 'fr' ? 'Voir le Stand' :
               language === 'de' ? 'Stand Anzeigen' :
               language === 'it' ? 'Vedi Stand' :
               language === 'pt' ? 'Ver Stand' :
               language === 'ru' ? 'Просмотреть Стенд' :
               language === 'hi' ? 'बूथ देखें' :
               'View Booth',
    
    editBooth: language === 'zh' ? '编辑展位' :
               language === 'ja' ? 'ブース編集' :
               language === 'ko' ? '부스 편집' :
               language === 'ar' ? 'تعديل الكشاك' :
               language === 'es' ? 'Editar Puesto' :
               language === 'fr' ? 'Modifier le Stand' :
               language === 'de' ? 'Stand Bearbeiten' :
               language === 'it' ? 'Modifica Stand' :
               language === 'pt' ? 'Editar Stand' :
               language === 'ru' ? 'Редактировать Стенд' :
               language === 'hi' ? 'बूथ संपादित करें' :
               'Edit Booth',
    
    boothNumber: language === 'zh' ? '展位编号' :
                 language === 'ja' ? 'ブース番号' :
                 language === 'ko' ? '부스 번호' :
                 language === 'ar' ? 'رقم الكشك' :
                 language === 'es' ? 'Número de Puesto' :
                 language === 'fr' ? 'Numéro de Stand' :
                 language === 'de' ? 'Standnummer' :
                 language === 'it' ? 'Numero Stand' :
                 language === 'pt' ? 'Número do Stand' :
                 language === 'ru' ? 'Номер стенда' :
                 language === 'hi' ? 'बूथ संख्या' :
                 'Booth Number',
    
    boothName: language === 'zh' ? '展位名称 *' :
               language === 'ja' ? 'ブース名 *' :
               language === 'ko' ? '부스 이름 *' :
               language === 'ar' ? 'اسم الكشاك *' :
               language === 'es' ? 'Nombre del Puesto *' :
               language === 'fr' ? 'Nom du Stand *' :
               language === 'de' ? 'Standname *' :
               language === 'it' ? 'Nome Stand *' :
               language === 'pt' ? 'Nome do Stand *' :
               language === 'ru' ? 'Название Стенда *' :
               language === 'hi' ? 'बूथ नाम *' :
               'Booth Name *',
    
    exhibitionName: language === 'zh' ? '公司名称 *' :
                    language === 'ja' ? '会社名 *' :
                    language === 'ko' ? '회사 이름 *' :
                    language === 'ar' ? 'اسم الشركة *' :
                    language === 'es' ? 'Nombre de la Empresa *' :
                    language === 'fr' ? 'Nom de l\'Entreprise *' :
                    language === 'de' ? 'Firmenname *' :
                    language === 'it' ? 'Nome Azienda *' :
                    language === 'pt' ? 'Nome da Empresa *' :
                    language === 'ru' ? 'Название Компании *' :
                    language === 'hi' ? 'कंपनी का नाम *' :
                    'Company Name *',
    
    location: language === 'zh' ? '公司地址' :
              language === 'ja' ? '会社住所' :
              language === 'ko' ? '회사 주소' :
              language === 'ar' ? 'عنوان الشركة' :
              language === 'es' ? 'Dirección de la Empresa' :
              language === 'fr' ? 'Adresse de l\'Entreprise' :
              language === 'de' ? 'Firmensitz' :
              language === 'it' ? 'Indirizzo Azienda' :
              language === 'pt' ? 'Endereço da Empresa' :
              language === 'ru' ? 'Адрес Компании' :
              language === 'hi' ? 'कंपनी का पता' :
              'Company Address',
    
    theme: language === 'zh' ? '主题' :
           language === 'ja' ? 'テーマ' :
           language === 'ko' ? '테마' :
           language === 'ar' ? 'المظهر' :
           language === 'es' ? 'Tema' :
           language === 'fr' ? 'Thème' :
           language === 'de' ? 'Thema' :
           language === 'it' ? 'Tema' :
           language === 'pt' ? 'Tema' :
           language === 'ru' ? 'Тема' :
           language === 'hi' ? 'विषय' :
           'Theme',
    
    boothDescription: language === 'zh' ? '展会介绍' :
           language === 'ja' ? '展示会紹介' :
           language === 'ko' ? '전시회 소개' :
           language === 'ar' ? 'نبذة عن المعرض' :
           language === 'es' ? 'Descripción de la feria' :
           language === 'fr' ? "Présentation du salon" :
           language === 'de' ? 'Messebeschreibung' :
           language === 'it' ? 'Descrizione della fiera' :
           language === 'pt' ? 'Descrição da feira' :
           language === 'ru' ? 'Описание выставки' :
           language === 'hi' ? 'प्रदर्शनी परिचय' :
           'Exhibition Description',
    
    boothDescriptionHint: language === 'zh' ? '介绍展会亮点、参展产品范围、可提供的服务等，支持多语言填写（每种语言最多 2000 字）。' :
           language === 'de' ? 'Beschreiben Sie Highlights, Produktpalette und Services. Mehrsprachig, max. 2000 Zeichen pro Sprache.' :
           language === 'es' ? 'Describa los aspectos destacados, la gama de productos y los servicios. Multilingüe, máx. 2000 caracteres por idioma.' :
           language === 'fr' ? 'Décrivez les points forts, la gamme de produits et les services. Multilingue, max. 2000 caractères par langue.' :
           'Describe highlights, product range and services. Multilingual, max 2000 characters per language.',
    
    layout: language === 'zh' ? '布局' :
            language === 'ja' ? 'レイアウト' :
            language === 'ko' ? '레이아웃' :
            language === 'ar' ? 'التخطيط' :
            language === 'es' ? 'Diseño' :
            language === 'fr' ? 'Disposition' :
            language === 'de' ? 'Layout' :
            language === 'it' ? 'Layout' :
            language === 'pt' ? 'Layout' :
            language === 'ru' ? 'Макет' :
            language === 'hi' ? 'लेआउट' :
            'Layout',
    
    selectTheme: language === 'zh' ? '选择主题' :
                 language === 'ja' ? 'テーマを選択' :
                 language === 'ko' ? '테마 선택' :
                 language === 'ar' ? 'اختر المظهر' :
                 language === 'es' ? 'Seleccionar tema' :
                 language === 'fr' ? 'Sélectionner le thème' :
                 language === 'de' ? 'Thema auswählen' :
                 language === 'it' ? 'Seleziona tema' :
                 language === 'pt' ? 'Selecionar tema' :
                 language === 'ru' ? 'Выбрать тему' :
                 language === 'hi' ? 'विषय चुनें' :
                 'Select theme',
    
    selectLayout: language === 'zh' ? '选择布局' :
                  language === 'ja' ? 'レイアウトを選択' :
                  language === 'ko' ? '레이아웃 선택' :
                  language === 'ar' ? 'اختر التخطيط' :
                  language === 'es' ? 'Seleccionar diseño' :
                  language === 'fr' ? 'Sélectionner la disposition' :
                  language === 'de' ? 'Layout auswählen' :
                  language === 'it' ? 'Seleziona layout' :
                  language === 'pt' ? 'Selecionar layout' :
                  language === 'ru' ? 'Выбрать макет' :
                  language === 'hi' ? 'लेआउट चुनें' :
                  'Select layout',
    
    logo: language === 'zh' ? '展位 Logo' :
          language === 'ja' ? 'ブースロゴ' :
          language === 'ko' ? '부스 로고' :
          language === 'ar' ? 'شعار الكشاك' :
          language === 'es' ? 'Logo del Puesto' :
          language === 'fr' ? 'Logo du Stand' :
          language === 'de' ? 'Stand Logo' :
          language === 'it' ? 'Logo Stand' :
          language === 'pt' ? 'Logo do Stand' :
          language === 'ru' ? 'Логотип Стенда' :
          language === 'hi' ? 'बूथ लोगो' :
          'Booth Logo',
    
    banner: language === 'zh' ? '展位横幅' :
            language === 'ja' ? 'ブースバナー' :
            language === 'ko' ? '부스 배너' :
            language === 'ar' ? 'لافتة الكشاك' :
            language === 'es' ? 'Banner del Puesto' :
            language === 'fr' ? 'Bannière du Stand' :
            language === 'de' ? 'Stand Banner' :
            language === 'it' ? 'Banner Stand' :
            language === 'pt' ? 'Banner do Stand' :
            language === 'ru' ? 'Баннер Стенда' :
            language === 'hi' ? 'बूथ बैनर' :
            'Booth Banner',
    
    keywords: language === 'zh' ? '关键词（最多50个）' :
              language === 'ja' ? 'キーワード（最大50個）' :
              language === 'ko' ? '키워드 (최대 50개)' :
              language === 'ar' ? 'كلمات مفتاحية (أقصى 50)' :
              language === 'es' ? 'Palabras clave (máx. 50)' :
              language === 'fr' ? 'Mots-clés (max 50)' :
              language === 'de' ? 'Schlüsselwörter (max 50)' :
              language === 'it' ? 'Parole chiave (max 50)' :
              language === 'pt' ? 'Palavras-chave (máx. 50)' :
              language === 'ru' ? 'Ключевые слова (макс. 50)' :
              language === 'hi' ? 'कीवर्ड (अधिकतम 50)' :
              'Keywords (max 50)',
    
    uploadLogo: language === 'zh' ? '上传 Logo' :
                language === 'ja' ? 'ロゴをアップロード' :
                language === 'ko' ? '로고 업로드' :
                language === 'ar' ? 'تحميل الشعار' :
                language === 'es' ? 'Subir Logo' :
                language === 'fr' ? 'Télécharger Logo' :
                language === 'de' ? 'Logo Hochladen' :
                language === 'it' ? 'Carica Logo' :
                language === 'pt' ? 'Enviar Logo' :
                language === 'ru' ? 'Загрузить Логотип' :
                language === 'hi' ? 'लोगो अपलोड करें' :
                'Upload Logo',
    
    uploadBanner: language === 'zh' ? '上传横幅' :
                  language === 'ja' ? 'バナーをアップロード' :
                  language === 'ko' ? '배너 업로드' :
                  language === 'ar' ? 'تحميل اللافتة' :
                  language === 'es' ? 'Subir Banner' :
                  language === 'fr' ? 'Télécharger Bannière' :
                  language === 'de' ? 'Banner Hochladen' :
                  language === 'it' ? 'Carica Banner' :
                  language === 'pt' ? 'Enviar Banner' :
                  language === 'ru' ? 'Загрузить Баннер' :
                  language === 'hi' ? 'बैनर अपलोड करें' :
                  'Upload Banner',
    
    max10Keywords: language === 'zh' ? '已添加 {count}/10 个关键词' :
                   language === 'ja' ? '{count}/10 個のキーワードを追加' :
                   language === 'ko' ? '{count}/10 키워드 추가됨' :
                   language === 'ar' ? '{count}/10 كلمات مفتاحية مضافة' :
                   language === 'es' ? '{count}/10 palabras clave añadidas' :
                   language === 'fr' ? '{count}/10 mots-clés ajoutés' :
                   language === 'de' ? '{count}/10 Schlüsselwörter hinzugefügt' :
                   language === 'it' ? '{count}/10 parole chiave aggiunte' :
                   language === 'pt' ? '{count}/10 palavras-chave adicionadas' :
                   language === 'ru' ? '{count}/10 ключевых слов добавлено' :
                   language === 'hi' ? '{count}/10 कीवर्ड जोड़े गए' :
                   '{count}/10 keywords added',
    
    cancel: language === 'zh' ? '取消' :
            language === 'ja' ? 'キャンセル' :
            language === 'ko' ? '취소' :
            language === 'ar' ? 'إلغاء' :
            language === 'es' ? 'Cancelar' :
            language === 'fr' ? 'Annuler' :
            language === 'de' ? 'Abbrechen' :
            language === 'it' ? 'Annulla' :
            language === 'pt' ? 'Cancelar' :
            language === 'ru' ? 'Отмена' :
            language === 'hi' ? 'रद्द करें' :
            'Cancel',
    
    saveChanges: language === 'zh' ? '保存更改' :
                 language === 'ja' ? '変更を保存' :
                 language === 'ko' ? '변경 사항 저장' :
                 language === 'ar' ? 'حفظ التغييرات' :
                 language === 'es' ? 'Guardar Cambios' :
                 language === 'fr' ? 'Enregistrer les modifications' :
                 language === 'de' ? 'Änderungen speichern' :
                 language === 'it' ? 'Salva Modifiche' :
                 language === 'pt' ? 'Salvar Alterações' :
                 language === 'ru' ? 'Сохранить изменения' :
                 language === 'hi' ? 'परिवर्तन सहेजें' :
                 'Save Changes',
    
    createBooth: language === 'zh' ? '创建展位' :
                 language === 'ja' ? 'ブース作成' :
                 language === 'ko' ? '부스 만들기' :
                 language === 'ar' ? 'إنشاء كشاك' :
                 language === 'es' ? 'Crear Puesto' :
                 language === 'fr' ? 'Créer le Stand' :
                 language === 'de' ? 'Stand Erstellen' :
                 language === 'it' ? 'Crea Stand' :
                 language === 'pt' ? 'Criar Stand' :
                 language === 'ru' ? 'Создать Стенд' :
                 language === 'hi' ? 'बूथ बनाएं' :
                 'Create Booth',
    
    creating: language === 'zh' ? '创建中...' :
              language === 'ja' ? '作成中...' :
              language === 'ko' ? '만들기 중...' :
              language === 'ar' ? 'جارٍ الإنشاء...' :
              language === 'es' ? 'Creando...' :
              language === 'fr' ? 'Création...' :
              language === 'de' ? 'Erstellen...' :
              language === 'it' ? 'Creazione...' :
              language === 'pt' ? 'Criando...' :
              language === 'ru' ? 'Создается...' :
              language === 'hi' ? 'बन रहा है...' :
              'Creating...',

    saveFailed: language === 'zh' ? '保存失败，请重试' :
                language === 'ja' ? '保存に失敗しました、再試行してください' :
                language === 'ko' ? '저장 실패, 다시 시도해주세요' :
                language === 'ar' ? 'فشل الحفظ، يرجى المحاولة مرة أخرى' :
                language === 'es' ? 'Guardado fallido, por favor intente nuevamente' :
                language === 'fr' ? 'Échec de la sauvegarde, veuillez réessayer' :
                language === 'de' ? 'Speichern fehlgeschlagen, bitte versuchen Sie es erneut' :
                language === 'it' ? 'Salvataggio fallito, riprovare' :
                language === 'pt' ? 'Falha ao salvar, por favor tente novamente' :
                language === 'ru' ? 'Сохранение не удалось, попробуйте снова' :
                language === 'hi' ? 'बचाने में विफल, कृपया पुनः प्रयास करें' :
                'Save failed, please try again',

    boothNameExists: language === 'zh' ? '展位名称已存在，请使用其他名称' :
                      language === 'ja' ? 'ブース名は既に存在します、別の名前を使用してください' :
                      language === 'ko' ? '부스 이름이 이미 존재합니다, 다른 이름을 사용해주세요' :
                      language === 'ar' ? 'اسم الكشاك موجود بالفعل، يرجى استخدام اسم آخر' :
                      language === 'es' ? 'El nombre del puesto ya existe, por favor use otro nombre' :
                      language === 'fr' ? 'Ce nom de stand existe déjà, veuillez utiliser un autre nom' :
                      language === 'de' ? 'Standname existiert bereits, bitte verwenden Sie einen anderen Namen' :
                      language === 'it' ? 'Il nome dello stand esiste già, si prega di usare un altro nome' :
                      language === 'pt' ? 'O nome do stand já existe, por favor use outro nome' :
                      language === 'ru' ? 'Название стенда уже существует, пожалуйста, используйте другое имя' :
                      language === 'hi' ? 'बूथ का नाम पहले से मौजूद है, कृपया दूसरा नाम उपयोग करें' :
                      'Booth name already exists, please use another name',

    deleteConfirm: language === 'zh' ? '确定要删除这个展位吗？' :
                   language === 'ja' ? 'このブースを削除してもよろしいですか？' :
                   language === 'ko' ? '이 부스를 삭제하시겠습니까?' :
                   language === 'ar' ? 'هل أنت متأكد من حذف هذا الكشاك؟' :
                   language === 'es' ? '¿Está seguro de que desea eliminar este puesto?' :
                   language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce stand ?' :
                   language === 'de' ? 'Sind Sie sicher, dass Sie diesen Stand löschen möchten?' :
                   language === 'it' ? 'Sei sicuro di voler eliminare questo stand?' :
                   language === 'pt' ? 'Tem certeza que deseja excluir este stand?' :
                   language === 'ru' ? 'Вы уверены, что хотите удалить этот стенд?' :
                   language === 'hi' ? 'आप सुनिश्चित हैं कि आप इस बूथ को हटाना चाहते हैं?' :
                   'Are you sure you want to delete this booth?',
    
    boothNamePlaceholder: language === 'zh' ? '例如：2024春季博览会' :
                          language === 'ja' ? '例：スプリングフェア2024' :
                          language === 'ko' ? '예: 스프링 페어 2024' :
                          language === 'ar' ? 'مثال: معرض الربيع 2024' :
                          language === 'es' ? 'ej: Feria de Primavera 2024' :
                          language === 'fr' ? 'ex: Salon de Printemps 2024' :
                          language === 'de' ? 'z.B: Frühjahrsmesse 2024' :
                          language === 'it' ? 'es: Fiera di Primavera 2024' :
                          language === 'pt' ? 'ex: Feira de Primavera 2024' :
                          language === 'ru' ? 'напр: Весенняя ярмарка 2024' :
                          language === 'hi' ? 'उदा: स्प्रिंग फेयर 2024' :
                          'e.g., Spring Fair 2024',
    
    exhibitionPlaceholder: language === 'zh' ? '例如：杭州国汇国际贸易有限公司' :
                           language === 'ja' ? '例：杭州国際貿易有限公司' :
                           language === 'ko' ? '예: 항저우 국회 국제 무역 유한 회사' :
                           language === 'ar' ? 'مثال: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'es' ? 'ej: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'fr' ? 'ex: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'de' ? 'z.B: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'it' ? 'es: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'pt' ? 'ex: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'ru' ? 'напр: Hangzhou Gouhui International Trade Co., Ltd.' :
                           language === 'hi' ? 'उदा: Hangzhou Gouhui International Trade Co., Ltd.' :
                           'e.g., Hangzhou Gouhui International Trade Co., Ltd.',
    
    locationPlaceholder: language === 'zh' ? '例如：浙江省杭州市' :
                         language === 'ja' ? '例：浙江省杭州市' :
                         language === 'ko' ? '예: 절강성 항저우시' :
                         language === 'ar' ? 'مثال: مدينة غوانغتشو، مقاطعة تشيجيانغ' :
                         language === 'es' ? 'ej: Hangzhou, Zhejiang' :
                         language === 'fr' ? 'ex: Hangzhou, Zhejiang' :
                         language === 'de' ? 'z.B: Hangzhou, Zhejiang' :
                         language === 'it' ? 'es: Hangzhou, Zhejiang' :
                         language === 'pt' ? 'ex: Hangzhou, Zhejiang' :
                         language === 'ru' ? 'напр: Ханчжоу, Чжэцзян' :
                         language === 'hi' ? 'उदा: हांग्ज़ोउ, झेजियांग' :
                         'e.g., Hangzhou, Zhejiang',
  }
  
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    exhibitionName: '',
    location: '',
    logoUrl: '',
    bannerUrl: '',
    keywords: [] as string[],
    documents: [] as Array<{ url: string; name: string; type: string; size: number }>,
    descriptions: {} as Record<string, string>,
    theme: '',
    colorScheme: '',
    layout: ''
  })

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    fetchBooths()
    // Check if we need to open edit modal for a specific booth
    const editBoothId = searchParams.get('edit')
    if (editBoothId) {
      // Fetch the specific booth and open edit modal
      const fetchAndOpenEdit = async () => {
        try {
          const res = await fetch(`/api/booths?id=${editBoothId}`)
          const data = await res.json()
          if (data.booth) {
            setEditingBooth(data.booth)
            setFormData({
              name: data.booth.name || '',
              exhibitionName: data.booth.exhibitionName || '',
              location: data.booth.location || '',
              logoUrl: data.booth.logoUrl || '',
              bannerUrl: data.booth.bannerUrl || '',
              keywords: data.booth.keywords || [],
              documents: data.booth.documents || [],
              theme: data.booth.theme || '',
              colorScheme: data.booth.colorScheme || '',
              layout: data.booth.layout || ''
            })
            setLogoPreview(data.booth.logoUrl || '')
            setBannerPreview(data.booth.bannerUrl || '')
          }
        } catch (error) {
          console.error('Failed to fetch booth for edit:', error)
        }
      }
      fetchAndOpenEdit()
    }
  }, [])

  const fetchBooths = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/booths', {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.booths) {
        setBooths(data.booths)
      }
    } catch (error) {
      console.error('Failed to fetch booths:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 立即清空 input value，确保选择同一文件时也能再次触发 onChange
    event.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'boothLogo')

    setUploadingLogo(true)
    setUploadError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`)
      }
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, logoUrl: data.url }))
        setLogoPreview(data.url)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Logo upload failed:', error)
      setUploadError(language === 'zh' ? '上传失败，请检查网络后重试' : 'Upload failed, please check your network and try again')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 立即清空 input value，确保选择同一文件时也能再次触发 onChange
    event.target.value = ''
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'boothBanner')

    setUploadingBanner(true)
    setUploadError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`)
      }
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, bannerUrl: data.url }))
        setBannerPreview(data.url)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Banner upload failed:', error)
      setUploadError(language === 'zh' ? '上传失败，请检查网络后重试' : 'Upload failed, please check your network and try again')
    } finally {
      setUploadingBanner(false)
    }
  }

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (formData.documents.length + files.length > 10) {
      alert(language === 'zh' ? '最多只能上传10个文件' : 'Maximum 10 files allowed')
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `${file.name}-${Date.now()}`
      
      setUploadingFiles(prev => new Set([...prev, fileKey]))
      setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }))

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'boothDocument')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        const data = await res.json()
        if (data.url) {
          setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, {
              url: data.url,
              name: file.name,
              type: file.type,
              size: file.size
            }]
          }))
        } else if (data.error) {
          console.error('Upload error:', data.error)
          alert(`${language === 'zh' ? '上传失败' : 'Upload failed'}: ${data.error}`)
        } else {
          console.error('Upload failed, no URL returned:', data)
          alert(language === 'zh' ? '上传失败，请重试' : 'Upload failed, please try again')
        }
      } catch (error) {
        console.error('Document upload failed:', error)
        alert(language === 'zh' ? '上传失败，请重试' : 'Upload failed, please try again')
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileKey)
          return newSet
        })
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileKey]
          return newProgress
        })
      }
    }
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return
    if (formData.keywords.length >= 50) return
    if (formData.keywords.includes(keyword.trim())) return
    
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, keyword.trim()]
    }))
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage('')
    setNameError('')
    try {
      const method = editingBooth ? 'PUT' : 'POST'
      const body = editingBooth 
        ? { ...formData, id: editingBooth.id }
        : formData

      const res = await fetch('/api/booths', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        setShowCreateModal(false)
        setEditingBooth(null)
        setFormData({
          name: '',
          exhibitionName: '',
          location: '',
          logoUrl: '',
          bannerUrl: '',
          keywords: [],
          documents: [],
          descriptions: {},
          theme: '',
          colorScheme: '',
          layout: ''
        })
        setLogoPreview('')
        setBannerPreview('')
        setNewKeyword('')
        fetchBooths()
      } else {
        if (data.field === 'name') {
          setNameError(data.error || t.boothNameExists)
        } else {
          setErrorMessage(data.error || t.saveFailed)
        }
      }
    } catch (error) {
      console.error('Failed to save booth:', error)
      setErrorMessage(t.saveFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return
    
    try {
      const res = await fetch(`/api/booths?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchBooths()
      }
    } catch (error) {
      console.error('Failed to delete booth:', error)
    }
  }

  const handleTogglePublish = async (booth: Booth) => {
    try {
      const res = await fetch('/api/booths', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booth.id,
          isPublished: !booth.isPublished
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchBooths()
      }
    } catch (error) {
      console.error('Failed to update booth:', error)
    }
  }

  const openEditModal = (booth: Booth) => {
    setEditingBooth(booth)
    setFormData({
      name: booth.name,
      exhibitionName: booth.exhibitionName,
      location: booth.location || '',
      logoUrl: booth.logoUrl || '',
      bannerUrl: booth.bannerUrl || '',
      keywords: booth.keywords || [],
      documents: (booth.documents as Array<{ url: string; name: string; type: string; size: number }>) || [],
      descriptions: (booth.descriptions as Record<string, string>) || {},
      theme: booth.theme || '',
      colorScheme: booth.colorScheme || '',
      layout: booth.layout || ''
    })
    setLogoPreview(booth.logoUrl || '')
    setBannerPreview(booth.bannerUrl || '')
    setShowCreateModal(true)
  }

  const themeOptions = ['Light', 'Dark', 'Vibrant', 'Professional']
  const layoutOptions = ['Modern', 'Classic', 'Grid', 'Minimal']

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.myBooths}</h1>
          <p className="text-gray-500 mt-1">{t.manageBooths}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t.createNew}
        </button>
      </div>

      {/* Booth Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : booths.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noBooths}</h3>
          <p className="text-gray-500 mb-4">{t.createFirst}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.createFirstBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {booths.map((booth) => (
            <div
              key={booth.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{booth.name}</h3>
                  <p className="text-sm text-gray-500">{booth.exhibitionName}</p>
                  {booth.boothCode && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-mono bg-indigo-50 text-indigo-600 rounded border border-indigo-200">
                      {booth.boothCode}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booth.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booth.isPublished ? t.published : t.unpublished}
                </span>
              </div>

              {booth.location && (
                <p className="text-sm text-gray-600 mb-2">📍 {booth.location}</p>
              )}

              {booth.exhibitionDates && (
                <p className="text-sm text-gray-600 mb-3">
                  📅 {booth.exhibitionDates.start} - {booth.exhibitionDates.end}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                {booth.theme && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                    {booth.theme}
                  </span>
                )}
                {booth.layout && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    {booth.layout}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {t.created}: {new Date(booth.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {booth.isPublished ? (
                    <button
                      onClick={() => handleTogglePublish(booth)}
                      className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors font-medium"
                      title={t.unpublish}
                    >
                      下架
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTogglePublish(booth)}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors font-medium"
                      title={t.publish}
                    >
                      上架
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(booth)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title={t.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(booth.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => window.open(`/seller/booths/${booth.id}`, '_blank')}
                className="w-full mt-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 text-sm font-medium">
                {t.viewBooth} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-h-screen">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBooth ? t.editBooth : t.createNew}
              </h2>
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {editingBooth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.boothNumber}
                    </label>
                    <input
                      type="text"
                      value={editingBooth.boothNumber}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.boothName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errorMessage) setErrorMessage('')
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      nameError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t.boothNamePlaceholder}
                    required
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.exhibitionName}
                  </label>
                  <input
                    type="text"
                    value={formData.exhibitionName}
                    onChange={(e) => setFormData({ ...formData, exhibitionName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.exhibitionPlaceholder}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.locationPlaceholder}
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.theme}
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectTheme}</option>
                  {themeOptions.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 {t.boothDescription}
                </label>
                <p className="text-xs text-gray-500 mb-2">{t.boothDescriptionHint}</p>
                <MultilingualInput
                  value={formData.descriptions}
                  onChange={(val) => setFormData({ ...formData, descriptions: val })}
                  label=""
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.layout}
                </label>
                <select
                  value={formData.layout}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectLayout}</option>
                  {layoutOptions.map((layout) => (
                    <option key={layout} value={layout}>{layout}</option>
                  ))}
                </select>
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button onClick={() => setUploadError('')} className="ml-3 text-red-400 hover:text-red-600">✕</button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.logo}
                </label>
                <label htmlFor="booth-logo-upload" className="block border border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  {uploadingLogo ? (
                    <div className="text-gray-500">
                      <div className="text-3xl mb-1 animate-pulse">⏳</div>
                      <div>{language === 'zh' ? '上传中...' : 'Uploading...'}</div>
                    </div>
                  ) : logoPreview || formData.logoUrl ? (
                    <img
                      src={logoPreview || formData.logoUrl}
                      alt="Logo preview"
                      className="max-h-24 mx-auto object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-3xl mb-1">📷</div>
                      <div>{t.uploadLogo}</div>
                      <div className="text-xs mt-1">JPG, PNG, WebP • Max 5MB</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="booth-logo-upload"
                    disabled={uploadingLogo}
                  />
                  {logoPreview || formData.logoUrl ? (
                    <div className="text-blue-600 text-sm mt-2 hover:text-blue-700">
                      {t.uploadLogo} (换一张)
                    </div>
                  ) : null}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.banner}
                </label>
                <label htmlFor="booth-banner-upload" className="block border border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  {uploadingBanner ? (
                    <div className="text-gray-500">
                      <div className="text-3xl mb-1 animate-pulse">⏳</div>
                      <div>{language === 'zh' ? '上传中...' : 'Uploading...'}</div>
                    </div>
                  ) : bannerPreview || formData.bannerUrl ? (
                    <img
                      src={bannerPreview || formData.bannerUrl}
                      alt="Banner preview"
                      className="max-h-24 mx-auto object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-3xl mb-1">🎨</div>
                      <div>{t.uploadBanner}</div>
                      <div className="text-xs mt-1">JPG, PNG, WebP • Max 5MB</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="booth-banner-upload"
                    disabled={uploadingBanner}
                  />
                  {bannerPreview || formData.bannerUrl ? (
                    <div className="text-blue-600 text-sm mt-2 hover:text-blue-700">
                      {t.uploadBanner} (换一张)
                    </div>
                  ) : null}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.keywords}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newKeyword.trim()) {
                        e.preventDefault()
                        addKeyword(newKeyword)
                        setNewKeyword('')
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入关键词后按回车"
                    disabled={formData.keywords.length >= 50}
                  />
                  <button
                    onClick={() => {
                      addKeyword(newKeyword)
                      setNewKeyword('')
                    }}
                    disabled={!newKeyword.trim() || formData.keywords.length >= 50}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t.max10Keywords.replace('{count}', formData.keywords.length.toString())}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'zh' ? '上传文件（最多10个）' : 'Upload Files (max 10)'}
                </label>
                <label
                  htmlFor="booth-document-upload"
                  className={`block border border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer ${
                    formData.documents.length >= 10 || uploadingFiles.size > 0 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  style={{ backgroundColor: formData.documents.length >= 10 ? '#f9fafb' : undefined }}
                >
                  {uploadingFiles.size > 0 ? (
                    <div className="text-blue-600">
                      <div className="text-3xl mb-1">⏳</div>
                      <div>{language === 'zh' ? '上传中...' : 'Uploading...'}</div>
                      <div className="text-xs mt-1">{uploadingFiles.size} {language === 'zh' ? '个文件' : 'file(s)'}</div>
                    </div>
                  ) : formData.documents.length === 0 ? (
                    <div className="text-gray-400">
                      <div className="text-3xl mb-1">📎</div>
                      <div>{language === 'zh' ? '点击或拖拽上传文件' : 'Click or drag to upload files'}</div>
                      <div className="text-xs mt-1">PDF, DOC, XLS, PPT, ZIP • Max 100MB each</div>
                    </div>
                  ) : (
                    <div className="text-blue-600">
                      <div className="text-2xl mb-1">📎</div>
                      <div>{language === 'zh' ? '添加更多文件' : 'Add more files'}</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="booth-document-upload"
                    disabled={formData.documents.length >= 10}
                  />
                </label>

                {formData.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={language === 'zh' ? '删除文件' : 'Remove file'}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {language === 'zh' ? `已上传 ${formData.documents.length}/10 个文件` : `${formData.documents.length}/10 files uploaded`}
                </p>
              </div>

              <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                    setShowCreateModal(false)
                    setEditingBooth(null)
                    setFormData({
                      name: '',
                      exhibitionName: '',
                      location: '',
                      logoUrl: '',
                      bannerUrl: '',
                      keywords: [],
                      documents: [],
                      descriptions: {},
                      theme: '',
                      colorScheme: '',
                      layout: ''
                    })
                    setLogoPreview('')
                    setBannerPreview('')
                    setNewKeyword('')
                  }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t.creating : (editingBooth ? t.saveChanges : t.createBooth)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
