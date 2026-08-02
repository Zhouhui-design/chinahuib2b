/**
 * 上传限制集中配置
 *
 * 所有文件上传的大小、数量、类型限制统一在此文件管理。
 * 以后需要调整限制时，只需修改此文件即可，无需改动业务代码。
 *
 * 设计原则：
 * - 单文件大小限制防止超大文件耗尽存储
 * - 每类文件数量限制防止恶意刷量
 * - 总文件数限制防止滥用
 * - 频率限制防止短时间内大量上传
 * - 类型白名单防止上传恶意文件
 */

/** 文件大小（字节） */
const KB = 1024
const MB = 1024 * KB

/** 单个附件类型限制 */
export interface AttachmentTypeLimit {
  /** 该类型允许的最大文件大小（字节） */
  maxFileSize: number
  /** 该类型每个任务允许的最大文件数量 */
  maxCount: number
  /** 允许的 MIME 类型白名单（空数组表示不限制 MIME，仅按扩展名判断） */
  allowedMimeTypes: string[]
  /** 允许的文件扩展名白名单（含点号，小写） */
  allowedExtensions: string[]
  /** 上传到 /api/upload 时使用的 type 参数值 */
  apiType: string
}

/** 附件类型分类键 */
export type AttachmentTypeKey = 'image' | 'video' | 'file' | 'drawing' | 'compressed'

/**
 * 各附件类型的限制配置
 * 使用明确类型而非 Record<string, ...> 避免 noUncheckedIndexedAccess 返回 undefined
 */
export const ATTACHMENT_LIMITS: Record<AttachmentTypeKey, AttachmentTypeLimit> = {
  /** 图片：jpg/png/webp，单张 5MB，最多 10 张 */
  image: {
    maxFileSize: 5 * MB,
    maxCount: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    apiType: 'task_attachment',
  },

  /** 视频：mp4/mov/webm，单个 100MB，最多 3 个 */
  video: {
    maxFileSize: 100 * MB,
    maxCount: 3,
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    allowedExtensions: ['.mp4', '.mov', '.webm'],
    apiType: 'task_attachment',
  },

  /** 文档：pdf/doc/docx/xls/xlsx/ppt/pptx，单个 20MB，最多 5 个 */
  file: {
    maxFileSize: 20 * MB,
    maxCount: 5,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    apiType: 'task_attachment',
  },

  /** 图纸：dwg/dxf，单个 20MB，最多 5 个 */
  drawing: {
    maxFileSize: 20 * MB,
    maxCount: 5,
    allowedMimeTypes: [],
    allowedExtensions: ['.dwg', '.dxf'],
    apiType: 'task_attachment',
  },

  /** 压缩包：zip/rar/7z，单个 50MB，最多 3 个 */
  compressed: {
    maxFileSize: 50 * MB,
    maxCount: 3,
    allowedMimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
    allowedExtensions: ['.zip', '.rar', '.7z'],
    apiType: 'task_attachment',
  },
}

/** 每个任务允许的附件总数量上限（所有类型合计） */
export const MAX_TOTAL_ATTACHMENTS = 20

/**
 * 频率限制：每个用户在指定时间窗口内允许的最大上传次数
 * 默认每小时 30 次（足够正常使用，阻止恶意刷量）
 */
export const UPLOAD_RATE_LIMIT = {
  /** 时间窗口（毫秒），默认 1 小时 */
  windowMs: 60 * 60 * 1000,
  /** 窗口内允许的最大上传次数 */
  maxUploads: 30,
}

/** 全局单文件大小硬上限（字节），任何类型都不能超过此值 */
export const GLOBAL_MAX_FILE_SIZE = 200 * MB

/**
 * 根据文件名获取小写扩展名（含点号）
 * @example getExtension('photo.JPG') → '.jpg'
 */
export function getExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length > 1) {
    const ext = parts[parts.length - 1]
    return ext ? '.' + ext.toLowerCase() : ''
  }
  return ''
}

/**
 * 验证单个文件是否符合指定类型的限制
 * @returns 验证通过返回 null，否则返回错误消息
 */
export function validateFile(
  file: File,
  attachmentType: AttachmentTypeKey
): string | null {
  const limit = ATTACHMENT_LIMITS[attachmentType]
  if (!limit) {
    return `Unknown attachment type: ${attachmentType}`
  }

  // 全局大小硬上限
  if (file.size > GLOBAL_MAX_FILE_SIZE) {
    return `File too large: global max is ${GLOBAL_MAX_FILE_SIZE / MB}MB`
  }

  // 类型大小限制
  if (file.size > limit.maxFileSize) {
    const maxMB = limit.maxFileSize / MB
    return `File "${file.name}" exceeds ${maxMB}MB limit for this file type`
  }

  // 空文件检查
  if (file.size === 0) {
    return `File "${file.name}" is empty`
  }

  const ext = getExtension(file.name)

  // 扩展名白名单检查
  if (limit.allowedExtensions.length > 0 && !limit.allowedExtensions.includes(ext)) {
    return `File "${file.name}" has unsupported extension. Allowed: ${limit.allowedExtensions.join(', ')}`
  }

  // MIME 类型白名单检查（仅当配置了白名单且浏览器提供了 MIME 类型时）
  if (limit.allowedMimeTypes.length > 0 && file.type && !limit.allowedMimeTypes.includes(file.type)) {
    return `File "${file.name}" has unsupported type. Allowed: ${limit.allowedMimeTypes.join(', ')}`
  }

  return null
}

/**
 * 格式化文件大小为人类可读字符串
 * @example formatFileSize(5242880) → '5.0 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

/**
 * 获取某类型的当前已上传数量描述
 * @example getCountDescription('image', 3) → '3 / 10'
 */
export function getCountDescription(
  attachmentType: AttachmentTypeKey,
  currentCount: number
): string {
  const limit = ATTACHMENT_LIMITS[attachmentType]
  return `${currentCount} / ${limit.maxCount}`
}
