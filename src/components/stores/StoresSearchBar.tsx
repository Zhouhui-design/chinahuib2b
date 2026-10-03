'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface StoresSearchBarProps {
  placeholder?: string
  buttonText?: string
}

export default function StoresSearchBar({ placeholder = '搜索公司、产品、展会、关键词…', buttonText = '搜索' }: StoresSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initial = searchParams.get('search') || ''
  const [value, setValue] = useState(initial)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const keyword = value.trim()
    // 搜索时重置到第 1 页
    if (keyword) {
      router.push(`?search=${encodeURIComponent(keyword)}`)
    } else {
      router.push('?')
    }
  }

  const clear = () => {
    setValue('')
    router.push('?')
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {value && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="清除"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}
