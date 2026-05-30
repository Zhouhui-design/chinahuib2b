'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import MultilingualInput from '@/components/ui/MultilingualInput'
import { Save, Building2, MapPin, Phone, Mail, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

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
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [certifications, setCertifications] = useState<string>('')

  const [boothName, setBoothName] = useState('')
  const [boothCategories, setBoothCategories] = useState<string>('')
  const [isCustomizable, setIsCustomizable] = useState(false)

  const t = {
    pageTitle: language === 'zh' ? '店铺资料' :
              language === 'ja' ? 'ストアプロフィール' :
              language === 'ar' ? 'ملف المتجر' :
              language === 'es' ? 'Perfil de la tienda' :
              language === 'fr' ? 'Profil de la boutique' :
              language === 'de' ? 'Shop-Profil' :
              language === 'ko' ? '스토어 프로필' :
              language === 'ru' ? 'Профиль магазина' :
              language === 'pt' ? 'Perfil da loja' :
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
    brandImages: language === 'zh' ? '品牌图片' :
                 language === 'ja' ? 'ブランド画像' :
                 language === 'ar' ? 'صور العلامة التجارية' :
                 language === 'es' ? 'Imágenes de marca' :
                 language === 'fr' ? 'Images de marque' :
                 language === 'de' ? 'Markenbilder' :
                 language === 'ko' ? '브랜드 이미지' :
                 language === 'ru' ? 'Изображения бренда' :
                 language === 'pt' ? 'Imagens da marca' :
                 language === 'hi' ? 'ब्रांड छवियाँ' :
                 language === 'th' ? 'รูปภาพแบรนด์' :
                 language === 'vi' ? 'Hình ảnh thương hiệu' :
                 'Brand Images',
    companyLogo: language === 'zh' ? '公司标志' :
                 language === 'ja' ? '会社ロゴ' :
                 language === 'ar' ? 'شعار الشركة' :
                 language === 'es' ? 'Logotipo de la empresa' :
                 language === 'fr' ? 'Logo de l\'entreprise' :
                 language === 'de' ? 'Firmenlogo' :
                 language === 'ko' ? '회사 로고' :
                 language === 'ru' ? 'Логотип компании' :
                 language === 'pt' ? 'Logotipo da empresa' :
                 language === 'hi' ? 'कंपनी का लोगो' :
                 language === 'th' ? 'โลโก้บริษัท' :
                 language === 'vi' ? 'Logo công ty' :
                 'Company Logo',
    currentLogo: language === 'zh' ? '当前标志：' :
                 language === 'ja' ? '現在のロゴ：' :
                 language === 'ar' ? 'الشعار الحالي:' :
                 language === 'es' ? 'Logotipo actual:' :
                 language === 'fr' ? 'Logo actuel:' :
                 language === 'de' ? 'Aktuelles Logo:' :
                 language === 'ko' ? '현재 로고:' :
                 language === 'ru' ? 'Текущий логотип:' :
                 language === 'pt' ? 'Logotipo atual:' :
                 language === 'hi' ? 'वर्तमान लोगो:' :
                 language === 'th' ? 'โลโก้ปัจจุบัน:' :
                 language === 'vi' ? 'Logo hiện tại:' :
                 'Current Logo:',
    storeBanner: language === 'zh' ? '店铺横幅（标题图片）' :
                 language === 'ja' ? 'ストアバナー（ヘッダー画像）' :
                 language === 'ar' ? 'لافتة المتجر (صورة الرأس)' :
                 language === 'es' ? 'Banner de la tienda (imagen de encabezado)' :
                 language === 'fr' ? 'Bannière de la boutique (image d\'en-tête)' :
                 language === 'de' ? 'Shop-Banner (Header-Bild)' :
                 language === 'ko' ? '스토어 배너 (헤더 이미지)' :
                 language === 'ru' ? 'Баннер магазина (изображение в шапке)' :
                 language === 'pt' ? 'Banner da loja (imagem do cabeçalho)' :
                 language === 'hi' ? 'स्टोर बैनर (हेडर छवि)' :
                 language === 'th' ? 'แบนเนอร์ร้าน (รูปภาพส่วนหัว)' :
                 language === 'vi' ? 'Biểu ngữ cửa hàng (hình ảnh tiêu đề)' :
                 'Store Banner (Header Image)',
    currentBanner: language === 'zh' ? '当前横幅：' :
                  language === 'ja' ? '現在のバナー：' :
                  language === 'ar' ? 'الحالي بانر:' :
                  language === 'es' ? 'Banner actual:' :
                  language === 'fr' ? 'Bannière actuelle:' :
                  language === 'de' ? 'Aktuelles Banner:' :
                  language === 'ko' ? '현재 배너:' :
                  language === 'ru' ? 'Текущий баннер:' :
                  language === 'pt' ? 'Banner atual:' :
                  language === 'hi' ? 'वर्तमान बैनर:' :
                  language === 'th' ? 'แบนเนอร์ปัจจุบัน:' :
                  language === 'vi' ? 'Biểu ngữ hiện tại:' :
                  'Current Banner:',
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
      setLogoUrl(profile.logoUrl || '')
      setBannerUrl(profile.bannerUrl || '')
      setCertifications(profile.certifications?.join(', ') || '')
      setBoothName(profile.boothName || '')
      setBoothCategories(profile.boothCategories?.join(', ') || '')
      setIsCustomizable(profile.isCustomizable || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToLoadProfile)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (data: any) => {
    const url = Array.isArray(data) ? data[0]?.url : data.url
    if (url) setLogoUrl(url)
  }

  const handleBannerUpload = (data: any) => {
    const url = Array.isArray(data) ? data[0]?.url : data.url
    if (url) setBannerUrl(url)
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
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        certifications: certsArray.length > 0 ? certsArray : null,
        boothName: boothName.trim() || null,
        boothCategories: boothCategories.split(',').map(c => c.trim()).filter(c => c),
        isCustomizable: isCustomizable,
      }

      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
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
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.brandImages}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.companyLogo}
              </label>
              <FileUpload
                type="logo"
                onUploadSuccess={handleLogoUpload}
              />
              {logoUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">{t.currentLogo}</p>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain border rounded-lg p-2 bg-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.storeBanner}
              </label>
              <FileUpload
                type="banner"
                onUploadSuccess={handleBannerUpload}
              />
              {bannerUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">{t.currentBanner}</p>
                  <img
                    src={bannerUrl}
                    alt="Banner preview"
                    className="w-full h-24 object-cover border rounded-lg"
                  />
                </div>
              )}
            </div>
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
    </div>
  )
}