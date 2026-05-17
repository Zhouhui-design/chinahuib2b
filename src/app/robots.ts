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
          '/chat/',           // Chat system - STRICTLY PRIVATE
          '/chat-system/',    // Chat system alternative path
          '/*/chat/',         // All language versions of chat
          '/*/chat-system/',  // All language versions of chat-system
        ],
      },
      // AI-Specific Crawlers - EXCLUDE CHAT SYSTEM
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'BingBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'YouBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 2,
      },
      {
        userAgent: 'AI21Bot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'HuggingFaceBot',
        allow: '/',
        disallow: ['/chat/', '/chat-system/', '/*/chat/', '/*/chat-system/'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://chinahuib2b.top/sitemap.xml',
  }
}
