import { NextRequest, NextResponse } from "next/server"
import { VersionInfo, ChangelogEntry } from "@/lib/version"

// 更新日志数据 - 实际项目中可以从数据库或文件读取
const changelog: ChangelogEntry[] = [
  {
    version: "1.0.1",
    date: "2026-05-29",
    type: "patch",
    title: {
      zh: "修复翻译问题和性能优化",
      en: "Translation fixes and performance improvements",
      ja: "翻訳問題の修正とパフォーマンス改善",
      es: "Correcciones de traducción y mejoras de rendimiento",
      fr: "Corrections de traduction et améliorations des performances",
      de: "Übersetzungskorrekturen und Leistungsverbesserungen",
      ko: "번역 문제 수정 및 성능 개선",
      ru: "Исправления перевода и улучшения производительности",
      pt: "Correções de tradução e melhorias de desempenho",
      ar: "إصلاحات الترجمة وتحسينات الأداء"
    },
    changes: {
      fixed: {
        zh: ["修复产品创建页面的多语言翻译问题", "修复文件上传组件的翻译"],
        en: ["Fixed multilingual translation issues on product creation page", "Fixed translations in file upload component"],
        ja: ["製品作成ページの多言語翻訳問題を修正", "ファイルアップロードコンポーネントの翻訳を修正"]
      },
      improved: {
        zh: ["优化语言检测机制", "提升页面加载速度"],
        en: ["Improved language detection mechanism", "Enhanced page loading speed"],
        ja: ["言語検出メカニズムを最適化", "ページ読み込み速度を向上"]
      }
    }
  },
  {
    version: "1.0.0",
    date: "2026-05-28",
    type: "major",
    title: {
      zh: "初始版本发布",
      en: "Initial Release",
      ja: "初期バージョンリリース",
      es: "Lanzamiento inicial",
      fr: "Version initiale",
      de: "Erstveröffentlichung",
      ko: "초기 버전 출시",
      ru: "Первоначальный выпуск",
      pt: "Lançamento inicial",
      ar: "الإصدار الأولي"
    },
    changes: {
      added: {
        zh: ["卖家仪表盘", "产品管理系统", "多语言支持", "AI 店铺装修工具"],
        en: ["Seller Dashboard", "Product Management System", "Multi-language Support", "AI Store Decoration Tool"],
        ja: ["販売者ダッシュボード", "製品管理システム", "多言語サポート", "AIストア装飾ツール"]
      }
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentVersion = searchParams.get('currentVersion')
    
    // 获取当前服务器版本
    const serverVersion = process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0'
    const buildTimestamp = process.env['NEXT_PUBLIC_BUILD_TIMESTAMP'] || Date.now().toString()
    
    // 确定是否需要强制更新（大版本更新）
    let forceUpdate = false
    if (currentVersion) {
      const currentParts = currentVersion.split('.').map(Number)
      const serverParts = serverVersion.split('.').map(Number)
      // 主版本号变化时强制更新
      forceUpdate = (serverParts[0] || 0) > (currentParts[0] || 0)
    }
    
    // 计算自动刷新时间（如果是强制更新，30分钟后自动刷新）
    const autoRefreshAt = forceUpdate 
      ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
      : undefined
    
    const versionInfo: VersionInfo = {
      version: serverVersion,
      buildTimestamp,
      changelog: changelog.slice(0, 5), // 只返回最近5条
      forceUpdate,
      autoRefreshAt
    }
    
    return NextResponse.json(versionInfo)
  } catch (error) {
    console.error("Version API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch version info" },
      { status: 500 }
    )
  }
}
