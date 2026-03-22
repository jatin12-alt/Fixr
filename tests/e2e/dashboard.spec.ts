import { test, expect } from '@playwright/test';
import { authenticate } from '../helpers/auth';

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto('/dashboard');
  });

  test('dashboard loads correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check stats cards are visible
    await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
    
    // Check specific stats
    await expect(page.locator('[data-testid="total-repos"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-pipelines"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-fixes"]')).toBeVisible();
    
    // Check navigation works
    await expect(page.locator('nav a[href="/dashboard/analytics"]')).toBeVisible();
    await expect(page.locator('nav a[href="/dashboard/teams"]')).toBeVisible();
    await expect(page.locator('nav a[href="/dashboard/settings"]')).toBeVisible();
    
    // Check repository section
    await expect(page.locator('[data-testid="repository-list"]')).toBeVisible();
  });

  test('empty state shows when no repositories', async ({ page }) => {
    // Mock empty repository list
    await page.route('**/api/repositories', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ repositories: [] }),
      });
    });
    
    await page.reload();
    
    // Check empty state is shown
    await expect(page.locator('[data-testid="empty-repos"]')).toBeVisible();
    await expect(page.locator('h2:has-text("No repositories connected")')).toBeVisible();
    await expect(page.locator('button:has-text("Connect Repository")')).toBeVisible();
  });

  test('connect repository flow', async ({ page }) => {
    // Click connect repository button
    await page.click('button:has-text("Connect Repository")');
    
    // Should open modal or navigate to connection page
    await expect(page.locator('[data-testid="connect-repo-modal"]')).toBeVisible();
    
    // Click GitHub authorization button
    await page.click('button:has-text("Connect with GitHub")');
    
    // Mock GitHub OAuth success
    await page.waitForURL('**/github/callback**');
    
    // Should show repository selection
    await expect(page.locator('[data-testid="repo-selection"]')).toBeVisible();
    
    // Select a repository
    await page.click('[data-testid="repo-item"]:first-child');
    
    // Click connect button
    await page.click('button:has-text("Connect")');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=Repository connected successfully')).toBeVisible();
    
    // Repository should appear in list
    await expect(page.locator('[data-testid="repository-item"]')).toHaveCount(1);
  });

  test('repository detail page loads', async ({ page }) => {
    // Mock repository data
    await page.route('**/api/repositories', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          repositories: [
            {
              id: '1',
              name: 'test-repo',
              fullName: 'user/test-repo',
              owner: 'user',
              isActive: true,
              lastSync: new Date().toISOString(),
            }
          ]
        }),
      });
    });
    
    await page.reload();
    
    // Click on repository
    await page.click('[data-testid="repository-item"]');
    
    // Should navigate to repository detail
    await expect(page).toHaveURL(/\/dashboard\/repos\/\d+/);
    
    // Check repository detail elements
    await expect(page.locator('h1:has-text("test-repo")')).toBeVisible();
    await expect(page.locator('[data-testid="pipeline-runs"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-analysis-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="webhook-status"]')).toBeVisible();
  });

  test('pipeline runs list displays correctly', async ({ page }) => {
    // Navigate to a repository with runs
    await page.goto('/dashboard/repos/1');
    
    // Check pipeline runs header
    await expect(page.locator('h2:has-text("Pipeline Runs")')).toBeVisible();
    
    // Check filter controls
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-filter"]')).toBeVisible();
    
    // Check runs table
    await expect(page.locator('[data-testid="runs-table"]')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Branch")')).toBeVisible();
    await expect(page.locator('th:has-text("Commit")')).toBeVisible();
    await expect(page.locator('th:has-text("Duration")')).toBeVisible();
    
    // Check run items
    const runItems = page.locator('[data-testid="run-item"]');
    if (await runItems.count() > 0) {
      await expect(runItems.first()).toBeVisible();
    }
  });

  test('notifications system works', async ({ page }) => {
    // Check notification bell is visible
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
    
    // Mock unread notifications
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'pipeline_failure',
              title: 'Pipeline failed',
              message: 'Your pipeline failed on main branch',
              read: false,
              createdAt: new Date().toISOString(),
            }
          ],
          unreadCount: 1,
        }),
      });
    });
    
    // Click notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Notification panel should open
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible();
    
    // Check notification items
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    await expect(page.locator('text=Pipeline failed')).toBeVisible();
    
    // Mark as read
    await page.click('[data-testid="notification-item"]');
    
    // Should be marked as read
    await expect(page.locator('[data-testid="notification-item"].read')).toBeVisible();
    
    // Close panel
    await page.click('body'); // Click outside
    await expect(page.locator('[data-testid="notification-panel"]')).toBeHidden();
  });

  test('real-time updates work', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Mock WebSocket connection for real-time updates
    await page.evaluate(() => {
      // Mock real-time notification
      setTimeout(() => {
        const event = new CustomEvent('notification', {
          detail: {
            type: 'pipeline_failure',
            title: 'New Pipeline Failure',
            message: 'A pipeline just failed',
          }
        });
        window.dispatchEvent(event);
      }, 2000);
    });
    
    // Wait for real-time update
    await page.waitForTimeout(2500);
    
    // Check if notification appears
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(page.locator('text=New Pipeline Failure')).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    // Check search input is present
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Type search query
    await page.fill('[data-testid="search-input"]', 'test-repo');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Check if results are filtered
    const repoItems = page.locator('[data-testid="repository-item"]');
    if (await repoItems.count() > 0) {
      await expect(repoItems.first()).toContainText('test-repo');
    }
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '');
    await page.waitForTimeout(500);
    
    // Should show all repositories again
    // This depends on your mock data
  });

  test('error handling works correctly', async ({ page }) => {
    // Mock API error
    await page.route('**/api/repositories', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    await page.reload();
    
    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('text=Failed to load repositories')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    
    // Click retry button
    await page.click('button:has-text("Try Again")');
    
    // Should attempt to reload
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
  });
});
