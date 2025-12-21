import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login link when not authenticated', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.locator('a[href="/auth/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText('Login');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Login');
    await page.waitForURL('**/auth/login');

    // Check for login form elements
    await expect(page.locator('input[type="text"][autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Log In');
  });

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto('/auth/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const usernameInput = page.locator('input[autocomplete="username"]');
    const isValid = await usernameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in invalid credentials
    await page.fill('input[autocomplete="username"]', 'invaliduser');
    await page.fill('input[autocomplete="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=/invalid username or password/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signup page from login', async ({ page }) => {
    await page.goto('/auth/login');

    await page.click('text=Sign up');
    await page.waitForURL('**/auth/signup');

    // Check for signup form elements
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="email"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="new-password"]')).toBeVisible();
  });

  test('should show validation on signup form', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in password only (missing required fields)
    await page.fill('input[autocomplete="new-password"]', 'test123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Check HTML5 validation prevents submission
    const usernameInput = page.locator('input[autocomplete="username"]');
    const isValid = await usernameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should maintain auth state across page navigation', async ({ page }) => {
    // Simulate authenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'fake-token-for-testing');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'USER',
        reputation_points: 0,
        spoiler_preference: 'NONE',
        date_joined: '2024-01-01'
      }));
    });

    // Reload to apply auth state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait a bit for the header to render with auth state
    await page.waitForTimeout(500);

    // Should see logout button instead of login
    const logoutButton = page.locator('a[href="/auth/logout"]');
    const loginLink = page.locator('a[href="/auth/login"]');

    await expect(logoutButton).toBeVisible({ timeout: 2000 });
    await expect(loginLink).not.toBeVisible();
  });

  test('should clear auth state on logout', async ({ page }) => {
    // Set up authenticated state
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

    await page.reload();
    await page.waitForTimeout(500);

    // Click logout
    await page.click('a[href="/auth/logout"]');
    await page.waitForURL('**/auth/logout');

    // Check localStorage is cleared
    const hasToken = await page.evaluate(() => {
      return localStorage.getItem('accessToken') !== null;
    });
    expect(hasToken).toBe(false);
  });
});
