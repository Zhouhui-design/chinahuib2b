'use client'

import { useState, useEffect } from 'react'
import { Wallet, CreditCard, Banknote, Receipt, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function BuyerFinancesPage() {
  const [language, setLanguage] = useState('en')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])

  const t = {
    title: language === 'zh' ? '财务管理' : 'Finances',
    
    tabs: {
      overview: language === 'zh' ? '概览' : 'Overview',
      transactions: language === 'zh' ? '交易记录' : 'Transactions',
      paymentMethods: language === 'zh' ? '支付方式' : 'Payment Methods',
    },
    
    overview: {
      balance: language === 'zh' ? '账户余额' : 'Account Balance',
      pending: language === 'zh' ? '待处理金额' : 'Pending Amount',
      totalSpent: language === 'zh' ? '累计消费' : 'Total Spent',
      recentActivity: language === 'zh' ? '最近活动' : 'Recent Activity',
    },
    
    transactions: {
      date: language === 'zh' ? '日期' : 'Date',
      description: language === 'zh' ? '描述' : 'Description',
      amount: language === 'zh' ? '金额' : 'Amount',
      status: language === 'zh' ? '状态' : 'Status',
      filter: language === 'zh' ? '筛选' : 'Filter',
    },
    
    paymentMethods: {
      addPayment: language === 'zh' ? '添加支付方式' : 'Add Payment Method',
      cardNumber: language === 'zh' ? '卡号' : 'Card Number',
      expiryDate: language === 'zh' ? '有效期' : 'Expiry Date',
      cvv: language === 'zh' ? 'CVV' : 'CVV',
      save: language === 'zh' ? '保存' : 'Save',
    },
    
    status: {
      completed: language === 'zh' ? '已完成' : 'Completed',
      pending: language === 'zh' ? '待处理' : 'Pending',
      refunded: language === 'zh' ? '已退款' : 'Refunded',
    }
  }

  const balance = 12850.00
  const pending = 2340.00
  const totalSpent = 45678.00

  const recentTransactions = [
    { id: 1, date: '2024-01-15', description: 'Purchase from Tech Corp', amount: -2450.00, status: 'completed', type: 'expense' },
    { id: 2, date: '2024-01-14', description: 'Refund - Order #1234', amount: 150.00, status: 'completed', type: 'income' },
    { id: 3, date: '2024-01-12', description: 'Purchase from Global Supplier', amount: -5680.00, status: 'pending', type: 'expense' },
    { id: 4, date: '2024-01-10', description: 'Wallet Top-up', amount: 10000.00, status: 'completed', type: 'income' },
    { id: 5, date: '2024-01-08', description: 'Service Fee', amount: -99.00, status: 'completed', type: 'expense' },
  ]

  const paymentMethods = [
    { id: 1, type: 'visa', last4: '4242', expiry: '12/25', default: true },
    { id: 2, type: 'mastercard', last4: '5555', expiry: '06/26', default: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wallet className="w-5 h-5 mr-3" />
                {t.tabs.overview}
              </button>
              
              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                {t.tabs.transactions}
              </button>
              
              <button
                onClick={() => setActiveTab('paymentMethods')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'paymentMethods'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                {t.tabs.paymentMethods}
              </button>
            </nav>
          </aside>

          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{t.overview.balance}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${balance.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{t.overview.pending}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${pending.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{t.overview.totalSpent}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.overview.recentActivity}</h2>
                  
                  <div className="space-y-4">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : ''}${transaction.amount.toLocaleString()}
                          </p>
                          <p className={`text-sm ${transaction.status === 'completed' ? 'text-green-500' : transaction.status === 'pending' ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {transaction.status === 'completed' ? t.status.completed : transaction.status === 'pending' ? t.status.pending : t.status.refunded}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t.tabs.transactions}</h2>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>{t.transactions.filter}</option>
                    <option>{t.status.completed}</option>
                    <option>{t.status.pending}</option>
                    <option>{t.status.refunded}</option>
                  </select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t.transactions.date}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t.transactions.description}</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t.transactions.amount}</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t.transactions.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{transaction.date}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{transaction.description}</td>
                          <td className={`py-4 px-4 text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : ''}${transaction.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status === 'completed' ? t.status.completed : 
                               transaction.status === 'pending' ? t.status.pending : 
                               t.status.refunded}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'paymentMethods' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.tabs.paymentMethods}</h2>
                  
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {method.type === 'visa' ? 'Visa' : 'Mastercard'} **** **** **** {method.last4}
                            </p>
                            <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                          </div>
                        </div>
                        {method.default && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {language === 'zh' ? '默认' : 'Default'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.paymentMethods.addPayment}</h3>
                  
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.paymentMethods.cardNumber}
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.paymentMethods.expiryDate}
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.paymentMethods.cvv}
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t.paymentMethods.save}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}