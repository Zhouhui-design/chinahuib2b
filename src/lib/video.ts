// 视频附件识别与嵌入工具
// 支持：本地上传视频(mp4/mov/webm) + 外链(YouTube/Facebook/抖音/小红书)

export type VideoPlatform =
  | 'youtube'
  | 'facebook'
  | 'douyin'
  | 'xiaohongshu'
  | 'upload'
  | null

export interface VideoInfo {
  platform: VideoPlatform
  // 外链嵌入播放地址（可 iframe）；无法嵌入时为 null（退化为卡片跳转）
  embedUrl: string | null
  // 平台展示名
  label: string
}

const VIDEO_EXT_RE = /\.(mp4|mov|webm)(\?.*)?$/i

/** 判断一个附件 URL 是否是视频 */
export function isVideoUrl(url: string): boolean {
  return getVideoInfo(url).platform !== null
}

/** 解析视频 URL，返回平台与嵌入信息 */
export function getVideoInfo(url: string): VideoInfo {
  if (!url || typeof url !== 'string') {
    return { platform: null, embedUrl: null, label: '' }
  }
  const u = url.trim()

  // 本地上传视频（站内路径或含扩展名）
  if (VIDEO_EXT_RE.test(u)) {
    return { platform: 'upload', embedUrl: u, label: 'Video' }
  }

  // YouTube: youtube.com/watch?v=ID / youtu.be/ID / youtube.com/shorts/ID
  const ytMatch =
    u.match(/(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{6,})/i) ||
    u.match(/(?:youtu\.be\/)([\w-]{6,})/i) ||
    u.match(/(?:youtube\.com\/shorts\/)([\w-]{6,})/i) ||
    u.match(/(?:youtube\.com\/embed\/)([\w-]{6,})/i)
  if (ytMatch && ytMatch[1]) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      label: 'YouTube',
    }
  }

  // Facebook 视频: facebook.com/*/videos/* / fb.watch/*
  if (/facebook\.com\/.+\/videos\//i.test(u) || /fb\.watch\//i.test(u)) {
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false`,
      label: 'Facebook',
    }
  }

  // 抖音: douyin.com/video/ID / v.douyin.com/short
  if (/douyin\.com\/video\//i.test(u) || /v\.douyin\.com\//i.test(u)) {
    // 抖音无公开 iframe 嵌入，退化为卡片跳转
    return { platform: 'douyin', embedUrl: null, label: '抖音' }
  }

  // 小红书: xiaohongshu.com/explore/ID / xhslink.com/short
  if (/xiaohongshu\.com\//i.test(u) || /xhslink\.com\//i.test(u)) {
    // 小红书无公开 iframe 嵌入，退化为卡片跳转
    return { platform: 'xiaohongshu', embedUrl: null, label: '小红书' }
  }

  return { platform: null, embedUrl: null, label: '' }
}

/** 校验一个输入是否是受支持的视频链接（用于表单添加前校验） */
export function isValidVideoLink(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const u = url.trim()
  if (!/^https?:\/\//i.test(u)) return false
  return getVideoInfo(u).platform !== null && getVideoInfo(u).platform !== 'upload'
}
