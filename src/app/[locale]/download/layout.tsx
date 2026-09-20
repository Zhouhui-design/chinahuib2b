import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'download',
  en: {
    title: 'Downloads',
    description:
      'Download SeaHeart Global resources: platform guides, supplier brochures, trade documents and the mobile app for global B2B sourcing.',
  },
  overrides: {
    zh: {
      title: '资源下载 | 心海环球 B2B 贸易平台',
      description:
        '下载心海环球平台资源：使用指南、供应商画册、贸易文件与移动应用，助力全球 B2B 采购。',
    },
  },
  keywords: [
    'B2B platform download',
    'supplier brochure',
    'trade documents',
    'sourcing app',
  ],
})

export { generateMetadata }
export default Layout
