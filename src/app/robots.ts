import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products/',
          '/stores/',
          '/en/',
          '/zh/',
          '/ar/',
          '/es/',
          '/fr/',
          '/de/',
          '/ru/',
          '/ja/',
          '/ko/',
          '/pt/',
          '/hi/',
          '/tr/',
          '/th/',
          '/id/',
          '/vi/',
        ],
        disallow: [
          '/admin/',
          '/seller/',
          '/buyer/',
          '/api/',
          '/_next/',
        ],
      },
      // AI-Specific Crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'BingBot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'YouBot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'AI21Bot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'HuggingFaceBot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://chinahuib2b.top/sitemap.xml',
  }
}
