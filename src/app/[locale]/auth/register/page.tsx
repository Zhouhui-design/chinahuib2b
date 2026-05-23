'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'BUYER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      setLanguage(langCookie.split('=')[1])
    }
  }, [])

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

      const redirectLang = language || 'en'
      router.push(`/${redirectLang}/auth/login?registered=true`)
    } catch (err: any) {
      setError(err.message)
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
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
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
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded">
            {t.policyWarning}
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