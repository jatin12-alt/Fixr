import '@testing-library/jest-dom'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'expect' {
  interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}

// Extend global type for mockFetch
declare global {
  var mockFetch: (data: any, status?: number) => jest.Mock
  var mockFetchError: (error: string) => jest.Mock
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Firebase auth
jest.mock('@/lib/providers/FirebaseAuthProvider', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    },
    loading: false,
    signOut: jest.fn(),
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  FirebaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Drizzle DB
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
  },
  users: { authId: 'authId', email: 'email' },
  repos: { id: 'id', userId: 'userId' },
  pipelineRuns: { id: 'id', repoId: 'repoId' },
  notifications: { id: 'id', userId: 'userId' },
}))

// Mock fetch
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Suppress console errors during tests
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  // Filter out expected errors
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
      args[0].includes('act(...) is not supported') ||
      args[0].includes('Warning: validateDOMNesting'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// Global test utilities
global.mockFetch = (data: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  })
}

global.mockFetchError = (error: string) => {
  return jest.fn().mockRejectedValue(new Error(error))
}
