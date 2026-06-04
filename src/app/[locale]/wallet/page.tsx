'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { dictionaries } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'
import { Wallet, CreditCard, Banknote, ArrowUpRight, ArrowDownLeft, Clock, Filter, Search, RefreshCw, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Wallet as WalletIcon, History, Plus, Minus } from 'lucide-react'

type WalletData = {
  id: string
  userId: string
  balance: number
  holdAmount: number
  totalEarned: number
  totalSpent: number
  currency: string
  isActive: boolean
  lastActivity: string
  createdAt: string
  transactions: Transaction[]
}

type Transaction = {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'EARNING' | 'REFUND' | 'FEE' | 'TRANSFER'
  amount: number
  currency: string
  balanceBefore: number
  balanceAfter: number
  description: string
  category: string | null
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
}

type PaymentGateway = 'ALIPAY' | 'WECHAT' | 'WORLDFIRST' | 'MANUAL'

const typeLabels: Record<string, { label: string; icon: typeof TrendingUp; color: string; bgColor: string }> = {
  DEPOSIT: { label: 'Deposit', icon: ArrowDownLeft, color: 'text-green-600', bgColor: 'bg-green-50' },
  WITHDRAWAL: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-red-600', bgColor: 'bg-red-50' },
  PURCHASE: { label: 'Purchase', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  EARNING: { label: 'Earning', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
  REFUND: { label: 'Refund', icon: Minus, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  FEE: { label: 'Fee', icon: Minus, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  TRANSFER: { label: 'Transfer', icon: Banknote, color: 'text-purple-600', bgColor: 'bg-purple-50' },
}

const statusLabels: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  SUCCESS: { label: 'Success', icon: CheckCircle, color: 'text-green-600' },
  FAILED: { label: 'Failed', icon: XCircle, color: 'text-red-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-gray-600' },
  REFUNDED: { label: 'Refunded', icon: Minus, color: 'text-yellow-600' },
}

const gatewayLabels: Record<string, { label: string; icon: string }> = {
  ALIPAY: { label: '支付宝', icon: '📱' },
  WECHAT: { label: '微信支付', icon: '💬' },
  WORLDFIRST: { label: 'WorldFirst', icon: '🌍' },
  MANUAL: { label: 'Bank Transfer', icon: '🏦' },
}

export default function WalletPage() {
  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en
  
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositGateway, setDepositGateway] = useState<PaymentGateway>('ALIPAY')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [withdrawalGateway, setWithdrawalGateway] = useState<PaymentGateway>('WORLDFIRST')

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/wallet')
      if (!response.ok) {
        throw new Error('Failed to fetch wallet')
      }
      const data = await response.json()
      setWallet(data)
      setTransactions(data.transactions || [])
    } catch (err) {
      setError('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const url = new URL('/api/wallet/transactions', window.location.origin)
      if (filterType !== 'all') {
        url.searchParams.set('type', filterType)
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error('Failed to fetch transactions')
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filterType])

  const filteredTransactions = transactions.filter(t => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return t.description.toLowerCase().includes(query) ||
             t.category?.toLowerCase().includes(query) ||
             t.type.toLowerCase().includes(query)
    }
    return true
  })

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      const response = await fetch('/api/payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          gateway: depositGateway,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create payment proof')
      }
      
      setShowDepositModal(false)
      setDepositAmount('')
      await fetchWallet()
    } catch (err) {
      setError('Failed to create deposit request')
    }
  }

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (wallet && parseFloat(withdrawalAmount) > wallet.balance) {
      setError('Insufficient balance')
      return
    }

    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          gateway: withdrawalGateway,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create withdrawal request')
      }
      
      setShowWithdrawalModal(false)
      setWithdrawalAmount('')
      await fetchWallet()
    } catch (err) {
      setError('Failed to create withdrawal request')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={fetchWallet}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <WalletIcon className="w-8 h-8 text-blue-600" />
            {dict.wallet?.title || 'My Wallet'}
          </h1>
          <p className="text-gray-600 mt-2">
            {dict.wallet?.description || 'Manage your funds, view transactions, and more.'}
          </p>
        </div>

        {/* Wallet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{dict.wallet?.availableBalance || 'Available Balance'}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {wallet ? formatCurrency(wallet.balance) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{dict.wallet?.onHold || 'On Hold'}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {wallet ? formatCurrency(wallet.holdAmount) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{dict.wallet?.totalEarned || 'Total Earned'}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {wallet ? formatCurrency(wallet.totalEarned) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{dict.wallet?.totalSpent || 'Total Spent'}</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {wallet ? formatCurrency(wallet.totalSpent) : '$0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            {dict.wallet?.deposit || 'Deposit Funds'}
          </button>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Minus className="w-5 h-5" />
            {dict.wallet?.withdraw || 'Withdraw Funds'}
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              {dict.wallet?.transactionHistory || 'Transaction History'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={dict.wallet?.searchTransactions || 'Search transactions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{dict.wallet?.all || 'All'}</option>
                <option value="DEPOSIT">{dict.wallet?.deposit || 'Deposit'}</option>
                <option value="WITHDRAWAL">{dict.wallet?.withdrawal || 'Withdrawal'}</option>
                <option value="PURCHASE">{dict.wallet?.purchase || 'Purchase'}</option>
                <option value="EARNING">{dict.wallet?.earning || 'Earning'}</option>
              </select>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{dict.wallet?.noTransactions || 'No transactions found.'}</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const typeConfig = typeLabels[transaction.type]
                const statusConfig = statusLabels[transaction.status]
                const TypeIcon = typeConfig.icon
                const StatusIcon = statusConfig.icon
                
                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${typeConfig.bgColor} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${typeConfig.bgColor} flex items-center justify-center`}>
                        <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">{typeConfig.label}</span>
                          {transaction.category && (
                            <span className="text-sm text-gray-400">| {transaction.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'DEPOSIT' || transaction.type === 'EARNING' ? 'text-green-600' : 'text-gray-900'}`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'EARNING' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-xs ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{dict.wallet?.deposit || 'Deposit Funds'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dict.wallet?.amount || 'Amount'} (USD)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dict.wallet?.paymentMethod || 'Payment Method'}
                </label>
                <select
                  value={depositGateway}
                  onChange={(e) => setDepositGateway(e.target.value as PaymentGateway)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(gatewayLabels).map(([key, value]) => (
                    <option key={key} value={key}>{value.icon} {value.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {dict.wallet?.depositNote || 'After submitting, please upload your payment proof for verification.'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {dict.wallet?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {dict.wallet?.submit || 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{dict.wallet?.withdraw || 'Withdraw Funds'}</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  {dict.wallet?.availableBalance || 'Available Balance'}: {wallet ? formatCurrency(wallet.balance) : '$0.00'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dict.wallet?.amount || 'Amount'} (USD)
                </label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="0.00"
                  max={wallet?.balance}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dict.wallet?.withdrawalMethod || 'Withdrawal Method'}
                </label>
                <select
                  value={withdrawalGateway}
                  onChange={(e) => setWithdrawalGateway(e.target.value as PaymentGateway)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(gatewayLabels).map(([key, value]) => (
                    <option key={key} value={key}>{value.icon} {value.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  {dict.wallet?.withdrawalNote || 'Withdrawals are processed within 1-3 business days.'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {dict.wallet?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleWithdrawal}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {dict.wallet?.submit || 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}