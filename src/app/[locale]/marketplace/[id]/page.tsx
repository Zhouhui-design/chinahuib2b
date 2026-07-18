import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, DollarSign, Eye, MessageCircle, Tag, User, FileText, MapPin } from 'lucide-react'
import { dictionaries } from '@/locales/dictionary'

export async function generateMetadata({ params }: { params: { id: string; locale: string } }) {
  const dict = dictionaries[params.locale] || dictionaries.en
  
  try {
    const task = await prisma.marketplaceTask.findUnique({
      where: { id: params.id },
    })
    
    if (!task) {
      return {
        title: `${dict.marketplace.taskNotFound || 'Task Not Found'} | X2XHub`,
        description: dict.marketplace.description || 'Global B2B Trade Platform',
      }
    }
    
    const keywords = task.keywords && task.keywords.length > 0 
      ? task.keywords.join(', ') 
      : 'B2B, trade, marketplace, business'
    
    return {
      title: `${task.title} | X2XHub`,
      description: task.description.length > 160 
        ? task.description.substring(0, 160) + '...' 
        : task.description,
      keywords: keywords,
      openGraph: {
        title: task.title,
        description: task.description.length > 160 
          ? task.description.substring(0, 160) + '...' 
          : task.description,
        type: 'website',
        url: `https://x2xhub.com/${params.locale}/marketplace/${task.id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: task.title,
        description: task.description.length > 160 
          ? task.description.substring(0, 160) + '...' 
          : task.description,
      },
    }
  } catch {
    return {
      title: `${dict.marketplace.taskNotFound || 'Task Not Found'} | X2XHub`,
      description: dict.marketplace.description || 'Global B2B Trade Platform',
    }
  }
}

export default async function TaskDetailPage({ params }: { params: { id: string; locale: string } }) {
  const dict = dictionaries[params.locale] || dictionaries.en
  
  const task = await prisma.marketplaceTask.findUnique({
    where: { id: params.id },
  })
  
  if (!task) {
    notFound()
  }
  
  const formatCurrency = (value: number | null, currency: string) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value)
  }
  
  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(params.locale)
  }
  
  const getTypeLabel = (type: string) => {
    const types: Record<string, { zh: string; en: string; ja: string; ko: string }> = {
      MANUFACTURING: { zh: '制造', en: 'Manufacturing', ja: '製造', ko: '제조' },
      PRODUCT_SALE: { zh: '产品销售', en: 'Product Sale', ja: '製品販売', ko: '제품 판매' },
      SERVICE: { zh: '服务', en: 'Service', ja: 'サービス', ko: '서비스' },
    }
    return types[type]?.[params.locale as keyof typeof types.MANUFACTURING] || type
  }
  
  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { zh: string; en: string; ja: string; ko: string }> = {
      OPEN: { zh: '开放', en: 'Open', ja: 'オープン', ko: '오픈' },
      IN_PROGRESS: { zh: '进行中', en: 'In Progress', ja: '進行中', ko: '진행 중' },
      COMPLETED: { zh: '已完成', en: 'Completed', ja: '完了', ko: '완료' },
      CANCELLED: { zh: '已取消', en: 'Cancelled', ja: 'キャンセル', ko: '취소' },
    }
    return statuses[status]?.[params.locale as keyof typeof statuses.OPEN] || status
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${params.locale}/marketplace`}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← {dict.marketplace.backToMarketplace || 'Back to Marketplace'}
          </Link>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getStatusLabel(task.status)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                    {getTypeLabel(task.type)}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {task.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {task.applications}
                  </span>
                </div>
              </div>
              
              {task.keywords && task.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="w-3 h-3" />
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
            
            {task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {dict.marketplace.attachments || 'Attachments'}
                </h2>
                <div className="space-y-3">
                  {task.attachments.map((url: string, index: number) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="flex-1 text-gray-700 truncate">{url.split('/').pop()}</span>
                      <span className="text-blue-600 text-sm">{dict.marketplace.download || 'Download'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {dict.marketplace.taskDetails || 'Task Details'}
              </h2>
              
              <div className="space-y-4">
                {task.budget && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {dict.marketplace.budget || 'Budget'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(Number(task.budget), task.currency)}
                    </span>
                  </div>
                )}
                
                {task.price && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">{dict.marketplace.unitPrice || 'Unit Price'}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(Number(task.price), task.currency)}
                      {task.unit && <span className="text-gray-500 ml-1">/{task.unit}</span>}
                    </span>
                  </div>
                )}
                
                {task.minOrderQty && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">{dict.marketplace.minOrderQty || 'Min Order Qty'}</span>
                    <span className="font-semibold text-gray-900">{task.minOrderQty}</span>
                  </div>
                )}
                
                {task.deadline && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {dict.marketplace.deadline || 'Deadline'}
                    </span>
                    <span className="font-semibold text-gray-900">{formatDate(task.deadline)}</span>
                  </div>
                )}
                
                {task.contactInfo && (
                  <div className="py-3">
                    <span className="text-gray-600 block mb-2">{dict.marketplace.contactInfo || 'Contact Info'}</span>
                    <span className="font-semibold text-gray-900">{task.contactInfo}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {dict.marketplace.applyTask || 'Apply for Task'}
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-2">
                {dict.marketplace.poweredBy || 'Powered by'}
              </h3>
              <p className="text-blue-100 text-sm">
                {dict.marketplace.seoDescription || 'X2XHub is a global B2B trade platform connecting buyers and sellers worldwide.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}