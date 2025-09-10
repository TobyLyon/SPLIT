import { test, expect } from '@playwright/test';

test.describe('SplitSquads Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main hero section', async ({ page }) => {
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Split the Rewards');
    await expect(page.locator('h1')).toContainText('Share the Success');

    // Check for tagline
    await expect(page.locator('p')).toContainText('Join squads, stake $SPLIT tokens');

    // Check for CTA button
    await expect(page.locator('text=Connect Wallet to Start')).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Total Staked')).toBeVisible();
    await expect(page.locator('text=Active Squads')).toBeVisible();
    await expect(page.locator('text=Total Members')).toBeVisible();
    await expect(page.locator('text=Rewards Paid')).toBeVisible();

    // Check for formatted numbers
    await expect(page.locator('text=$1.3M')).toBeVisible(); // Total Staked
    await expect(page.locator('text=342')).toBeVisible(); // Active Squads
  });

  test('should display features section', async ({ page }) => {
    // Check for features heading
    await expect(page.locator('h2')).toContainText('Why Choose SplitSquads');

    // Check for feature cards
    await expect(page.locator('text=Squad Formation')).toBeVisible();
    await expect(page.locator('text=Dynamic Weights')).toBeVisible();
    await expect(page.locator('text=Competitive Leaderboards')).toBeVisible();
    await expect(page.locator('text=Secure & Transparent')).toBeVisible();
  });

  test('should display testimonials section', async ({ page }) => {
    // Check for testimonials heading
    await expect(page.locator('h2')).toContainText('What Our Community Says');

    // Check for testimonial cards
    await expect(page.locator('text=Alex Chen')).toBeVisible();
    await expect(page.locator('text=@alexbuilds')).toBeVisible();
    await expect(page.locator('text=SplitSquads revolutionized')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check for header navigation
    await expect(page.locator('text=SplitSquads')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Squads')).toBeVisible();
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that mobile menu button is visible
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();

    // Check that main content is still visible and properly formatted
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Connect Wallet to Start')).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toHaveCount(1);
    expect(await h2.count()).toBeGreaterThan(0);

    // Check for alt text on images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('alt');
    }

    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should handle animations and interactions', async ({ page }) => {
    // Test hover effects on buttons
    const ctaButton = page.locator('text=Connect Wallet to Start').first();
    await ctaButton.hover();
    
    // Check that button is still visible after hover
    await expect(ctaButton).toBeVisible();

    // Test scroll behavior
    await page.evaluate(() => window.scrollTo(0, 1000));
    
    // Check that navigation is still visible (sticky header)
    await expect(page.locator('text=SplitSquads')).toBeVisible();
  });

  test('should load performance assets efficiently', async ({ page }) => {
    // Monitor network requests
    const responses: string[] = [];
    page.on('response', response => {
      responses.push(response.url());
    });

    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check that essential resources loaded
    expect(responses.some(url => url.includes('globals.css'))).toBeTruthy();
    expect(responses.some(url => url.includes('Inter'))).toBeTruthy(); // Google Fonts
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/SplitSquads/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Join squads, stake \$SPLIT tokens/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /SplitSquads/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /Join squads, stake \$SPLIT tokens/);
  });
});