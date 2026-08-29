'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, X, Globe, Check } from 'lucide-react'
import { worldLanguages, getWorldLanguageName } from '@/lib/world-languages'

interface LanguageSelectProps {
  value: string[]
  onChange: (values: string[]) => void
  label?: string
  language?: string
}

export default function LanguageSelect({ value, onChange, label, language = 'en' }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 关闭下拉菜单（点击外部）
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
        setShowCustom(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const isAllSelected = value.length === worldLanguages.length + (value.filter(v => !worldLanguages.some(w => w.code === v)).length > 0 ? 1 : 0)

  const filtered = useMemo(() => {
    if (!search) return worldLanguages
    const q = search.toLowerCase()
    return worldLanguages.filter(
      l => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.includes(q)
    )
  }, [search])

  const toggleLanguage = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter(v => v !== code))
    } else {
      onChange([...value, code])
    }
  }

  const selectAll = () => {
    onChange(worldLanguages.map(l => l.code))
  }

  const deselectAll = () => {
    onChange([])
    setShowCustom(false)
    setCustomInput('')
  }

  const addCustomLanguage = () => {
    const v = customInput.trim()
    if (!v) return
    if (!value.includes(v)) {
      onChange([...value, v])
    }
    setCustomInput('')
    setShowCustom(false)
  }

  const removeLanguage = (code: string) => {
    onChange(value.filter(v => v !== code))
  }

  const isCustom = (code: string) => !worldLanguages.some(l => l.code === code)

  // 判断是否为内置语言
  const isBuiltin = (code: string) => worldLanguages.some(l => l.code === code)

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {/* 标签区域 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg"
            >
              {isBuiltin(code) ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <span className="text-xs font-medium">✏</span>
              )}
              <span>{getWorldLanguageName(code, language) || code}</span>
              <button
                type="button"
                onClick={() => removeLanguage(code)}
                className="text-green-400 hover:text-green-700 focus:outline-none"
                aria-label={`Remove ${code}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 下拉触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
      >
        <span className={`text-sm ${value.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
          {value.length === 0
            ? (label || 'Select languages...')
            : `${value.length} ${language === 'zh' ? '种语言已选择' : 'language(s) selected'}`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="border border-gray-200 rounded-lg shadow-lg bg-white max-h-80 overflow-hidden flex flex-col">
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'zh' ? '搜索语言...' : 'Search languages...'}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* 全选/取消 按钮 */}
          <div className="flex gap-2 px-3 py-2 border-b border-gray-100">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              {language === 'zh' ? '全选' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs px-3 py-1 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100"
            >
              {language === 'zh' ? '取消' : 'Clear'}
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="text-xs px-3 py-1 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 ml-auto"
            >
              {language === 'zh' ? '+ Other' : '+ Other'}
            </button>
          </div>

          {/* 自定义语言输入 */}
          {showCustom && (
            <div className="flex gap-2 px-3 py-2 border-b border-gray-100 bg-amber-50">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomLanguage() } }}
                placeholder={language === 'zh' ? '输入自定义语言...' : 'Enter custom language...'}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={addCustomLanguage}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600"
              >
                {language === 'zh' ? '添加' : 'Add'}
              </button>
            </div>
          )}

          {/* 语言列表（可滚动） */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                {language === 'zh' ? '未找到匹配的语言' : 'No matching languages'}
              </div>
            ) : (
              filtered.map((lang) => {
                const selected = value.includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selected ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <span className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1 text-left">{lang.name}</span>
                    <span className="text-xs text-gray-400">{lang.nativeName}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
