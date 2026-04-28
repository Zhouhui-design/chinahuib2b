import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
};

export default async function SubscriptionRequiredPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'zh' ? '需要充值才能访问商家后台' : 'Subscription Required'}
          </h1>
          <p className="text-gray-600">
            {locale === 'zh' 
              ? '请完成充值以激活您的商家账户' 
              : 'Please complete payment to activate your seller account'}
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">
            {locale === 'zh' ? '充值要求' : 'Payment Requirements'}
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                {locale === 'zh' ? '最低充值金额：$10 USD' : 'Minimum payment: $10 USD'}
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                {locale === 'zh' ? '有效期：1 年' : 'Validity period: 1 year'}
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                {locale === 'zh' ? '自动续费提醒' : 'Auto-renewal reminders'}
              </span>
            </li>
          </ul>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            {locale === 'zh' ? '商家权益' : 'Seller Benefits'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              locale === 'zh' ? '店铺展示在参展商列表' : 'Store listed in exhibitors',
              locale === 'zh' ? '上传产品手册 PDF' : 'Upload product brochures',
              locale === 'zh' ? '接收买家询盘' : 'Receive buyer inquiries',
              locale === 'zh' ? '自定义店铺页面' : 'Customize store page',
              locale === 'zh' ? '查看访问统计' : 'View analytics',
              locale === 'zh' ? '优先客户支持' : 'Priority support',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Options */}
        <div className="border-t pt-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            {locale === 'zh' ? '选择支付方式' : 'Choose Payment Method'}
          </h3>
          
          <div className="space-y-4">
            {/* Alipay QR Code Payment */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.422 15.358c-1.022-.422-2.134-.667-3.289-.667-2.156 0-4.156 1.156-5.133 3.022-.222.422-.667.667-1.133.667s-.911-.244-1.133-.667c-.978-1.867-2.978-3.022-5.133-3.022-1.156 0-2.267.244-3.289.667C1.422 15.758.5 16.756.5 18c0 1.656 1.344 3 3 3h17c1.656 0 3-1.344 3-3 0-1.244-.922-2.244-2.078-2.642zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                  <span className="text-xl font-bold text-blue-600">支付宝支付</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'zh' 
                    ? '请使用支付宝扫描二维码完成支付' 
                    : 'Scan QR code with Alipay to complete payment'}
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                  <img 
                    src="/alipay-qrcode.jpg" 
                    alt="Alipay Payment QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">1</span>
                    <span>
                      {locale === 'zh' ? '打开支付宝 App' : 'Open Alipay App'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">2</span>
                    <span>
                      {locale === 'zh' ? '点击"扫一扫"功能' : 'Tap "Scan" function'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">3</span>
                    <span>
                      {locale === 'zh' ? '扫描上方二维码' : 'Scan the QR code above'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">4</span>
                    <span>
                      {locale === 'zh' ? '输入金额 $10 USD（约 ¥72 CNY）' : 'Enter amount: $10 USD (≈ ¥72 CNY)'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">5</span>
                    <span>
                      {locale === 'zh' ? '完成支付后，截图发送给客服' : 'After payment, send screenshot to customer service'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <strong>{locale === 'zh' ? '重要提示：' : 'Important: '}</strong>
                    {locale === 'zh' 
                      ? '支付完成后，请点击下方按钮提交付款凭证，我们将在 24 小时内激活您的账户。' 
                      : 'After payment, please click the button below to submit your payment proof. We will activate your account within 24 hours.'}
                  </div>
                </div>
              </div>

              {/* Submit Proof Button */}
              <Link
                href={`/${locale}/seller/submit-payment-proof`}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors block"
              >
                {locale === 'zh' ? ' 提交付款凭证' : ' Submit Payment Proof'}
              </Link>
            </div>

            {/* Stripe Option - Coming Soon */}
            <button
              disabled
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-xs">Stripe</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Credit Card / PayPal</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, AMEX</div>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {locale === 'zh' ? '即将推出' : 'Coming Soon'}
              </span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${locale}/seller/dashboard`}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            {locale === 'zh' ? '返回仪表板' : 'Back to Dashboard'}
          </Link>
          <Link
            href={`/${locale}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            {locale === 'zh' ? '返回首页' : 'Go to Homepage'}
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {locale === 'zh' 
            ? '有问题？请联系我们的支持团队' 
            : 'Have questions? Contact our support team'}
        </div>
      </div>
    </div>
  );
}
