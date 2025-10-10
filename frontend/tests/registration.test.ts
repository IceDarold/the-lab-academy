import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should successfully register a new user with valid data', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('#/register');

    // Verify we're on the registration page
    await expect(page).toHaveURL('**/register');

    // Fill out the registration form with valid data
    await page.fill('input[id="full-name"]', 'John Doe');
    await page.fill('input[id="email-address"]', 'john.doe@example.com');
    await page.fill('input[id="password"]', 'Password123!');
    await page.check('input[id="terms"]');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for either redirect to dashboard or confirmation modal
    try {
      // Check for redirect to dashboard (authenticated registration)
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      await expect(page).toHaveURL('**/dashboard');
    } catch {
      // If no redirect, check for confirmation modal (pending confirmation)
      await expect(page.locator('text=Email Confirmation')).toBeVisible();
      await expect(page.locator('text=Please confirm your email to complete registration')).toBeVisible();
    }
  });
});