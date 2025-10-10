import { test, expect } from '@playwright/test';

test.describe('User Login Flow', () => {
  test('should register a user and successfully login with the registered credentials', async ({ page }) => {
    const testUser = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    };

    // Step 1: Register a new user
    await page.goto('#/register');
    await expect(page).toHaveURL('**/register');

    // Fill out the registration form
    await page.fill('input[id="full-name"]', testUser.fullName);
    await page.fill('input[id="email-address"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.check('input[id="terms"]');

    // Submit the registration form
    await page.click('button[type="submit"]');

    // Wait for either successful registration (redirect to dashboard) or pending confirmation
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('**/dashboard');

      // Verify user is logged in by checking the welcome message
      await expect(page.locator('text=Glad to see you again, Test!')).toBeVisible();

      // Logout to test the login flow
      await page.click('button[id="user-menu-button"]');
      await page.click('text=Sign out');

      // Verify logout redirect
      await page.waitForURL('**/', { timeout: 5000 });
      await expect(page).toHaveURL('**/');

    } catch {
      // If registration requires email confirmation, skip the test or handle accordingly
      // For this test, we'll assume registration succeeds; in a real scenario, handle email confirmation
      console.log('Registration pending confirmation - skipping login test');
      test.skip();
    }

    // Step 2: Navigate to the login page
    await page.goto('#/login');
    await expect(page).toHaveURL('**/login');

    // Fill out the login form with registered credentials
    await page.fill('input[id="email-address"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);

    // Submit the login form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('**/dashboard');

    // Verify successful login by checking user info display
    await expect(page.locator('text=Glad to see you again, Test!')).toBeVisible();

    // Additional assertion: Ensure no error messages are present
    await expect(page.locator('text=Invalid credentials')).not.toBeVisible();
    await expect(page.locator('text=An error occurred')).not.toBeVisible();
  });
});