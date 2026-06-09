import '@testing-library/jest-dom'

// Polyfill for Web APIs in Node.js environment
// Note: jsdom provides most of these, so we only mock what's missing
global.Request = global.Request || class Request {
  constructor(input: string | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
  }
  url: string
  method: string
  headers: Headers
  clone() { return this }
}

// Polyfill Response for Node.js test environment
// jsdom should provide this, but we add it as a fallback
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body?: BodyInit, init?: ResponseInit) {
      this.status = init?.status || 200
      this.ok = this.status >= 200 && this.status < 300
      this.headers = new Headers(init?.headers)
      this._body = body
    }
    status: number
    ok: boolean
    headers: Headers
    _body?: BodyInit
    json() { return Promise.resolve(this._body) }
    text() { return Promise.resolve(typeof this._body === 'string' ? this._body : JSON.stringify(this._body)) }
    clone() { return this }

    // Static method needed by NextResponse.json()
    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    }
  } as typeof globalThis.Response
}

global.Headers = global.Headers || class Headers {
  constructor(init?: HeadersInit) {
    this._map = new Map()
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([name, value]) => this._map.set(name, value))
      } else if (init instanceof Headers) {
        init._map.forEach((value, name) => this._map.set(name, value))
      } else {
        Object.entries(init).forEach(([name, value]) => this._map.set(name, value))
      }
    }
  }
  _map: Map<string, string>
  get(name: string) { return this._map.get(name) || null }
  set(name: string, value: string) { this._map.set(name, value) }
  has(name: string) { return this._map.has(name) }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Suppress console errors during tests (optional)
// const originalConsoleError = console.error
// console.error = (...args) => {
//   if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
//     return
//   }
//   originalConsoleError(...args)
// }
