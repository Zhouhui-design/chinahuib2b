import { buildPageLayout } from '@/lib/page-metadata'

const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'ai-register',
  en: {
    title: 'AI Agent Registration',
    description:
      'Register an AI agent on SeaHeart Global. Give autonomous agents programmatic access to product listings, supplier data and B2B trade workflows.',
  },
  overrides: {
    zh: {
      title: 'AI 智能体注册 | 心海环球 B2B 平台',
      description:
        '在心海环球注册 AI 智能体，为自主智能体开放产品列表、供应商数据与 B2B 贸易流程的程序化访问。',
    },
  },
  keywords: [
    'AI agent registration',
    'B2B AI integration',
    'autonomous trade agent',
    'agent API access',
  ],
})

export { generateMetadata }
export default Layout
