'use client'

import { useState } from 'react'
import { Plus, X, Store } from 'lucide-react'

/**
 * 线下门店 / 自提点输入组件。
 *
 * 与 MultiValueInput 相同的"多值 + 号"交互模式，区别是每一条不是单个字符串，
 * 而是包含门店名称/国家城市/详细地址/电话/营业时间的结构化对象。
 * 数据以 JSONB 数组形式存进 SellerProfile.offlineStores，最多 10 条。
 */

export const MAX_OFFLINE_STORES = 10

export interface OfflineStore {
  name: string
  location: string
  address: string
  phone: string
  hours: string
}

export const emptyOfflineStore = (): OfflineStore => ({
  name: '',
  location: '',
  address: '',
  phone: '',
  hours: '',
})

/** 判断一条门店是否有任何有效内容（全空的条目保存时会被过滤掉）。 */
export const isOfflineStoreFilled = (s: OfflineStore): boolean =>
  Boolean(
    (s.name && s.name.trim()) ||
      (s.location && s.location.trim()) ||
      (s.address && s.address.trim()) ||
      (s.phone && s.phone.trim()) ||
      (s.hours && s.hours.trim())
  )

/** 把任意 JSONB 值安全地规范化成 OfflineStore[]，用于回填与前台渲染。 */
export function normalizeOfflineStores(arr: unknown): OfflineStore[] {
  if (!Array.isArray(arr)) return []
  const list: OfflineStore[] = []
  for (const raw of arr) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const o = raw as Record<string, unknown>
    const pick = (k: string): string => (typeof o[k] === 'string' ? (o[k] as string).trim() : '')
    const item: OfflineStore = {
      name: pick('name'),
      location: pick('location'),
      address: pick('address'),
      phone: pick('phone'),
      hours: pick('hours'),
    }
    if (isOfflineStoreFilled(item)) list.push(item)
    if (list.length >= MAX_OFFLINE_STORES) break
  }
  return list
}

interface Labels {
  storeName: string
  storeNamePlaceholder: string
  location: string
  locationPlaceholder: string
  address: string
  addressPlaceholder: string
  phone: string
  phonePlaceholder: string
  hours: string
  hoursPlaceholder: string
  addStore: string
  storeIndex: string
  remove: string
  maxReached: string
  empty: string
}

export default function OfflineStoresInput({
  values,
  onChange,
  labels,
  max = MAX_OFFLINE_STORES,
}: {
  values: OfflineStore[]
  onChange: (values: OfflineStore[]) => void
  labels: Labels
  max?: number
}) {
  const [expanded, setExpanded] = useState<number | null>(values.length > 0 ? 0 : null)

  const addStore = () => {
    if (values.length >= max) return
    onChange([...values, emptyOfflineStore()])
    setExpanded(values.length)
  }

  const removeStore = (i: number) => {
    onChange(values.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  const updateField = (i: number, field: keyof OfflineStore, val: string) => {
    onChange(values.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-3">
      {values.length === 0 && <p className="text-sm text-gray-400">{labels.empty}</p>}

      {values.map((store, i) => (
        <div
          key={`offline-store-${i}`}
          className="border border-gray-200 rounded-lg bg-gray-50/60 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-blue-600 focus:outline-none"
            >
              <Store className="w-4 h-4 text-gray-400" />
              <span>
                {labels.storeIndex.replace('{n}', String(i + 1))}
                {store.name.trim() ? `：${store.name.trim()}` : ''}
              </span>
            </button>
            <button
              type="button"
              onClick={() => removeStore(i)}
              className="text-gray-400 hover:text-red-600 focus:outline-none"
              aria-label={labels.remove}
              title={labels.remove}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {expanded === i && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {labels.storeName}
                </label>
                <input
                  type="text"
                  value={store.name}
                  onChange={(e) => updateField(i, 'name', e.target.value)}
                  placeholder={labels.storeNamePlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {labels.location}
                </label>
                <input
                  type="text"
                  value={store.location}
                  onChange={(e) => updateField(i, 'location', e.target.value)}
                  placeholder={labels.locationPlaceholder}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {labels.address}
                </label>
                <input
                  type="text"
                  value={store.address}
                  onChange={(e) => updateField(i, 'address', e.target.value)}
                  placeholder={labels.addressPlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {labels.phone}
                </label>
                <input
                  type="tel"
                  value={store.phone}
                  onChange={(e) => updateField(i, 'phone', e.target.value)}
                  placeholder={labels.phonePlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {labels.hours}
                </label>
                <input
                  type="text"
                  value={store.hours}
                  onChange={(e) => updateField(i, 'hours', e.target.value)}
                  placeholder={labels.hoursPlaceholder}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {values.length < max ? (
        <button
          type="button"
          onClick={addStore}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          {labels.addStore}
        </button>
      ) : (
        <p className="text-xs text-amber-600">{labels.maxReached}</p>
      )}
      <p className="text-xs text-gray-400">
        {values.length} / {max}
      </p>
    </div>
  )
}
