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
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'BingBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'YouBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 2,
      },
      {
        userAgent: 'AI21Bot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'HuggingFaceBot',
        allow: ['/', '/products/', '/stores/'],
        disallow: ['/chat/', '/chat-system/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://chinahuib2b.top/sitemap.xml',
  }
}
