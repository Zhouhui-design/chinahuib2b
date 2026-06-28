'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MultilingualInput from '@/components/ui/MultilingualInput'
import { Save, Building2, MapPin, Phone, Mail, MessageCircle, CheckCircle, Loader2, Upload, X, Image, AlertCircle, Award, Trash2, FileText } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

interface UploadedFile {
  url: string
}

export default function StoreProfilePage() {
  const router = useRouter()
  const language = useSellerLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [wechat, setWechat] = useState('')
  const [telegram, setTelegram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [twitter, setTwitter] = useState('')
  const [pinterest, setPinterest] = useState('')
  const [douyin, setDouyin] = useState('')
  const [xiaohongshu, setXiaohongshu] = useState('')
  const [qq, setQq] = useState('')
  const [dingtalk, setDingtalk] = useState('')
  const [lark, setLark] = useState('')
  const [wechatVideo, setWechatVideo] = useState('')
  const [weibo, setWeibo] = useState('')
  const [kuaishou, setKuaishou] = useState('')
  const [bilibili, setBilibili] = useState('')
  const [reddit, setReddit] = useState('')
  const [snapchat, setSnapchat] = useState('')
  const [tumblr, setTumblr] = useState('')
  const [chatSystem, setChatSystem] = useState('')
  const [certifications, setCertifications] = useState<string>('')

  // Enterprise certificate state
  interface Certificate {
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    fileType: string
    mimeType: string | null
    isVerified: boolean
    description: string | null
    certificateNumber: string | null
    issuingAuthority: string | null
    issueDate: string | null
    expiryDate: string | null
    certificateName: string | null
    createdAt: string
  }
  const [certificateList, setCertificateList] = useState<Certificate[]>([])
  const [newCertType, setNewCertType] = useState('')
  const [newCertName, setNewCertName] = useState('')
  const [newCertNumber, setNewCertNumber] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [newCertIssueDate, setNewCertIssueDate] = useState('')
  const [newCertExpiryDate, setNewCertExpiryDate] = useState('')
  const [selectedCertFile, setSelectedCertFile] = useState<File | null>(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const certFileInputRef = useRef<HTMLInputElement>(null)

  const [boothName, setBoothName] = useState('')
  const [boothCategories, setBoothCategories] = useState<string>('')
  const [isCustomizable, setIsCustomizable] = useState(false)

  // Organization Profile fields
  const [organizationType, setOrganizationType] = useState('ENTERPRISE')
  const [registeredCapital, setRegisteredCapital] = useState('')
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [patents, setPatents] = useState<string>('')
  const [awards, setAwards] = useState<string>('')
  const [companyPhotos, setCompanyPhotos] = useState<string[]>([])
  const [teamPhotos, setTeamPhotos] = useState<string[]>([])
  const [mapLatitude, setMapLatitude] = useState<number | null>(null)
  const [mapLongitude, setMapLongitude] = useState<number | null>(null)
  const [mapAddress, setMapAddress] = useState('')
  const [foundingYear, setFoundingYear] = useState('')
  const [businessScope, setBusinessScope] = useState('')
  const [legalRepresentative, setLegalRepresentative] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [showLogoConfirm, setShowLogoConfirm] = useState(false)
  const [showBannerConfirm, setShowBannerConfirm] = useState(false)
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null)
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const t = {
    pageTitle: language === 'zh' ? '组织介绍' :
              language === 'ja' ? '組織紹介' :
              language === 'ar' ? 'ملف المنظمة' :
              language === 'es' ? 'Perfil de la organización' :
              language === 'fr' ? 'Profil de l\'organisation' :
              language === 'de' ? 'Organisationsprofil' :
              language === 'ko' ? '조직 소개' :
              language === 'ru' ? 'Профиль организации' :
              language === 'pt' ? 'Perfil da organização' :
              language === 'hi' ? 'स्टोर प्रोफ़ाइल' :
              language === 'th' ? 'โปรไฟล์ร้านค้า' :
              language === 'vi' ? 'Hồ sơ cửa hàng' :
              'Store Profile',
    pageSubtitle: language === 'zh' ? '更新您的公司信息以吸引更多买家' :
                  language === 'ja' ? '会社名情報を更新して、より多くのバイヤーを獲得しましょう' :
                  language === 'ar' ? 'قم بتحديث معلومات شركتك لجذب المزيد من المشترين' :
                  language === 'es' ? 'Actualice la información de su empresa para atraer a más compradores' :
                  language === 'fr' ? 'Mettez à jour les informations de votre entreprise pour attirer plus d\'acheteurs' :
                  language === 'de' ? 'Aktualisieren Sie Ihre Unternehmensinformationen, um mehr Käufer anzuziehen' :
                  language === 'ko' ? '더 많은 바이어를 유치하기 위해 회사 정보를 업데이트하세요' :
                  language === 'ru' ? 'Обновите информацию о компании, чтобы привлечь больше покупателей' :
                  language === 'pt' ? 'Atualize as informações da sua empresa para atrair mais compradores' :
                  language === 'hi' ? 'अधिक खरीदारों को आकर्षित करने के लिए अपनी कंपनी की जानकारी अपडेट करें' :
                  language === 'th' ? 'อัปเดตข้อมูลบริษัทของคุณเพื่อดึงดูดผู้ซื้อเพิ่มเติม' :
                  language === 'vi' ? 'Cập nhật thông tin công ty của bạn để thu hút nhiều người mua hơn' :
                  'Update your company information to attract more buyers',
    companyInfo: language === 'zh' ? '公司信息' :
                 language === 'ja' ? '会社情報' :
                 language === 'ar' ? 'معلومات الشركة' :
                 language === 'es' ? 'Información de la empresa' :
                 language === 'fr' ? 'Informations sur l\'entreprise' :
                 language === 'de' ? 'Unternehmensinformationen' :
                 language === 'ko' ? '회사 정보' :
                 language === 'ru' ? 'Информация о компании' :
                 language === 'pt' ? 'Informações da empresa' :
                 language === 'hi' ? 'कंपनी की जानकारी' :
                 language === 'th' ? 'ข้อมูลบริษัท' :
                 language === 'vi' ? 'Thông tin công ty' :
                 'Company Information',
    companyName: language === 'zh' ? '公司名称 *' :
                 language === 'ja' ? '会社名 *' :
                 language === 'ar' ? 'اسم الشركة *' :
                 language === 'es' ? 'Nombre de la empresa *' :
                 language === 'fr' ? 'Nom de l\'entreprise *' :
                 language === 'de' ? 'Firmenname *' :
                 language === 'ko' ? '회사명 *' :
                 language === 'ru' ? 'Название компании *' :
                 language === 'pt' ? 'Nome da empresa *' :
                 language === 'hi' ? 'कंपनी का नाम *' :
                 language === 'th' ? 'ชื่อบริษัท *' :
                 language === 'vi' ? 'Tên công ty *' :
                 'Company Name *',
    companyNamePlaceholder: language === 'zh' ? '例如：XYZ科技有限公司' :
                           language === 'ja' ? '例：XYZテクノロジー株式会社' :
                           language === 'ar' ? 'مثال: XYZ تكنولوجيا ذكية المحدودة' :
                           language === 'es' ? 'ej., XYZ Tecnología Co., Ltd.' :
                           language === 'fr' ? 'ex., XYZ Technologie Co., Ltd.' :
                           language === 'de' ? 'z.B. XYZ Technologie GmbH' :
                           language === 'ko' ? '예: XYZ 기술 유한회사' :
                           language === 'ru' ? 'напр., XYZ Технологии ООО' :
                           language === 'pt' ? 'ex., XYZ Tecnologia Ltda.' :
                           language === 'hi' ? 'उदाहरण: XYZ टेक्नोलॉजी कंपनी लिमिटेड' :
                           language === 'th' ? 'ตัวอย่าง: XYZ เทคโนโลยี บจ.' :
                           language === 'vi' ? 'ví dụ: XYZ Công nghệ Co., Ltd.' :
                           'e.g., XYZ Technology Co., Ltd.',
    companyDescription: language === 'zh' ? '公司描述' :
                        language === 'ja' ? '会社説明' :
                        language === 'ar' ? 'وصف الشركة' :
                        language === 'es' ? 'Descripción de la empresa' :
                        language === 'fr' ? 'Description de l\'entreprise' :
                        language === 'de' ? 'Unternehmensbeschreibung' :
                        language === 'ko' ? '회사 설명' :
                        language === 'ru' ? 'Описание компании' :
                        language === 'pt' ? 'Descrição da empresa' :
                        language === 'hi' ? 'कंपनी का विवरण' :
                        language === 'th' ? 'คำอธิบายบริษัท' :
                        language === 'vi' ? 'Mô tả công ty' :
                        'Company Description',
    descriptionPlaceholder: language === 'zh' ? '描述您的公司历史、核心产品、生产能力、认证...' :
                           language === 'ja' ? '会社の歴史、主力製品、生産能力、認証について説明してください...' :
                           language === 'ar' ? 'صف تاريخ شركتك والمنتجات الأساسية والقدرة الإنتاجية والشهادات...' :
                           language === 'es' ? 'Describa el historial de su empresa, productos principales, capacidad de producción, certificaciones...' :
                           language === 'fr' ? 'Décrivez l\'historique de votre entreprise, vos produits principaux, votre capacité de production, vos certifications...' :
                           language === 'de' ? 'Beschreiben Sie Ihre Firmengeschichte, Hauptprodukte, Produktionskapazität, Zertifizierungen...' :
                           language === 'ko' ? '회사 역사, 핵심 제품, 생산 능력, 인증에 대해 설명하세요...' :
                           language === 'ru' ? 'Опишите историю вашей компании, основные продукты, производственные мощности, сертификаты...' :
                           language === 'pt' ? 'Descreva o histórico da sua empresa, produtos principais, capacidade de produção, certificações...' :
                           language === 'hi' ? 'अपनी कंपनी का इतिहास, मुख्य उत्पाद, उत्पादन क्षमता, प्रमाणपत्र का वर्णन करें...' :
                           language === 'th' ? 'อธิบายประวัติบริษัท ผลิตภัณฑ์หลัก กำลังการผลิต ใบรับรอง...' :
                           language === 'vi' ? 'Mô tả lịch sử công ty, sản phẩm chính, công suất sản xuất, chứng nhận...' :
                           'Describe your company history, core products, production capacity, certifications...',
    certifications: language === 'zh' ? '认证（逗号分隔）' :
                    language === 'ja' ? '認証（カンマ区切り）' :
                    language === 'ar' ? 'الشهادات (مفصولة بفواصل)' :
                    language === 'es' ? 'Certificaciones (separadas por comas)' :
                    language === 'fr' ? 'Certifications (séparées par des virgules)' :
                    language === 'de' ? 'Zertifizierungen (kommagetrennt)' :
                    language === 'ko' ? '인증 (쉼표로 구분)' :
                    language === 'ru' ? 'Сертификаты (через запятую)' :
                    language === 'pt' ? 'Certificações (separadas por vírgulas)' :
                    language === 'hi' ? 'प्रमाणपत्र (अल्पविराम से अलग)' :
                    language === 'th' ? 'ใบรับรอง (คั่นด้วยเครื่องหมายอัลฟา)' :
                    language === 'vi' ? 'Chứng nhận (phân cách bằng dấu phẩy)' :
                    'Certifications (comma-separated)',
    certificationsPlaceholder: language === 'zh' ? '例如：ISO9001, CE, FDA, RoHS' :
                              language === 'ja' ? '例：ISO9001、CE、FDA、RoHS' :
                              language === 'ar' ? 'مثال: ISO9001، CE، FDA، RoHS' :
                              language === 'es' ? 'ej., ISO9001, CE, FDA, RoHS' :
                              language === 'fr' ? 'ex., ISO9001, CE, FDA, RoHS' :
                              language === 'de' ? 'z.B. ISO9001, CE, FDA, RoHS' :
                              language === 'ko' ? '예: ISO9001, CE, FDA, RoHS' :
                              language === 'ru' ? 'напр., ISO9001, CE, FDA, RoHS' :
                              language === 'pt' ? 'ex., ISO9001, CE, FDA, RoHS' :
                              language === 'hi' ? 'उदाहरण: ISO9001, CE, FDA, RoHS' :
                              language === 'th' ? 'ตัวอย่าง: ISO9001, CE, FDA, RoHS' :
                              language === 'vi' ? 'ví dụ: ISO9001, CE, FDA, RoHS' :
                              'e.g., ISO9001, CE, FDA, RoHS',
    certificationsHint: language === 'zh' ? '用逗号分隔多个认证' :
                        language === 'ja' ? '複数の認証はカンマで区切ってください' :
                        language === 'ar' ? 'افصل الشهادات المتعددة بفواصل' :
                        language === 'es' ? 'Separe múltiples certificaciones con comas' :
                        language === 'fr' ? 'Séparez les certifications multiples par des virgules' :
                        language === 'de' ? 'Trennen Sie mehrere Zertifizierungen durch Kommas' :
                        language === 'ko' ? '여러 인증은 쉼표로 구분하세요' :
                        language === 'ru' ? 'Разделяйте несколько сертификатов запятыми' :
                        language === 'pt' ? 'Separe várias certificações com vírgulas' :
                        language === 'hi' ? 'एकाधिक प्रमाणपत्रों को अल्पविराम से अलग करें' :
                        language === 'th' ? 'แยกใบรับรองหลายใบด้วยเครื่องหมายอัลฟา' :
                        language === 'vi' ? 'Phân tách nhiều chứng nhận bằng dấu phẩy' :
                        'Separate multiple certifications with commas',
    location: language === 'zh' ? '位置' :
              language === 'ja' ? '所在地' :
              language === 'ar' ? 'الموقع' :
              language === 'es' ? 'Ubicación' :
              language === 'fr' ? 'Localisation' :
              language === 'de' ? 'Standort' :
              language === 'ko' ? '위치' :
              language === 'ru' ? 'Местоположение' :
              language === 'pt' ? 'Localização' :
              language === 'hi' ? 'स्थान' :
              language === 'th' ? 'สถานที่' :
              language === 'vi' ? 'Vị trí' :
              'Location',
    country: language === 'zh' ? '国家' :
             language === 'ja' ? '国' :
             language === 'ar' ? 'البلد' :
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
    selectCountry: language === 'zh' ? '选择国家' :
                   language === 'ja' ? '国を選択' :
                   language === 'ar' ? 'اختر البلد' :
                   language === 'es' ? 'Seleccionar país' :
                   language === 'fr' ? 'Sélectionner un pays' :
                   language === 'de' ? 'Land auswählen' :
                   language === 'ko' ? '국가 선택' :
                   language === 'ru' ? 'Выберите страну' :
                   language === 'pt' ? 'Selecionar país' :
                   language === 'hi' ? 'देश चुनें' :
                   language === 'th' ? 'เลือกประเทศ' :
                   language === 'vi' ? 'Chọn quốc gia' :
                   'Select country',
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
    cityPlaceholder: language === 'zh' ? '例如：深圳' :
                     language === 'ja' ? '例：深圳' :
                     language === 'ar' ? 'مثال: شنتشن' :
                     language === 'es' ? 'ej., Shenzhen' :
                     language === 'fr' ? 'ex., Shenzhen' :
                     language === 'de' ? 'z.B. Shenzhen' :
                     language === 'ko' ? '예: 선전' :
                     language === 'ru' ? 'напр., Шэньчжэнь' :
                     language === 'pt' ? 'ex., Shenzhen' :
                     language === 'hi' ? 'उदाहरण: शेनझेन' :
                     language === 'th' ? 'ตัวอย่าง: เซินเจิ้น' :
                     language === 'vi' ? 'ví dụ: Thâm Quyến' :
                     'e.g., Shenzhen',
    fullAddress: language === 'zh' ? '完整地址' :
                 language === 'ja' ? '住所' :
                 language === 'ar' ? 'العنوان الكامل' :
                 language === 'es' ? 'Dirección completa' :
                 language === 'fr' ? 'Adresse complète' :
                 language === 'de' ? 'Vollständige Adresse' :
                 language === 'ko' ? '전체 주소' :
                 language === 'ru' ? 'Полный адрес' :
                 language === 'pt' ? 'Endereço completo' :
                 language === 'hi' ? 'पूरा पता' :
                 language === 'th' ? 'ที่อยู่เต็ม' :
                 language === 'vi' ? 'Địa chỉ đầy đủ' :
                 'Full Address',
    addressPlaceholder: language === 'zh' ? '街道地址、区、邮政编码' :
                        language === 'ja' ? '番地、区、郵便番号' :
                        language === 'ar' ? 'عنوان الشارع، الحي، الرمز البريدي' :
                        language === 'es' ? 'Dirección de la calle, distrito, código postal' :
                        language === 'fr' ? 'Adresse de rue, district, code postal' :
                        language === 'de' ? 'Straße, Bezirk, Postleitzahl' :
                        language === 'ko' ? '거리 주소, 구, 우편번호' :
                        language === 'ru' ? 'Улица, район, почтовый индекс' :
                        language === 'pt' ? 'Endereço da rua, bairro, código postal' :
                        language === 'hi' ? 'गली का पता, जिला, पिन कोड' :
                        language === 'th' ? 'ที่อยู่ถนน เขต รหัสไปรษณีย์' :
                        language === 'vi' ? 'Địa chỉ đường phố, quận, mã bưu điện' :
                        'Street address, district, postal code',
    contactInfo: language === 'zh' ? '联系信息（仅对登录用户可见）' :
                 language === 'ja' ? '連絡先情報（ログイン済みユーザーのみ表示）' :
                 language === 'ar' ? 'معلومات الاتصال (مرئية للمستخدمين المسجلين فقط)' :
                 language === 'es' ? 'Información de contacto (visible solo para usuarios conectados)' :
                 language === 'fr' ? 'Coordonnées (visibles uniquement pour les utilisateurs connectés)' :
                 language === 'de' ? 'Kontaktinformationen (nur für eingeloggte Benutzer sichtbar)' :
                 language === 'ko' ? '연락처 정보 (로그인한 사용자만 볼 수 있음)' :
                 language === 'ru' ? 'Контактная информация (видна только зарегистрированным пользователям)' :
                 language === 'pt' ? 'Informações de contato (visíveis apenas para usuários conectados)' :
                 language === 'hi' ? 'संपर्क जानकारी (केवल लॉग इन उपयोगकर्ताओं के लिए दृश्यमान)' :
                 language === 'th' ? 'ข้อมูลติดต่อ (มองเห็นได้เฉพาะผู้ใช้ที่ล็อกอินเท่านั้น)' :
                 language === 'vi' ? 'Thông tin liên hệ (chỉ hiển thị cho người dùng đã đăng nhập)' :
                 'Contact Information (Visible to logged-in users only)',
    phoneNumber: language === 'zh' ? '电话号码' :
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
    phonePlaceholder: language === 'zh' ? '+86 123 4567 8900' :
                     language === 'ja' ? '+86 123 4567 8900' :
                     language === 'ar' ? '+86 123 4567 8900' :
                     language === 'es' ? '+86 123 4567 8900' :
                     language === 'fr' ? '+86 123 4567 8900' :
                     language === 'de' ? '+86 123 4567 8900' :
                     language === 'ko' ? '+86 123 4567 8900' :
                     language === 'ru' ? '+86 123 4567 8900' :
                     language === 'pt' ? '+86 123 4567 8900' :
                     language === 'hi' ? '+86 123 4567 8900' :
                     language === 'th' ? '+86 123 4567 8900' :
                     language === 'vi' ? '+86 123 4567 8900' :
                     '+86 123 4567 8900',
    emailAddress: language === 'zh' ? '电子邮箱' :
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
    emailPlaceholder: language === 'zh' ? 'contact@company.com' :
                      language === 'ja' ? 'contact@company.com' :
                      language === 'ar' ? 'contact@company.com' :
                      language === 'es' ? 'contact@company.com' :
                      language === 'fr' ? 'contact@company.com' :
                      language === 'de' ? 'contact@company.com' :
                      language === 'ko' ? 'contact@company.com' :
                      language === 'ru' ? 'contact@company.com' :
                      language === 'pt' ? 'contact@company.com' :
                      language === 'hi' ? 'contact@company.com' :
                      language === 'th' ? 'contact@company.com' :
                      language === 'vi' ? 'contact@company.com' :
                      'contact@company.com',
    website: language === 'zh' ? '网站' :
             language === 'ja' ? 'ウェブサイト' :
             language === 'ar' ? 'الموقع الإلكتروني' :
             language === 'es' ? 'Sitio web' :
             language === 'fr' ? 'Site web' :
             language === 'de' ? 'Webseite' :
             language === 'ko' ? '웹사이트' :
             language === 'ru' ? 'Веб-сайт' :
             language === 'pt' ? 'Site' :
             language === 'hi' ? 'वेबसाइट' :
             language === 'th' ? 'เว็บไซต์' :
             language === 'vi' ? 'Trang web' :
             'Website',
    websitePlaceholder: language === 'zh' ? 'https://www.company.com' :
                         language === 'ja' ? 'https://www.company.com' :
                         language === 'ar' ? 'https://www.company.com' :
                         language === 'es' ? 'https://www.company.com' :
                         language === 'fr' ? 'https://www.company.com' :
                         language === 'de' ? 'https://www.company.com' :
                         language === 'ko' ? 'https://www.company.com' :
                         language === 'ru' ? 'https://www.company.com' :
                         language === 'pt' ? 'https://www.company.com' :
                         language === 'hi' ? 'https://www.company.com' :
                         language === 'th' ? 'https://www.company.com' :
                         language === 'vi' ? 'https://www.company.com' :
                         'https://www.company.com',
    socialMedia: language === 'zh' ? '社交媒体账号' :
                 language === 'ja' ? 'ソーシャルメディアアカウント' :
                 language === 'ar' ? 'حسابات التواصل الاجتماعي' :
                 language === 'es' ? 'Cuentas de redes sociales' :
                 language === 'fr' ? 'Comptes de réseaux sociaux' :
                 language === 'de' ? 'Social Media Konten' :
                 language === 'ko' ? '소셜 미디어 계정' :
                 language === 'ru' ? 'Аккаунты в социальных сетях' :
                 language === 'pt' ? 'Contas de redes sociais' :
                 language === 'hi' ? 'सोशल मीडिया अकाउंट' :
                 language === 'th' ? 'บัญชีโซเชียลมีเดีย' :
                 language === 'vi' ? 'Tài khoản mạng xã hội' :
                 'Social Media Accounts',
    linkedin: language === 'zh' ? '领英 (LinkedIn)' :
              language === 'ja' ? 'LinkedIn' :
              language === 'ko' ? '링크드인' :
              'LinkedIn',
    facebook: language === 'zh' ? 'Facebook' :
              language === 'ja' ? 'Facebook' :
              language === 'ko' ? '페이스북' :
              'Facebook',
    instagram: language === 'zh' ? 'Instagram' :
               language === 'ja' ? 'Instagram' :
               language === 'ko' ? '인스타그램' :
               'Instagram',
    youtube: language === 'zh' ? 'YouTube' :
             language === 'ja' ? 'YouTube' :
             language === 'ko' ? '유튜브' :
             'YouTube',
    tiktok: language === 'zh' ? 'TikTok' :
            language === 'ja' ? 'TikTok' :
            language === 'ko' ? '틱톡' :
            'TikTok',
    twitter: language === 'zh' ? 'Twitter / X' :
             language === 'ja' ? 'Twitter / X' :
             language === 'ko' ? '트위터 / X' :
             'Twitter / X',
    pinterest: language === 'zh' ? 'Pinterest' :
               language === 'ja' ? 'Pinterest' :
               language === 'ko' ? '핀터레스트' :
               'Pinterest',
    douyin: language === 'zh' ? '抖音' :
            language === 'ja' ? '抖音/Douyin' :
            language === 'ko' ? '륏인' :
            'Douyin',
    xiaohongshu: language === 'zh' ? '小红书' :
                 language === 'ja' ? '小红书/RED' :
                 language === 'ko' ? '샤오홍슈' :
                 'RED / 小红书',
    qq: language === 'zh' ? 'QQ' :
        language === 'ja' ? 'QQ' :
        language === 'ko' ? 'QQ' :
        'QQ',
    dingtalk: language === 'zh' ? '钉钉' :
              language === 'ja' ? '钉钉/DingTalk' :
              language === 'ko' ? '딩탈크' :
              'DingTalk',
    lark: language === 'zh' ? '飞书 / Lark' :
          language === 'ja' ? '飞书/Lark' :
          language === 'ko' ? '레이크' :
          'Lark',
    wechatVideo: language === 'zh' ? '微信视频号' :
                 language === 'ja' ? '微信视频号' :
                 language === 'ko' ? '웨이챗 비디오 채널' :
                 'WeChat Video',
    weibo: language === 'zh' ? '微博' :
           language === 'ja' ? '微博' :
           language === 'ko' ? '웨이보' :
           'Weibo',
    kuaishou: language === 'zh' ? '快手' :
              language === 'ja' ? '快手/Kuaishou' :
              language === 'ko' ? '쿠아이쇼우' :
              'Kuaishou',
    bilibili: language === 'zh' ? 'B站 / Bilibili' :
              language === 'ja' ? 'Bilibili' :
              language === 'ko' ? '빌리빌리' :
              'Bilibili',
    reddit: language === 'zh' ? 'Reddit' :
            language === 'ja' ? 'Reddit' :
            language === 'ko' ? '레딧' :
            'Reddit',
    snapchat: language === 'zh' ? 'Snapchat' :
              language === 'ja' ? 'Snapchat' :
              language === 'ko' ? '스냅챗' :
              'Snapchat',
    tumblr: language === 'zh' ? 'Tumblr' :
            language === 'ja' ? 'Tumblr' :
            language === 'ko' ? '텀블러' :
            'Tumblr',
    whatsapp: language === 'zh' ? 'WhatsApp' :
              language === 'ja' ? 'WhatsApp' :
              language === 'ko' ? '왓츠앱' :
              'WhatsApp',
    wechat: language === 'zh' ? '微信 (WeChat)' :
            language === 'ja' ? 'WeChat' :
            language === 'ko' ? '웨이챗' :
            'WeChat',
    telegram: language === 'zh' ? 'Telegram' :
              language === 'ja' ? 'Telegram' :
              language === 'ko' ? '텔레그램' :
              'Telegram',
    chatSystem: language === 'zh' ? '聊天系统账号' :
                language === 'ja' ? 'チャットシステムアカウント' :
                language === 'ko' ? '채팅 시스템 계정' :
                'Chat System Account',
    chatSystemPlaceholder: language === 'zh' ? '输入注册邮箱或用户名' :
                           language === 'ja' ? '登録メールまたはユーザー名を入力' :
                           language === 'ko' ? '등록 이메일 또는 사용자 이름 입력' :
                           'Enter registered email or username',
    boothCustomization: language === 'zh' ? '展位定制' :
                        language === 'ja' ? '展示ブースカスタマイズ' :
                        language === 'ar' ? 'تخصيص كشك المعرض' :
                        language === 'es' ? 'Personalización del stand de exhibición' :
                        language === 'fr' ? 'Personnalisation du stand d\'exposition' :
                        language === 'de' ? 'Messestand-Anpassung' :
                        language === 'ko' ? '전시 부스 커스터마이징' :
                        language === 'ru' ? 'Настройка выставочного стенда' :
                        language === 'pt' ? 'Personalização do estande de exposição' :
                        language === 'hi' ? 'प्रदर्शनी बूथ अनुकूलन' :
                        language === 'th' ? 'การปรับแต่งบูธงานแสดงสินค้า' :
                        language === 'vi' ? 'Tùy chỉnh gian hàng triển lãm' :
                        'Exhibition Booth Customization',
    boothName: language === 'zh' ? '展位名称' :
               language === 'ja' ? 'ブース名' :
               language === 'ar' ? 'اسم الكشك' :
               language === 'es' ? 'Nombre del stand' :
               language === 'fr' ? 'Nom du stand' :
               language === 'de' ? 'Standname' :
               language === 'ko' ? '부스 이름' :
               language === 'ru' ? 'Название стенда' :
               language === 'pt' ? 'Nome do estande' :
               language === 'hi' ? 'बूथ का नाम' :
               language === 'th' ? 'ชื่อบูธ' :
               language === 'vi' ? 'Tên gian hàng' :
               'Booth Name',
    boothNamePlaceholder: language === 'zh' ? '例如：高端电子产品展位、豪华家具展厅' :
                          language === 'ja' ? '例：高端エレクトロニクスブース、ラグジュアリーファニチャーショールーム' :
                          language === 'ar' ? 'مثال: جناح إلكترونيات فاخرة، صالة أثاث فاخرة' :
                          language === 'es' ? 'ej., Stand de Electrónicos Premium, Escaparate de Muebles de Lujo' :
                          language === 'fr' ? 'ex., Stand d\'Électronique Premium, Vitrine de Meubles de Luxe' :
                          language === 'de' ? 'z.B. Premium-Elektronik-Stand, Luxus-Möbel-Schaufenster' :
                          language === 'ko' ? '예: 프리미엄 전자제품 부스, 럭셔리 가구 쇼룸' :
                          language === 'ru' ? 'напр., Стенд премиум-электроники, Витрина люксовой мебели' :
                          language === 'pt' ? 'ex., Estande de Eletrônicos Premium, Vitrine de Móveis de Luxo' :
                          language === 'hi' ? 'उदाहरण: प्रीमियम इलेक्ट्रॉनिक्स बूथ, लक्ज़री फर्नीचर शोकेस' :
                          language === 'th' ? 'ตัวอย่าง: บูธอิเล็กทรอนิกส์พรีเมียม, ตู้โชว์เฟอร์นิเจอร์หรูหรา' :
                          language === 'vi' ? 'ví dụ: Gian hàng điện tử cao cấp, phòng trưng bày nội thất sang trọng' :
                          'e.g., Premium Electronics Booth, Luxury Furniture Showcase',
    boothNameHint: language === 'zh' ? '显示在您展览展位上的自定义名称' :
                   language === 'ja' ? '展示ブースに表示されるカスタム名' :
                   language === 'ar' ? 'الاسم المخصص المعروض على كشك المعرض الخاص بك' :
                   language === 'es' ? 'Nombre personalizado mostrado en su stand de exhibición' :
                   language === 'fr' ? 'Nom personnalisé affiché sur votre stand d\'exposition' :
                   language === 'de' ? 'Benutzerdefinierter Name, der auf Ihrem Messestand angezeigt wird' :
                   language === 'ko' ? '전시 부스에 표시되는 사용자 정의 이름' :
                   language === 'ru' ? 'Пользовательское имя, отображаемое на вашем выставочном стенде' :
                   language === 'pt' ? 'Nome personalizado exibido no seu estande de exposição' :
                   language === 'hi' ? 'आपकी प्रदर्शनी बूथ पर प्रदर्शित कस्टम नाम' :
                   language === 'th' ? 'ชื่อที่กำหนดเองที่แสดงบนบูธงานแสดงสินค้าของคุณ' :
                   language === 'vi' ? 'Tên tùy chỉnh được hiển thị trên gian hàng triển lãm của bạn' :
                   'Custom name displayed on your exhibition booth',
    productCategories: language === 'zh' ? '产品类别（可多选）' :
                      language === 'ja' ? '製品カテゴリー（複数選択可）' :
                      language === 'ar' ? 'فئات المنتجات (اختيار متعدد)' :
                      language === 'es' ? 'Categorías de productos (selección múltiple)' :
                      language === 'fr' ? 'Catégories de produits (plusieurs sélections)' :
                      language === 'de' ? 'Produktkategorien (Mehrfachauswahl)' :
                      language === 'ko' ? '제품 카테고리 (다중 선택 가능)' :
                      language === 'ru' ? 'Категории товаров (несколько вариантов)' :
                      language === 'pt' ? 'Categorias de produtos (múltipla seleção)' :
                      language === 'hi' ? 'उत्पाद श्रेणियाँ (एकाधिक चयन)' :
                      language === 'th' ? 'หมวดหมู่สินค้า (เลือกได้หลายรายการ)' :
                      language === 'vi' ? 'Danh mục sản phẩm (chọn nhiều)' :
                      'Product Categories',
    categoriesPlaceholder: language === 'zh' ? '例如：电子产品、家用电器、厨房用品（逗号分隔）' :
                           language === 'ja' ? '例：電子機器、家庭用品、キッチン用品（カンマ区切り）' :
                           language === 'ar' ? 'مثال: إلكترونيات، أجهزة منزلية، مستلزمات المطبخ (مفصولة بفواصل)' :
                           language === 'es' ? 'ej., Electrónicos, Electrodomésticos, Suministros de Cocina (separados por comas)' :
                           language === 'fr' ? 'ex., Électronique, Appareils ménagers, Ustensiles de cuisine (séparés par des virgules)' :
                           language === 'de' ? 'z.B. Elektronik, Haushaltsgeräte, Küchenzubehör (kommagetrennt)' :
                           language === 'ko' ? '예: 전자제품, 가전제품, 주방용품 (쉼표로 구분)' :
                           language === 'ru' ? 'напр., Электроника, Бытовая техника, Кухонные принадлежности (через запятую)' :
                           language === 'pt' ? 'ex., Eletrônicos, Eletrodomésticos, Utensílios de Cozinha (separados por vírgulas)' :
                           language === 'hi' ? 'उदाहरण: इलेक्ट्रॉनिक्स, घरेलू उपकरण, रसोई की आपूर्ति (अल्पविराम से अलग)' :
                           language === 'th' ? 'ตัวอย่าง: อิเล็กทรอนิกส์, เครื่องใช้ในบ้าน, อุปกรณ์ครัว (คั่นด้วยเครื่องหมายอัลฟา)' :
                           language === 'vi' ? 'ví dụ: Điện tử, Thiết bị gia dụng, Vật dụng nhà bếp (phân cách bằng dấu phẩy)' :
                           'e.g., Electronics, Home Appliances, Kitchen Supplies (comma separated)',
    categoriesHint: language === 'zh' ? '输入多个类别，用逗号分隔' :
                    language === 'ja' ? '複数のカテゴリーを入力し、カンマで区切ってください' :
                    language === 'ar' ? 'فواصل متعددة فئات مدخلات' :
                    language === 'es' ? 'Ingrese múltiples categorías separadas por comas' :
                    language === 'fr' ? 'Entrez plusieurs catégories séparées par des virgules' :
                    language === 'de' ? 'Geben Sie mehrere durch Kommas getrennte Kategorien ein' :
                    language === 'ko' ? '쉼표로 구분된 여러 카테고리를 입력하세요' :
                    language === 'ru' ? 'Введите несколько категорий через запятую' :
                    language === 'pt' ? 'Digite várias categorias separadas por vírgulas' :
                    language === 'hi' ? 'अल्पविराम से अलग कई श्रेणियाँ दर्ज करें' :
                    language === 'th' ? 'ป้อนหมวดหมู่หลายรายการคั่นด้วยเครื่องหมายอัลฟา' :
                    language === 'vi' ? 'Nhập nhiều danh mục phân cách bằng dấu phẩy' :
                    'Enter multiple categories separated by commas',
    customizationAvailable: language === 'zh' ? '可定制（是/否）' :
                            language === 'ja' ? 'カスタマイズ可能（はい/いいえ）' :
                            language === 'ar' ? 'التخصيص متاح (نعم/لا)' :
                            language === 'es' ? 'Personalización disponible (Sí/No)' :
                            language === 'fr' ? 'Personnalisation disponible (Oui/Non)' :
                            language === 'de' ? 'Anpassung verfügbar (Ja/Nein)' :
                            language === 'ko' ? '맞춤형 사용 가능 (예/아니오)' :
                            language === 'ru' ? 'Доступна настройка (Да/Нет)' :
                            language === 'pt' ? 'Personalização disponível (Sim/Não)' :
                            language === 'hi' ? 'अनुकूलन उपलब्ध (हाँ/नहीं)' :
                            language === 'th' ? 'การปรับแต่งมีให้บริการ (ใช่/ไม่ใช่)' :
                            language === 'vi' ? 'Có thể tùy chỉnh (Có/Không)' :
                            'Customization Available',
    customizationHint: language === 'zh' ? '勾选如果您提供产品定制服务' :
                      language === 'ja' ? '製品カスタマイズサービスを使用している場合はチェックしてください' :
                      language === 'ar' ? 'تحقق إذا كنت تقدم خدمات تخصيص المنتجات' :
                      language === 'es' ? 'Marque si ofrece servicios de personalización de productos' :
                      language === 'fr' ? 'Cochez si vous proposez des services de personnalisation de produits' :
                      language === 'de' ? 'Kreuzen Sie an, wenn Sie Produktpersonalisierungsdienste anbieten' :
                      language === 'ko' ? '제품 맞춤 서비스를 제공하는 경우 체크해 주세요' :
                      language === 'ru' ? 'Отметьте, если вы предлагаете услуги по индивидуальной настройке продуктов' :
                      language === 'pt' ? 'Marque se você oferece serviços de personalização de produtos' :
                      language === 'hi' ? 'यदि आप उत्पाद अनुकूलन सेवाएं प्रदान करते हैं तो जांचें' :
                      language === 'th' ? 'ทำเครื่องหมายหากคุณให้บริการปรับแต่งผลิตภัณฑ์' :
                      language === 'vi' ? 'Đánh dấu nếu bạn cung cấp dịch vụ tùy chỉnh sản phẩm' :
                      'Check if you offer product customization services',
    saveChanges: language === 'zh' ? '保存更改' :
                 language === 'ja' ? '変更を保存' :
                 language === 'ar' ? 'حفظ التغييرات' :
                 language === 'es' ? 'Guardar cambios' :
                 language === 'fr' ? 'Enregistrer les modifications' :
                 language === 'de' ? 'Änderungen speichern' :
                 language === 'ko' ? '변경 사항 저장' :
                 language === 'ru' ? 'Сохранить изменения' :
                 language === 'pt' ? 'Salvar alterações' :
                 language === 'hi' ? 'परिवर्तनों को सहेजें' :
                 language === 'th' ? 'บันทึกการเปลี่ยนแปลง' :
                 language === 'vi' ? 'Lưu thay đổi' :
                 'Save Changes',
    saving: language === 'zh' ? '保存中...' :
            language === 'ja' ? '保存中...' :
            language === 'ar' ? 'جارِ الحفظ...' :
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
    profileSaved: language === 'zh' ? '资料保存成功！' :
                  language === 'ja' ? 'プロフィールの保存に成功しました！' :
                  language === 'ar' ? 'تم حفظ الملف الشخصي بنجاح!' :
                  language === 'es' ? '¡Perfil guardado con éxito!' :
                  language === 'fr' ? 'Profil enregistré avec succès!' :
                  language === 'de' ? 'Profil erfolgreich gespeichert!' :
                  language === 'ko' ? '프로필이 성공적으로 저장되었습니다!' :
                  language === 'ru' ? 'Профиль успешно сохранен!' :
                  language === 'pt' ? 'Perfil salvo com sucesso!' :
                  language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक सहेजी गई!' :
                  language === 'th' ? 'บันทึกโปรไฟล์สำเร็จ!' :
                  language === 'vi' ? 'Lưu hồ sơ thành công!' :
                  'Profile saved successfully!',
    companyNameRequired: language === 'zh' ? '公司名称为必填项' :
                        language === 'ja' ? '会社名は必須です' :
                        language === 'ar' ? 'اسم الشركة مطلوب' :
                        language === 'es' ? 'El nombre de la empresa es obligatorio' :
                        language === 'fr' ? 'Le nom de l\'entreprise est obligatoire' :
                        language === 'de' ? 'Firmenname ist erforderlich' :
                        language === 'ko' ? '회사명은 필수입니다' :
                        language === 'ru' ? 'Название компании обязательно' :
                        language === 'pt' ? 'O nome da empresa é obrigatório' :
                        language === 'hi' ? 'कंपनी का नाम आवश्यक है' :
                        language === 'th' ? 'ชื่อบริษัทเป็นสิ่งจำเป็น' :
                        language === 'vi' ? 'Tên công ty là bắt buộc' :
                        'Company name is required',
    failedToLoadProfile: language === 'zh' ? '无法加载资料' :
                          language === 'ja' ? 'プロフィールの読み込みに失敗しました' :
                          language === 'ar' ? 'فشل تحميل الملف الشخصي' :
                          language === 'es' ? 'Error al cargar el perfil' :
                          language === 'fr' ? 'Échec du chargement du profil' :
                          language === 'de' ? 'Profil konnte nicht geladen werden' :
                          language === 'ko' ? '프로필 로드 실패' :
                          language === 'ru' ? 'Не удалось загрузить профиль' :
                          language === 'pt' ? 'Falha ao carregar o perfil' :
                          language === 'hi' ? 'प्रोफ़ाइल लोड करने में विफल' :
                          language === 'th' ? 'ไม่สามารถโหลดโปรไฟล์ได้' :
                          language === 'vi' ? 'Không thể tải hồ sơ' :
                          'Failed to load profile',
    failedToSaveProfile: language === 'zh' ? '无法保存资料' :
                         language === 'ja' ? 'プロフィールの保存に失敗しました' :
                         language === 'ar' ? 'فشل حفظ الملف الشخصي' :
                         language === 'es' ? 'Error al guardar el perfil' :
                         language === 'fr' ? 'Échec de l\'enregistrement du profil' :
                         language === 'de' ? 'Profil konnte nicht gespeichert werden' :
                         language === 'ko' ? '프로필 저장 실패' :
                         language === 'ru' ? 'Не удалось сохранить профиль' :
                         language === 'pt' ? 'Falha ao salvar o perfil' :
                         language === 'hi' ? 'प्रोफ़ाइल सहेजने में विफल' :
                         language === 'th' ? 'ไม่สามารถบันทึกโปรไฟล์ได้' :
                         language === 'vi' ? 'Không thể lưu hồ sơ' :
                         'Failed to save profile',
    logoImage: language === 'zh' ? 'Logo图片' :
               language === 'ja' ? 'ロゴ画像' :
               language === 'ko' ? '로고 이미지' :
               'Logo Image',
    bannerImage: language === 'zh' ? '横幅图片' :
                language === 'ja' ? 'バナー画像' :
                language === 'ko' ? '배너 이미지' :
                'Banner Image',
    uploadImage: language === 'zh' ? '上传图片' :
                 language === 'ja' ? '画像をアップロード' :
                 language === 'ko' ? '이미지 업로드' :
                 'Upload Image',
    replaceImage: language === 'zh' ? '替换图片' :
                  language === 'ja' ? '画像を替换' :
                  language === 'ko' ? '이미지 교체' :
                  'Replace Image',
    deleteImage: language === 'zh' ? '删除图片' :
                 language === 'ja' ? '画像を削除' :
                 language === 'ko' ? '이미지 삭제' :
                 'Delete Image',
    uploading: language === 'zh' ? '上传中...' :
               language === 'ja' ? 'アップロード中...' :
               language === 'ko' ? '업로드 중...' :
               'Uploading...',
    uploadFailed: language === 'zh' ? '上传失败' :
                  language === 'ja' ? 'アップロード失敗' :
                  language === 'ko' ? '업로드 실패' :
                  'Upload failed',
    recommendedSize: language === 'zh' ? '建议尺寸：Logo 200x200px，横幅 1200x400px' :
                    language === 'ja' ? '推奨サイズ：ロゴ 200x200px、バナー 1200x400px' :
                    language === 'ko' ? '권장 크기: 로고 200x200px, 배너 1200x400px' :
                    'Recommended size: Logo 200x200px, Banner 1200x400px',
    clickToUpload: language === 'zh' ? '点击上传' :
                   language === 'ja' ? 'クリックしてアップロード' :
                   language === 'ko' ? '클릭하여 업로드' :
                   'Click to upload',
    dragAndDrop: language === 'zh' ? '或将图片拖放到此处' :
                 language === 'ja' ? 'またはここに画像をドラッグ＆ドロップ' :
                 language === 'ko' ? '또는 이미지를 여기에 드래그 앤 드롭' :
                 'or drag and drop',
    imageFormats: language === 'zh' ? '支持 JPG, PNG 格式' :
                  language === 'ja' ? 'JPG, PNG形式対応' :
                  language === 'ko' ? 'JPG, PNG 형식 지원' :
                  'JPG, PNG formats supported',
    confirmReplaceTitle: language === 'zh' ? '确认替换' :
                         language === 'ja' ? '置換の確認' :
                         language === 'ko' ? '대체 확인' :
                         'Confirm Replace',
    confirmReplaceMessage: language === 'zh' ? '您确定要替换当前图片吗？此操作无法撤销。' :
                           language === 'ja' ? '現在の画像を置き換えますか？この操作は元に戻せません。' :
                           language === 'ko' ? '현재 이미지를 대체하시겠습니까? 이 작업은 취소할 수 없습니다.' :
                           'Are you sure you want to replace the current image? This action cannot be undone.',
    confirmYes: language === 'zh' ? '是' :
                language === 'ja' ? 'はい' :
                language === 'ko' ? '예' :
                'Yes',
    confirmNo: language === 'zh' ? '否' :
               language === 'ja' ? 'いいえ' :
               language === 'ko' ? '아니오' :
               'No',
    organizationProfile: language === 'zh' ? '组织介绍' :
                         language === 'ja' ? '組織紹介' :
                         language === 'ko' ? '조직 소개' :
                         'Organization Profile',
    organizationType: language === 'zh' ? '组织形式 *' :
                      language === 'ja' ? '組織形態 *' :
                      language === 'ko' ? '조직 형태 *' :
                      'Organization Type *',
    enterprise: language === 'zh' ? '企业' :
                language === 'ja' ? '企業' :
                language === 'ko' ? '기업' :
                'Enterprise',
    individual: language === 'zh' ? '个体户' :
                language === 'ja' ? '個人事業主' :
                language === 'ko' ? '개인사업자' :
                'Individual',
    stateOwned: language === 'zh' ? '国企' :
                language === 'ja' ? '国営企業' :
                language === 'ko' ? '국영기업' :
                'State-owned',
    personal: language === 'zh' ? '个人' :
              language === 'ja' ? '個人' :
              language === 'ko' ? '개인' :
              'Personal',
    registeredCapital: language === 'zh' ? '注册资金' :
                       language === 'ja' ? '登録資本金' :
                       language === 'ko' ? '등록자본금' :
                       'Registered Capital',
    registeredAddress: language === 'zh' ? '注册地址' :
                       language === 'ja' ? '登録住所' :
                       language === 'ko' ? '등록주소' :
                       'Registered Address',
    businessAddress: language === 'zh' ? '经营地址' :
                     language === 'ja' ? '営業住所' :
                     language === 'ko' ? '영업주소' :
                     'Business Address',
    employeeCount: language === 'zh' ? '公司人数' :
                   language === 'ja' ? '従業員数' :
                   language === 'ko' ? '직원 수' :
                   'Employee Count',
    patents: language === 'zh' ? '专利（逗号分隔）' :
             language === 'ja' ? '特許（カンマ区切り）' :
             language === 'ko' ? '특허 (쉼표로 구분)' :
             'Patents (comma-separated)',
    awards: language === 'zh' ? '奖章/荣誉（逗号分隔）' :
            language === 'ja' ? 'メダル/栄誉（カンマ区切り）' :
            language === 'ko' ? '수상/영예 (쉼표로 구분)' :
            'Awards/Honors (comma-separated)',
    companyPhotos: language === 'zh' ? '公司照片' :
                   language === 'ja' ? '会社写真' :
                   language === 'ko' ? '회사 사진' :
                   'Company Photos',
    teamPhotos: language === 'zh' ? '团队照片' :
                language === 'ja' ? 'チーム写真' :
                language === 'ko' ? '팀 사진' :
                'Team Photos',
    mapLocation: language === 'zh' ? '地图位置' :
                 language === 'ja' ? '地図位置' :
                 language === 'ko' ? '지도 위치' :
                 'Map Location',
    foundingYear: language === 'zh' ? '成立年份' :
                  language === 'ja' ? '設立年' :
                  language === 'ko' ? '설립연도' :
                  'Founding Year',
    businessScope: language === 'zh' ? '经营范围' :
                   language === 'ja' ? '事業範囲' :
                   language === 'ko' ? '경영 범위' :
                   'Business Scope',
    legalRepresentative: language === 'zh' ? '法定代表人' :
                         language === 'ja' ? '法定代表者' :
                         language === 'ko' ? '법정대표인' :
                         'Legal Representative',
    registrationNumber: language === 'zh' ? '统一社会信用代码' :
                        language === 'ja' ? '統一社会信用コード' :
                        language === 'ko' ? '통합사회신용코드' :
                        'Registration Number',
    bankAccount: language === 'zh' ? '银行账户' :
                 language === 'ja' ? '銀行口座' :
                 language === 'ko' ? '은행 계좌' :
                 'Bank Account',
    taxNumber: language === 'zh' ? '税号' :
               language === 'ja' ? '税番号' :
               language === 'ko' ? '세금번호' :
               'Tax Number',
    uploadCompanyPhoto: language === 'zh' ? '上传公司照片' :
                        language === 'ja' ? '会社写真をアップロード' :
                        language === 'ko' ? '회사 사진 업로드' :
                        'Upload Company Photo',
    uploadTeamPhoto: language === 'zh' ? '上传团队照片' :
                     language === 'ja' ? 'チーム写真をアップロード' :
                     language === 'ko' ? '팀 사진 업로드' :
                     'Upload Team Photo',
    deletePhoto: language === 'zh' ? '删除' :
                 language === 'ja' ? '削除' :
                 language === 'ko' ? '삭제' :
                 'Delete',
    setOnMap: language === 'zh' ? '在地图上设置位置' :
              language === 'ja' ? '地図に位置を設定' :
              language === 'ko' ? '지도에 위치 설정' :
              'Set location on map',
    basicInfo: language === 'zh' ? '基本信息' :
               language === 'ja' ? '基本情報' :
               language === 'ko' ? '기본 정보' :
               'Basic Information',
    businessInfo: language === 'zh' ? '经营信息' :
                  language === 'ja' ? '営業情報' :
                  language === 'ko' ? '경영 정보' :
                  'Business Information',
    mediaGallery: language === 'zh' ? '图片展示' :
                  language === 'ja' ? '画像ギャラリー' :
                  language === 'ko' ? '이미지 갤러리' :
                  'Media Gallery',
    failedToUpload: language === 'zh' ? '上传失败' :
                    language === 'ja' ? 'アップロード失敗' :
                    language === 'ko' ? '업로드 실패' :
                    'Failed to upload',

    enterpriseCertificates: language === 'zh' ? '企业资质证书' :
                           language === 'ja' ? '企業資格証明書' :
                           language === 'ko' ? '기업 자격 증명서' :
                           'Enterprise Certificates',
    certificatesDescription: language === 'zh' ? '上传企业营业执照、经营许可证等资质证明文件，提升企业可信度' :
                             language === 'ja' ? '営業許可証などの資格証明書をアップロードして、企業の信頼性を高めましょう' :
                             language === 'ko' ? '사업자등록증 등 자격 증명서를 업로드하여 기업 신뢰도를 높이세요' :
                             'Upload business licenses and certificates to improve enterprise credibility',
    certificateType: language === 'zh' ? '证书类型' :
                    language === 'ja' ? '証明書タイプ' :
                    language === 'ko' ? '증명서 종류' :
                    'Certificate Type',
    selectCertificateType: language === 'zh' ? '请选择证书类型' :
                          language === 'ja' ? '証明書タイプを選択' :
                          language === 'ko' ? '증명서 종류를 선택하세요' :
                          'Select certificate type',
    certBusinessLicense: language === 'zh' ? '营业执照' :
                        language === 'ja' ? '営業許可証' :
                        language === 'ko' ? '사업자등록증' :
                        'Business License',
    certOperatingLicense: language === 'zh' ? '经营许可证' :
                         language === 'ja' ? '営業許可書' :
                         language === 'ko' ? '영업허가증' :
                         'Operating License',
    certTaxRegistration: language === 'zh' ? '税务登记证' :
                        language === 'ja' ? '税務登録証' :
                        language === 'ko' ? '세무등록증' :
                        'Tax Registration',
    certOrgCode: language === 'zh' ? '组织机构代码证' :
                language === 'ja' ? '組織機構コード証' :
                language === 'ko' ? '조직기관코드증' :
                'Organization Code',
    certIso: language === 'zh' ? 'ISO认证' :
            language === 'ja' ? 'ISO認証' :
            language === 'ko' ? 'ISO 인증' :
            'ISO Certification',
    certCe: language === 'zh' ? 'CE认证' :
           language === 'ja' ? 'CE認証' :
           language === 'ko' ? 'CE 인증' :
           'CE Certification',
    certFda: language === 'zh' ? 'FDA认证' :
            language === 'ja' ? 'FDA認証' :
            language === 'ko' ? 'FDA 인증' :
            'FDA Certification',
    certExportLicense: language === 'zh' ? '出口许可证' :
                       language === 'ja' ? '輸出許可証' :
                       language === 'ko' ? '수출허가증' :
                       'Export License',
    certImportLicense: language === 'zh' ? '进口许可证' :
                       language === 'ja' ? '輸入許可証' :
                       language === 'ko' ? '수입허가증' :
                       'Import License',
    certCountryRegistration: language === 'zh' ? '其他国家企业注册证明' :
                             language === 'ja' ? 'その他の国の企業登録証明' :
                             language === 'ko' ? '기타 국가 기업 등록 증명' :
                             'Country Registration',
    certOther: language === 'zh' ? '其他' :
               language === 'ja' ? 'その他' :
               language === 'ko' ? '기타' :
               'Other',
    certificateName: language === 'zh' ? '证书名称（自定义）' :
                     language === 'ja' ? '証明書名（カスタム）' :
                     language === 'ko' ? '증명서 이름 (사용자 지정)' :
                     'Certificate Name (Custom)',
    certificateNamePlaceholder: language === 'zh' ? '例如：高新技术企业证书' :
                                language === 'ja' ? '例：ハイテク企業証明書' :
                                language === 'ko' ? '예: 하이테크 기업 증명서' :
                                'e.g., High-tech Enterprise Certificate',
    certificateNumber: language === 'zh' ? '证书编号' :
                      language === 'ja' ? '証明書番号' :
                      language === 'ko' ? '증명서 번호' :
                      'Certificate Number',
    certificateNumberPlaceholder: language === 'zh' ? '请输入证书编号' :
                                  language === 'ja' ? '証明書番号を入力' :
                                  language === 'ko' ? '증명서 번호를 입력하세요' :
                                  'Enter certificate number',
    issuingAuthority: language === 'zh' ? '颁发机构' :
                      language === 'ja' ? '発行機関' :
                      language === 'ko' ? '발급 기관' :
                      'Issuing Authority',
    issuingAuthorityPlaceholder: language === 'zh' ? '例如：国家市场监督管理总局' :
                                 language === 'ja' ? '例：国家市場監督管理総局' :
                                 language === 'ko' ? '예: 국가시장감독관리총국' :
                                 'e.g., State Administration for Market Regulation',
    issueDate: language === 'zh' ? '颁发日期' :
              language === 'ja' ? '発行日' :
              language === 'ko' ? '발급일' :
              'Issue Date',
    expiryDate: language === 'zh' ? '有效期至' :
               language === 'ja' ? '有効期限' :
               language === 'ko' ? '유효기간' :
               'Expiry Date',
    certificateFile: language === 'zh' ? '证书文件' :
                     language === 'ja' ? '証明書ファイル' :
                     language === 'ko' ? '증명서 파일' :
                     'Certificate File',
    uploadCertificate: language === 'zh' ? '上传证书' :
                       language === 'ja' ? '証明書をアップロード' :
                       language === 'ko' ? '증명서 업로드' :
                       'Upload Certificate',
    uploadedCertificates: language === 'zh' ? '已上传的证书' :
                          language === 'ja' ? 'アップロード済み証明書' :
                          language === 'ko' ? '업로드된 증명서' :
                          'Uploaded Certificates',
    verified: language === 'zh' ? '已验证' :
              language === 'ja' ? '認証済み' :
              language === 'ko' ? '인증됨' :
              'Verified',
    pendingVerification: language === 'zh' ? '待审核' :
                        language === 'ja' ? '審査待ち' :
                        language === 'ko' ? '심사 대기 중' :
                        'Pending Verification',
    selectedFile: language === 'zh' ? '已选择文件' :
                  language === 'ja' ? '選択したファイル' :
                  language === 'ko' ? '선택된 파일' :
                  'Selected file',
  }

  const countries = [
    'China', 'United States', 'Germany', 'Japan', 'United Kingdom', 'France',
    'Italy', 'Canada', 'Australia', 'India', 'Brazil', 'Mexico', 'Spain',
    'Netherlands', 'South Korea', 'Singapore', 'Vietnam', 'Thailand',
    'Malaysia', 'Indonesia', 'Turkey', 'Russia', 'Other'
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/seller/profile')

      if (!response.ok) {
        throw new Error(t.failedToLoadProfile)
      }

      const data = await response.json()
      const profile = data.profile

      setCompanyName(profile.companyName || '')
      setDescription(profile.description || '')
      setDescriptions(profile.descriptions || {})
      setCountry(profile.country || '')
      setCity(profile.city || '')
      setAddress(profile.address || '')
      setPhone(profile.phone || '')
      setEmail(profile.email || '')
      setWebsite(profile.website || '')
      setCertifications(profile.certifications?.join(', ') || '')
      setBoothName(profile.boothName || '')
      setBoothCategories(profile.boothCategories?.join(', ') || '')
      setIsCustomizable(profile.isCustomizable || false)
      setLogoUrl(profile.logoUrl || '')
      setBannerUrl(profile.bannerUrl || '')
      setOrganizationType(profile.organizationType || 'ENTERPRISE')
      setRegisteredCapital(profile.registeredCapital || '')
      setRegisteredAddress(profile.registeredAddress || '')
      setBusinessAddress(profile.businessAddress || '')
      setEmployeeCount(profile.employeeCount || '')
      setPatents((profile.patents || []).join(', '))
      setAwards((profile.awards || []).join(', '))
      setCompanyPhotos(profile.companyPhotos || [])
      setTeamPhotos(profile.teamPhotos || [])
      setMapLatitude(profile.mapLatitude || null)
      setMapLongitude(profile.mapLongitude || null)
      setMapAddress(profile.mapAddress || '')
      setFoundingYear(profile.foundingYear || '')
      setBusinessScope(profile.businessScope || '')
      setLegalRepresentative(profile.legalRepresentative || '')
      setRegistrationNumber(profile.registrationNumber || '')
      setBankAccount(profile.bankAccount || '')
      setTaxNumber(profile.taxNumber || '')
      setLinkedin(profile.linkedin || '')
      setFacebook(profile.facebook || '')
      setInstagram(profile.instagram || '')
      setYoutube(profile.youtube || '')
      setTiktok(profile.tiktok || '')
      setTwitter(profile.twitter || '')
      setPinterest(profile.pinterest || '')
      setDouyin(profile.douyin || '')
      setXiaohongshu(profile.xiaohongshu || '')
      setQq(profile.qq || '')
      setDingtalk(profile.dingtalk || '')
      setLark(profile.lark || '')
      setWechatVideo(profile.wechatVideo || '')
      setWeibo(profile.weibo || '')
      setKuaishou(profile.kuaishou || '')
      setBilibili(profile.bilibili || '')
      setReddit(profile.reddit || '')
      setSnapchat(profile.snapchat || '')
      setTumblr(profile.tumblr || '')
      setWhatsapp(profile.whatsapp || '')
      setWechat(profile.wechat || '')
      setTelegram(profile.telegram || '')
      setChatSystem(profile.chatSystem || '')

      // Load verification certificates
      if (profile.organizationType === 'ENTERPRISE' || profile.organizationType === 'STATE_OWNED') {
        loadCertificates()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToLoadProfile)
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      const response = await fetch('/api/seller/verification/files')
      if (response.ok) {
        const data = await response.json()
        setCertificateList(data.files || [])
      }
    } catch (err) {
      console.error('Failed to load certificates:', err)
    }
  }

  const handleCertFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedCertFile(file)
    }
  }

  const handleUploadCertificate = async () => {
    // Validate required fields
    if (!newCertType) {
      setError(t.selectCertificateType)
      return
    }
    if (!selectedCertFile) {
      setError(language === 'zh' ? '请选择证书文件' : 'Please select a certificate file')
      return
    }

    setUploadingCert(true)
    setError('') // Clear previous error
    try {
      const formData = new FormData()
      formData.append('file', selectedCertFile)
      formData.append('fileType', newCertType)
      if (newCertName) formData.append('certificateName', newCertName)
      if (newCertNumber) formData.append('certificateNumber', newCertNumber)
      if (newCertIssuer) formData.append('issuingAuthority', newCertIssuer)
      if (newCertIssueDate) formData.append('issueDate', newCertIssueDate)
      if (newCertExpiryDate) formData.append('expiryDate', newCertExpiryDate)

      console.log('Uploading certificate:', { fileType: newCertType, fileName: selectedCertFile.name })

      const response = await fetch('/api/seller/verification/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Upload success:', data)
        setCertificateList((prev) => [data.file, ...prev])
        // Reset form
        setNewCertType('')
        setNewCertName('')
        setNewCertNumber('')
        setNewCertIssuer('')
        setNewCertIssueDate('')
        setNewCertExpiryDate('')
        setSelectedCertFile(null)
        if (certFileInputRef.current) {
          certFileInputRef.current.value = ''
        }
      } else {
        const data = await response.json()
        console.error('Upload failed:', data)
        setError(data.error || 'Failed to upload certificate')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload certificate')
    } finally {
      setUploadingCert(false)
    }
  }

  const handleDeleteCertificate = async (certId: string) => {
    if (!confirm(t.confirmDelete)) return
    try {
      const response = await fetch('/api/seller/verification/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: certId }),
      })

      if (response.ok) {
        setCertificateList((prev) => prev.filter((c) => c.id !== certId))
      }
    } catch (err) {
      console.error('Failed to delete certificate:', err)
    }
  }

  const getCertTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      BUSINESS_LICENSE: t.certBusinessLicense,
      OPERATING_LICENSE: t.certOperatingLicense,
      TAX_REGISTRATION: t.certTaxRegistration,
      ORG_CODE_CERTIFICATE: t.certOrgCode,
      ISO_CERTIFICATION: t.certIso,
      CE_CERTIFICATION: t.certCe,
      FDA_CERTIFICATION: t.certFda,
      EXPORT_LICENSE: t.certExportLicense,
      IMPORT_LICENSE: t.certImportLicense,
      COUNTRY_REGISTRATION: t.certCountryRegistration,
      OTHER: t.certOther,
      ID_CARD: 'ID Card',
      DRIVER_LICENSE: 'Driver License',
      CREDIT_CARD: 'Credit Card',
      PHOTO: 'Photo',
      VIDEO: 'Video',
    }
    return typeMap[type] || type
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (logoUrl) {
      setPendingLogoFile(file)
      setShowLogoConfirm(true)
      return
    }

    performLogoUpload(file)
  }

  const performLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(t.uploadFailed)
      }

      const data = await response.json()
      setLogoUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.uploadFailed)
    } finally {
      setUploadingLogo(false)
      setShowLogoConfirm(false)
      setPendingLogoFile(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleConfirmLogoReplace = () => {
    if (pendingLogoFile) {
      performLogoUpload(pendingLogoFile)
    }
  }

  const handleCancelLogoReplace = () => {
    setShowLogoConfirm(false)
    setPendingLogoFile(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (bannerUrl) {
      setPendingBannerFile(file)
      setShowBannerConfirm(true)
      return
    }

    performBannerUpload(file)
  }

  const performBannerUpload = async (file: File) => {
    setUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(t.uploadFailed)
      }

      const data = await response.json()
      setBannerUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.uploadFailed)
    } finally {
      setUploadingBanner(false)
      setShowBannerConfirm(false)
      setPendingBannerFile(null)
      if (bannerInputRef.current) bannerInputRef.current.value = ''
    }
  }

  const handleConfirmBannerReplace = () => {
    if (pendingBannerFile) {
      performBannerUpload(pendingBannerFile)
    }
  }

  const handleCancelBannerReplace = () => {
    setShowBannerConfirm(false)
    setPendingBannerFile(null)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  const handleDeleteLogo = () => {
    setLogoUrl('')
  }

  const handleDeleteBanner = () => {
    setBannerUrl('')
  }

  const handleCompanyPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', 'seller/company-photos')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.url) {
          setCompanyPhotos(prev => [...prev, data.url])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.failedToUpload)
      }
    }

    if (e.target) e.target.value = ''
  }

  const handleTeamPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', 'seller/team-photos')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.url) {
          setTeamPhotos(prev => [...prev, data.url])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.failedToUpload)
      }
    }

    if (e.target) e.target.value = ''
  }

  const handleDeleteCompanyPhoto = (index: number) => {
    setCompanyPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteTeamPhoto = (index: number) => {
    setTeamPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      setError(t.companyNameRequired)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const certsArray = certifications
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0)

      const payload = {
        companyName: companyName.trim(),
        description: description.trim(),
        descriptions: Object.keys(descriptions).length > 0 ? descriptions : undefined,
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        certifications: certsArray.length > 0 ? certsArray : null,
        boothName: boothName.trim() || null,
        boothCategories: boothCategories.split(',').map(c => c.trim()).filter(c => c),
        isCustomizable: isCustomizable,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        organizationType: organizationType,
        registeredCapital: registeredCapital.trim() || null,
        registeredAddress: registeredAddress.trim() || null,
        businessAddress: businessAddress.trim() || null,
        employeeCount: employeeCount.trim() || null,
        patents: patents.split(',').map(p => p.trim()).filter(p => p),
        awards: awards.split(',').map(a => a.trim()).filter(a => a),
        companyPhotos: companyPhotos,
        teamPhotos: teamPhotos,
        mapLatitude: mapLatitude ? parseFloat(mapLatitude) : null,
        mapLongitude: mapLongitude ? parseFloat(mapLongitude) : null,
        mapAddress: mapAddress.trim() || null,
        foundingYear: foundingYear.trim() || null,
        businessScope: businessScope.trim() || null,
        legalRepresentative: legalRepresentative.trim() || null,
        registrationNumber: registrationNumber.trim() || null,
        bankAccount: bankAccount.trim() || null,
        taxNumber: taxNumber.trim() || null,
        linkedin: linkedin.trim() || null,
        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null,
        youtube: youtube.trim() || null,
        tiktok: tiktok.trim() || null,
        twitter: twitter.trim() || null,
        pinterest: pinterest.trim() || null,
        douyin: douyin.trim() || null,
        xiaohongshu: xiaohongshu.trim() || null,
        qq: qq.trim() || null,
        dingtalk: dingtalk.trim() || null,
        lark: lark.trim() || null,
        wechatVideo: wechatVideo.trim() || null,
        weibo: weibo.trim() || null,
        kuaishou: kuaishou.trim() || null,
        bilibili: bilibili.trim() || null,
        reddit: reddit.trim() || null,
        snapchat: snapchat.trim() || null,
        tumblr: tumblr.trim() || null,
        whatsapp: whatsapp.trim() || null,
        wechat: wechat.trim() || null,
        telegram: telegram.trim() || null,
        chatSystem: chatSystem.trim() || null,
      }

      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show validation details if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((d: any) => 
            `${d.path.join('.')}: ${d.message}`
          ).join(', ')
          throw new Error(`${data.error}: ${errorMessages}`)
        }
        throw new Error(data.error || t.failedToSaveProfile)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToSaveProfile)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {t.pageSubtitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">{t.profileSaved}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            {t.companyInfo}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.companyName}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t.companyNamePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.companyDescription}
            </label>
            {Object.keys(descriptions).length > 0 ? (
              <MultilingualInput
                value={descriptions}
                onChange={(val) => setDescriptions(val)}
                label=""
                rows={5}
              />
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {Object.keys(descriptions).length === 0 && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Tip: Enable multi-language editing in Advanced Mode for global buyers
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.certifications}
            </label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder={t.certificationsPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t.certificationsHint}</p>
          </div>

          {/* Logo 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.logoImage}
            </label>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            {logoUrl ? (
              <div className="relative inline-block">
                <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingLogo ? t.uploading : t.replaceImage}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    disabled={uploadingLogo}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {t.deleteImage}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                {uploadingLogo ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">{t.uploading}</span>
                  </div>
                ) : (
                  <>
                    <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{t.clickToUpload}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.dragAndDrop}</p>
                    <p className="text-xs text-gray-400">{t.imageFormats}</p>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{t.recommendedSize}</p>
          </div>

          {/* 横幅图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.bannerImage}
            </label>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden"
            />
            {bannerUrl ? (
              <div className="relative inline-block">
                <div className="w-full max-w-md h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-contain" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingBanner ? t.uploading : t.replaceImage}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBanner}
                    disabled={uploadingBanner}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {t.deleteImage}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                {uploadingBanner ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">{t.uploading}</span>
                  </div>
                ) : (
                  <>
                    <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{t.clickToUpload}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.dragAndDrop}</p>
                    <p className="text-xs text-gray-400">{t.imageFormats}</p>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{t.recommendedSize}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            {t.location}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.country}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.selectCountry}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.city}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.cityPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.fullAddress}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-500" />
            {t.contactInfo}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.phoneNumber}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.emailAddress}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.website}
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder={t.websitePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Accounts Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            {t.socialMedia}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.linkedin}
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.facebook}
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.instagram}
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.youtube}
              </label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.tiktok}
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Twitter/X */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.twitter}
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pinterest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.pinterest}
              </label>
              <input
                type="url"
                value={pinterest}
                onChange={(e) => setPinterest(e.target.value)}
                placeholder="https://pinterest.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 抖音 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.douyin}
              </label>
              <input
                type="text"
                value={douyin}
                onChange={(e) => setDouyin(e.target.value)}
                placeholder="@username / UID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 小红书 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.xiaohongshu}
              </label>
              <input
                type="text"
                value={xiaohongshu}
                onChange={(e) => setXiaohongshu(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* QQ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.qq}
              </label>
              <input
                type="text"
                value={qq}
                onChange={(e) => setQq(e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 钉钉 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.dingtalk}
              </label>
              <input
                type="text"
                value={dingtalk}
                onChange={(e) => setDingtalk(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 飞书 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.lark}
              </label>
              <input
                type="text"
                value={lark}
                onChange={(e) => setLark(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 微信视频号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.wechatVideo}
              </label>
              <input
                type="text"
                value={wechatVideo}
                onChange={(e) => setWechatVideo(e.target.value)}
                placeholder="视频号名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 微博 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.weibo}
              </label>
              <input
                type="text"
                value={weibo}
                onChange={(e) => setWeibo(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 快手 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.kuaishou}
              </label>
              <input
                type="text"
                value={kuaishou}
                onChange={(e) => setKuaishou(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* B站 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bilibili}
              </label>
              <input
                type="text"
                value={bilibili}
                onChange={(e) => setBilibili(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reddit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.reddit}
              </label>
              <input
                type="text"
                value={reddit}
                onChange={(e) => setReddit(e.target.value)}
                placeholder="u/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Snapchat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.snapchat}
              </label>
              <input
                type="text"
                value={snapchat}
                onChange={(e) => setSnapchat(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tumblr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.tumblr}
              </label>
              <input
                type="url"
                value={tumblr}
                onChange={(e) => setTumblr(e.target.value)}
                placeholder="yourblog.tumblr.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.whatsapp}
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+86 186 xxxx xxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* WeChat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.wechat}
              </label>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="wechat_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.telegram}
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chat System */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.chatSystem}
              </label>
              <input
                type="text"
                value={chatSystem}
                onChange={(e) => setChatSystem(e.target.value)}
                placeholder={t.chatSystemPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            {t.boothCustomization}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.boothName}
            </label>
            <input
              type="text"
              value={boothName}
              onChange={(e) => setBoothName(e.target.value)}
              placeholder={t.boothNamePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t.boothNameHint}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.productCategories}
            </label>
            <input
              type="text"
              value={boothCategories}
              onChange={(e) => setBoothCategories(e.target.value)}
              placeholder={t.categoriesPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t.categoriesHint}</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t.customizationAvailable}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">{t.customizationHint}</p>
          </div>
        </div>

        {/* Organization Profile Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            {t.organizationProfile}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.organizationType}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'ENTERPRISE', label: t.enterprise },
                { value: 'INDIVIDUAL', label: t.individual },
                { value: 'STATE_OWNED', label: t.stateOwned },
                { value: 'PERSONAL', label: t.personal },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    organizationType === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="organizationType"
                    value={opt.value}
                    checked={organizationType === opt.value}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.foundingYear}
              </label>
              <input
                type="text"
                value={foundingYear}
                onChange={(e) => setFoundingYear(e.target.value)}
                placeholder="2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.registeredCapital}
              </label>
              <input
                type="text"
                value={registeredCapital}
                onChange={(e) => setRegisteredCapital(e.target.value)}
                placeholder="100万元"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.legalRepresentative}
              </label>
              <input
                type="text"
                value={legalRepresentative}
                onChange={(e) => setLegalRepresentative(e.target.value)}
                placeholder="张三"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.registrationNumber}
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="91110000MA00000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.employeeCount}
              </label>
              <input
                type="text"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="50-100人"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.businessScope}
              </label>
              <input
                type="text"
                value={businessScope}
                onChange={(e) => setBusinessScope(e.target.value)}
                placeholder="技术开发、技术服务"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.registeredAddress}
              </label>
              <input
                type="text"
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.businessAddress}
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.patents}
            </label>
            <input
              type="text"
              value={patents}
              onChange={(e) => setPatents(e.target.value)}
              placeholder="发明专利, 实用新型专利"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.awards}
            </label>
            <input
              type="text"
              value={awards}
              onChange={(e) => setAwards(e.target.value)}
              placeholder="国家高新技术企业, 行业领军企业"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bankAccount}
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="中国工商银行 6222 0000 0000 0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.taxNumber}
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="91110000MA00000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Enterprise Certificates Section - Only show for enterprise/state-owned */}
        {(organizationType === 'ENTERPRISE' || organizationType === 'STATE_OWNED') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-500" />
              {t.enterpriseCertificates}
            </h2>

            <p className="text-sm text-gray-500">
              {t.certificatesDescription}
            </p>

            {/* Upload Certificate Form */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.certificateType} *
                  </label>
                  <select
                    value={newCertType}
                    onChange={(e) => setNewCertType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t.selectCertificateType}</option>
                    <option value="BUSINESS_LICENSE">{t.certBusinessLicense}</option>
                    <option value="OPERATING_LICENSE">{t.certOperatingLicense}</option>
                    <option value="TAX_REGISTRATION">{t.certTaxRegistration}</option>
                    <option value="ORG_CODE_CERTIFICATE">{t.certOrgCode}</option>
                    <option value="ISO_CERTIFICATION">{t.certIso}</option>
                    <option value="CE_CERTIFICATION">{t.certCe}</option>
                    <option value="FDA_CERTIFICATION">{t.certFda}</option>
                    <option value="EXPORT_LICENSE">{t.certExportLicense}</option>
                    <option value="IMPORT_LICENSE">{t.certImportLicense}</option>
                    <option value="COUNTRY_REGISTRATION">{t.certCountryRegistration}</option>
                    <option value="OTHER">{t.certOther}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.certificateName}
                  </label>
                  <input
                    type="text"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder={t.certificateNamePlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.certificateNumber}
                  </label>
                  <input
                    type="text"
                    value={newCertNumber}
                    onChange={(e) => setNewCertNumber(e.target.value)}
                    placeholder={t.certificateNumberPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.issuingAuthority}
                  </label>
                  <input
                    type="text"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder={t.issuingAuthorityPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.issueDate}
                  </label>
                  <input
                    type="date"
                    value={newCertIssueDate}
                    onChange={(e) => setNewCertIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.expiryDate}
                  </label>
                  <input
                    type="date"
                    value={newCertExpiryDate}
                    onChange={(e) => setNewCertExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.certificateFile} *
                </label>
                <input
                  type="file"
                  ref={certFileInputRef}
                  onChange={handleCertFileSelect}
                  accept="image/*,.pdf"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedCertFile && (
                  <p className="mt-1 text-sm text-gray-600">
                    {t.selectedFile}: {selectedCertFile.name} ({formatFileSize(selectedCertFile.size)})
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUploadCertificate}
                disabled={uploadingCert || !newCertType || !selectedCertFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingCert ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {t.uploadCertificate}
                  </>
                )}
              </button>
            </div>

            {/* Certificate List */}
            {certificateList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">{t.uploadedCertificates}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificateList.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 rounded-lg p-4 space-y-2 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            cert.isVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {cert.isVerified ? t.verified : t.pendingVerification}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm font-medium text-gray-900">
                        {cert.certificateName || getCertTypeName(cert.fileType)}
                      </div>

                      {cert.certificateNumber && (
                        <div className="text-xs text-gray-500">
                          {t.certificateNumber}: {cert.certificateNumber}
                        </div>
                      )}

                      {cert.issuingAuthority && (
                        <div className="text-xs text-gray-500">
                          {t.issuingAuthority}: {cert.issuingAuthority}
                        </div>
                      )}

                      {(cert.issueDate || cert.expiryDate) && (
                        <div className="text-xs text-gray-500">
                          {cert.issueDate && `${t.issueDate}: ${cert.issueDate}`}
                          {cert.expiryDate && ` / ${t.expiryDate}: ${cert.expiryDate}`}
                        </div>
                      )}

                      {/* File preview */}
                      <div className="mt-2">
                        {cert.mimeType?.startsWith('image/') ? (
                          <img
                            src={cert.fileUrl}
                            alt={cert.certificateName || getCertTypeName(cert.fileType)}
                            className="w-full h-32 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Location Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            {t.mapLocation}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.fullAddress}
            </label>
            <input
              type="text"
              value={mapAddress}
              onChange={(e) => setMapAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={mapLatitude ?? ''}
                onChange={(e) => setMapLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="39.9042"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={mapLongitude ?? ''}
                onChange={(e) => setMapLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="116.4074"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mapLatitude && mapLongitude && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=15&output=embed`}
              />
            </div>
          )}
        </div>

        {/* Media Gallery Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-gray-500" />
            {t.mediaGallery}
          </h2>

          {/* Company Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.companyPhotos}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {companyPhotos.map((photo, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={photo}
                    alt={`Company photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCompanyPhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {t.uploadCompanyPhoto}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCompanyPhotoUpload}
                className="sr-only"
              />
            </label>
          </div>

          {/* Team Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.teamPhotos}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {teamPhotos.map((photo, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={photo}
                    alt={`Team photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteTeamPhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {t.uploadTeamPhoto}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleTeamPhotoUpload}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t.saveChanges}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Logo Replace Confirmation Modal */}
      {showLogoConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t.confirmReplaceTitle}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t.confirmReplaceMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelLogoReplace}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.confirmNo}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogoReplace}
                disabled={uploadingLogo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploadingLogo ? t.uploading : t.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Replace Confirmation Modal */}
      {showBannerConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t.confirmReplaceTitle}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t.confirmReplaceMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelBannerReplace}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.confirmNo}
              </button>
              <button
                type="button"
                onClick={handleConfirmBannerReplace}
                disabled={uploadingBanner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploadingBanner ? t.uploading : t.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}