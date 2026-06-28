'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import type { LanguageCode } from '@/lib/languages'

export default function RegisterPage() {
  const router = useRouter()
  const params = useParams()
  const language = params.locale as LanguageCode || 'en'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'BUYER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [linkChatSystem, setLinkChatSystem] = useState(false)

  const t = {
    title: language === 'zh' ? '创建您的账户' :
           language === 'ja' ? 'アカウント作成' :
           language === 'ar' ? 'إنشاء حسابك' :
           language === 'es' ? 'Crea tu cuenta' :
           language === 'fr' ? 'Créer votre compte' :
           language === 'de' ? 'Konto erstellen' :
           language === 'ko' ? '계정 만들기' :
           language === 'ru' ? 'Создайте свой аккаунт' :
           language === 'pt' ? 'Crie sua conta' :
           language === 'hi' ? 'अपना खाता बनाएं' :
           language === 'th' ? 'สร้างบัญชีของคุณ' :
           language === 'vi' ? 'Tạo tài khoản của bạn' :
           'Create your account',
    signInLink: language === 'zh' ? '登录您的账户' :
                language === 'ja' ? 'アカウントにサインイン' :
                language === 'ar' ? 'تسجيل الدخول إلى حسابك' :
                language === 'es' ? 'Inicia sesión en tu cuenta' :
                language === 'fr' ? 'Connectez-vous à votre compte' :
                language === 'de' ? 'Melden Sie sich bei Ihrem Konto an' :
                language === 'ko' ? '계정에 로그인' :
                language === 'ru' ? 'Войдите в свой аккаунт' :
                language === 'pt' ? 'Entre em sua conta' :
                language === 'hi' ? 'अपने खाते में प्रवेश करें' :
                language === 'th' ? 'เข้าสู่ระบบบัญชีของคุณ' :
                language === 'vi' ? 'Đăng nhập vào tài khoản của bạn' :
                'sign in to your account',
    or: language === 'zh' ? '或者' :
        language === 'ja' ? 'または' :
        language === 'ar' ? 'أو' :
        language === 'es' ? 'O' :
        language === 'fr' ? 'Ou' :
        language === 'de' ? 'Oder' :
        language === 'ko' ? '또는' :
        language === 'ru' ? 'Или' :
        language === 'pt' ? 'Ou' :
        language === 'hi' ? 'या' :
        language === 'th' ? 'หรือ' :
        language === 'vi' ? 'Hoặc' :
        'Or',
    emailPlaceholder: language === 'zh' ? '电子邮件地址' :
                       language === 'ja' ? 'メールアドレス' :
                       language === 'ar' ? 'عنوان البريد الإلكتروني' :
                       language === 'es' ? 'Correo electrónico' :
                       language === 'fr' ? 'Adresse e-mail' :
                       language === 'de' ? 'E-Mail-Adresse' :
                       language === 'ko' ? '이메일 주소' :
                       language === 'ru' ? 'Адрес электронной почты' :
                       language === 'pt' ? 'Endereço de e-mail' :
                       language === 'hi' ? 'ईमेल पता' :
                       language === 'th' ? 'ที่อยู่อีเมล' :
                       language === 'vi' ? 'Địa chỉ email' :
                       'Email address',
    usernamePlaceholder: language === 'zh' ? '用户名' :
                          language === 'ja' ? 'ユーザー名' :
                          language === 'ar' ? 'اسم المستخدم' :
                          language === 'es' ? 'Nombre de usuario' :
                          language === 'fr' ? "Nom d'utilisateur" :
                          language === 'de' ? 'Benutzername' :
                          language === 'ko' ? '사용자 이름' :
                          language === 'ru' ? 'Имя пользователя' :
                          language === 'pt' ? 'Nome de usuário' :
                          language === 'hi' ? 'उपयोगकर्ता नाम' :
                          language === 'th' ? 'ชื่อผู้ใช้' :
                          language === 'vi' ? 'Tên đăng nhập' :
                          'Username',
    passwordPlaceholder: language === 'zh' ? '密码' :
                          language === 'ja' ? 'パスワード' :
                          language === 'ar' ? 'كلمة المرور' :
                          language === 'es' ? 'Contraseña' :
                          language === 'fr' ? 'Mot de passe' :
                          language === 'de' ? 'Passwort' :
                          language === 'ko' ? '비밀번호' :
                          language === 'ru' ? 'Пароль' :
                          language === 'pt' ? 'Senha' :
                          language === 'hi' ? 'पासवर्ड' :
                          language === 'th' ? 'รหัสผ่าน' :
                          language === 'vi' ? 'Mật khẩu' :
                          'Password',
    accountType: language === 'zh' ? '账户类型' :
                 language === 'ja' ? 'アカウントタイプ' :
                 language === 'ar' ? 'نوع الحساب' :
                 language === 'es' ? 'Tipo de cuenta' :
                 language === 'fr' ? 'Type de compte' :
                 language === 'de' ? 'Kontotyp' :
                 language === 'ko' ? '계정 유형' :
                 language === 'ru' ? 'Тип аккаунта' :
                 language === 'pt' ? 'Tipo de conta' :
                 language === 'hi' ? 'खाते का प्रकार' :
                 language === 'th' ? 'ประเภทบัญชี' :
                 language === 'vi' ? 'Loại tài khoản' :
                 'Account Type',
    buyerOption: language === 'zh' ? '买家（浏览产品）' :
                 language === 'ja' ? '买家（製品を閲覧）' :
                 language === 'ar' ? '买家（تصفح المنتجات）' :
                 language === 'es' ? 'Comprador (Explorar productos)' :
                 language === 'fr' ? 'Acheteur (Parcourir les produits)' :
                 language === 'de' ? 'Käufer (Produkte durchsuchen)' :
                 language === 'ko' ? '구매자（제품 검색）' :
                 language === 'ru' ? 'Покупатель (Просмотр товаров)' :
                 language === 'pt' ? 'Comprador (Navegar produtos)' :
                 language === 'hi' ? 'खरीदार（उत्पाद देखें）' :
                 language === 'th' ? 'ผู้ซื้อ（เรียกดูสินค้า）' :
                 language === 'vi' ? 'Người mua（Xem sản phẩm）' :
                 'Buyer (Browse Products)',
    sellerOption: language === 'zh' ? '卖家（开设店铺 - $10/月）' :
                  language === 'ja' ? '卖家（ストアを開く - $10/月）' :
                  language === 'ar' ? '卖家（فتح متجر - 10 دولار/شهر）' :
                  language === 'es' ? 'Vendedor (Abrir tienda - $10/mes)' :
                  language === 'fr' ? 'Vendeur (Ouvrir une boutique - 10$/mois)' :
                  language === 'de' ? 'Verkäufer (Shop eröffnen - 10$/Monat)' :
                  language === 'ko' ? '판매자（스토어 개설 - $10/월）' :
                  language === 'ru' ? 'Продавец (Открыть магазин - 10$/мес)' :
                  language === 'pt' ? 'Vendedor (Abrir loja - $10/mês)' :
                  language === 'hi' ? 'विक्रेता（दुकान खोलें - $10/महीना）' :
                  language === 'th' ? 'ผู้ขาย（เปิดร้านค้า - $10/เดือน）' :
                  language === 'vi' ? 'Người bán（Mở cửa hàng - $10/tháng）' :
                  'Seller (Open Store - $10/month)',
    buyerAndSellerOption: language === 'zh' ? '买家 & 卖家（双重身份 - $10/月）' :
                          language === 'ja' ? 'バイヤー & セラー（二重の役割 - $10/月）' :
                          language === 'ar' ? '买家 & 卖家（دور مزدوج - $10/月）' :
                          language === 'es' ? 'Comprador & Vendedor (Rol dual - $10/mes)' :
                          language === 'fr' ? 'Acheteur & Vendeur (Double rôle - 10$/mois)' :
                          language === 'de' ? 'Käufer & Verkäufer (Doppelte Rolle - 10$/Monat)' :
                          language === 'ko' ? '구매자 & 판매자（이중 역할 - $10/월）' :
                          language === 'ru' ? 'Покупатель & Продавец (Двойная роль - 10$/мес)' :
                          language === 'pt' ? 'Comprador & Vendedor (Função dupla - $10/mês)' :
                          language === 'hi' ? 'खरीदार & विक्रेता（दोहरी भूमिका - $10/महीना）' :
                          language === 'th' ? 'ผู้ซื้อ & ผู้ขาย（บทบาทคู่ - $10/เดือน）' :
                          language === 'vi' ? 'Người mua & Người bán（Vai trò kép - $10/tháng）' :
                          'Buyer & Seller (Dual Role - $10/month)',
    policyWarning: language === 'zh' ? '⚠️ 账户活动政策：365天未活跃的账户将被停用。请定期登录以保持账户活跃。' :
                   language === 'ja' ? '⚠️ アカウントアクティビティポリシー：365日間非アクティブなアカウントは停止されます。アカウントを有効に保つために定期的にログインしてください。' :
                   language === 'ar' ? '⚠️ سياسة نشاط الحساب: سيتم إيقاف الحسابات غير النشطة لمدة 365 يومًا. يرجى تسجيل الدخول بانتظام لإبقاء حسابك نشطًا.' :
                   language === 'es' ? '⚠️ Política de actividad de la cuenta: Las cuentas inactivas durante 365 días serán desactivadas. Inicie sesión regularmente para mantener su cuenta activa.' :
                   language === 'fr' ? '⚠️ Politique d\'activité du compte: Les comptes inactifs pendant 365 jours seront désactivés. Veuillez vous connecter régulièrement pour garder votre compte actif.' :
                   language === 'de' ? '⚠️ Kontoaktivitätsrichtlinie: Konten, die 365 Tage inaktiv sind, werden deaktiviert. Bitte melden Sie sich regelmäßig an, um Ihr Konto aktiv zu halten.' :
                   language === 'ko' ? '⚠️ 계정 활동 정책: 365일 동안 비활성화된 계정은 비활성화됩니다. 계정을 활성화 상태로 유지하려면 정기적으로 로그인하세요.' :
                   language === 'ru' ? '⚠️ Политика активности аккаунта: Аккаунты, неактивные в течение 365 дней, будут деактивированы. Пожалуйста, входите в систему регулярно, чтобы ваш аккаунт оставался активным.' :
                   language === 'pt' ? '⚠️ Política de atividade da conta: Contas inativas por 365 dias serão desativadas. Faça login regularmente para manter sua conta ativa.' :
                   language === 'hi' ? '⚠️ खाता गतिविधि नीति: 365 दिनों तक निष्क्रिय खातों को निष्क्रिय कर दिया जाएगा। कृपया अपना खाता सक्रिय रखने के लिए नियमित रूप से लॉग इन करें।' :
                   language === 'th' ? '⚠️ นโยบายกิจกรรมบัญชี: บัญชีที่ไม่ใช้งาน 365 วันจะถูกปิดใช้งาน กรุณาล็อกอินเป็นประจำเพื่อให้บัญชีของคุณทำงานอยู่' :
                   language === 'vi' ? '⚠️ Chính sách hoạt động tài khoản: Tài khoản không hoạt động trong 365 ngày sẽ bị vô hiệu hóa. Vui lòng đăng nhập thường xuyên để giữ tài khoản của bạn hoạt động.' :
                   '⚠️ Account Activity Policy: Accounts inactive for 365 days will be deactivated. Please log in regularly to keep your account active.',
    loginTip: language === 'zh' ? '💡 温馨提示：本平台支持用户名和邮箱登录，两者至少填写一项（建议都填写）。填写真实邮箱可接收平台公告及找回密码（忘记密码时可通过邮箱找回）。' :
              language === 'ja' ? '💡 注意：当社プラットフォームはユーザー名とメールアドレスでのログインをサポートしています。少なくともいずれか一方を入力してください（両方入力することをお勧めします）。実際のメールアドレスを入力すると、プラットフォームからのお知らせを受け取ったり、パスワードをリセットしたりできます（パスワードを忘れた場合、メールアドレスからリセットできます）。' :
              language === 'ar' ? '💡 ملاحظة: منصةنا تدعم تسجيل الدخول باستخدام اسم المستخدم والعنوان البريدي. أملأ على الأقل أحدهما (يوصى بملء كليهما). يمكنك تلقي الإعلانات من المنصة واستعادة كلمة المرور (عند نسيان كلمة المرور يمكن استعادتها من خلال البريد الإلكتروني) عند ملء عنوان بريد إلكتروني حقيقي.' :
              language === 'es' ? '💡 Consejo: Nuestra plataforma admite inicio de sesión con nombre de usuario y correo electrónico. Rellene al menos uno de ellos (se recomienda rellenar ambos). Al introducir un correo electrónico real, podrá recibir anuncios de la plataforma y recuperar la contraseña (si olvida la contraseña, podrá recuperarla a través del correo electrónico).' :
              language === 'fr' ? '💡 Conseil: Notre plateforme prend en charge la connexion avec nom d\'utilisateur et adresse e-mail. Veuillez remplir au moins l\'un d\'eux (il est recommandé de remplir les deux). En renseignant une adresse e-mail réelle, vous pouvez recevoir les annonces de la plateforme et récupérer votre mot de passe (si vous oubliez votre mot de passe, vous pouvez le récupérer par e-mail).' :
              language === 'de' ? '💡 Tipp: Unsere Plattform unterstützt die Anmeldung mit Benutzername und E-Mail. Bitte füllen Sie mindestens eines davon aus (es wird empfohlen, beide auszufüllen). Durch Eingabe einer echten E-Mail-Adresse können Sie Plattformankündigungen erhalten und Ihr Passwort zurücksetzen (wenn Sie Ihr Passwort vergessen haben, können Sie es über E-Mail zurücksetzen).' :
              language === 'ko' ? '💡 안내: 본 플랫폼은 사용자 이름과 이메일로 로그인을 지원합니다. 둘 중 하나 이상을 입력하세요 (둘 다 입력하는 것이 좋습니다). 실제 이메일을 입력하면 플랫폼 공지사항을 받을 수 있고 비밀번호를 찾을 수 있습니다 (비밀번호를 잊은 경우 이메일을 통해 찾을 수 있습니다).' :
              language === 'ru' ? '💡 Советы: Наша платформа поддерживает вход по имени пользователя и электронной почте. Пожалуйста, заполните хотя бы одно из полей (рекомендуется заполнить оба). При указании реальной электронной почты вы можете получать уведомления платформы и восстанавливать пароль (если вы забудете пароль, вы можете восстановить его по электронной почте).' :
              language === 'pt' ? '💡 Dica: Nossa plataforma suporta login com nome de usuário e e-mail. Preencha pelo menos um deles (recomenda-se preencher ambos). Ao inserir um e-mail real, você poderá receber anúncios da plataforma e recuperar sua senha (se você esquecer sua senha, poderá recuperá-la por e-mail).' :
              language === 'hi' ? '💡 टिप्पणी: हमारा प्लेटफॉर्म उपयोगकर्ता नाम और ईमेल के साथ लॉगिन का समर्थन करता है। कम से कम एक को भरें (दोनों को भरने की सिफारिश की जाती है)। वास्तविक ईमेल डालकर आप प्लेटफॉर्म की घोषणाएं प्राप्त कर सकते हैं और पासवर्ड पुनर्प्राप्त कर सकते हैं (यदि आप पासवर्ड भूल जाते हैं, तो आप ईमेल के माध्यम से इसे पुनर्प्राप्त कर सकते हैं)।' :
              language === 'th' ? '💡 คำแนะนำ: แพลตฟอร์มของเรารองรับการเข้าสู่ระบบด้วยชื่อผู้ใช้และอีเมล กรุณากรอกอย่างน้อยหนึ่งรายการ (ขอแนะนำให้กรอกทั้งสองรายการ) เมื่อป้อนอีเมลจริง คุณสามารถรับข่าวประชาสัมพันธ์จากแพลตฟอร์มและเรียกคืนรหัสผ่าน (หากคุณลืมรหัสผ่าน คุณสามารถเรียกคืนได้ผ่านอีเมล)' :
              language === 'vi' ? '💡 Lưu ý: Nền tảng của chúng tôi hỗ trợ đăng nhập bằng tên người dùng và email. Vui lòng điền ít nhất một trong hai (khuyến nghị điền cả hai). Khi điền email thực tế, bạn có thể nhận thông báo từ nền tảng và lấy lại mật khẩu (nếu bạn quên mật khẩu, bạn có thể lấy lại qua email).' :
              '💡 Tip: Our platform supports login with username and email. Please fill in at least one of them (recommended to fill both). By entering a real email, you can receive platform announcements and retrieve your password (if you forget your password, you can retrieve it via email).',
    creatingAccount: language === 'zh' ? '正在创建账户...' :
                     language === 'ja' ? 'アカウント作成中...' :
                     language === 'ar' ? 'جارٍ إنشاء الحساب...' :
                     language === 'es' ? 'Creando cuenta...' :
                     language === 'fr' ? 'Création du compte...' :
                     language === 'de' ? 'Konto wird erstellt...' :
                     language === 'ko' ? '계정 생성 중...' :
                     language === 'ru' ? 'Создание аккаунта...' :
                     language === 'pt' ? 'Criando conta...' :
                     language === 'hi' ? 'खाता बनाया जा रहा है...' :
                     language === 'th' ? 'กำลังสร้างบัญชี...' :
                     language === 'vi' ? 'Đang tạo tài khoản...' :
                     'Creating account...',
    createAccount: language === 'zh' ? '创建账户' :
                   language === 'ja' ? 'アカウント作成' :
                   language === 'ar' ? 'إنشاء حساب' :
                   language === 'es' ? 'Crear cuenta' :
                   language === 'fr' ? 'Créer un compte' :
                   language === 'de' ? 'Konto erstellen' :
                   language === 'ko' ? '계정 만들기' :
                   language === 'ru' ? 'Создать аккаунт' :
                   language === 'pt' ? 'Criar conta' :
                   language === 'hi' ? 'खाता बनाएं' :
                   language === 'th' ? 'สร้างบัญชี' :
                   language === 'vi' ? 'Tạo tài khoản' :
                   'Create account',
    nextAuthError: language === 'zh' ? 'NextAuth 未正确配置。请联系管理员。' :
                   language === 'ja' ? 'NextAuthが正しく設定されていません。管理者に連絡してください。' :
                   language === 'ar' ? 'لم يتم تكوين NextAuth بشكل صحيح. يرجى الاتصال بالمسؤول.' :
                   language === 'es' ? 'NextAuth no está configurado correctamente. Por favor contacte al administrador.' :
                   language === 'fr' ? 'NextAuth n\'est pas configuré correctement. Veuillez contacter l\'administrateur.' :
                   language === 'de' ? 'NextAuth ist nicht korrekt konfiguriert. Bitte kontaktieren Sie den Administrator.' :
                   language === 'ko' ? 'NextAuth가 올바르게 구성되지 않았습니다. 관리자에게 문의하세요.' :
                   language === 'ru' ? 'NextAuth настроен неправильно. Пожалуйста, свяжитесь с администратором.' :
                   language === 'pt' ? 'NextAuth não está configurado corretamente. Por favor, entre em contato com o administrador.' :
                   language === 'hi' ? 'NextAuth सही से कॉन्फ़िगर नहीं है। कृपया व्यवस्थापक से संपर्क करें।' :
                   language === 'th' ? 'NextAuth ไม่ได้กำหนดค่าอย่างถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' :
                   language === 'vi' ? 'NextAuth chưa được định cấu hình đúng. Vui lòng liên hệ với quản trị viên.' :
                   'NextAuth is not properly configured. Please contact the administrator.',
    linkChatSystem: language === 'zh' ? '同时授权 Chat System 账号（可使用同一套账号登录聊天系统）' :
                    language === 'ja' ? 'Chat Systemアカウントも同時にリンク（同じアカウントでチャットシステムにログイン可能）' :
                    language === 'ar' ? 'قم بالترخيص لـ Chat System في نفس الوقت (يمكن تسجيل الدخول إلى نظام الدردشة باستخدام نفس الحساب)' :
                    language === 'es' ? 'También vincular cuenta de Chat System (puede iniciar sesión en el sistema de chat con la misma cuenta)' :
                    language === 'fr' ? 'Vinculer également le compte Chat System (vous pouvez vous connecter au système de chat avec le même compte)' :
                    language === 'de' ? 'Chat System-Konto auch verbinden (Sie können sich mit demselben Konto im Chatsystem anmelden)' :
                    language === 'ko' ? 'Chat System 계정도 함께 연결 (동일한 계정으로 채팅 시스템에 로그인 가능)' :
                    language === 'ru' ? 'Также привязать аккаунт Chat System (можно входить в чат-систему с одним и тем же аккаунтом)' :
                    language === 'pt' ? 'Vincular também a conta do Chat System (pode fazer login no sistema de chat com a mesma conta)' :
                    language === 'hi' ? 'चैट सिस्टम खाते को भी एक साथ लिंक करें (एक ही खाते से चैट सिस्टम में लॉगिन कर सकते हैं)' :
                    language === 'th' ? 'เชื่อมต่อ Chat System Account ด้วย (สามารถเข้าสู่ระบบแชทด้วยบัญชีเดียวกัน)' :
                    language === 'vi' ? 'Cũng liên kết tài khoản Chat System (có thể đăng nhập hệ thống chat với cùng một tài khoản)' :
                    'Also link Chat System account (can log in to chat system with the same account)',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((d: any) => d.message).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.error || 'Registration failed')
      }

      if (linkChatSystem) {
        try {
          const signInRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            })
          })
          if (signInRes.ok) {
            await fetch('/api/auth/chat-link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: formData.role })
            })
          }
        } catch (linkError) {
          console.warn('Failed to link chat system:', linkError)
        }
      }

      const redirectLang = language || 'en'
      router.push(`/${redirectLang}/auth/login?registered=true`)
    } catch (err) {
      setError((err as Error).message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.or}{' '}
            <Link href={`/${language}/auth/login`} className="font-medium text-blue-600 hover:text-blue-500">
              {t.signInLink}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">{t.emailPlaceholder}</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">{t.usernamePlaceholder}</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.usernamePlaceholder}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t.passwordPlaceholder}</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="role" className="sr-only">{t.accountType}</label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="BUYER">{t.buyerOption}</option>
                <option value="SELLER">{t.sellerOption}</option>
                <option value="BOTH">{t.buyerAndSellerOption || '买家 & 卖家'}</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
            {t.loginTip}
          </div>

          <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded">
            {t.policyWarning}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="linkChatSystem"
                name="linkChatSystem"
                type="checkbox"
                checked={linkChatSystem}
                onChange={(e) => setLinkChatSystem(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="linkChatSystem" className="text-gray-600">
                {t.linkChatSystem}
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t.creatingAccount : t.createAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}