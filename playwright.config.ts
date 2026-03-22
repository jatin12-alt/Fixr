import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for Fixr E2E testing
 * 
 * Features:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile viewport testing
 * - Visual regression testing
 * - Video recording on failure
 * - Authentication state management
 * - Parallel execution
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global setup for authentication
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video only when retrying a test for the first time
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Global timeout for each action
    actionTimeout: 10000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
    
    // Tablet
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
    
    // Debug mode (headed)
    {
      name: 'debug',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
        slowMo: 100,
      },
      testMatch: '**/*.debug.spec.ts',
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Output directory
  outputDir: 'test-results',
  
  // Global setup options
  globalSetup: path.join(__dirname, 'tests/e2e/global-setup.ts'),
  
  // Global teardown
  globalTeardown: path.join(__dirname, 'tests/e2e/global-teardown.ts'),
});
