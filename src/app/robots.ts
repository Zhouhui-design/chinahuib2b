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
          '/chat/public/',       // 允许公开频道
          '/chat/community/',    // 允许社区讨论
        ],
        disallow: [
          '/admin/',
          '/seller/',
          '/buyer/',
          '/api/',
          '/_next/',
          '/chat/private/',      // 禁止私人对话
          '/chat-system/private/', // 禁止私人对话系统
          '/*/chat/private/',     // 所有语言的私人对话
        ],
      },
      // AI-Specific Crawlers - ALLOW PUBLIC CHAT, BLOCK PRIVATE CHAT
      {
        userAgent: 'GPTBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'BingBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'msnbot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'YouBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 2,
      },
      {
        userAgent: 'AI21Bot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'HuggingFaceBot',
        allow: ['/', '/products/', '/stores/', '/chat/public/', '/chat/community/'],
        disallow: ['/chat/private/', '/chat-system/private/', '/admin/', '/seller/', '/buyer/', '/api/'],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://x2xhub.com/sitemap.xml',
  }
}
