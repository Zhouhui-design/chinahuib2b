'use client'

import { useVersionCheck } from '@/hooks/useVersionCheck'
import { RefreshCw, X, Clock, Sparkles, Bug, Shield, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UpdateNotificationProps {
  language?: string
}

export default function UpdateNotification({ language = 'en' }: UpdateNotificationProps) {
  const {
    updateStatus,
    showNotification,
    countdown,
    refreshNow,
    remindLater,
    dismissUpdate,
    translations
  } = useVersionCheck(language)

  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (showNotification) {
      // 延迟显示动画
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [showNotification])

  if (!showNotification || !updateStatus) return null

  const getUpdateIcon = () => {
    switch (updateStatus.type) {
      case 'major':
        return <Sparkles className="w-6 h-6 text-purple-500" />
      case 'minor':
        return <Zap className="w-6 h-6 text-blue-500" />
      case 'patch':
        return <Bug className="w-6 h-6 text-green-500" />
      default:
        return <Shield className="w-6 h-6 text-red-500" />
    }
  }

  const getUpdateColor = () => {
    switch (updateStatus.type) {
      case 'major':
        return 'bg-purple-50 border-purple-200'
      case 'minor':
        return 'bg-blue-50 border-blue-200'
      case 'patch':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  const getUpdateBadgeColor = () => {
    switch (updateStatus.type) {
      case 'major':
        return 'bg-purple-100 text-purple-700'
      case 'minor':
        return 'bg-blue-100 text-blue-700'
      case 'patch':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-red-100 text-red-700'
    }
  }

  // 获取当前语言的更新日志
  const getChangelogForLanguage = (entry: typeof updateStatus.changelog[0]) => {
    const title = entry.title[language] || entry.title['en'] || Object.values(entry.title)[0] || ''
    
    const changes: { type: string; items: string[] }[] = []
    
    if (entry.changes.fixed?.[language]?.length) {
      changes.push({ type: translations.fixed, items: entry.changes.fixed[language] || [] })
    }
    if (entry.changes.added?.[language]?.length) {
      changes.push({ type: translations.added, items: entry.changes.added[language] || [] })
    }
    if (entry.changes.improved?.[language]?.length) {
      changes.push({ type: translations.improved, items: entry.changes.improved[language] || [] })
    }
    if (entry.changes.security?.[language]?.length) {
      changes.push({ type: translations.security, items: entry.changes.security[language] || [] })
    }
    
    return { title, changes }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`
          relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden
          transform transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        {/* 头部 */}
        <div className={`${getUpdateColor()} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getUpdateIcon()}
              <div>
                <h3 className="font-bold text-gray-900">
                  {translations.newVersionAvailable}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getUpdateBadgeColor()}`}>
                    v{updateStatus.version}
                  </span>
                  {updateStatus.forceUpdate && (
                    <span className="text-xs text-red-600 font-medium">
                      {translations.forceUpdateMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!updateStatus.forceUpdate && (
              <button
                onClick={dismissUpdate}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div className="bg-white px-6 py-4">
          {/* 倒计时提示 */}
          {countdown !== null && countdown > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-700">
                {translations.autoRefreshIn(countdown)}
              </span>
            </div>
          )}

          {/* 更新详情 */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Sparkles className="w-4 h-4" />
              {translations.whatsNew}
              <span className="text-gray-400">
                {showDetails ? '▼' : '▶'}
              </span>
            </button>

            {showDetails && (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {updateStatus.changelog.map((entry, index) => {
                  const { title, changes } = getChangelogForLanguage(entry)
                  if (changes.length === 0) return null

                  return (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{entry.date}</p>
                      <div className="space-y-2">
                        {changes.map((change, changeIndex) => (
                          <div key={changeIndex}>
                            <span className="text-xs font-medium text-gray-600">
                              {change.type}:
                            </span>
                            <ul className="mt-1 space-y-1">
                              {change.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-xs text-gray-500 pl-3">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={remindLater}
            disabled={updateStatus.forceUpdate}
            className={`
              text-sm font-medium transition-colors
              ${updateStatus.forceUpdate 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {translations.later}
          </button>
          
          <button
            onClick={refreshNow}
            className="
              flex items-center gap-2 px-6 py-2 
              bg-blue-600 hover:bg-blue-700 
              text-white font-medium rounded-lg
              transition-all transform hover:scale-105
              shadow-lg shadow-blue-600/30
            "
          >
            <RefreshCw className="w-4 h-4" />
            {translations.updateNow}
          </button>
        </div>
      </div>
    </div>
  )
}
