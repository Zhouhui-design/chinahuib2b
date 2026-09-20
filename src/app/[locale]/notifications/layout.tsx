import { buildPageLayout } from '@/lib/page-metadata'

/**
 * Private, per-user page. Needs its own canonical so it stops inheriting the
 * homepage one, but must stay out of the search index.
 */
const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'notifications',
  index: false,
  en: {
    title: 'Notifications',
    description: 'View your SeaHeart Global notifications, enquiry alerts and platform updates.',
  },
  overrides: {
    zh: {
      title: '通知中心 | 心海环球',
      description: '查看您的心海环球通知、询盘提醒与平台更新。',
    },
  },
})

export { generateMetadata }
export default Layout
