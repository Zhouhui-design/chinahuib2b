import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'partner-recruitment',
  en: {
    title: 'Partner Recruitment | Join SeaHeart Global B2B Network',
    description:
      'Become a SeaHeart Global partner. Recruiting regional agents, sourcing partners and channel resellers for our multi-language B2B trade exhibition platform.',
  },
  overrides: {
    zh: {
      title: '招募合伙人 | 加入心海环球 B2B 网络',
      description:
        '成为心海环球合伙人。招募区域代理、采购合作伙伴与渠道分销商，共建多语言 B2B 贸易展览平台。',
    },
  },
  keywords: [
    'B2B partner recruitment',
    'trade platform agent',
    'channel reseller',
    'sourcing partner',
  ],
})

export { generateMetadata }
export default Layout
