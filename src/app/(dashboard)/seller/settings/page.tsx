'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/auth'
import { User, Mail, Phone, Building, Globe, Bell, Shield, Save, Upload, FileText, Image as ImageIcon, CreditCard, Video, CheckCircle, ShieldCheck, MessageCircle, Link as LinkIcon } from 'lucide-react'
import VerificationFileUpload from '@/components/seller/VerificationFileUpload'

export default function SellerSettingsPage() {
  const [language, setLanguage] = useState('en')
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Form states
  const [profileData, setProfileData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    whatsapp: '',
    wechat: '',
    telegram: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    address: '',
    city: '',
    country: '',
    description: ''
  })
  
  // Multi-language descriptions
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [activeLangTab, setActiveLangTab] = useState('zh')
  
  const supportedLanguages = [
    { code: 'zh', name: '中文', flag: 'CN' },
    { code: 'en', name: 'English', flag: 'US' },
    { code: 'ja', name: '日本語', flag: 'JP' },
    { code: 'ko', name: '한국어', flag: 'KR' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'ar', name: 'العربية', flag: 'SA' },
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'pt', name: 'Português', flag: 'PT' },
    { code: 'hi', name: 'हिंदी', flag: 'IN' },
    { code: 'th', name: 'ไทย', flag: 'TH' },
    { code: 'vi', name: 'Tiếng Việt', flag: 'VN' },
  ]
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  interface VerificationFile {
    id: string
    name: string
    type: string
    url?: string
    uploadedAt?: string
  }
  const [verificationFiles, setVerificationFiles] = useState<VerificationFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  
  // Load profile data on mount
  useEffect(() => {
    loadProfileData()
  }, [])
  
  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/seller/profile')
      const data = await response.json()
      if (data.success || data.profile) {
        const profile = data.profile
        setProfileData({
          companyName: profile.companyName || '',
          contactName: '', // Not stored in database yet
          email: profile.email || '',
          phone: profile.phone || '',
          website: profile.website || '',
          whatsapp: profile.whatsapp || '',
          wechat: profile.wechat || '',
          telegram: profile.telegram || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          instagram: profile.instagram || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          description: profile.description || ''
        })
        // Load multi-language descriptions
        if (profile.descriptions) {
          setDescriptions(typeof profile.descriptions === 'object' ? profile.descriptions : {})
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }
  
  // Get language from cookie
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])
  
  // Load verification files
  useEffect(() => {
    if (activeTab === 'verification') {
      loadVerificationFiles()
    }
  }, [activeTab])
  
  const loadVerificationFiles = async () => {
    setLoadingFiles(true)
    try {
      const response = await fetch('/api/seller/verification/files')
      const data = await response.json()
      if (data.success) {
        setVerificationFiles(data.files)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoadingFiles(false)
    }
  }
  
  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    try {
      const response = await fetch(`/api/seller/verification/delete?id=${fileId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        loadVerificationFiles()
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }
  
  // Translations - Full multi-language support
  const t = {
    title: language === 'zh' ? '账户设置' :
           language === 'ja' ? 'アカウント設定' :
           language === 'ar' ? 'إعدادات الحساب' :
           language === 'es' ? 'Configuración de la cuenta' :
           language === 'fr' ? 'Paramètres du compte' :
           language === 'de' ? 'Kontoeinstellungen' :
           language === 'ko' ? '계정 설정' :
           language === 'ru' ? 'Настройки аккаунта' :
           language === 'pt' ? 'Configurações da conta' :
           language === 'hi' ? 'खाता सेटिंग्स' :
           language === 'th' ? 'การตั้งค่าบัญชี' :
           language === 'vi' ? 'Cài đặt tài khoản' :
           'Account Settings',
    
    // Stats message on dashboard
    statsMessage: language === 'zh' ? '统计数据将显示在仪表板页面上' :
                  language === 'ja' ? '統計データはダッシュボードページに表示されます' :
                  language === 'ar' ? 'ستظهر الإحصائيات على صفحة لوحة التحكم' :
                  language === 'es' ? 'Las estadísticas aparecerán en la página del panel' :
                  language === 'fr' ? 'Les statistiques apparaîtront sur la page du tableau de bord' :
                  language === 'de' ? 'Statistiken werden auf der Dashboard-Seite angezeigt' :
                  language === 'ko' ? '통계 데이터가 대시보드 페이지에 표시됩니다' :
                  language === 'ru' ? 'Статистика будет отображена на странице панели управления' :
                  language === 'pt' ? 'Estatísticas aparecerão na página do painel' :
                  language === 'hi' ? 'डैशबोर्ड पेज पर आंकड़े दिखाई देंगे' :
                  language === 'th' ? 'สถิติจะปรากฏบนหน้าดัชบอร์ด' :
                  language === 'vi' ? 'Thống kê sẽ xuất hiện trên trang bảng điều khiển' :
                  'Stats will appear on dashboard page',
    
    tabs: {
      profile: language === 'zh' ? '个人资料' :
               language === 'ja' ? 'プロフィール' :
               language === 'ar' ? 'الملف الشخصي' :
               language === 'es' ? 'Perfil' :
               language === 'fr' ? 'Profil' :
               language === 'de' ? 'Profil' :
               language === 'ko' ? '프로필' :
               language === 'ru' ? 'Профиль' :
               language === 'pt' ? 'Perfil' :
               language === 'hi' ? 'प्रोफाइल' :
               language === 'th' ? 'โปรไฟล์' :
               language === 'vi' ? 'Hồ sơ' :
               'Profile',
      notifications: language === 'zh' ? '通知设置' :
                     language === 'ja' ? '通知設定' :
                     language === 'ar' ? 'إعدادات الإشعارات' :
                     language === 'es' ? 'Notificaciones' :
                     language === 'fr' ? 'Notifications' :
                     language === 'de' ? 'Benachrichtigungen' :
                     language === 'ko' ? '알림 설정' :
                     language === 'ru' ? 'Уведомления' :
                     language === 'pt' ? 'Notificações' :
                     language === 'hi' ? 'सूचनाएं' :
                     language === 'th' ? 'การแจ้งเตือน' :
                     language === 'vi' ? 'Thông báo' :
                     'Notifications',
      security: language === 'zh' ? '安全设置' :
                language === 'ja' ? 'セキュリティ設定' :
                language === 'ar' ? 'إعدادات الأمان' :
                language === 'es' ? 'Seguridad' :
                language === 'fr' ? 'Sécurité' :
                language === 'de' ? 'Sicherheit' :
                language === 'ko' ? '보안 설정' :
                language === 'ru' ? 'Безопасность' :
                language === 'pt' ? 'Segurança' :
                language === 'hi' ? 'सुरक्षा' :
                language === 'th' ? 'ความปลอดภัย' :
                language === 'vi' ? 'Bảo mật' :
                'Security',
    },
    
    profile: {
      companyName: language === 'zh' ? '公司名称' :
                   language === 'ja' ? '会社名' :
                   language === 'ar' ? 'اسم الشركة' :
                   language === 'es' ? 'Nombre de la empresa' :
                   language === 'fr' ? 'Nom de l\'entreprise' :
                   language === 'de' ? 'Firmenname' :
                   language === 'ko' ? '회사명' :
                   language === 'ru' ? 'Название компании' :
                   language === 'pt' ? 'Nome da empresa' :
                   language === 'hi' ? 'कंपनी का नाम' :
                   language === 'th' ? 'ชื่อบริษัท' :
                   language === 'vi' ? 'Tên công ty' :
                   'Company Name',
      contactName: language === 'zh' ? '联系人姓名' :
                   language === 'ja' ? '連絡先名' :
                   language === 'ar' ? 'اسم المتصل' :
                   language === 'es' ? 'Nombre del contacto' :
                   language === 'fr' ? 'Nom du contact' :
                   language === 'de' ? 'Kontaktname' :
                   language === 'ko' ? '연락처 이름' :
                   language === 'ru' ? 'Имя контактного лица' :
                   language === 'pt' ? 'Nome do contato' :
                   language === 'hi' ? 'संपर्क व्यक्ति का नाम' :
                   language === 'th' ? 'ชื่อผู้ติดต่อ' :
                   language === 'vi' ? 'Tên người liên hệ' :
                   'Contact Name',
      email: language === 'zh' ? '邮箱地址' :
             language === 'ja' ? 'メールアドレス' :
             language === 'ar' ? 'عنوان البريد الإلكتروني' :
             language === 'es' ? 'Dirección de correo electrónico' :
             language === 'fr' ? 'Adresse e-mail' :
             language === 'de' ? 'E-Mail-Adresse' :
             language === 'ko' ? '이메일 주소' :
             language === 'ru' ? 'Адрес электронной почты' :
             language === 'pt' ? 'Endereço de e-mail' :
             language === 'hi' ? 'ईमेल पता' :
             language === 'th' ? 'ที่อยู่อีเมล' :
             language === 'vi' ? 'Địa chỉ email' :
             'Email Address',
      phone: language === 'zh' ? '电话号码' :
             language === 'ja' ? '電話番号' :
             language === 'ar' ? 'رقم الهاتف' :
             language === 'es' ? 'Número de teléfono' :
             language === 'fr' ? 'Numéro de téléphone' :
             language === 'de' ? 'Telefonnummer' :
             language === 'ko' ? '전화번호' :
             language === 'ru' ? 'Номер телефона' :
             language === 'pt' ? 'Número de telefone' :
             language === 'hi' ? 'फोन नंबर' :
             language === 'th' ? 'หมายเลขโทรศัพท์' :
             language === 'vi' ? 'Số điện thoại' :
             'Phone Number',
      website: language === 'zh' ? '网站' :
               language === 'ja' ? 'ウェブサイト' :
               language === 'ar' ? 'الموقع الإلكتروني' :
               language === 'es' ? 'Sitio web' :
               language === 'fr' ? 'Site web' :
               language === 'de' ? 'Website' :
               language === 'ko' ? '웹사이트' :
               language === 'ru' ? 'Веб-сайт' :
               language === 'pt' ? 'Site web' :
               language === 'hi' ? 'वेबसाइट' :
               language === 'th' ? 'เว็บไซต์' :
               language === 'vi' ? 'Trang web' :
               'Website',
      address: language === 'zh' ? '地址' :
               language === 'ja' ? '住所' :
               language === 'ar' ? 'العنوان' :
               language === 'es' ? 'Dirección' :
               language === 'fr' ? 'Adresse' :
               language === 'de' ? 'Adresse' :
               language === 'ko' ? '주소' :
               language === 'ru' ? 'Адрес' :
               language === 'pt' ? 'Endereço' :
               language === 'hi' ? 'पता' :
               language === 'th' ? 'ที่อยู่' :
               language === 'vi' ? 'Địa chỉ' :
               'Address',
      city: language === 'zh' ? '城市' :
            language === 'ja' ? '都市' :
            language === 'ar' ? 'المدينة' :
            language === 'es' ? 'Ciudad' :
            language === 'fr' ? 'Ville' :
            language === 'de' ? 'Stadt' :
            language === 'ko' ? '도시' :
            language === 'ru' ? 'Город' :
            language === 'pt' ? 'Cidade' :
            language === 'hi' ? 'शहर' :
            language === 'th' ? 'เมือง' :
            language === 'vi' ? 'Thành phố' :
            'City',
      country: language === 'zh' ? '国家' :
               language === 'ja' ? '国' :
               language === 'ar' ? 'الدولة' :
               language === 'es' ? 'País' :
               language === 'fr' ? 'Pays' :
               language === 'de' ? 'Land' :
               language === 'ko' ? '국가' :
               language === 'ru' ? 'Страна' :
               language === 'pt' ? 'País' :
               language === 'hi' ? 'देश' :
               language === 'th' ? 'ประเทศ' :
               language === 'vi' ? 'Quốc gia' :
               'Country',
      description: language === 'zh' ? '公司简介' :
                   language === 'ja' ? '会社紹介' :
                   language === 'ar' ? 'وصف الشركة' :
                   language === 'es' ? 'Descripción de la empresa' :
                   language === 'fr' ? 'Description de l\'entreprise' :
                   language === 'de' ? 'Unternehmensbeschreibung' :
                   language === 'ko' ? '회사 소개' :
                   language === 'ru' ? 'Описание компании' :
                   language === 'pt' ? 'Descrição da empresa' :
                   language === 'hi' ? 'कंपनी का विवरण' :
                   language === 'th' ? 'คำอธิบายบริษัท' :
                   language === 'vi' ? 'Mô tả công ty' :
                   'Company Description',
      saveChanges: language === 'zh' ? '保存更改' :
                   language === 'ja' ? '変更を保存' :
                   language === 'ar' ? 'حفظ التغييرات' :
                   language === 'es' ? 'Guardar cambios' :
                   language === 'fr' ? 'Enregistrer les modifications' :
                   language === 'de' ? 'Änderungen speichern' :
                   language === 'ko' ? '변경 사항 저장' :
                   language === 'ru' ? 'Сохранить изменения' :
                   language === 'pt' ? 'Salvar alterações' :
                   language === 'hi' ? 'परिवर्तन सहेजें' :
                   language === 'th' ? 'บันทึกการเปลี่ยนแปลง' :
                   language === 'vi' ? 'Lưu thay đổi' :
                   'Save Changes',
      saving: language === 'zh' ? '保存中...' :
              language === 'ja' ? '保存中...' :
              language === 'ar' ? 'جاري الحفظ...' :
              language === 'es' ? 'Guardando...' :
              language === 'fr' ? 'Enregistrement...' :
              language === 'de' ? 'Speichern...' :
              language === 'ko' ? '저장 중...' :
              language === 'ru' ? 'Сохранение...' :
              language === 'pt' ? 'Salvando...' :
              language === 'hi' ? 'सहेज रहा है...' :
              language === 'th' ? 'กำลังบันทึก...' :
              language === 'vi' ? 'Đang lưu...' :
              'Saving...',
      socialMedia: language === 'zh' ? '社交媒体与消息' :
                   language === 'ja' ? 'ソーシャルメディアとメッセージ' :
                   language === 'ar' ? 'وسائل التواصل الاجتماعي والرسائل' :
                   language === 'es' ? 'Redes sociales y mensajería' :
                   language === 'fr' ? 'Réseaux sociaux et messagerie' :
                   language === 'de' ? 'Soziale Medien und Messaging' :
                   language === 'ko' ? '소셜 미디어 및 메시징' :
                   language === 'ru' ? 'Социальные сети и мессенджеры' :
                   language === 'pt' ? 'Redes sociais e mensagens' :
                   language === 'hi' ? 'सोशल मीडिया और संदेश' :
                   language === 'th' ? 'โซเชียลมีเดียและข้อความ' :
                   language === 'vi' ? 'Mạng xã hội và nhắn tin' :
                   'Social Media & Messaging',
      // Placeholder texts
      companyNamePlaceholder: language === 'zh' ? '您的公司名称' :
                              language === 'ja' ? 'あなたの会社名' :
                              language === 'ar' ? 'اسم شركتك' :
                              language === 'es' ? 'Nombre de su empresa' :
                              language === 'fr' ? 'Nom de votre entreprise' :
                              language === 'de' ? 'Ihr Firmenname' :
                              language === 'ko' ? '귀사의 회사명' :
                              language === 'ru' ? 'Название вашей компании' :
                              language === 'pt' ? 'Nome da sua empresa' :
                              language === 'hi' ? 'आपकी कंपनी का नाम' :
                              language === 'th' ? 'ชื่อบริษัทของคุณ' :
                              language === 'vi' ? 'Tên công ty của bạn' :
                              'Your Company Name',
      contactNamePlaceholder: language === 'zh' ? '联系人姓名' :
                              language === 'ja' ? '連絡先の名前' :
                              language === 'ar' ? 'اسم المتصل' :
                              language === 'es' ? 'Nombre del contacto' :
                              language === 'fr' ? 'Nom du contact' :
                              language === 'de' ? 'Kontaktperson' :
                              language === 'ko' ? '연락처 이름' :
                              language === 'ru' ? 'Имя контактного лица' :
                              language === 'pt' ? 'Nome do contato' :
                              language === 'hi' ? 'संपर्क व्यक्ति का नाम' :
                              language === 'th' ? 'ชื่อผู้ติดต่อ' :
                              language === 'vi' ? 'Tên người liên hệ' :
                              'Contact Person Name',
      emailPlaceholder: language === 'zh' ? 'company@example.com' :
                        language === 'ja' ? 'company@example.com' :
                        language === 'ar' ? 'company@example.com' :
                        language === 'es' ? 'empresa@ejemplo.com' :
                        language === 'fr' ? 'entreprise@exemple.com' :
                        language === 'de' ? 'firma@beispiel.de' :
                        language === 'ko' ? 'company@example.com' :
                        language === 'ru' ? 'company@example.com' :
                        language === 'pt' ? 'empresa@exemplo.com' :
                        language === 'hi' ? 'company@example.com' :
                        language === 'th' ? 'company@example.com' :
                        language === 'vi' ? 'company@example.com' :
                        'company@example.com',
      phonePlaceholder: language === 'zh' ? '+86 123 4567 8900' :
                        language === 'ja' ? '+81 3 1234 5678' :
                        language === 'ar' ? '+966 12 345 6789' :
                        language === 'es' ? '+34 123 456 789' :
                        language === 'fr' ? '+33 1 23 45 67 89' :
                        language === 'de' ? '+49 123 4567890' :
                        language === 'ko' ? '+82 2 1234 5678' :
                        language === 'ru' ? '+7 123 456 7890' :
                        language === 'pt' ? '+55 11 1234 5678' :
                        language === 'hi' ? '+91 123 456 7890' :
                        language === 'th' ? '+66 2 123 4567' :
                        language === 'vi' ? '+84 123 456 789' :
                        '+1 234 567 8900',
      websitePlaceholder: language === 'zh' ? 'https://www.example.com' :
                          language === 'ja' ? 'https://www.example.com' :
                          language === 'ar' ? 'https://www.example.com' :
                          language === 'es' ? 'https://www.ejemplo.com' :
                          language === 'fr' ? 'https://www.exemple.com' :
                          language === 'de' ? 'https://www.beispiel.de' :
                          language === 'ko' ? 'https://www.example.com' :
                          language === 'ru' ? 'https://www.example.com' :
                          language === 'pt' ? 'https://www.exemplo.com' :
                          language === 'hi' ? 'https://www.example.com' :
                          language === 'th' ? 'https://www.example.com' :
                          language === 'vi' ? 'https://www.example.com' :
                          'https://www.example.com',
      countryPlaceholder: language === 'zh' ? '国家' :
                          language === 'ja' ? '国' :
                          language === 'ar' ? 'الدولة' :
                          language === 'es' ? 'País' :
                          language === 'fr' ? 'Pays' :
                          language === 'de' ? 'Land' :
                          language === 'ko' ? '국가' :
                          language === 'ru' ? 'Страна' :
                          language === 'pt' ? 'País' :
                          language === 'hi' ? 'देश' :
                          language === 'th' ? 'ประเทศ' :
                          language === 'vi' ? 'Quốc gia' :
                          'Country',
      addressPlaceholder: language === 'zh' ? '街道地址' :
                          language === 'ja' ? '通りの住所' :
                          language === 'ar' ? 'عنوان الشارع' :
                          language === 'es' ? 'Dirección de la calle' :
                          language === 'fr' ? 'Adresse de la rue' :
                          language === 'de' ? 'Straßenadresse' :
                          language === 'ko' ? '거리 주소' :
                          language === 'ru' ? 'Улица' :
                          language === 'pt' ? 'Endereço da rua' :
                          language === 'hi' ? 'स्ट्रीट पता' :
                          language === 'th' ? 'ที่อยู่ถนน' :
                          language === 'vi' ? 'Địa chỉ đường phố' :
                          'Street Address',
      cityPlaceholder: language === 'zh' ? '城市' :
                       language === 'ja' ? '都市' :
                       language === 'ar' ? 'المدينة' :
                       language === 'es' ? 'Ciudad' :
                       language === 'fr' ? 'Ville' :
                       language === 'de' ? 'Stadt' :
                       language === 'ko' ? '도시' :
                       language === 'ru' ? 'Город' :
                       language === 'pt' ? 'Cidade' :
                       language === 'hi' ? 'शहर' :
                       language === 'th' ? 'เมือง' :
                       language === 'vi' ? 'Thành phố' :
                       'City',
      descriptionPlaceholder: language === 'zh' ? '告诉买家关于您公司的信息...' :
                              language === 'ja' ? 'バイヤーにあなたの会社について知らせてください...' :
                              language === 'ar' ? 'أخبر المشترين عن شركتك...' :
                              language === 'es' ? 'Cuéntale a los compradores sobre tu empresa...' :
                              language === 'fr' ? 'Parlez aux acheteurs de votre entreprise...' :
                              language === 'de' ? 'Erzählen Sie den Käufern von Ihrem Unternehmen...' :
                              language === 'ko' ? '구매자에게 회사 소개...' :
                              language === 'ru' ? 'Расскажите покупателям о вашей компании...' :
                              language === 'pt' ? 'Conte aos compradores sobre sua empresa...' :
                              language === 'hi' ? 'खरीदारों को अपनी कंपनी के बारे में बताएं...' :
                              language === 'th' ? 'บอกให้ผู้ซื้อทราบเกี่ยวกับบริษัทของคุณ...' :
                              language === 'vi' ? 'Chia sẻ thông tin về công ty của bạn với người mua...' :
                              'Tell buyers about your company...',
    },
    
    notifications: {
      title: language === 'zh' ? '通知偏好' : 'Notification Preferences',
      emailNotifications: language === 'zh' ? '邮件通知' : 'Email Notifications',
      emailNotificationsDesc: language === 'zh' ? '接收重要账户更新的邮件' : 'Receive emails for important account updates',
      orderUpdates: language === 'zh' ? '订单更新' : 'Order Updates',
      orderUpdatesDesc: language === 'zh' ? '收到新订单或订单状态变更时通知' : 'Get notified when you receive new orders or order status changes',
      marketingEmails: language === 'zh' ? '营销邮件' : 'Marketing Emails',
      marketingEmailsDesc: language === 'zh' ? '接收促销活动和平台新闻' : 'Receive promotional offers and platform news',
      securityAlerts: language === 'zh' ? '安全提醒' : 'Security Alerts',
      securityAlertsDesc: language === 'zh' ? '接收登录尝试和安全相关的提醒' : 'Get alerts about login attempts and security-related issues',
    },
    
    security: {
      title: language === 'zh' ? '修改密码' : 'Change Password',
      currentPassword: language === 'zh' ? '当前密码' : 'Current Password',
      newPassword: language === 'zh' ? '新密码' : 'New Password',
      confirmPassword: language === 'zh' ? '确认新密码' : 'Confirm New Password',
      updatePassword: language === 'zh' ? '更新密码' : 'Update Password',
      updating: language === 'zh' ? '更新中...' : 'Updating...',
      passwordRequirements: language === 'zh' ? '密码要求：至少 8 个字符，包含大小写字母和数字' : 'Password requirements: At least 8 characters, including uppercase, lowercase, and numbers',
    },
    
    messages: {
      saved: language === 'zh' ? '设置已保存！' : 'Settings saved successfully!',
      error: language === 'zh' ? '保存失败，请重试' : 'Failed to save settings. Please try again.',
      passwordUpdated: language === 'zh' ? '密码已更新！' : 'Password updated successfully!',
      passwordMismatch: language === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match',
      weakPassword: language === 'zh' ? '密码强度不足' : 'Password is too weak',
    },
    
    verification: {
      title: language === 'zh' ? '认证文件' : 'Verification Files',
      subtitle: language === 'zh' ? '上传认证文件以增加买家信任（可选）' : 'Upload verification documents to build buyer trust (optional)',
      businessLicense: language === 'zh' ? '营业执照' : 'Business License',
      businessLicenseDesc: language === 'zh' ? '上传您的营业执照扫描件或照片' : 'Upload a scan or photo of your business license',
      idCard: language === 'zh' ? '身份证' : 'ID Card',
      idCardDesc: language === 'zh' ? '上传身份证正反面照片' : 'Upload front and back photos of your ID card',
      driverLicense: language === 'zh' ? '驾驶证' : 'Driver\'s License',
      driverLicenseDesc: language === 'zh' ? '上传驾驶证照片（如有）' : 'Upload photo of your driver\'s license (if applicable)',
      creditCard: language === 'zh' ? '信用卡' : 'Credit Card',
      creditCardDesc: language === 'zh' ? '上传信用卡照片（仅显示最后4位，其他部分请遮挡）' : 'Upload credit card photo (show only last 4 digits, mask the rest)',
      photo: language === 'zh' ? '照片' : 'Photos',
      photoDesc: language === 'zh' ? '上传公司、工厂或产品照片' : 'Upload photos of your company, factory, or products',
      video: language === 'zh' ? '视频' : 'Videos',
      videoDesc: language === 'zh' ? '上传公司介绍或产品展示视频' : 'Upload company introduction or product demonstration videos',
      uploadedFiles: language === 'zh' ? '已上传的文件' : 'Uploaded Files',
      noFiles: language === 'zh' ? '暂无上传文件' : 'No files uploaded yet',
      delete: language === 'zh' ? '删除' : 'Delete',
      verified: language === 'zh' ? '已验证' : 'Verified',
      pending: language === 'zh' ? '待审核' : 'Pending',
    }
  }
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profileData.companyName,
          description: profileData.description,
          descriptions: descriptions,
          country: profileData.country,
          city: profileData.city,
          address: profileData.address,
          phone: profileData.phone,
          email: profileData.email,
          website: profileData.website,
          whatsapp: profileData.whatsapp,
          wechat: profileData.wechat,
          telegram: profileData.telegram,
          linkedin: profileData.linkedin,
          facebook: profileData.facebook,
          instagram: profileData.instagram
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(t.messages.saved)
      } else {
        setMessage(data.error || t.messages.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(t.messages.error)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage(t.messages.passwordMismatch)
      setLoading(false)
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage(t.messages.weakPassword)
      setLoading(false)
      return
    }
    
    try {
      // TODO: Implement API call to update password
      // await fetch('/api/seller/password', { method: 'PUT', body: JSON.stringify(passwordData) })
      
      setTimeout(() => {
        setMessage(t.messages.passwordUpdated)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage(t.messages.error)
      setLoading(false)
    }
  }
  
  const isNewSeller = !profileData.companyName

  const onboardingSteps = [
    { id: 1, key: 'company', label: language === 'zh' ? '完善公司信息' : 'Complete Company Info', completed: !!profileData.companyName },
    { id: 2, key: 'contact', label: language === 'zh' ? '填写联系方式' : 'Add Contact Details', completed: !!profileData.phone || !!profileData.email },
    { id: 3, key: 'description', label: language === 'zh' ? '编写公司简介' : 'Write Company Description', completed: !!profileData.description },
    { id: 4, key: 'verification', label: language === 'zh' ? '上传认证文件（可选）' : 'Upload Verification Docs (Optional)', completed: verificationFiles.length > 0 },
  ]

  const completedSteps = onboardingSteps.filter(s => s.completed).length
  const progressPercent = Math.round((completedSteps / onboardingSteps.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        </div>
      </div>

      {isNewSeller && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {language === 'zh' ? '👋 欢迎加入 ChinaHui B2B！' : '👋 Welcome to ChinaHui B2B!'}
                </h2>
                <p className="mt-1 text-blue-100">
                  {language === 'zh' ? '完成以下步骤，开始您的销售之旅' : 'Complete the steps below to start selling'}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">{language === 'zh' ? '完成进度' : 'Progress'}</p>
                  <p className="text-2xl font-bold">{completedSteps}/{onboardingSteps.length}</p>
                </div>
                <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {onboardingSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.key === 'company' || step.key === 'contact' || step.key === 'description') {
                      setActiveTab('profile')
                    } else if (step.key === 'verification') {
                      setActiveTab('verification')
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    step.completed
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-500' : 'bg-white/30'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex md:hidden items-center gap-3">
              <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium">{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Tabs */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                {t.tabs.profile}
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                {t.tabs.notifications}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5 mr-3" />
                {t.tabs.security}
              </button>
              
              <button
                onClick={() => setActiveTab('verification')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'verification'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mr-3" />
                {t.verification.title}
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('success') || message.includes('saved') || message.includes('updated')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.tabs.profile}</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />
                        {t.profile.companyName}
                      </label>
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.companyNamePlaceholder}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        {t.profile.contactName}
                      </label>
                      <input
                        type="text"
                        value={profileData.contactName}
                        onChange={(e) => setProfileData({...profileData, contactName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.contactNamePlaceholder}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        {t.profile.email}
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.emailPlaceholder}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        {t.profile.phone}
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.phonePlaceholder}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        {t.profile.website}
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.websitePlaceholder}
                      />
                    </div>
                    
                    {/* Social Media & Messaging */}
                    <div className="md:col-span-2">
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t.profile.socialMedia}
                      </h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={profileData.whatsapp}
                        onChange={(e) => setProfileData({...profileData, whatsapp: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WeChat
                      </label>
                      <input
                        type="text"
                        value={profileData.wechat}
                        onChange={(e) => setProfileData({...profileData, wechat: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="WeChat ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telegram
                      </label>
                      <input
                        type="text"
                        value={profileData.telegram}
                        onChange={(e) => setProfileData({...profileData, telegram: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <LinkIcon className="w-4 h-4 inline mr-1 text-blue-700" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={profileData.facebook}
                        onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="https://facebook.com/page"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={profileData.instagram}
                        onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.profile.country}
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.profile.countryPlaceholder}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.address}
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.profile.addressPlaceholder}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.city}
                    </label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.profile.cityPlaceholder}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.description}
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      {language === 'zh' ? '为不同语言的客户提供公司描述' :
                       language === 'ja' ? '異なる言語の顧客向けに会社の説明を提供' :
                       language === 'ar' ? 'قدم وصف الشركة لعملاء متعدد اللغات' :
                       language === 'es' ? 'Proporcione una descripción de la empresa para clientes de diferentes idiomas' :
                       language === 'fr' ? 'Fournissez une description de l\'entreprise pour des clients de différentes langues' :
                       language === 'de' ? 'Bieten Sie eine Unternehmensbeschreibung für Kunden verschiedener Sprachen an' :
                       language === 'ko' ? '다양한 언어의 고객을 위한 회사 설명 제공' :
                       language === 'ru' ? 'Предоставьте описание компании для клиентов разных языков' :
                       language === 'pt' ? 'Forneça uma descrição da empresa para clientes de diferentes idiomas' :
                       language === 'hi' ? 'विभिन्न भाषाओं के ग्राहकों के लिए कंपनी का विवरण प्रदान करें' :
                       language === 'th' ? 'ให้คำอธิบายบริษัทสำหรับลูกค้าที่ใช้ภาษาต่างๆ' :
                       language === 'vi' ? 'Cung cấp mô tả công ty cho khách hàng nói các ngôn ngữ khác nhau' :
                       'Provide company description for different language audiences'}
                    </p>
                    
                    {/* Language tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {supportedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setActiveLangTab(lang.code)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            activeLangTab === lang.code
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      value={descriptions[activeLangTab] || ''}
                      onChange={(e) => setDescriptions({...descriptions, [activeLangTab]: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t.profile.descriptionPlaceholder}
                    />
                    
                    {/* Show which languages have content */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.keys(descriptions).filter(key => descriptions[key]?.trim()).map((langCode) => {
                        const lang = supportedLanguages.find(l => l.code === langCode)
                        return (
                          <span key={langCode} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            ✓ {lang?.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? t.profile.saving : t.profile.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.notifications.title}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.emailNotifications}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.emailNotificationsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.orderUpdates}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.orderUpdatesDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderUpdates}
                        onChange={(e) => setNotificationSettings({...notificationSettings, orderUpdates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.marketingEmails}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.marketingEmailsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings({...notificationSettings, marketingEmails: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.securityAlerts}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.securityAlertsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.securityAlerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, securityAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.security.title}</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.currentPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.newPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.security.passwordRequirements}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.confirmPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {loading ? t.security.updating : t.security.updatePassword}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.verification.title}</h2>
                  <p className="text-sm text-gray-600">{t.verification.subtitle}</p>
                </div>
                
                <div className="space-y-4">
                  <VerificationFileUpload
                    fileType="BUSINESS_LICENSE"
                    label={t.verification.businessLicense}
                    description={t.verification.businessLicenseDesc}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onUploadComplete={loadVerificationFiles}
                  />
                  
                  <VerificationFileUpload
                    fileType="ID_CARD"
                    label={t.verification.idCard}
                    description={t.verification.idCardDesc}
                    accept=".jpg,.jpeg,.png"
                    onUploadComplete={loadVerificationFiles}
                  />
                  
                  <VerificationFileUpload
                    fileType="DRIVER_LICENSE"
                    label={t.verification.driverLicense}
                    description={t.verification.driverLicenseDesc}
                    accept=".jpg,.jpeg,.png"
                    onUploadComplete={loadVerificationFiles}
                  />
                  
                  <VerificationFileUpload
                    fileType="CREDIT_CARD"
                    label={t.verification.creditCard}
                    description={t.verification.creditCardDesc}
                    accept=".jpg,.jpeg,.png"
                    onUploadComplete={loadVerificationFiles}
                  />
                  
                  <VerificationFileUpload
                    fileType="PHOTO"
                    label={t.verification.photo}
                    description={t.verification.photoDesc}
                    accept=".jpg,.jpeg,.png,.gif"
                    onUploadComplete={loadVerificationFiles}
                  />
                  
                  <VerificationFileUpload
                    fileType="VIDEO"
                    label={t.verification.video}
                    description={t.verification.videoDesc}
                    accept=".mp4,.avi,.mov,.wmv"
                    onUploadComplete={loadVerificationFiles}
                  />
                </div>
                
                {/* Uploaded Files List */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.verification.uploadedFiles}</h3>
                  
                  {loadingFiles ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : verificationFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      {t.verification.noFiles}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {verificationFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              {file.fileType === 'VIDEO' ? (
                                <Video className="w-5 h-5 text-blue-600" />
                              ) : file.fileType === 'PHOTO' ? (
                                <ImageIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {file.isVerified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t.verification.verified}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleFileDelete(file.id)}
                            className="ml-4 text-sm text-red-600 hover:text-red-800"
                          >
                            {t.verification.delete}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
