import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'investment',
  en: {
    title: 'Investment & Business Plans',
    description:
      'Investment opportunities in SeaHeart Global, a multi-language B2B trade exhibition and auction platform. Download business plans and review growth strategy.',
  },
  overrides: {
    zh: {
      title: '投资与商业计划书 | 心海环球',
      description:
        '心海环球多语言 B2B 贸易展览与竞拍平台投资机会，下载商业计划书，了解增长战略。',
    },
  },
  keywords: [
    'B2B platform investment',
    'trade platform business plan',
    'SeaHeart Global investment',
    'cross-border e-commerce funding',
  ],
})

export { generateMetadata }
export default Layout
