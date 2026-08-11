'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { LanguageCode } from '@/lib/languages'
import { Download, Smartphone, Monitor, Apple, SmartphoneIcon, AppWindow, Terminal, Globe, ExternalLink, CheckCircle, Package } from 'lucide-react'

const platforms = [
  {
    id: 'ios',
    name: 'iOS',
    icon: Apple,
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'bg-gray-500',
    description: 'iPhone, iPad, iPod Touch',
    downloads: ['App Store'],
    comingSoon: false,
  },
  {
    id: 'android',
    name: 'Android',
    icon: SmartphoneIcon,
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500',
    description: '手机, 平板, 电视',
    downloads: ['Google Play', 'APK安装包'],
    comingSoon: false,
  },
  {
    id: 'harmonyos',
    name: 'HarmonyOS',
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500',
    description: '华为手机, 平板, 手表',
    downloads: ['AppGallery', 'PWA安装'],
    comingSoon: false,
  },
  {
    id: 'windows',
    name: 'Windows',
    icon: AppWindow,
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-600',
    description: 'Windows 10/11',
    downloads: ['EXE安装包', 'MSI安装包'],
    comingSoon: true,
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: Apple,
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'bg-gray-500',
    description: 'MacBook, iMac, Mac Mini',
    downloads: ['DMG安装包'],
    comingSoon: true,
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Terminal,
    color: 'bg-orange-100 text-orange-800',
    badgeColor: 'bg-orange-500',
    description: 'Ubuntu, Debian, Fedora, Arch',
    downloads: ['DEB包', 'RPM包', 'AppImage'],
    comingSoon: true,
  },
]

const features = [
  {
    title: '全平台同步',
    description: '在手机、平板、电脑上无缝切换，数据实时同步',
    icon: Globe,
  },
  {
    title: '离线访问',
    description: '支持离线浏览商品信息，随时随地查看',
    icon: Package,
  },
  {
    title: '推送通知',
    description: '即时接收订单提醒、消息通知和系统公告',
    icon: Smartphone,
  },
  {
    title: '安全加密',
    description: '端到端加密，保护您的商业数据安全',
    icon: Monitor,
  },
]

export default function DownloadPage() {
  const params = useParams()
  const language = (params.locale as LanguageCode) || 'zh'
  const [pwaInstallable, setPwaInstallable] = useState(false)
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const t = {
    title: language === 'zh' ? '下载 心海环球 客户端' :
           language === 'ja' ? '心海グローバル クライアントをダウンロード' :
           language === 'ar' ? 'تنزيل عميل القلب البحري العالمي' :
           language === 'es' ? 'Descargar cliente CorazónMar Global' :
           language === 'fr' ? 'Télécharger le client CœurMer Mondial' :
           language === 'de' ? 'Meerherz Global-Client herunterladen' :
           language === 'ko' ? '심해글로벌 클라이언트 다운로드' :
           language === 'ru' ? 'Скачать клиент МорскоеСердце Глобал' :
           language === 'pt' ? 'Baixar cliente CoraçãoMar Global' :
           language === 'hi' ? 'समुद्र-हृदय ग्लोबल क्लाइंट डाउनलोड करें' :
           language === 'th' ? 'ดาวน์โหลดไคลเอนต์ หัวใจทะเลโลก' :
           language === 'vi' ? 'Tải xuống ứng dụng TráiTimBiển ToànCầu' :
           'Download SeaHeart Global Client',
    subtitle: language === 'zh' ? '选择您的设备平台下载客户端' :
              language === 'ja' ? 'お使いのデバイスプラットフォームを選択してクライアントをダウンロード' :
              language === 'ar' ? 'اختر منصة جهازك لتنزيل العميل' :
              language === 'es' ? 'Seleccione su plataforma de dispositivo para descargar el cliente' :
              language === 'fr' ? 'Sélectionnez votre plateforme de dispositif pour télécharger le client' :
              language === 'de' ? 'Wählen Sie Ihre Geräteplattform zum Herunterladen des Clients' :
              language === 'ko' ? '디바이스 플랫폼을 선택하여 클라이언트를 다운로드하세요' :
              language === 'ru' ? 'Выберите платформу вашего устройства для загрузки клиента' :
              language === 'pt' ? 'Selecione sua plataforma de dispositivo para baixar o cliente' :
              language === 'hi' ? 'क्लाइंट डाउनलोड करने के लिए अपना डिवाइस प्लेटफॉर्म चुनें' :
              language === 'th' ? 'เลือกแพลตฟอร์มอุปกรณ์ของคุณเพื่อดาวน์โหลดไคลเอนต์' :
              language === 'vi' ? 'Chọn nền tảng thiết bị của bạn để tải xuống ứng dụng' :
              'Choose your device platform to download the client',
    mobile: language === 'zh' ? '移动端' :
            language === 'ja' ? 'モバイル' :
            language === 'ar' ? 'موبايل' :
            language === 'es' ? 'Móvil' :
            language === 'fr' ? 'Mobile' :
            language === 'de' ? 'Mobil' :
            language === 'ko' ? '모바일' :
            language === 'ru' ? 'Мобильный' :
            language === 'pt' ? 'Móvel' :
            language === 'hi' ? 'मोबाइल' :
            language === 'th' ? 'มือถือ' :
            language === 'vi' ? 'Di động' :
            'Mobile',
    desktop: language === 'zh' ? '桌面端' :
             language === 'ja' ? 'デスクトップ' :
             language === 'ar' ? 'مكتب' :
             language === 'es' ? 'Escritorio' :
             language === 'fr' ? 'Bureau' :
             language === 'de' ? 'Desktop' :
             language === 'ko' ? '데스크톱' :
             language === 'ru' ? 'Десктоп' :
             language === 'pt' ? 'Desktop' :
             language === 'hi' ? 'डेस्कटॉप' :
             language === 'th' ? 'เดสก์ท็อป' :
             language === 'vi' ? 'Máy tính để bàn' :
             'Desktop',
    comingSoon: language === 'zh' ? '即将推出' :
                language === 'ja' ? '近日公開' :
                language === 'ar' ? 'قريباً' :
                language === 'es' ? 'Próximamente' :
                language === 'fr' ? 'Bientôt disponible' :
                language === 'de' ? 'Demnächst verfügbar' :
                language === 'ko' ? '곧 출시' :
                language === 'ru' ? 'Скоро' :
                language === 'pt' ? 'Em breve' :
                language === 'hi' ? 'जल्द ही आ रहा है' :
                language === 'th' ? 'เร็วๆ นี้' :
                language === 'vi' ? 'Sắp ra mắt' :
                'Coming Soon',
    download: language === 'zh' ? '下载' :
              language === 'ja' ? 'ダウンロード' :
              language === 'ar' ? 'تنزيل' :
              language === 'es' ? 'Descargar' :
              language === 'fr' ? 'Télécharger' :
              language === 'de' ? 'Herunterladen' :
              language === 'ko' ? '다운로드' :
              language === 'ru' ? 'Скачать' :
              language === 'pt' ? 'Baixar' :
              language === 'hi' ? 'डाउनलोड करें' :
              language === 'th' ? 'ดาวน์โหลด' :
              language === 'vi' ? 'Tải xuống' :
              'Download',
    webVersion: language === 'zh' ? '网页版' :
                language === 'ja' ? 'ウェブバージョン' :
                language === 'ar' ? 'النسخة الويب' :
                language === 'es' ? 'Versión web' :
                language === 'fr' ? 'Version web' :
                language === 'de' ? 'Webversion' :
                language === 'ko' ? '웹 버전' :
                language === 'ru' ? 'Веб-версия' :
                language === 'pt' ? 'Versão web' :
                language === 'hi' ? 'वेब संस्करण' :
                language === 'th' ? 'เวอร์ชันเว็บ' :
                language === 'vi' ? 'Phiên bản web' :
                'Web Version',
    features: language === 'zh' ? '客户端特性' :
              language === 'ja' ? 'クライアント機能' :
              language === 'ar' ? 'ميزات العميل' :
              language === 'es' ? 'Características del cliente' :
              language === 'fr' ? 'Fonctionnalités du client' :
              language === 'de' ? 'Client-Funktionen' :
              language === 'ko' ? '클라이언트 기능' :
              language === 'ru' ? 'Функции клиента' :
              language === 'pt' ? 'Recursos do cliente' :
              language === 'hi' ? 'क्लाइंट विशेषताएं' :
              language === 'th' ? 'คุณสมบัติไคลเอนต์' :
              language === 'vi' ? 'Tính năng ứng dụng' :
              'Client Features',
    pwaInstall: language === 'zh' ? '安装 PWA 应用' :
                language === 'ja' ? 'PWAアプリをインストール' :
                language === 'ar' ? 'تثبيت تطبيق PWA' :
                language === 'es' ? 'Instalar aplicación PWA' :
                language === 'fr' ? 'Installer l\'application PWA' :
                language === 'de' ? 'PWA-App installieren' :
                language === 'ko' ? 'PWA 앱 설치' :
                language === 'ru' ? 'Установить PWA-приложение' :
                language === 'pt' ? 'Instalar aplicativo PWA' :
                language === 'hi' ? 'PWA ऐप इंस्टॉल करें' :
                language === 'th' ? 'ติดตั้งแอป PWA' :
                language === 'vi' ? 'Cài đặt ứng dụng PWA' :
                'Install PWA App',
    pwaAvailable: language === 'zh' ? '🎉 您可以将 心海环球 安装到您的设备上！' :
                  language === 'ja' ? '🎉 心海グローバルをお使いのデバイスにインストールできます！' :
                  language === 'ar' ? '🎉 يمكنك تثبيت القلب البحري العالمي على جهازك！' :
                  language === 'es' ? '🎉 ¡Puede instalar CorazónMar Global en su dispositivo!' :
                  language === 'fr' ? '🎉 Vous pouvez installer CœurMer Mondial sur votre dispositif !' :
                  language === 'de' ? '🎉 Sie können Meerherz Global auf Ihrem Gerät installieren!' :
                  language === 'ko' ? '🎉 심해글로벌를 디바이스에 설치할 수 있습니다!' :
                  language === 'ru' ? '🎉 Вы можете установить МорскоеСердце Глобал на свое устройство!' :
                  language === 'pt' ? '🎉 Você pode instalar o CoraçãoMar Global no seu dispositivo!' :
                  language === 'hi' ? '🎉 आप समुद्र-हृदय ग्लोबल को अपने डिवाइस पर इंस्टॉल कर सकते हैं!' :
                  language === 'th' ? '🎉 คุณสามารถติดตั้ง หัวใจทะเลโลก บนอุปกรณ์ของคุณได้!' :
                  language === 'vi' ? '🎉 Bạn có thể cài đặt TráiTimBiển ToànCầu trên thiết bị của bạn!' :
                  '🎉 You can install SeaHeart Global on your device!',
    allPlatforms: language === 'zh' ? '支持全球所有平台' :
                  language === 'ja' ? '世界中のすべてのプラットフォームをサポート' :
                  language === 'ar' ? 'دعم جميع المنصات العالمية' :
                  language === 'es' ? 'Compatible con todas las plataformas globales' :
                  language === 'fr' ? 'Prend en charge toutes les plateformes mondiales' :
                  language === 'de' ? 'Unterstützt alle globalen Plattformen' :
                  language === 'ko' ? '전 세계 모든 플랫폼 지원' :
                  language === 'ru' ? 'Поддержка всех глобальных платформ' :
                  language === 'pt' ? 'Suporta todas as plataformas globais' :
                  language === 'hi' ? 'वैश्विक सभी प्लेटफॉर्म का समर्थन' :
                  language === 'th' ? 'รองรับแพลตฟอร์มทั่วโลก' :
                  language === 'vi' ? 'Hỗ trợ tất cả nền tảng trên toàn cầu' :
                  'Supports all global platforms',
  }

  const mobilePlatforms = platforms.filter(p => ['ios', 'android', 'harmonyos'].includes(p.id))
  const desktopPlatforms = platforms.filter(p => ['windows', 'macos', 'linux'].includes(p.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {pwaInstallable && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">{t.pwaAvailable}</p>
                <p className="text-blue-100 text-sm">{t.pwaInstall}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPwaPrompt(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              {t.download}
            </button>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
          <p className="mt-4 text-blue-600 flex items-center justify-center gap-2">
            <Globe className="w-5 h-5" />
            {t.allPlatforms}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t.mobile}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mobilePlatforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <div
                    key={platform.id}
                    className={`${platform.color} rounded-xl p-6 transition-transform hover:scale-105 ${
                      platform.comingSoon ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white rounded-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      {platform.comingSoon && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {t.comingSoon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{platform.name}</h3>
                    <p className="text-sm opacity-70 mb-4">{platform.description}</p>
                    <div className="space-y-2">
                      {platform.downloads.map((download, index) => (
                        <button
                          key={index}
                          disabled={platform.comingSoon}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            platform.comingSoon
                              ? 'bg-white/50 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {download}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t.desktop}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {desktopPlatforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <div
                    key={platform.id}
                    className={`${platform.color} rounded-xl p-6 transition-transform hover:scale-105 ${
                      platform.comingSoon ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white rounded-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      {platform.comingSoon && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {t.comingSoon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{platform.name}</h3>
                    <p className="text-sm opacity-70 mb-4">{platform.description}</p>
                    <div className="space-y-2">
                      {platform.downloads.map((download, index) => (
                        <button
                          key={index}
                          disabled={platform.comingSoon}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            platform.comingSoon
                              ? 'bg-white/50 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {download}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">{t.features}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-sm">
            <span className="text-gray-600">{t.webVersion}</span>
            <a
              href="/"
              className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
            >
              {t.download}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}