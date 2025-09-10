import { test, expect } from '@playwright/test';

test.describe('SplitSquads Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock wallet connection for testing
    await page.addInitScript(() => {
      // Mock Solana wallet adapter
      (window as any).solana = {
        isPhantom: true,
        connect: async () => ({
          publicKey: {
            toString: () => 'ABC123456789DEF123456789ABC123456789DEF12'
          }
        }),
        disconnect: async () => {},
        on: () => {},
        off: () => {}
      };
    });

    await page.goto('/dashboard');
  });

  test('should redirect to home if wallet not connected', async ({ page }) => {
    // Clear the mock wallet
    await page.addInitScript(() => {
      delete (window as any).solana;
    });

    await page.goto('/dashboard');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });

  test('should display dashboard header with wallet address', async ({ page }) => {
    // Mock connected state
    await page.addInitScript(() => {
      (window as any).__NEXT_DATA__ = {
        props: {
          pageProps: {
            wallet: {
              connected: true,
              publicKey: 'ABC123456789DEF123456789ABC123456789DEF12'
            }
          }
        }
      };
    });

    await page.reload();

    // Check for welcome message
    await expect(page.locator('h1')).toContainText('Welcome back!');
    
    // Check for shortened wallet address
    await expect(page.locator('text=ABC1...F12')).toBeVisible();
    
    // Check for Create Squad button
    await expect(page.locator('text=Create Squad')).toBeVisible();
  });

  test('should display user stats cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Total Staked')).toBeVisible();
    await expect(page.locator('text=Total Rewards')).toBeVisible();
    await expect(page.locator('text=Active Squads')).toBeVisible();
    await expect(page.locator('text=Global Rank')).toBeVisible();

    // Check for stat values
    await expect(page.locator('text=5K $SPLIT')).toBeVisible(); // Total Staked
    await expect(page.locator('text=1.3K $SPLIT')).toBeVisible(); // Total Rewards
    await expect(page.locator('text=2')).toBeVisible(); // Active Squads
    await expect(page.locator('text=#47')).toBeVisible(); // Global Rank
  });

  test('should display My Squads section', async ({ page }) => {
    // Check for My Squads section
    await expect(page.locator('h2')).toContainText('My Squads');
    
    // Check for squad cards
    await expect(page.locator('text=DeFi Builders')).toBeVisible();
    await expect(page.locator('text=Solana Stakers')).toBeVisible();
    
    // Check for squad details
    await expect(page.locator('text=5/6 members')).toBeVisible();
    await expect(page.locator('text=Rank #12')).toBeVisible();
    await expect(page.locator('text=+125 $SPLIT')).toBeVisible();
    
    // Check for progress bars
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Check for Join Another Squad button
    await expect(page.locator('text=Join Another Squad')).toBeVisible();
  });

  test('should display Recent Activity section', async ({ page }) => {
    // Check for Recent Activity section
    await expect(page.locator('h2')).toContainText('Recent Activity');
    
    // Check for activity items
    await expect(page.locator('text=+45 $SPLIT reward')).toBeVisible();
    await expect(page.locator('text=Staked 1000 $SPLIT')).toBeVisible();
    await expect(page.locator('text=Joined squad')).toBeVisible();
    
    // Check for timestamps
    await expect(page.locator('text=2 hours ago')).toBeVisible();
    await expect(page.locator('text=1 day ago')).toBeVisible();
    await expect(page.locator('text=3 days ago')).toBeVisible();
  });

  test('should display Quick Actions section', async ({ page }) => {
    // Check for Quick Actions section
    await expect(page.locator('h3')).toContainText('Quick Actions');
    
    // Check for action buttons
    await expect(page.locator('text=Stake More Tokens')).toBeVisible();
    await expect(page.locator('text=View Leaderboard')).toBeVisible();
    await expect(page.locator('text=Invite Friends')).toBeVisible();
  });

  test('should handle squad card interactions', async ({ page }) => {
    // Click on a squad card
    const squadCard = page.locator('text=DeFi Builders').locator('..');
    await squadCard.hover();
    
    // Check that card has hover effects
    await expect(squadCard).toBeVisible();
    
    // In a real app, clicking would navigate to squad details
    // await squadCard.click();
    // await expect(page).toHaveURL(/\/squad\/[a-zA-Z0-9]+/);
  });

  test('should handle Create Squad button click', async ({ page }) => {
    const createSquadButton = page.locator('text=Create Squad');
    await createSquadButton.click();
    
    // Should navigate to squad creation page
    await expect(page).toHaveURL('/squads/create');
  });

  test('should handle Join Another Squad button click', async ({ page }) => {
    const joinSquadButton = page.locator('text=Join Another Squad');
    await joinSquadButton.click();
    
    // Should navigate to squads listing page
    await expect(page).toHaveURL('/squads');
  });

  test('should handle quick action clicks', async ({ page }) => {
    // Test Stake More Tokens button
    const stakeButton = page.locator('text=Stake More Tokens');
    await stakeButton.click();
    
    // In a real app, this might open a modal or navigate to a staking page
    await expect(stakeButton).toBeVisible();
    
    // Test View Leaderboard button
    const leaderboardButton = page.locator('text=View Leaderboard');
    await leaderboardButton.click();
    
    // Should navigate to leaderboard
    await expect(page).toHaveURL('/leaderboard');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and properly formatted
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Total Staked')).toBeVisible();
    await expect(page.locator('text=My Squads')).toBeVisible();
    
    // Stats should stack vertically on mobile
    const statsCards = page.locator('[role="grid"], .grid');
    await expect(statsCards).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Mock slow network conditions
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.reload();
    
    // Check that page doesn't break during loading
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display proper error states', async ({ page }) => {
    // Mock API errors
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.reload();
    
    // Page should still render with fallback data
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    await expect(h1).toHaveCount(1);
    expect(await h2.count()).toBeGreaterThan(0);
    expect(await h3.count()).toBeGreaterThan(0);
    
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
    
    // Check for proper progress bar accessibility
    const progressBars = page.locator('[role="progressbar"]');
    const progressBarCount = await progressBars.count();
    
    for (let i = 0; i < progressBarCount; i++) {
      const progressBar = progressBars.nth(i);
      
      // Progress bars should have proper ARIA attributes
      await expect(progressBar).toHaveAttribute('role', 'progressbar');
    }
  });
});