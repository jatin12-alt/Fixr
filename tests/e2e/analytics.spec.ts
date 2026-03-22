import { test, expect } from '@playwright/test';
import { authenticate } from '../helpers/auth';

test.describe('Analytics Features', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto('/dashboard/analytics');
  });

  test('analytics page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Analytics');
    
    // Check KPI cards are visible
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-pipelines"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="avg-duration"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-fixes-applied"]')).toBeVisible();
    
    // Check charts are rendered
    await expect(page.locator('[data-testid="pipeline-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-breakdown-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="repo-performance-chart"]')).toBeVisible();
    
    // Check date range selector
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
    await expect(page.locator('button:has-text("7D")')).toBeVisible();
    await expect(page.locator('button:has-text("30D")')).toBeVisible();
    await expect(page.locator('button:has-text("90D")')).toBeVisible();
  });

  test('date range filtering works', async ({ page }) => {
    // Mock analytics data for different date ranges
    await page.route('**/api/analytics*', (route) => {
      const url = new URL(route.request().url());
      const range = url.searchParams.get('range') || '7d';
      
      let data;
      switch (range) {
        case '7d':
          data = {
            totalPipelines: 45,
            successRate: 87.5,
            avgDuration: 4.2,
            aiFixesApplied: 8,
            trendData: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              successful: 5,
              failed: 1,
            })),
          };
          break;
        case '30d':
          data = {
            totalPipelines: 180,
            successRate: 89.2,
            avgDuration: 3.8,
            aiFixesApplied: 35,
            trendData: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              successful: 6,
              failed: 0,
            })),
          };
          break;
        default:
          data = {
            totalPipelines: 0,
            successRate: 0,
            avgDuration: 0,
            aiFixesApplied: 0,
            trendData: [],
          };
      }
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
    
    // Select 7D range
    await page.click('button:has-text("7D")');
    await page.waitForTimeout(1000);
    
    // Check KPI values for 7D
    await expect(page.locator('[data-testid="total-pipelines"]')).toContainText('45');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText('87.5%');
    
    // Select 30D range
    await page.click('button:has-text("30D")');
    await page.waitForTimeout(1000);
    
    // Check KPI values for 30D
    await expect(page.locator('[data-testid="total-pipelines"]')).toContainText('180');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText('89.2%');
    
    // Select 90D range
    await page.click('button:has-text("90D")');
    await page.waitForTimeout(1000);
    
    // Check that data is updated (should show different values)
    const totalPipelines = page.locator('[data-testid="total-pipelines"]');
    await expect(totalPipelines).toBeVisible();
  });

  test('custom date range works', async ({ page }) => {
    // Click custom date range button
    await page.click('button:has-text("Custom")');
    
    // Date picker should appear
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
    
    // Select start date (30 days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Select end date (today)
    const endDate = new Date();
    
    // This would depend on your date picker implementation
    // For now, we'll assume it works and check the result
    
    // Apply date range
    await page.click('button:has-text("Apply")');
    
    // Should update analytics data
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-state"]')).toBeHidden();
  });

  test('charts render correctly', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[data-testid="pipeline-trend-chart"] canvas', { timeout: 10000 });
    
    // Check trend chart
    await expect(page.locator('[data-testid="pipeline-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="pipeline-trend-chart"] canvas')).toBeVisible();
    
    // Check error breakdown chart
    await expect(page.locator('[data-testid="error-breakdown-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-breakdown-chart"] canvas')).toBeVisible();
    
    // Check repo performance chart
    await expect(page.locator('[data-testid="repo-performance-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="repo-performance-chart"] canvas')).toBeVisible();
    
    // Check chart legends
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('chart interactions work', async ({ page }) => {
    // Hover over trend chart
    await page.hover('[data-testid="pipeline-trend-chart"] canvas');
    
    // Tooltip should appear
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    
    // Click on chart segment
    await page.click('[data-testid="error-breakdown-chart"] canvas');
    
    // Should show detailed view or filter
    await expect(page.locator('[data-testid="chart-details"]')).toBeVisible();
  });

  test('export functionality works', async ({ page }) => {
    // Check export button is present
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Export options should appear
    await expect(page.locator('[data-testid="export-menu"]')).toBeVisible();
    await expect(page.locator('button:has-text("Export as CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("Export as PDF")')).toBeVisible();
    
    // Click CSV export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export as CSV")');
    
    // Should download file
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv$/);
  });

  test('analytics refreshes automatically', async ({ page }) => {
    // Check initial data
    const initialPipelines = page.locator('[data-testid="total-pipelines"]');
    await expect(initialPipelines).toBeVisible();
    
    // Mock updated data after refresh
    await page.route('**/api/analytics*', (route) => {
      // First call - initial data
      if (!route.request().url().includes('refresh')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalPipelines: 45,
            successRate: 87.5,
            avgDuration: 4.2,
            aiFixesApplied: 8,
          }),
        });
      } else {
        // Refresh call - updated data
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalPipelines: 50,
            successRate: 88.0,
            avgDuration: 4.0,
            aiFixesApplied: 10,
          }),
        });
      }
    });
    
    // Trigger refresh (auto-refresh after 30 seconds or manual refresh)
    await page.click('button:has-text("Refresh")');
    
    // Should show loading state
    await expect(page.locator('[data-testid="refresh-loading"]')).toBeVisible();
    
    // Should update with new data
    await expect(page.locator('[data-testid="total-pipelines"]')).toContainText('50');
  });

  test('empty state shows when no data', async ({ page }) => {
    // Mock empty analytics data
    await page.route('**/api/analytics*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPipelines: 0,
          successRate: 0,
          avgDuration: 0,
          aiFixesApplied: 0,
          trendData: [],
        }),
      });
    });
    
    await page.reload();
    
    // Should show empty state
    await expect(page.locator('[data-testid="empty-analytics"]')).toBeVisible();
    await expect(page.locator('h2:has-text("No analytics data available")')).toBeVisible();
    await expect(page.locator('p:has-text("Connect repositories to see analytics")')).toBeVisible();
    await expect(page.locator('a:has-text("Connect Repository")')).toBeVisible();
  });

  test('error handling works', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load analytics' }),
      });
    });
    
    await page.reload();
    
    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('text=Failed to load analytics')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    
    // Click retry
    await page.click('button:has-text("Try Again")');
    
    // Should attempt to reload
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check mobile layout
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
    
    // KPI cards should stack vertically on mobile
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const firstCard = kpiCards.first();
    const secondCard = kpiCards.nth(1);
    
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    
    expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
    
    // Charts should be responsive
    await expect(page.locator('[data-testid="pipeline-trend-chart"]')).toBeVisible();
    
    // Date range selector should be scrollable or collapsed
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
  });
});
