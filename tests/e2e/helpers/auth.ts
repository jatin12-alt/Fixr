import { Page } from '@playwright/test'

/**
 * Authentication helper for Playwright tests
 * Simulates user authentication for testing
 */

interface AuthOptions {
  isNewUser?: boolean
  userId?: string
  email?: string
  name?: string
}

export async function authenticate(page: Page, options: AuthOptions = {}): Promise<void> {
  const {
    isNewUser = false,
    userId = 'test-user-123',
    email = 'test@example.com',
    name = 'Test User',
  } = options

  // Set authentication cookies
  await page.context().addCookies([
    {
      name: 'firebase_token',
      value: 'mock-firebase-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Set localStorage auth state
  await page.evaluate((authData) => {
    localStorage.setItem('firebase_token', 'mock-firebase-token')
    localStorage.setItem('firebase_user', JSON.stringify({
      uid: authData.userId,
      email: authData.email,
      displayName: authData.name,
    }))
  }, { userId, email, name })

  // Mock the auth API response
  await page.route('**/api/auth/session**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId,
        email,
        name,
        isSignedIn: true,
      }),
    })
  })

  // If new user, show onboarding
  if (isNewUser) {
    await page.route('**/api/user/onboarding**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          completed: false,
          steps: ['connect-repo', 'setup-notifications', 'invite-team'],
        }),
      })
    })
  }
}

/**
 * Sign out helper
 */
export async function signOut(page: Page): Promise<void> {
  // Clear cookies
  await page.context().clearCookies()

  // Clear localStorage
  await page.evaluate(() => {
    localStorage.removeItem('firebase_token')
    localStorage.removeItem('firebase_user')
  })

  // Mock auth API to return not authenticated
  await page.route('**/api/auth/session**', (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Not authenticated',
      }),
    })
  })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies()
  const hasSessionCookie = cookies.some(c => c.name === 'firebase_token')
  
  return hasSessionCookie
}
