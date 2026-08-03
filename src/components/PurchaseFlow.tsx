'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart, CreditCard, Truck, CheckCircle, AlertCircle, Package, Shield, Globe, Building } from 'lucide-react'

interface PurchaseFlowProps {
  listing: any
  onClose: () => void
  locale: string
}

type PurchaseStep = 'quantity' | 'shipping' | 'payment' | 'processing' | 'success' | 'error'

const CLIENT_PAYMENT_METHODS = [
  { method: 'STRIPE', name: 'Credit Card (Stripe)', description: 'Visa, Mastercard, Apple Pay, Google Pay', icon: '💳' },
  { method: 'PAYPAL', name: 'PayPal', description: 'Pay with your PayPal account balance', icon: '🅿️' },
  { method: 'ALIPAY', name: 'Alipay', description: 'Pay with Alipay (China, Asia)', icon: '🅰️' },
  { method: 'WECHAT', name: 'WeChat Pay', description: 'Pay with WeChat wallet', icon: '💚' },
  { method: 'WORLD_FIRST', name: 'WorldFirst', description: 'International money transfer', icon: '🌍' },
  { method: 'BANK_TRANSFER', name: 'Bank Transfer (T/T)', description: 'Wire transfer to platform account', icon: '🏦' },
  { method: 'CRYPTO', name: 'Crypto (USDT)', description: 'Pay with USDT or other crypto', icon: '₿' },
]

export default function PurchaseFlow({ listing, onClose, locale }: PurchaseFlowProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<PurchaseStep>('quantity')
  const [quantity, setQuantity] = useState(listing.minOrderQty || 1)
  const [shippingMethod, setShippingMethod] = useState<string>('FOB')
  const [portOfLoading, setPortOfLoading] = useState(listing.portOfLoading || '')
  const [portOfDestination, setPortOfDestination] = useState('')
  const [purposePort, setPurposePort] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [orderId, setOrderId] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successData, setSuccessData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableStock = Math.max(0, (listing.stockQuantity || 0) - (listing.soldQuantity || 0))
  const unitPrice = listing.price?.toNumber() ?? 0
  const totalAmount = unitPrice * quantity

  const paymentMethods = CLIENT_PAYMENT_METHODS

  const shippingOptions = [
    { value: 'FOB', label: 'FOB - Free On Board', desc: 'Seller loads onto ship at origin port. Buyer arranges & pays for shipping.', icon: '🚢' },
    { value: 'CIF', label: 'CIF - Cost, Insurance, Freight', desc: 'Seller pays for shipping and insurance to destination port.', icon: '🛡️' },
    { value: 'EXW', label: 'EXW - Ex Works', desc: 'Buyer picks up goods at seller factory/warehouse.', icon: '🏭' },
    { value: 'DAP', label: 'DAP - Delivered At Place', desc: 'Seller delivers to named destination. Buyer unloads.', icon: '📦' },
  ]

  const validateQuantity = (): string | null => {
    if (quantity <= 0) return 'Quantity must be greater than 0'
    if (quantity > availableStock) return `Only ${availableStock} units available in stock`
    if (listing.minOrderQty && quantity < listing.minOrderQty) return `Minimum order quantity is ${listing.minOrderQty}`
    if (listing.maxOrderQty && quantity > listing.maxOrderQty) return `Maximum order quantity is ${listing.maxOrderQty}`
    return null
  }

  const handleContinueToShipping = () => {
    const error = validateQuantity()
    if (error) {
      setErrorMsg(error)
      return
    }
    setErrorMsg('')
    setStep('shipping')
  }

  const handleContinueToPayment = () => {
    if (shippingMethod === 'FOB' && !portOfDestination && !purposePort) {
      setErrorMsg('Please enter your destination port or contact our freight forwarder')
      return
    }
    setErrorMsg('')
    setStep('payment')
  }

  const handleCreateOrder = async () => {
    if (!paymentMethod) {
      setErrorMsg('Please select a payment method')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')
    setStep('processing')

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          quantity,
          shippingMethod,
          portOfLoading,
          portOfDestination: portOfDestination || purposePort,
          buyerNote: '',
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        if (orderData.code === 'STOCK_CONFLICT') {
          setErrorMsg('⚠️ Stock conflict! Another buyer has purchased some of the stock. Please refresh and try again with a different quantity.')
        } else {
          setErrorMsg(orderData.error || 'Failed to create order')
        }
        setStep('error')
        setIsSubmitting(false)
        return
      }

      const newOrderId = orderData.data.id
      setOrderId(newOrderId)

      const payRes = await fetch(`/api/orders/${newOrderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
        }),
      })

      const payData = await payRes.json()

      if (!payRes.ok) {
        setErrorMsg(payData.error || 'Payment failed')
        setStep('error')
        setIsSubmitting(false)
        return
      }

      setSuccessData({
        orderId: newOrderId,
        totalAmount,
        currency: listing.currency,
        quantity,
        listingTitle: listing.title,
        paymentMethod,
        escrowId: payData.escrow?.id,
        shippingMethod,
        portOfLoading: portOfLoading || listing.portOfLoading,
        portOfDestination: portOfDestination || purposePort,
      })
      setStep('success')
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.')
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            {step === 'quantity' && 'Step 1: Select Quantity'}
            {step === 'shipping' && 'Step 2: Shipping Method'}
            {step === 'payment' && 'Step 3: Payment'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Order Confirmed!'}
            {step === 'error' && 'Error'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {step === 'quantity' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-bold text-lg mb-2">{listing.title}</h3>
                {listing.price > 0 && (
                  <p className="text-3xl font-bold text-green-400">
                    {listing.currency} {Number(listing.price).toLocaleString()}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className="bg-blue-600/20 border border-blue-600/40 text-blue-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Stock: {availableStock} {listing.unitId || 'pcs'}
                  </span>
                  {listing.minOrderQty && (
                    <span className="text-gray-400 text-sm">MOQ: {listing.minOrderQty}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white font-bold mb-2 block">Quantity to Purchase</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xl font-bold transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={availableStock}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xl font-bold transition"
                  >
                    +
                  </button>
                </div>
                {availableStock <= 10 && (
                  <p className="text-yellow-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Only {availableStock} units left in stock!
                  </p>
                )}
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Unit Price</span>
                  <span>{listing.currency} {Number(unitPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Quantity</span>
                  <span>× {quantity}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">{listing.currency} {Number(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-600/20 border border-red-600/40 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleContinueToShipping}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold transition text-lg"
              >
                Continue to Shipping →
              </button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Select Shipping Method
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {shippingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setShippingMethod(opt.value)}
                      className={`p-4 rounded-lg text-left transition ${
                        shippingMethod === opt.value
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-gray-600 border-2 border-transparent hover:bg-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="text-white font-bold">{opt.label}</p>
                          <p className="text-gray-300 text-sm">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {shippingMethod === 'FOB' && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Globe className="w-4 h-4" />
                    FOB Trade Details
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Loading Port (from listing)</label>
                      <input
                        type="text"
                        value={portOfLoading}
                        onChange={(e) => setPortOfLoading(e.target.value)}
                        placeholder="e.g. Shanghai Port"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Destination Port *</label>
                      <input
                        type="text"
                        value={portOfDestination}
                        onChange={(e) => setPortOfDestination(e.target.value)}
                        placeholder="e.g. Los Angeles Port"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Need help with shipping? Contact our platform freight forwarder for a quote.
                    </p>
                    <input
                      type="text"
                      value={purposePort}
                      onChange={(e) => setPurposePort(e.target.value)}
                      placeholder="Or enter your destination port here..."
                      className="w-full mt-2 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-600/20 border border-red-600/40 rounded-lg p-3 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('quantity'); setErrorMsg('') }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinueToPayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold transition"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Item</span>
                  <span className="text-white">{listing.title}</span>
                </div>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Shipping</span>
                  <span className="text-white">{shippingMethod}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between text-xl font-bold">
                  <span className="text-white">Total Due</span>
                  <span className="text-green-400">{listing.currency} {Number(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Choose Payment Method
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.method}
                      onClick={() => setPaymentMethod(pm.method)}
                      className={`p-3 rounded-lg text-left transition flex items-center gap-3 ${
                        paymentMethod === pm.method
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-gray-700 border-2 border-transparent hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold">{pm.name}</p>
                        <p className="text-gray-300 text-xs">{pm.description}</p>
                      </div>
                      {paymentMethod === pm.method && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your payment is held in escrow by the platform. Funds are released to the seller only after you confirm receipt of goods.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-600/20 border border-red-600/40 rounded-lg p-3 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('shipping'); setErrorMsg('') }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 text-white rounded-lg font-bold transition text-lg"
                >
                  {isSubmitting ? 'Processing...' : `Pay ${listing.currency} ${Number(totalAmount).toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Your Payment...</h3>
              <p className="text-gray-400">Please wait while we confirm your payment and create the order.</p>
              <p className="text-gray-500 text-sm mt-4">Do not close this page.</p>
            </div>
          )}

          {step === 'success' && successData && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
              <p className="text-green-400 mb-6">Payment received. Funds held in escrow.</p>

              <div className="bg-gray-700 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-white font-mono text-sm">{successData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Item:</span>
                  <span className="text-white">{successData.listingTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white">{successData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid:</span>
                  <span className="text-green-400 font-bold">{successData.currency} {Number(successData.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping:</span>
                  <span className="text-white">{successData.shippingMethod}</span>
                </div>
                {successData.portOfLoading && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">From Port:</span>
                    <span className="text-white">{successData.portOfLoading}</span>
                  </div>
                )}
                {successData.portOfDestination && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">To Port:</span>
                    <span className="text-white">{successData.portOfDestination}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mt-4 text-left">
                <p className="text-blue-400 text-sm">
                  📋 <strong>Next Steps:</strong><br />
                  1. Seller will be notified to ship within 48 hours<br />
                  2. You can track order status in your profile<br />
                  3. Once received, confirm delivery to release payment<br />
                  4. Contact platform freight forwarder if needed
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
              >
                Done
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
              <p className="text-red-400 mb-6">{errorMsg}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('quantity'); setErrorMsg('') }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  Start Over
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
