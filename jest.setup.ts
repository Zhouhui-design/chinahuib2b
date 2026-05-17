import '@testing-library/jest-dom'

// Polyfill for Web APIs in Node.js environment
global.Request = global.Request || class Request {
  constructor(input: string | Request, init?: RequestInit) {}
  url = ''
  method = 'GET'
  headers = new Headers()
  clone() { return this }
}

global.Response = global.Response || class Response {
  constructor(body?: BodyInit, init?: ResponseInit) {}
  status = 200
  ok = true
  headers = new Headers()
  json() { return Promise.resolve({}) }
  text() { return Promise.resolve('') }
  clone() { return this }
}

global.Headers = global.Headers || class Headers {
  constructor(init?: HeadersInit) {}
  get(name: string) { return null }
  set(name: string, value: string) {}
  has(name: string) { return false }
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
