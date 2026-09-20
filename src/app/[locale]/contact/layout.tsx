import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'contact',
  en: {
    title: 'Contact Us',
    description:
      'Get in touch with SeaHeart Global. Contact our international trade team for supplier sourcing, exhibition booths, platform support and partnership enquiries.',
  },
  overrides: {
    zh: {
      title: '联系我们 | 心海环球 B2B 贸易平台',
      description:
        '联系心海环球国际贸易团队，咨询供应商对接、线上展位、平台支持与合作事宜。',
    },
  },
  keywords: [
    'contact SeaHeart Global',
    'B2B platform support',
    'supplier sourcing enquiry',
    'international trade contact',
  ],
})

export { generateMetadata }
export default Layout
