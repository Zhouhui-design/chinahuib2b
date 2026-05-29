'use client'

import { useState, useEffect, useCallback } from 'react'
import { VERSION_CONFIG, VersionInfo, compareVersions, getUpdateType, UpdateType } from '@/lib/version'

interface UpdateStatus {
  hasUpdate: boolean
  version: string
  type: UpdateType
  forceUpdate: boolean
  changelog: VersionInfo['changelog']
  autoRefreshAt?: string | undefined
}

export function useVersionCheck(language: string = 'en') {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // 翻译文本
  const t = {
    newVersionAvailable: {
      zh: '🎉 发现新版本',
      en: '🎉 New Version Available',
      ja: '🎉 新しいバージョンが利用可能',
      es: '🎉 Nueva versión disponible',
      fr: '🎉 Nouvelle version disponible',
      de: '🎉 Neue Version verfügbar',
      ko: '🎉 새 버전 사용 가능',
      ru: '🎉 Доступна новая версия',
      pt: '🎉 Nova versão disponível',
      ar: '🎉 نسخة جديدة متاحة'
    },
    updateNow: {
      zh: '立即更新',
      en: 'Update Now',
      ja: '今すぐ更新',
      es: 'Actualizar ahora',
      fr: 'Mettre à jour maintenant',
      de: 'Jetzt aktualisieren',
      ko: '지금 업데이트',
      ru: 'Обновить сейчас',
      pt: 'Atualizar agora',
      ar: 'تحديث الآن'
    },
    later: {
      zh: '稍后提醒',
      en: 'Remind Me Later',
      ja: '後で通知',
      es: 'Recordarme más tarde',
      fr: 'Me le rappeler plus tard',
      de: 'Später erinnern',
      ko: '나중에 알림',
      ru: 'Напомнить позже',
      pt: 'Lembrar mais tarde',
      ar: 'ذكرني لاحقاً'
    },
    autoRefreshIn: {
      zh: (min: number) => `${min}分钟后自动刷新`,
      en: (min: number) => `Auto-refresh in ${min} minutes`,
      ja: (min: number) => `${min}分後に自動更新`,
      es: (min: number) => `Actualización automática en ${min} minutos`,
      fr: (min: number) => `Actualisation automatique dans ${min} minutes`,
      de: (min: number) => `Automatische Aktualisierung in ${min} Minuten`,
      ko: (min: number) => `${min}분 후 자동 새로고침`,
      ru: (min: number) => `Автообновление через ${min} минут`,
      pt: (min: number) => `Atualização automática em ${min} minutos`,
      ar: (min: number) => `التحديث التلقائي بعد ${min} دقيقة`
    },
    whatsNew: {
      zh: '更新内容：',
      en: "What's New:",
      ja: '更新内容：',
      es: 'Novedades:',
      fr: 'Nouveautés :',
      de: 'Neuigkeiten:',
      ko: '새로운 기능:',
      ru: 'Что нового:',
      pt: 'Novidades:',
      ar: 'ما الجديد:'
    },
    fixed: {
      zh: '修复',
      en: 'Fixed',
      ja: '修正',
      es: 'Corregido',
      fr: 'Corrigé',
      de: 'Behoben',
      ko: '수정',
      ru: 'Исправлено',
      pt: 'Corrigido',
      ar: 'تم إصلاحه'
    },
    added: {
      zh: '新增',
      en: 'Added',
      ja: '追加',
      es: 'Añadido',
      fr: 'Ajouté',
      de: 'Hinzugefügt',
      ko: '추가',
      ru: 'Добавлено',
      pt: 'Adicionado',
      ar: 'تمت إضافته'
    },
    improved: {
      zh: '优化',
      en: 'Improved',
      ja: '改善',
      es: 'Mejorado',
      fr: 'Amélioré',
      de: 'Verbessert',
      ko: '개선',
      ru: 'Улучшено',
      pt: 'Melhorado',
      ar: 'تم تحسينه'
    },
    security: {
      zh: '安全',
      en: 'Security',
      ja: 'セキュリティ',
      es: 'Seguridad',
      fr: 'Sécurité',
      de: 'Sicherheit',
      ko: '보안',
      ru: 'Безопасность',
      pt: 'Segurança',
      ar: 'الأمان'
    },
    forceUpdateMessage: {
      zh: '重要更新：请立即刷新页面以获取最新功能和安全修复。',
      en: 'Important Update: Please refresh the page now to get the latest features and security fixes.',
      ja: '重要な更新：最新の機能とセキュリティ修正を取得するには、今すぐページを更新してください。',
      es: 'Actualización importante: Actualice la página ahora para obtener las últimas funciones y correcciones de seguridad.',
      fr: 'Mise à jour importante : Veuillez actualiser la page maintenant pour obtenir les dernières fonctionnalités et corrections de sécurité.',
      de: 'Wichtiges Update: Bitte aktualisieren Sie die Seite jetzt, um die neuesten Funktionen und Sicherheitskorrekturen zu erhalten.',
      ko: '중요 업데이트: 최신 기능과 보안 수정 사항을 받으려면 지금 페이지를 새로고침하세요.',
      ru: 'Важное обновление: Обновите страницу сейчас, чтобы получить последние функции и исправления безопасности.',
      pt: 'Atualização importante: Atualize a página agora para obter os recursos mais recentes e correções de segurança.',
      ar: 'تحديث مهم: يرجى تحديث الصفحة الآن للحصول على أحدث الميزات وإصلاحات الأمان.'
    }
  }

  const getTranslation = (obj: Record<string, string>) => {
    return obj[language] || obj['en'] || Object.values(obj)[0]
  }

  const getTranslationWithParam = (fn: Record<string, (param: number) => string>, param: number) => {
    const translated = fn[language] || fn['en']
    return translated ? translated(param) : ''
  }

  // 检查版本更新
  const checkVersion = useCallback(async () => {
    try {
      setIsChecking(true)
      
      // 获取本地存储的版本
      const lastVersion = localStorage.getItem(VERSION_CONFIG.STORAGE_KEYS.LAST_VERSION)
      
      // 检查是否需要跳过（用户已选择稍后提醒）
      const dismissed = localStorage.getItem(VERSION_CONFIG.STORAGE_KEYS.USER_DISMISSED)
      if (dismissed) {
        const dismissedTime = parseInt(dismissed)
        // 2小时内不再提醒
        if (Date.now() - dismissedTime < 2 * 60 * 60 * 1000) {
          setIsChecking(false)
          return
        }
      }
      
      // 从服务器获取最新版本
      const response = await fetch(`/api/version?currentVersion=${lastVersion || '0.0.0'}`)
      if (!response.ok) throw new Error('Failed to check version')
      
      const versionInfo: VersionInfo = await response.json()
      
      // 比较版本
      const currentVersion = lastVersion || VERSION_CONFIG.APP_VERSION
      const hasUpdate = compareVersions(versionInfo.version, currentVersion) > 0
      
      if (hasUpdate) {
        const updateType = getUpdateType(currentVersion, versionInfo.version)
        
        const newStatus: UpdateStatus = {
          hasUpdate: true,
          version: versionInfo.version,
          type: updateType,
          forceUpdate: versionInfo.forceUpdate,
          changelog: versionInfo.changelog,
          autoRefreshAt: versionInfo.autoRefreshAt
        }
        
        setUpdateStatus(newStatus)
        
        // 显示通知
        const updateShown = localStorage.getItem(VERSION_CONFIG.STORAGE_KEYS.UPDATE_SHOWN)
        if (updateShown !== versionInfo.version) {
          setShowNotification(true)
          localStorage.setItem(VERSION_CONFIG.STORAGE_KEYS.UPDATE_SHOWN, versionInfo.version)
        }
        
        // 如果是强制更新，启动倒计时
        if (versionInfo.forceUpdate && versionInfo.autoRefreshAt) {
          const autoRefreshTime = new Date(versionInfo.autoRefreshAt).getTime()
          const remaining = Math.ceil((autoRefreshTime - Date.now()) / 60000)
          setCountdown(Math.max(0, remaining))
        }
        
        // 更新本地存储的版本
        localStorage.setItem(VERSION_CONFIG.STORAGE_KEYS.LAST_VERSION, versionInfo.version)
      }
      
      localStorage.setItem(VERSION_CONFIG.STORAGE_KEYS.LAST_CHECK, Date.now().toString())
      
    } catch (error) {
      console.error('Version check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }, [language])

  // 立即刷新页面
  const refreshNow = useCallback(() => {
    window.location.reload()
  }, [])

  // 稍后提醒
  const remindLater = useCallback(() => {
    setShowNotification(false)
    localStorage.setItem(VERSION_CONFIG.STORAGE_KEYS.USER_DISMISSED, Date.now().toString())
  }, [])

  // 关闭通知
  const dismissUpdate = useCallback(() => {
    setShowNotification(false)
  }, [])

  // 定期检查和倒计时
  useEffect(() => {
    // 初始检查
    checkVersion()
    
    // 定期检查
    const checkInterval = setInterval(checkVersion, VERSION_CONFIG.CHECK_INTERVAL)
    
    return () => {
      clearInterval(checkInterval)
    }
  }, [checkVersion])

  // 倒计时更新
  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          // 倒计时结束，自动刷新
          window.location.reload()
          return 0
        }
        return prev - 1
      })
    }, 60000) // 每分钟更新一次
    
    return () => clearInterval(countdownInterval)
  }, [countdown])

  return {
    updateStatus,
    isChecking,
    showNotification,
    countdown,
    refreshNow,
    remindLater,
    dismissUpdate,
    checkVersion,
    translations: {
      newVersionAvailable: getTranslation(t.newVersionAvailable),
      updateNow: getTranslation(t.updateNow),
      later: getTranslation(t.later),
      autoRefreshIn: (min: number) => getTranslationWithParam(t.autoRefreshIn, min),
      whatsNew: getTranslation(t.whatsNew),
      fixed: getTranslation(t.fixed),
      added: getTranslation(t.added),
      improved: getTranslation(t.improved),
      security: getTranslation(t.security),
      forceUpdateMessage: getTranslation(t.forceUpdateMessage)
    }
  }
}
