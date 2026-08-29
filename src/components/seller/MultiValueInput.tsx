'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

/**
 * 多值输入组件：支持填写多个邮箱/电话/网址等。
 * 每个值是一个可删除的标签 + 一个"添加"输入框。
 */
export default function MultiValueInput({
  values,
  onChange,
  placeholder,
  type = 'text',
  singlePlaceholder,
}: {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url'
  singlePlaceholder?: string
}) {
  const [draft, setDraft] = useState('')

  const addValue = () => {
    const v = draft.trim()
    if (!v) return
    // 去重，避免重复添加
    if (values.includes(v)) {
      setDraft('')
      return
    }
    onChange([...values, v])
    setDraft('')
  }

  const removeValue = (i: number) => {
    onChange(values.filter((_, idx) => idx !== i))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addValue()
    }
  }

  return (
    <div className="space-y-2">
      {/* 已添加的值标签 */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg"
            >
              <span className="break-all">{v}</span>
              <button
                type="button"
                onClick={() => removeValue(i)}
                className="text-blue-400 hover:text-blue-700 focus:outline-none"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 添加输入框 */}
      <div className="flex gap-2">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addValue}
          placeholder={singlePlaceholder || placeholder || 'Add and press Enter / comma'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addValue}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400">
        {placeholder ? '多个值用回车或逗号分隔' : 'Add multiple values (press Enter or comma)'}
      </p>
    </div>
  )
}
