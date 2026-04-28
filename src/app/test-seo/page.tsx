'use client'

import { useState } from 'react'

export default function TestSEO() {
  const [testResult, setTestResult] = useState<any[]>([])

  const runTests = async () => {
    const results: any[] = []

    // Test 1: Robots.txt
    try {
      const res = await fetch('/robots.txt')
      results.push({
        test: 'Robots.txt',
        status: res.status === 200 ? '✅ PASS' : '❌ FAIL',
        details: `Status: ${res.status}`
      })
    } catch (error: any) {
      results.push({ test: 'Robots.txt', status: '❌ FAIL', details: error.message })
    }

    // Test 2: Sitemap.xml
    try {
      const res = await fetch('/sitemap.xml')
      results.push({
        test: 'Sitemap.xml',
        status: res.status === 200 ? '✅ PASS' : '❌ FAIL',
        details: `Status: ${res.status}`
      })
    } catch (error: any) {
      results.push({ test: 'Sitemap.xml', status: '❌ FAIL', details: error.message })
    }

    // Test 3: 404 Page
    try {
      const res = await fetch('/this-page-does-not-exist-12345')
      results.push({
        test: '404 Page',
        status: res.status === 404 ? '✅ PASS' : '❌ FAIL',
        details: `Status: ${res.status}`
      })
    } catch (error: any) {
      results.push({ test: '404 Page', status: '❌ FAIL', details: error.message })
    }

    // Test 4: Dead Link API
    try {
      const res = await fetch('/api/admin/dead-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '/test-dead-link', sourceUrl: '/test' })
      })
      results.push({
        test: 'Dead Link API',
        status: res.status === 200 ? '✅ PASS' : '❌ FAIL',
        details: `Status: ${res.status}`
      })
    } catch (error: any) {
      results.push({ test: 'Dead Link API', status: '❌ FAIL', details: error.message })
    }

    // Test 5: SEO Config API
    try {
      const res = await fetch('/api/admin/seo?pagePath=/test')
      results.push({
        test: 'SEO Config API',
        status: res.status === 200 ? '✅ PASS' : '❌ FAIL',
        details: `Status: ${res.status}`
      })
    } catch (error: any) {
      results.push({ test: 'SEO Config API', status: '❌ FAIL', details: error.message })
    }

    setTestResult(results)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SEO Features Test</h1>
        
        <button
          onClick={runTests}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-6"
        >
          Run All Tests
        </button>

        {testResult.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResult.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{result.test}</span>
                    <span className="ml-3 text-sm text-gray-600">{result.details}</span>
                  </div>
                  <span className={`font-bold ${result.status.includes('PASS') ? 'text-green-600' : 'text-red-600'}`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">SEO Features Implemented</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ <strong>Robots.txt</strong> - 搜索引擎爬虫规则</li>
            <li>✅ <strong>Sitemap.xml</strong> - 站点地图自动生成</li>
            <li>✅ <strong>404 Page</strong> - 友好的错误页面（含倒计时跳转）</li>
            <li>✅ <strong>Dead Link Detection</strong> - 死链自动检测系统</li>
            <li>✅ <strong>TDK Management</strong> - Title/Description/Keywords 后台管理</li>
            <li>✅ <strong>Product Schema</strong> - 产品页结构化数据（Schema.org）</li>
            <li>✅ <strong>WebP Conversion</strong> - 自动 WebP 格式转换</li>
            <li>✅ <strong>Lazy Loading</strong> - 图片懒加载优化</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
