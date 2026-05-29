// 版本管理配置
export const VERSION_CONFIG = {
  // 当前应用版本 - 每次部署时更新
  APP_VERSION: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
  
  // 构建时间戳 - 用于检测新版本
  BUILD_TIMESTAMP: process.env['NEXT_PUBLIC_BUILD_TIMESTAMP'] || Date.now().toString(),
  
  // 检查间隔（毫秒）- 每5分钟检查一次
  CHECK_INTERVAL: 5 * 60 * 1000,
  
  // 自动刷新延迟（毫秒）- 提醒后30分钟自动刷新
  AUTO_REFRESH_DELAY: 30 * 60 * 1000,
  
  // 存储键名
  STORAGE_KEYS: {
    LAST_VERSION: 'app_last_version',
    LAST_CHECK: 'app_last_check',
    UPDATE_SHOWN: 'app_update_shown',
    USER_DISMISSED: 'app_user_dismissed',
  }
}

// 更新类型
export type UpdateType = 'major' | 'minor' | 'patch' | 'hotfix'

// 更新日志条目
export interface ChangelogEntry {
  version: string
  date: string
  type: UpdateType
  title: Record<string, string>
  changes: {
    fixed?: Record<string, string[]>
    added?: Record<string, string[]>
    improved?: Record<string, string[]>
    security?: Record<string, string[]>
  }
}

// 版本信息响应
export interface VersionInfo {
  version: string
  buildTimestamp: string
  changelog: ChangelogEntry[]
  forceUpdate: boolean
  autoRefreshAt?: string | undefined
}

// 比较版本号
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

// 获取更新类型
export function getUpdateType(oldVersion: string, newVersion: string): UpdateType {
  const oldParts = oldVersion.split('.').map(Number)
  const newParts = newVersion.split('.').map(Number)
  
  if ((newParts[0] || 0) > (oldParts[0] || 0)) return 'major'
  if ((newParts[1] || 0) > (oldParts[1] || 0)) return 'minor'
  if ((newParts[2] || 0) > (oldParts[2] || 0)) return 'patch'
  return 'hotfix'
}
