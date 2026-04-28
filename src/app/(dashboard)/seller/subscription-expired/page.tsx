'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SubscriptionExpiredPage() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const gracePeriodExpired = searchParams.get('grace') === 'expired';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {language === 'zh' ? '订阅已过期' : 'Subscription Expired'}
        </h1>

        {/* Message */}
        <div className="mb-6">
          {gracePeriodExpired ? (
            <>
              <p className="text-gray-600 mb-4">
                {language === 'zh' 
                  ? '您的订阅已过期超过3个月,账户已被暂停。如需恢复服务,请联系管理员。' 
                  : 'Your subscription has expired for more than 3 months and your account has been suspended. Please contact the administrator to restore service.'}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-red-900 mb-1">
                      {language === 'zh' ? '需要人工处理' : 'Manual Action Required'}
                    </div>
                    <p className="text-sm text-red-800">
                      {language === 'zh' 
                        ? '由于超过宽限期,您需要联系管理员手动重新激活账户。' 
                        : 'Since the grace period has expired, you need to contact the administrator to manually reactivate your account.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                {language === 'zh' 
                  ? '您的订阅已过期。在3个月的宽限期内,您仍可以访问商家后台,但您的店铺对买家不可见。' 
                  : 'Your subscription has expired. During the 3-month grace period, you can still access the seller portal, but your store is not visible to buyers.'}
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-yellow-900 mb-1">
                      {language === 'zh' ? '宽限期说明' : 'Grace Period Info'}
                    </div>
                    <p className="text-sm text-yellow-800">
                      {language === 'zh' 
                        ? '您还有3个月的时间续费。超过此期限后,账户将被暂停。' 
                        : 'You have 3 months to renew. After this period, your account will be suspended.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-900">
            <strong>{language === 'zh' ? '联系方式:' : 'Contact: '}</strong>
            admin@chinahuib2b.top
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${language}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            {language === 'zh' ? '返回首页' : 'Go to Homepage'}
          </Link>
          {!gracePeriodExpired && (
            <Link
              href={`/${language}/seller/dashboard`}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              {language === 'zh' ? '进入仪表板' : 'Access Dashboard'}
            </Link>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {language === 'zh' 
            ? '需要帮助?请联系我们的支持团队' 
            : 'Need help? Contact our support team'}
        </div>
      </div>
    </div>
  );
}
