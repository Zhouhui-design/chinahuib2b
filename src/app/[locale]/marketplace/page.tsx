/**
 * Marketplace / Task Hall Page (Server Component)
 *
 * 首屏任务与话题在服务端直出：保证无 JS 的搜索引擎 / AI 答案引擎（GPTBot
 * 等）在 HTML 中能读到真实发布内容与指向详情页的链接，并附带 ItemList
 * 结构化数据。筛选 / 排序 / 切 Tab / 删除等交互由客户端子组件
 * MarketplaceClient 接管。
 */

import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { TaskStatus } from '@prisma/client'
import { buildAlternates } from '@/lib/hreflang'
import type { LanguageCode } from '@/lib/languages'
import MarketplaceClient, { type Task, type Topic } from './MarketplaceClient'

type Props = {
  params: Promise<{ locale: LanguageCode }>
}

/** 首屏条数：与客户端筛选请求的 limit 保持一致。 */
const INITIAL_LIMIT = 10
const ORIGIN = 'https://x2xhub.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const alternates = buildAlternates(`/${locale}/marketplace`)

  const isZh = locale === 'zh'
  const title = 'B2B Marketplace | Wholesale Products & Verified Suppliers'
  const description = isZh
    ? '浏览全球 B2B 批发市场：工业机械、电子产品、化工原料、纺织与消费品，对接已认证供应商。'
    : 'Browse the global B2B marketplace: industrial machinery, electronics, chemicals, textiles and consumer goods from verified suppliers worldwide.'

  return {
    title,
    description,
    keywords: [
      'B2B marketplace', 'wholesale products', 'verified suppliers',
      'global sourcing', 'industrial machinery', 'electronics wholesale',
      'bulk purchase', 'trade platform',
    ],
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: alternates.canonical,
      siteName: 'SeaHeart Global',
    },
  }
}

/** JSON-LD 序列化：转义 '<' 防止用户内容里的 </script> 截断脚本。 */
function ldJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/** 与 /api/marketplace/tasks 的字段映射保持一致，保证 SSR 与客户端筛选结果一致。 */
function toClientTask(task: any): Task {
  return {
    id: task.id,
    type: task.type,
    postedAt: task.createdAt.toISOString(),
    title: task.title,
    description: task.description,
    budget: task.budget != null ? Number(task.budget) : undefined,
    price: task.price != null ? Number(task.price) : undefined,
    currency: task.currency ?? undefined,
    unit: task.unit ?? undefined,
    minOrderQty: task.minOrderQty ?? undefined,
    deadline: task.deadline ? task.deadline.toISOString() : undefined,
    applications: task.applications,
    views: task.views,
    rating: task.rating != null ? Number(task.rating) : undefined,
    // B2B 买家更信任公司名而非用户名，优先展示卖家公司名
    postedBy: task.postedBy?.sellerProfile?.companyName || task.postedBy?.displayName || task.postedBy?.username || 'Unknown',
    sellerVerified: !!task.postedBy?.sellerProfile?.isVerified,
    attachments: Array.isArray(task.attachments) ? task.attachments : [],
    postedById: task.postedById,
    countryCode: task.countryCode ?? undefined,
    countryName: task.countryName ?? undefined,
  }
}

/** 与 /api/topics 的返回结构保持一致。 */
function toClientTopic(topic: any): Topic {
  return {
    id: topic.id,
    userId: topic.userId,
    title: topic.title,
    content: topic.content,
    category: topic.category,
    images: topic.images ?? [],
    videos: topic.videos ?? [],
    documents: Array.isArray(topic.documents) ? topic.documents : [],
    link: topic.link ?? null,
    phone: topic.phone ?? null,
    viewCount: topic.viewCount,
    likeCount: topic.likeCount,
    commentCount: topic.commentCount,
    isActive: topic.isActive,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    user: topic.user,
  }
}

export default async function MarketplacePage({ params }: Props) {
  const { locale } = await params

  const [tasksRaw, totalTasks, topicsRaw] = await Promise.all([
    prisma.marketplaceTask.findMany({
      where: { status: TaskStatus.OPEN },
      orderBy: { createdAt: 'desc' },
      take: INITIAL_LIMIT,
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            sellerProfile: { select: { companyName: true, isVerified: true } },
          },
        },
      },
    }),
    prisma.marketplaceTask.count({ where: { status: TaskStatus.OPEN } }),
    prisma.topic.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: INITIAL_LIMIT,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            sellerProfile: {
              select: { companyName: true, logoUrl: true, isVerified: true },
            },
          },
        },
      },
    }),
  ])

  const initialTasks = tasksRaw.map(toClientTask)
  const initialTopics = topicsRaw.map(toClientTopic)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'B2B Marketplace Listings',
    numberOfItems: totalTasks,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: initialTasks.map((task, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${ORIGIN}/${locale}/marketplace/${task.id}`,
      name: task.title,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${ORIGIN}/${locale}/marketplace` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbSchema) }} />
      <MarketplaceClient
        locale={locale}
        initialTasks={initialTasks}
        initialTopics={initialTopics}
        initialTotalPages={Math.ceil(totalTasks / INITIAL_LIMIT)}
      />
    </>
  )
}
