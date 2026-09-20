import { buildPageLayout } from '@/lib/page-metadata'

/**
 * Private, per-user page. It must resolve its own canonical (so it stops
 * claiming to be the homepage) but must NOT enter the index.
 */
const { generateMetadata, default: Layout } = buildPageLayout({
  route: 'wallet',
  index: false,
  en: {
    title: 'Wallet',
    description: 'Manage your SeaHeart Global account balance, payments and transaction history.',
  },
  overrides: {
    zh: {
      title: '钱包 | 心海环球',
      description: '管理您的心海环球账户余额、支付与交易记录。',
    },
  },
})

export { generateMetadata }
export default Layout
