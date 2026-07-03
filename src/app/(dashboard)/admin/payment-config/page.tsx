'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Check, AlertCircle, CreditCard, Banknote, QrCode } from 'lucide-react'

export default function PaymentConfigPage() {
  const [config, setConfig] = useState({
    enabled: true,
    feeRate: 0.0001,
    minFee: 0.01,
    qrCodeWeChat: '',
    qrCodeAlipay: '',
    qrCodePaypal: '',
    bankAccount: '',
    bankName: '',
    bankSwift: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/admin/payment-config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch payment config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save payment config:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-600" />
          收款配置管理
        </h1>
        <p className="mt-2 text-gray-600">管理平台服务费收取规则和收款方式</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              服务费设置
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-6 h-6 ${config.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">收款功能</p>
                    <p className="text-sm text-gray-500">
                      {config.enabled ? '开启后用户发布列表时需要支付服务费' : '关闭后用户发布列表无需支付服务费'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    拍卖行手续费比例（%）
                  </label>
                  <input
                    type="number"
                    value={(config.feeRate * 100).toFixed(4)}
                    onChange={(e) => setConfig({ ...config, feeRate: parseFloat(e.target.value) / 100 })}
                    min="0"
                    max="100"
                    step="0.0001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    当前比例：{config.enabled ? `${(config.feeRate * 100).toFixed(4)}%` : '已禁用'}
                    <br />
                    <span className="text-gray-400">
                      示例：设置 0.001% 表示收取货款金额的万分之一；0.002% 表示万分之二
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最低手续费
                  </label>
                  <input
                    type="number"
                    value={config.minFee}
                    onChange={(e) => setConfig({ ...config, minFee: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    当计算结果小于此值时，按此值收取
                    <br />
                    <span className="text-gray-400">
                      手续费货币与卖家选择的交易货币一致（如卖家选美元则为0.01美元）
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gray-600" />
              收款码配置
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💳 微信支付收款码
                </label>
                <input
                  type="text"
                  value={config.qrCodeWeChat}
                  onChange={(e) => setConfig({ ...config, qrCodeWeChat: e.target.value })}
                  placeholder="请输入微信收款码图片URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔷 支付宝收款码
                </label>
                <input
                  type="text"
                  value={config.qrCodeAlipay}
                  onChange={(e) => setConfig({ ...config, qrCodeAlipay: e.target.value })}
                  placeholder="请输入支付宝收款码图片URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌐 PayPal 收款码
                </label>
                <input
                  type="text"
                  value={config.qrCodePaypal}
                  onChange={(e) => setConfig({ ...config, qrCodePaypal: e.target.value })}
                  placeholder="请输入PayPal收款码图片URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-gray-600" />
              银行转账信息
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  银行名称
                </label>
                <input
                  type="text"
                  value={config.bankName}
                  onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                  placeholder="请输入银行名称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  银行账户
                </label>
                <input
                  type="text"
                  value={config.bankAccount}
                  onChange={(e) => setConfig({ ...config, bankAccount: e.target.value })}
                  placeholder="请输入银行账号"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SWIFT 代码
                </label>
                <input
                  type="text"
                  value={config.bankSwift}
                  onChange={(e) => setConfig({ ...config, bankSwift: e.target.value })}
                  placeholder="请输入SWIFT代码（可选）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {saving ? '保存中...' : '保存配置'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}