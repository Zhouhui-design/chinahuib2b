import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'about',
  en: {
    title: 'About Us',
    description:
      'Learn about SeaHeart Global: a multi-language B2B trade exhibition and auction platform connecting verified suppliers and global buyers across 13 languages.',
  },
  overrides: {
    zh: {
      title: '关于我们 | 心海环球 B2B 贸易与展览平台',
      description:
        '了解心海环球：一个连接全球买家与认证供应商的多语言 B2B 贸易展览与竞拍平台，支持 13 种语言。',
    },
  },
  keywords: [
    'about SeaHeart Global',
    'B2B trade platform',
    'global exhibition platform',
    'verified suppliers',
  ],
})

export { generateMetadata }
export default Layout
