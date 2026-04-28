import { getDictionary } from "@/locales/dictionary";
import type { LanguageCode } from "@/lib/languages";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams: Promise<{ grace?: string }>;
};

export default async function SubscriptionExpiredPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { grace } = await searchParams;
  const dict = await getDictionary(locale);

  const isGracePeriodExpired = grace === 'expired';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isGracePeriodExpired ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <svg
              className={`w-8 h-8 ${isGracePeriodExpired ? 'text-red-600' : 'text-yellow-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isGracePeriodExpired 
              ? (locale === 'zh' ? '订阅已过期' : 'Subscription Expired')
              : (locale === 'zh' ? '订阅即将过期' : 'Subscription Expiring Soon')}
          </h1>
          <p className="text-gray-600">
            {isGracePeriodExpired
              ? (locale === 'zh' 
                  ? '您的商家订阅已超过宽限期' 
                  : 'Your seller subscription has exceeded the grace period')
              : (locale === 'zh' 
                  ? '您的商家订阅已过期，但仍在宽限期内' 
                  : 'Your seller subscription has expired but is still in grace period')}
          </p>
        </div>

        {/* Status Info */}
        <div className={`border-l-4 p-4 mb-6 ${
          isGracePeriodExpired 
            ? 'bg-red-50 border-red-500' 
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <h2 className={`font-semibold mb-2 ${
            isGracePeriodExpired ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isGracePeriodExpired 
              ? (locale === 'zh' ? '当前状态' : 'Current Status')
              : (locale === 'zh' ? '宽限期状态' : 'Grace Period Status')}
          </h2>
          
          {isGracePeriodExpired ? (
            <div className="space-y-2">
              <p className={isGracePeriodExpired ? 'text-red-800' : 'text-yellow-800'}>
                {locale === 'zh' 
                  ? '❌ 您的订阅已过期超过 3 个月' 
                  : '❌ Your subscription has expired for more than 3 months'}
              </p>
              <p className={isGracePeriodExpired ? 'text-red-800' : 'text-yellow-800'}>
                {locale === 'zh' 
                  ? '❌ 店铺已从参展商列表中隐藏' 
                  : '❌ Your store has been hidden from exhibitors list'}
              </p>
              <p className={isGracePeriodExpired ? 'text-red-800' : 'text-yellow-800'}>
                {locale === 'zh' 
                  ? '❌ 无法访问商家后台' 
                  : '❌ Seller dashboard access is restricted'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-800">
                {locale === 'zh' 
                  ? '⚠️ 您的订阅已过期，但仍在 3 个月宽限期内' 
                  : '⚠️ Your subscription has expired but you are within the 3-month grace period'}
              </p>
              <p className="text-yellow-800">
                {locale === 'zh' 
                  ? '⚠️ 店铺对买家不可见' 
                  : '⚠️ Your store is not visible to buyers'}
              </p>
              <p className="text-green-700 font-medium">
                {locale === 'zh' 
                  ? '✅ 您仍可以访问商家后台进行续费' 
                  : '✅ You can still access the seller dashboard to renew'}
              </p>
            </div>
          )}
        </div>

        {/* What Happens */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            {locale === 'zh' ? '影响说明' : 'What This Means'}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {locale === 'zh' ? '店铺可见性' : 'Store Visibility'}
                </div>
                <p className="text-sm text-gray-600">
                  {locale === 'zh' 
                    ? '您的店铺不会显示在参展商列表和产品搜索中' 
                    : 'Your store will not appear in exhibitors list or product searches'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {locale === 'zh' ? '数据保留' : 'Data Retention'}
                </div>
                <p className="text-sm text-gray-600">
                  {locale === 'zh' 
                    ? '您的所有数据（产品、手册、询盘）都会被保留' 
                    : 'All your data (products, brochures, inquiries) will be retained'}
                </p>
              </div>
            </div>

            {!isGracePeriodExpired && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">
                    {locale === 'zh' ? '宽限期倒计时' : 'Grace Period Countdown'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {locale === 'zh' 
                      ? '您还有不到 3 个月的时间来续费，否则将失去访问权限' 
                      : 'You have less than 3 months to renew before losing access'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Renewal Options */}
        <div className="border-t pt-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            {locale === 'zh' ? '如何恢复' : 'How to Restore'}
          </h3>
          
          <div className="space-y-3">
            {/* Contact Admin */}
            <div className="p-4 border-2 border-blue-300 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <div className="font-medium text-blue-900 mb-1">
                    {locale === 'zh' ? '联系管理员续费' : 'Contact Admin to Renew'}
                  </div>
                  <p className="text-sm text-blue-800 mb-2">
                    {locale === 'zh' 
                      ? '支付功能开发中。请联系管理员手动续费。' 
                      : 'Payment integration is under development. Please contact admin to renew manually.'}
                  </p>
                  <div className="text-sm text-blue-700">
                    <strong>Email:</strong> admin@chinahuib2b.top
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-900">
                  {locale === 'zh' ? '续费价格' : 'Renewal Price'}
                </span>
                <span className="text-2xl font-bold text-green-700">$10</span>
              </div>
              <p className="text-sm text-green-800">
                {locale === 'zh' ? '有效期：1 年' : 'Validity: 1 year'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isGracePeriodExpired && (
            <Link
              href="/seller"
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              {locale === 'zh' ? '前往仪表板' : 'Go to Dashboard'}
            </Link>
          )}
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
            ? '需要帮助？请联系我们的支持团队' 
            : 'Need help? Contact our support team'}
        </div>
      </div>
    </div>
  );
}
