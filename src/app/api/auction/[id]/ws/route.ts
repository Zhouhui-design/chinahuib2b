import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'

let wss: WebSocketServer | null = null
const activeConnections = new Map<string, Set<WebSocket>>()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })
    
    wss.on('connection', (ws: WebSocket) => {
      ws.on('close', () => {
        activeConnections.forEach((connections, listingId) => {
          connections.delete(ws)
          if (connections.size === 0) {
            activeConnections.delete(listingId)
          }
        })
      })
    })
  }

  const upgradeHeader = request.headers.get('upgrade')
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 })
  }

  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': 'dGhlIHNhbXBsZSBub25jZQ==',
    },
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const body = await request.json()
    const { type, data } = body
    
    const connections = activeConnections.get(id)
    if (connections) {
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type, data }))
        }
      })
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error sending auction update:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}