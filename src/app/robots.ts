import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/seller/',
          '/buyer/',
          '/api/',
          '/_next/',
          '/chat/private/',
          '/chat-system/private/',
          '/*/chat/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'BingBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'YouBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 2,
      },
      {
        userAgent: 'AI21Bot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'HuggingFaceBot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/buyer/', '/api/', '/chat/private/', '/chat-system/private/'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://x2xhub.com/sitemap.xml',
  }
}
