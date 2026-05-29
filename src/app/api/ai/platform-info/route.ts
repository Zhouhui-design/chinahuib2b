import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'China Hui B2B',
    version: '1.0.0',
    status: 'online',
    description: {
      zh: '中国最大的B2B电子商务平台，连接全球买家和卖家',
      en: 'China\'s largest B2B e-commerce platform connecting global buyers and sellers',
      ja: '中国最大のB2B電子商取引プラットフォーム、世界中のバイヤーとセラーをつなぐ',
      es: 'La mayor plataforma de comercio electrónico B2B de China que conecta compradores y vendedores globales',
      fr: 'La plus grande plateforme de commerce électronique B2B en Chine, connectant acheteurs et vendeurs du monde entier',
      de: 'Chinas größte B2B-E-Commerce-Plattform, die Käufer und Verkäufer weltweit verbindet',
      ko: '세계적인 바이어와 셀러를 연결하는 중국 최대의 B2B 전자상거래 플랫폼',
      ru: 'Крупнейшая китайская B2B-платформа электронной коммерции, связывающая покупателей и продавцов по всему миру',
      pt: 'Maior plataforma de e-commerce B2B da China, conectando compradores e vendedores globais',
      ar: 'أكبر منصة تجارة إلكترونية B2B في الصين تربط المشترين والبائعين العالميين'
    },
    supportedAIs: [
      'lingma',
      'trae',
      'qoder',
      'comate',
      'openclaw',
      'claude_code',
      'hermes',
      'arkclaw',
      'workbuddy',
      'codebuddy'
    ],
    capabilities: {
      productManagement: true,
      search: true,
      chat: true,
      translation: true,
      sellerTools: true,
      buyerTools: true
    },
    rateLimits: {
      standard: {
        requestsPerHour: 1000,
        uploadsPerDay: 100,
        messagesPerHour: 500
      },
      basic: {
        requestsPerHour: 500,
        uploadsPerDay: 50,
        messagesPerHour: 250
      }
    },
    apiEndpoints: {
      register: '/api/ai/register',
      keys: '/api/ai/keys',
      products: '/api/products',
      chat: '/api/chat',
      translate: '/api/ai/translate',
      seller: '/api/seller',
      docs: '/api/docs'
    },
    documentation: {
      api: 'https://chinahuib2b.top/api/docs',
      integration: 'https://chinahuib2b.top/docs/AI_INTEGRATION.md',
      support: 'https://chinahuib2b.top/support'
    },
    lastUpdated: new Date().toISOString()
  })
}
