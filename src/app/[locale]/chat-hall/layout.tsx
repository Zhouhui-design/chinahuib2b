import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'chat-hall',
  en: {
    title: 'Trade Chat Hall | Talk to Global Buyers & Suppliers',
    description:
      'Open trade chat hall on SeaHeart Global. Post sourcing requests, answer buyer enquiries and connect with verified international suppliers in real time.',
  },
  overrides: {
    zh: {
      title: '贸易聊天大厅 | 对话全球买家与供应商',
      description:
        '心海环球开放贸易聊天大厅。发布采购需求、回复买家询盘，实时对接全球认证供应商。',
    },
  },
  keywords: [
    'B2B trade chat',
    'sourcing requests',
    'buyer enquiries',
    'supplier communication',
  ],
})

export { generateMetadata }
export default Layout
