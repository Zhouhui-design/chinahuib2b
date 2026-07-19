import { useEffect, useState } from 'react'
import { AlertTriangle, X, Clock, CheckCircle } from 'lucide-react'

interface MaintenanceNotice {
  id: string
  title: string
  titleEn: string | null
  content: string
  contentEn: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: string
  scheduledStart: string | null
  estimatedDuration: number | null
  actualEndTime: string | null
}

export function MaintenanceBanner() {
  const [notices, setNotices] = useState<MaintenanceNotice[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/maintenance')
        const data = await response.json()
        if (data.success && data.notices && data.notices.length > 0) {
          setNotices(data.notices)
        }
      } catch (error) {
        console.error('Failed to fetch maintenance notices:', error)
      }
    }

    fetchNotices()

    const interval = setInterval(fetchNotices, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible || notices.length === 0) return null

  const currentNotice = notices[0]

  const getStatusColor = () => {
    switch (currentNotice.status) {
      case 'IN_PROGRESS':
        return 'bg-red-500'
      case 'PENDING':
        return 'bg-amber-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = () => {
    switch (currentNotice.status) {
      case 'IN_PROGRESS':
        return '维护进行中'
      case 'PENDING':
        return '维护即将开始'
      default:
        return '维护已完成'
    }
  }

  const getIcon = () => {
    switch (currentNotice.status) {
      case 'IN_PROGRESS':
        return <AlertTriangle className="w-5 h-5" />
      case 'PENDING':
        return <Clock className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  return (
    <div className={`${getStatusColor()} text-white py-3 px-4`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-sm">{getStatusText()}</span>
          </span>
          <span className="text-sm font-medium">{currentNotice.title}</span>
          {currentNotice.estimatedDuration && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              预计时长：{formatDuration(currentNotice.estimatedDuration)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="关闭通知"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}