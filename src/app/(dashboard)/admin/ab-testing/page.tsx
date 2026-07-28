'use client'

import { useState, useEffect } from 'react'
import { BarChart, Play, Pause, Square, TrendingUp, Users, Target, Award } from 'lucide-react'

export default function AdminABTestingPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)

  const experiments = [
    { id: 'exp-1', name: '首页布局测试', status: 'running', description: '测试不同的首页布局对转化率的影响', trafficPercentage: 50, variants: 2, goals: 3 },
    { id: 'exp-2', name: 'CTA 按钮颜色', status: 'completed', description: '测试不同颜色的行动号召按钮', trafficPercentage: 30, variants: 3, goals: 2 },
    { id: 'exp-3', name: '产品列表排序', status: 'paused', description: '测试不同的产品排序算法', trafficPercentage: 20, variants: 2, goals: 4 },
  ]

  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (selectedExperiment) {
      setResults([
        { variantId: 'control', totalUsers: 1250, conversionRate: 0.032, conversions: 40, confidence: 0.85 },
        { variantId: 'treatment', totalUsers: 1180, conversionRate: 0.045, conversions: 53, confidence: 0.92 },
      ])
    }
  }, [selectedExperiment])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B 测试管理</h1>
          <p className="text-sm text-gray-600 mt-1">创建和管理 A/B 测试实验，优化网站转化率</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">活跃实验</span>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{experiments.filter(e => e.status === 'running').length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">总用户数</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">转化次数</span>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">置信度</span>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">-</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            实验列表
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedExperiment === experiment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-blue-300'
                }`}
                onClick={() => setSelectedExperiment(experiment.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{experiment.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      experiment.status === 'running' ? 'bg-green-100 text-green-800' :
                      experiment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {experiment.status === 'running' ? '进行中' : experiment.status === 'completed' ? '已完成' : '已暂停'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{experiment.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">流量: {experiment.trafficPercentage}%</span>
                  <span className="text-gray-500">变量: {experiment.variants}</span>
                  <span className="text-gray-500">目标: {experiment.goals}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedExperiment && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              实验结果: {experiments.find(e => e.id === selectedExperiment)?.name}
            </h2>
          </div>
          <div className="p-6">
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.variantId}</span>
                      <span className="text-sm text-gray-500">{result.totalUsers} 用户</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(result.conversionRate * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">转化率: {(result.conversionRate * 100).toFixed(2)}%</span>
                      <span className="text-gray-500">转化数: {result.conversions}</span>
                      {result.confidence && (
                        <span className="px-2 py-1 text-xs border rounded">
                          置信度: {(result.confidence * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无数据，开始实验以收集结果。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}