import { test, expect } from '@playwright/test'
import { authenticate } from './helpers/auth';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check logo is visible
    await expect(page.locator('h1')).toContainText('Fixr');
    
    // Check CTA button is present
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
    
    // Check navbar links work
    await expect(page.locator('nav a[href="/pricing"]')).toBeVisible();
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible();
    
    // Check footer links
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
    
    // Check meta tags
    await expect(page.locator('title')).toContainText('Fixr — AI-Powered CI/CD Pipeline Monitor');
  });

  test('sign in flow works end-to-end', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to Firebase (or auth page)
    await expect(page).toHaveURL(/.*sign-in.*/);
    
    // For testing, we'll mock successful authentication
    // In real tests, you'd use actual Firebase test credentials
    await authenticate(page);
    
    // Should redirect to dashboard after successful auth
    await expect(page).toHaveURL('/dashboard');
    
    // Check user name visible in navbar
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Check dashboard elements are visible
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('sign out flow works correctly', async ({ page }) => {
    // First sign in
    await authenticate(page);
    await page.goto('/dashboard');
    
    // Click user menu
    await page.click('[data-testid="user-menu"]');
    
    // Click sign out
    await page.click('button:has-text("Sign Out")');
    
    // Should redirect to landing page
    await expect(page).toHaveURL('/');
    
    // Dashboard should be inaccessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('protected routes redirect to sign-in', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/analytics',
      '/dashboard/teams',
      '/dashboard/settings',
      '/api/notifications',
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to sign-in
      await expect(page).toHaveURL(/.*sign-in.*/);
      
      // Clear state for next test
      await page.context().clearCookies();
    }
  });

  test('API routes require authentication', async ({ page, request }) => {
    const protectedEndpoints = [
      '/api/notifications',
      '/api/analytics',
      '/api/teams',
      '/api/user/profile',
    ];
    
    for (const endpoint of protectedEndpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
    }
  });

  test('authentication persists across page reloads', async ({ page }) => {
    await authenticate(page);
    await page.goto('/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('authentication expires correctly', async ({ page }) => {
    await authenticate(page);
    await page.goto('/dashboard');
    
    // Clear auth token to simulate expiry
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto('/dashboard/analytics');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('sign up flow creates new user', async ({ page }) => {
    await page.goto('/');
    
    // Click sign up
    await page.click('a:has-text("Get Started")');
    
    // Should redirect to sign-up
    await expect(page).toHaveURL(/.*sign-up.*/);
    
    // Mock sign up process
    await authenticate(page, { isNewUser: true });
    
    // Should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/dashboard|onboarding/);
  });

  test('error handling for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In")');
    
    // Try to sign in with invalid credentials
    // This would need to be implemented based on your auth flow
    // For now, we'll test that error states are handled
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'invalidpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
