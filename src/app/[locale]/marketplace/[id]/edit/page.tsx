/**
 * Edit Task Page
 * 允许任务发布者编辑自己的任务
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Save, AlertCircle } from 'lucide-react'

interface FormDataType {
  title: string
  description: string
  type: string
  budget: string
  price: string
  currency: string
  unit: string
  minOrderQty: string
  deadline: string
  contactInfo: string
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const taskId = params.id as string

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    type: 'MANUFACTURING',
    budget: '',
    price: '',
    currency: 'USD',
    unit: '',
    minOrderQty: '',
    deadline: '',
    contactInfo: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState(false)

  // 多语言标签
  const t = {
    title: locale === 'zh' ? '编辑信息' : locale === 'de' ? 'Information bearbeiten' : locale === 'ar' ? 'تعديل المعلومات' : 'Edit Task',
    back: locale === 'zh' ? '← 返回详情' : locale === 'de' ? '← Zurück zu Details' : locale === 'ar' ? '← العودة إلى التفاصيل' : '← Back to Details',
    taskTitle: locale === 'zh' ? '标题' : locale === 'de' ? 'Titel' : locale === 'ar' ? 'العنوان' : 'Title',
    description: locale === 'zh' ? '详细描述' : locale === 'de' ? 'Beschreibung' : locale === 'ar' ? 'الوصف' : 'Description',
    type: locale === 'zh' ? '类型' : locale === 'de' ? 'Typ' : locale === 'ar' ? 'النوع' : 'Type',
    manufacturing: locale === 'zh' ? '制造' : locale === 'de' ? 'Herstellung' : locale === 'ar' ? 'تصنيع' : 'Manufacturing',
    productSale: locale === 'zh' ? '产品销售' : locale === 'de' ? 'Produktverkauf' : locale === 'ar' ? 'مبيعات المنتجات' : 'Product Sale',
    service: locale === 'zh' ? '服务' : locale === 'de' ? 'Service' : locale === 'ar' ? 'خدمة' : 'Service',
    budget: locale === 'zh' ? '预算' : locale === 'de' ? 'Budget' : locale === 'ar' ? 'الميزانية' : 'Budget',
    price: locale === 'zh' ? '单价' : locale === 'de' ? 'Stückpreis' : locale === 'ar' ? 'سعر الوحدة' : 'Unit Price',
    currency: locale === 'zh' ? '货币' : locale === 'de' ? 'Währung' : locale === 'ar' ? 'العملة' : 'Currency',
    unit: locale === 'zh' ? '单位' : locale === 'de' ? 'Einheit' : locale === 'ar' ? 'الوحدة' : 'Unit',
    minOrderQty: locale === 'zh' ? '最小起订量' : locale === 'de' ? 'Mindestbestellmenge' : locale === 'ar' ? 'الحد الأدنى للكمية' : 'Min Order Qty',
    deadline: locale === 'zh' ? '截止日期' : locale === 'de' ? 'Frist' : locale === 'ar' ? 'الموعد النهائي' : 'Deadline',
    contactInfo: locale === 'zh' ? '联系信息' : locale === 'de' ? 'Kontaktinformation' : locale === 'ar' ? 'معلومات الاتصال' : 'Contact Info',
    save: locale === 'zh' ? '保存更改' : locale === 'de' ? 'Änderungen speichern' : locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    saving: locale === 'zh' ? '保存中...' : locale === 'de' ? 'Speichern...' : locale === 'ar' ? 'جاري الحفظ...' : 'Saving...',
    titleRequired: locale === 'zh' ? '请输入标题' : locale === 'de' ? 'Bitte Titel eingeben' : locale === 'ar' ? 'يرجى إدخال العنوان' : 'Title is required',
    descriptionRequired: locale === 'zh' ? '请输入描述' : locale === 'de' ? 'Bitte Beschreibung eingeben' : locale === 'ar' ? 'يرجى إدخال الوصف' : 'Description is required',
    saveSuccess: locale === 'zh' ? '保存成功！' : locale === 'de' ? 'Erfolgreich gespeichert!' : locale === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!',
    saveFailed: locale === 'zh' ? '保存失败' : locale === 'de' ? 'Speichern fehlgeschlagen' : locale === 'ar' ? 'فشل الحفظ' : 'Failed to save',
    loadingTask: locale === 'zh' ? '加载中...' : locale === 'de' ? 'Wird geladen...' : locale === 'ar' ? 'جاري التحميل...' : 'Loading...',
    notOwner: locale === 'zh' ? '您无权编辑此信息，只能编辑自己发布的信息' : locale === 'de' ? 'Sie sind nicht berechtigt, diese Information zu bearbeiten. Sie können nur Ihre eigenen Informationen bearbeiten.' : locale === 'ar' ? 'ليس لديك صلاحية تعديل هذه المعلومات. يمكنك فقط تعديل معلوماتك الخاصة' : 'You are not authorized to edit this task. You can only edit your own tasks.',
    notLoggedIn: locale === 'zh' ? '请先登录' : locale === 'de' ? 'Bitte zuerst anmelden' : locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
  }

  // 加载任务数据
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/marketplace/tasks/${taskId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch task')
        }

        if (data.success && data.data) {
          const task = data.data
          setFormData({
            title: task.title || '',
            description: task.description || '',
            type: task.type || 'MANUFACTURING',
            budget: task.budget ? String(task.budget) : '',
            price: task.price ? String(task.price) : '',
            currency: task.currency || 'USD',
            unit: task.unit || '',
            minOrderQty: task.minOrderQty ? String(task.minOrderQty) : '',
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            contactInfo: task.contactInfo || '',
          })
        }
      } catch (err) {
        console.error('Error fetching task:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch task')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setError(t.titleRequired)
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch(`/api/marketplace/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          budget: formData.budget || null,
          price: formData.price || null,
          currency: formData.currency,
          unit: formData.unit || null,
          minOrderQty: formData.minOrderQty || null,
          deadline: formData.deadline || null,
          contactInfo: formData.contactInfo || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError(true)
          setError(t.notLoggedIn)
          return
        }
        if (response.status === 403) {
          setAuthError(true)
          setError(t.notOwner)
          return
        }
        throw new Error(data.error || t.saveFailed)
      }

      if (data.success) {
        alert(t.saveSuccess)
        router.push(`/${locale}/marketplace/${taskId}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          {t.loadingTask}
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href={`/${locale}/marketplace/${taskId}`}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t.back}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/marketplace/${taskId}`}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            {t.back}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.taskTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.type}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MANUFACTURING">{t.manufacturing}</option>
              <option value="PRODUCT_SALE">{t.productSale}</option>
              <option value="SERVICE">{t.service}</option>
            </select>
          </div>

          {/* 价格和预算 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.budget}
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.price}
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 货币和单位 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.currency}
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
                <option value="JPY">JPY</option>
                <option value="KRW">KRW</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.unit}
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="ton, piece, kg..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 最小起订量和截止日期 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.minOrderQty}
              </label>
              <input
                type="number"
                name="minOrderQty"
                value={formData.minOrderQty}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.deadline}
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 联系信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.contactInfo}
            </label>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              rows={3}
              placeholder="email: xxx@xxx.com tel: xxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/${locale}/marketplace/${taskId}`}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {t.back}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
