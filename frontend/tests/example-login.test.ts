import { test, expect } from '@playwright/test';
import { AuthHelpers, TEST_USERS } from './auth-helpers';

test.describe('E2E Infrastructure Test', () => {
  test('should login as admin successfully', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login as admin
    await auth.loginAsAdmin();

    // Verify we're logged in
    const isLoggedIn = await auth.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Check current user
    const userInfo = await auth.getCurrentUser();
    expect(userInfo?.email).toBe(TEST_USERS.admin.email);
  });

  test('should login as student successfully', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login as student
    await auth.loginAsStudent();

    // Verify we're logged in
    const isLoggedIn = await auth.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should logout successfully', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login first
    await auth.loginAsAdmin();

    // Verify logged in
    let isLoggedIn = await auth.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Logout
    await auth.logout();

    // Verify logged out
    isLoggedIn = await auth.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });
});