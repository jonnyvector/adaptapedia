import { test, expect } from '@playwright/test';

test.describe('Hydration', () => {
  test('should not have hydration errors on home page', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // Navigate to home page
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for hydration errors
    const hydrationErrors = consoleErrors.filter(
      (error) =>
        error.includes('Hydration') ||
        error.includes('did not match') ||
        error.includes('server-rendered HTML')
    );

    expect(hydrationErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });

  test('should not have hydration errors with authenticated state', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Set localStorage to simulate logged-in state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'USER'
      }));
    });

    // Reload to trigger hydration with auth state
    await page.reload();
    await page.waitForLoadState('networkidle');

    const hydrationErrors = consoleErrors.filter(
      (error) =>
        error.includes('Hydration') ||
        error.includes('did not match') ||
        error.includes('server-rendered HTML')
    );

    expect(hydrationErrors).toHaveLength(0);
  });

  test('should not have hydration errors on compare page', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to a compare page (assuming there's data)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find a comparison link
    const compareLink = page.locator('a[href*="/compare/"]').first();

    // Only test if a compare link exists
    const compareExists = await compareLink.count() > 0;
    if (compareExists) {
      await compareLink.click();
      await page.waitForLoadState('networkidle');

      const hydrationErrors = consoleErrors.filter(
        (error) =>
          error.includes('Hydration') ||
          error.includes('did not match') ||
          error.includes('server-rendered HTML')
      );

      expect(hydrationErrors).toHaveLength(0);
    }
  });
});
