import { test as base, Page } from '@playwright/test'

/**
 * Extended test fixture with authentication
 */
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, use) => {
    // Authenticate before each test
    await authenticate(page)
    await use(page)
  },
})

async function authenticate(page: Page) {
  // Set auth cookies for testing
  await page.context().addCookies([
    {
      name: 'firebase_token',
      value: 'test-firebase-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ])
  
  // Mock user data in localStorage
  await page.evaluate(() => {
    localStorage.setItem('firebase_token', 'test-firebase-token')
    localStorage.setItem('firebase_user', JSON.stringify({
      uid: 'test-user',
      email: 'test@example.com',
    }))
  })
}

export { expect } from '@playwright/test'
