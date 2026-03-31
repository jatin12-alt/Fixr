import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Runs once before all test suites
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...')
  
  // Create a browser instance for setup tasks
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // Verify test environment is ready
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  
  try {
    // Check if application is running
    const response = await page.goto(`${baseURL}/api/health`, { timeout: 10000 })
    
    if (response?.status() === 200) {
      console.log('✅ Application is running and healthy')
    } else {
      console.warn(`⚠️ Application health check returned status: ${response?.status()}`)
    }
  } catch (error) {
    console.error('❌ Application is not running. Please start the dev server first.')
    console.error('   Run: npm run dev')
    process.exit(1)
  }
  
  // Create authenticated state for tests
  await context.addCookies([
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
  
  // Save storage state for reuse in tests
  await context.storageState({ path: 'test-results/.auth/state.json' })
  
  await browser.close()
  
  console.log('✅ Global setup complete')
}

export default globalSetup
