import { test, expect, devices } from '@playwright/test';
import { authenticate } from '../helpers/auth';

test.describe('Mobile Responsiveness', () => {
  // Use iPhone 14 viewport
  test.use({ ...devices['iPhone 14'] });

  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test('landing page on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section is readable
    await expect(page.locator('h1')).toBeVisible();
    const heroText = page.locator('h1');
    await expect(heroText).toHaveCSS('font-size', /\d+px/);
    
    // CTA button should be tappable (44px minimum)
    const ctaButton = page.locator('button:has-text("Sign In")');
    await expect(ctaButton).toBeVisible();
    const buttonBox = await ctaButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    
    // Navbar should collapse to hamburger menu
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Click hamburger menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Mobile menu should open
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a[href="/pricing"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a[href="/blog"]')).toBeVisible();
    
    // Close mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();
    
    // Footer should be mobile-friendly
    await expect(page.locator('footer')).toBeVisible();
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    
    // Links should be tappable
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = footerLinks.nth(i);
      const linkBox = await link.boundingBox();
      expect(linkBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('dashboard on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Stats cards should stack vertically
    const statsCards = page.locator('[data-testid="stats-card"]');
    const cardCount = await statsCards.count();
    
    for (let i = 0; i < cardCount - 1; i++) {
      const currentCard = statsCards.nth(i);
      const nextCard = statsCards.nth(i + 1);
      
      const currentBox = await currentCard.boundingBox();
      const nextBox = await nextCard.boundingBox();
      
      expect(nextBox?.y).toBeGreaterThan((currentBox?.y || 0) + (currentBox?.height || 0));
    }
    
    // Repository list should be scrollable if needed
    await expect(page.locator('[data-testid="repository-list"]')).toBeVisible();
    
    // Table should be horizontally scrollable
    const tableContainer = page.locator('[data-testid="table-container"]');
    if (await tableContainer.isVisible()) {
      await expect(tableContainer).toHaveCSS('overflow-x', /auto|scroll/);
    }
    
    // Navigation should collapse to bottom nav or sidebar
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Check mobile navigation items
    await expect(page.locator('[data-testid="mobile-nav"] a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav"] a[href="/dashboard/analytics"]')).toBeVisible();
    
    // Search should be mobile-friendly
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      const searchBox = await searchInput.boundingBox();
      expect(searchBox?.height).toBeGreaterThanOrEqual(44);
    }
    
    // Connect repository button should be prominent
    await expect(page.locator('button:has-text("Connect Repository")')).toBeVisible();
  });

  test('analytics page on mobile', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // KPI cards should stack vertically
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const cardCount = await kpiCards.count();
    
    for (let i = 0; i < cardCount - 1; i++) {
      const currentCard = kpiCards.nth(i);
      const nextCard = kpiCards.nth(i + 1);
      
      const currentBox = await currentCard.boundingBox();
      const nextBox = await nextCard.boundingBox();
      
      expect(nextBox?.y).toBeGreaterThan((currentBox?.y || 0) + (currentBox?.height || 0));
    }
    
    // Charts should be responsive
    await expect(page.locator('[data-testid="pipeline-trend-chart"]')).toBeVisible();
    
    // Date range selector should be mobile-friendly
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
    
    // Date range buttons should be tappable
    const dateButtons = page.locator('[data-testid="date-range-selector"] button');
    for (let i = 0; i < Math.min(await dateButtons.count(), 3); i++) {
      const button = dateButtons.nth(i);
      const buttonBox = await button.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    }
    
    // Export button might be in a menu on mobile
    const exportButton = page.locator('button:has-text("Export")');
    if (await exportButton.isVisible()) {
      const exportBox = await exportButton.boundingBox();
      expect(exportBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('legal pages on mobile', async ({ page }) => {
    const legalPages = ['/privacy', '/terms', '/cookies'];
    
    for (const pagePath of legalPages) {
      await page.goto(pagePath);
      
      // TOC should be hidden or collapsed on mobile
      const toc = page.locator('[data-testid="table-of-contents"]');
      if (await toc.isVisible()) {
        // Should be collapsible
        await expect(toc).toHaveClass(/mobile-hidden|collapsed/);
      }
      
      // Main content should be readable without zoom
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Text should be large enough
      const paragraphs = mainContent.locator('p');
      for (let i = 0; i < Math.min(await paragraphs.count(), 3); i++) {
        const paragraph = paragraphs.nth(i);
        await expect(paragraph).toHaveCSS('font-size', /1[4-6]px/);
      }
      
      // Links should be tappable (44px minimum)
      const links = mainContent.locator('a');
      for (let i = 0; i < Math.min(await links.count(), 3); i++) {
        const link = links.nth(i);
        const linkBox = await link.boundingBox();
        expect(linkBox?.height).toBeGreaterThanOrEqual(44);
      }
      
      // Back to top button should be present on long pages
      const backToTop = page.locator('[data-testid="back-to-top"]');
      if (await backToTop.isVisible()) {
        await expect(backToTop).toHaveCSS('min-height', /44px/);
      }
    }
  });

  test('settings page on mobile', async ({ page }) => {
    await page.goto('/dashboard/settings');
    
    // Settings sections should be collapsible
    await expect(page.locator('[data-testid="settings-section"]')).toBeVisible();
    
    // Form inputs should be mobile-friendly
    const inputs = page.locator('input, select, textarea');
    for (let i = 0; i < Math.min(await inputs.count(), 3); i++) {
      const input = inputs.nth(i);
      const inputBox = await input.boundingBox();
      expect(inputBox?.height).toBeGreaterThanOrEqual(44);
    }
    
    // Toggle switches should be tappable
    const toggles = page.locator('[data-testid="toggle-switch"]');
    for (let i = 0; i < await toggles.count(); i++) {
      const toggle = toggles.nth(i);
      const toggleBox = await toggle.boundingBox();
      expect(toggleBox?.height).toBeGreaterThanOrEqual(44);
      expect(toggleBox?.width).toBeGreaterThanOrEqual(44);
    }
    
    // Save button should be prominent
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    const saveBox = await page.locator('button:has-text("Save")').boundingBox();
    expect(saveBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('team features on mobile', async ({ page }) => {
    await page.goto('/dashboard/teams');
    
    // Team list should be mobile-friendly
    await expect(page.locator('[data-testid="team-list"]')).toBeVisible();
    
    // Create team button should be prominent
    await expect(page.locator('button:has-text("Create Team")')).toBeVisible();
    
    // Team cards should stack vertically
    const teamCards = page.locator('[data-testid="team-card"]');
    const cardCount = await teamCards.count();
    
    if (cardCount > 1) {
      for (let i = 0; i < cardCount - 1; i++) {
        const currentCard = teamCards.nth(i);
        const nextCard = teamCards.nth(i + 1);
        
        const currentBox = await currentCard.boundingBox();
        const nextBox = await nextCard.boundingBox();
        
        expect(nextBox?.y).toBeGreaterThan((currentBox?.y || 0) + (currentBox?.height || 0));
      }
    }
    
    // Action buttons should be tappable
    const actionButtons = page.locator('[data-testid="team-card"] button');
    for (let i = 0; i < Math.min(await actionButtons.count(), 3); i++) {
      const button = actionButtons.nth(i);
      const buttonBox = await button.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('touch interactions work', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test swipe gestures (if implemented)
    const repoList = page.locator('[data-testid="repository-list"]');
    
    // Test pull-to-refresh (if implemented)
    await page.touchscreen.tap(200, 100);
    await page.touchscreen.move(200, 300);
    await page.touchscreen.up();
    
    // Test long press (if implemented)
    const repoItem = page.locator('[data-testid="repository-item"]');
    if (await repoItem.isVisible()) {
      await repoItem.first().tap();
      await page.waitForTimeout(500);
    }
    
    // Test double-tap to zoom (should be disabled)
    await page.tap(200, 200);
    await page.tap(200, 200);
    
    // Page should not zoom
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390);
    expect(viewport?.height).toBe(844);
  });

  test('orientation changes work', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test landscape orientation
    await page.setViewportSize({ width: 844, height: 390 });
    
    // Layout should adapt
    await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();
    
    // Test back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Layout should readapt
    await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();
  });

  test('accessibility on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Skip to main content link should work
    await page.press('Tab');
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
    
    // All interactive elements should be keyboard accessible
    const interactiveElements = page.locator('button, a, input, select');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      await interactiveElements.nth(i).focus();
      await expect(interactiveElements.nth(i)).toBeFocused();
    }
    
    // Focus should be visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toHaveCSS('outline', /.+/);
    }
  });
});
