'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Video, FileText, MessageCircle, ExternalLink } from 'lucide-react'

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    { id: 'getting-started', label: '快速入门', icon: BookOpen },
    { id: 'video-tutorials', label: '视频教程', icon: Video },
    { id: 'api-docs', label: 'API 文档', icon: FileText },
    { id: 'faq', label: '常见问题', icon: MessageCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">帮助指南</h1>
        <p className="text-sm text-gray-600 mt-1">管理后台使用说明和常见问题解答</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeSection === section.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeSection === 'getting-started' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">快速入门</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900">1. 登录管理后台</h3>
                <p className="text-sm text-blue-700 mt-1">使用管理员账号登录后，系统会自动跳转到管理后台首页。</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900">2. 审核待处理事项</h3>
                <p className="text-sm text-green-700 mt-1">从侧边栏导航进入各个管理模块，审核支付凭证、组织信息、拍卖列表等。</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-900">3. 管理产品分类</h3>
                <p className="text-sm text-yellow-700 mt-1">在"分类管理"中创建和维护五级产品分类体系。</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'video-tutorials' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">视频教程</h2>
            <p className="text-gray-600">即将推出，敬请期待。</p>
          </div>
        )}

        {activeSection === 'api-docs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">API 文档</h2>
            <a
              href="/api-docs"
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              查看完整 API 文档
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">常见问题</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">如何添加新的产品分类？</h3>
                <p className="text-sm text-gray-600 mt-1">进入"分类管理"页面，点击"添加分类"按钮，填写分类信息后保存即可。</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">如何审核支付凭证？</h3>
                <p className="text-sm text-gray-600 mt-1">进入"支付审核"页面，查看待审核的支付凭证，点击"批准"或"拒绝"完成审核。</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}