import { Metadata } from 'next'
import ApiDocsPage from '@/app/api-docs/page'

export const metadata: Metadata = {
  title: 'AI Agent API Documentation | China Hui B2B',
  description: 'Complete API documentation for AI agents to integrate with China Hui B2B platform via REST, MCP, CLI, and WebSocket',
  keywords: ['API', 'AI Agent', 'B2B', 'MCP', 'REST API', 'WebSocket', 'CLI'],
  robots: 'index, follow',
}

export default function LocaleApiDocsPage() {
  return <ApiDocsPage />
}
