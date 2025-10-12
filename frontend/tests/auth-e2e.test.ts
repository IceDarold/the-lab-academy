import { test, expect } from '@playwright/test';
import { AuthHelpers, TestUser } from './auth-helpers';
import { TEST_USERS } from './test-utils';
import { AccessibilityHelpers, ACCESSIBILITY_CONFIGS } from './accessibility-helpers';
import { PerformanceHelpers, performanceHelpers } from './performance-helpers';
import { getThresholdsForFlow, PERFORMANCE_CONFIG } from './performance-config';

/**
 * Comprehensive E2E Authentication Tests for Course System
 *
 * Tests cover all authentication scenarios including registration, login,
 * admin access, invalid attempts, and session management.
 */

test.describe('Course System Authentication E2E Tests', () => {
  test.describe('Registration Form', () => {
    test('registration_form_displays_correctly - Navigate to registration page and verify form elements are present', async ({ page }) => {
      // Navigate to registration page
      await page.goto('#/register');
      await expect(page).toHaveURL('**/register');

      // Verify registration form elements are present
      await expect(page.locator('[data-testid="full-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="terms-checkbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
    });

    test('registration_form_accessibility - Verify registration form meets accessibility standards', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to registration page
      await page.goto('#/register');
      await expect(page).toHaveURL('**/register');

      // Run accessibility audit on the registration form
      const results = await accessibility.checkElementAccessibility('form', ACCESSIBILITY_CONFIGS.formsOnly);

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation
      await accessibility.testKeyboardNavigation();

      // Check form accessibility specifically
      await accessibility.checkFormAccessibility('form');
    });

    test('successful_registration_creates_account - Fill form with valid data and submit, verify account creation', async ({ page }) => {
      // Generate unique test data to avoid conflicts
      const timestamp = Date.now();
      const testUser = {
        fullName: `Test Student ${timestamp}`,
        email: `teststudent${timestamp}@example.com`,
        password: 'StudentPass123!'
      };

      // Navigate to registration page
      await page.goto('#/register');
      await expect(page).toHaveURL('**/register');

      // Fill registration form with valid data
      await page.fill('[data-testid="full-name-input"]', testUser.fullName);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.check('[data-testid="terms-checkbox"]');

      // Submit form
      await page.click('[data-testid="register-button"]');

      // Verify success - either redirect to dashboard or confirmation message
      try {
        // Check for successful registration (auto-login)
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL('**/dashboard');

        // Verify user info is displayed
        await expect(page.locator(`text=${testUser.fullName.split(' ')[0]}`)).toBeVisible();

      } catch {
        // Handle pending confirmation case
        await expect(page.locator('text=Email Confirmation')).toBeVisible();
        await expect(page.locator('text=Please confirm your email')).toBeVisible();
      }
    });

    test('registration_auto_login_works - Verify user is automatically logged in after successful registration', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Generate unique test data to avoid conflicts
      const timestamp = Date.now();
      const testUser = {
        fullName: `Test Student ${timestamp}`,
        email: `teststudent${timestamp}@example.com`,
        password: 'StudentPass123!'
      };

      // Navigate to registration page
      await page.goto('#/register');
      await expect(page).toHaveURL('**/register');

      // Fill and submit registration form
      await page.fill('[data-testid="full-name-input"]', testUser.fullName);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');

      // Skip if email confirmation is required
      if (await page.locator('text=Email Confirmation').isVisible()) {
        test.skip();
      }

      // Verify auto-login to dashboard
      await expect(page).toHaveURL('**/dashboard');
      await expect(page.locator(`text=${testUser.fullName.split(' ')[0]}`)).toBeVisible();

      // Logout for cleanup
      await auth.logout();
    });

    test('new_user_can_login_manually - Verify newly registered user can login manually after registration', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Generate unique test data to avoid conflicts
      const timestamp = Date.now();
      const testUser = {
        fullName: `Test Student ${timestamp}`,
        email: `teststudent${timestamp}@example.com`,
        password: 'StudentPass123!'
      };

      // First register the user
      await page.goto('#/register');
      await page.fill('[data-testid="full-name-input"]', testUser.fullName);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');

      // Skip if email confirmation is required
      if (await page.url().includes('register')) {
        test.skip();
      }

      // Logout if auto-logged in
      await auth.logout();

      // Navigate to login page
      await page.goto('#/login');
      await expect(page).toHaveURL('**/login');

      // Login with registered credentials
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.click('[data-testid="login-button"]');

      // Verify successful login
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('**/dashboard');
      await expect(page.locator(`text=${testUser.fullName.split(' ')[0]}`)).toBeVisible();

      // Cleanup
      await auth.logout();
    });
  });

  test.describe('Login Form', () => {
    test('login_form_displays_correctly - Navigate to login page and verify form elements', async ({ page }) => {
      // Navigate to login page
      await page.goto('#/login');
      await expect(page).toHaveURL('**/login');

      // Verify login form elements
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });

    test('successful_student_login - Login with valid student credentials', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Navigate to login page
      await page.goto('#/login');
      await expect(page).toHaveURL('**/login');

      // Login with test student credentials
      await auth.loginAsStudent();

      // Verify successful login
      await expect(page).toHaveURL('**/dashboard');

      // Visual regression: Take screenshot of dashboard after login
      await expect(page).toHaveScreenshot('student-dashboard-post-login.png', {
        fullPage: true,
        mask: [
          page.locator('[data-testid="user-avatar"]'),
          page.locator('[data-testid="last-login-time"]'),
        ],
      });
    });

    test('successful_admin_login - Login with valid admin credentials', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login with admin credentials
      await auth.loginAsAdmin();

      // Verify admin dashboard access
      await expect(page).toHaveURL('**/dashboard');

      // Logout
      await auth.logout();
    test('login_form_accessibility - Verify login form meets accessibility standards', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to login page
      await page.goto('#/login');
      await expect(page).toHaveURL('**/login');

      // Run accessibility audit on the login form
      const results = await accessibility.checkElementAccessibility('form', ACCESSIBILITY_CONFIGS.formsOnly);

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation
      await accessibility.testKeyboardNavigation();

      // Check form accessibility specifically
      await accessibility.checkFormAccessibility('form');
    });
    });
  });

  test.describe('Dashboard Access', () => {
    test('student_dashboard_access - Verify student can access dashboard with proper UI elements', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Verify dashboard access
      await expect(page).toHaveURL('**/dashboard');

      // Verify user info display
      await expect(page.locator(`text=${TEST_USERS.student.fullName.split(' ')[0]}`)).toBeVisible();
      await expect(page.locator('text=Courses')).toBeVisible();

      // Verify dashboard elements are visible
      await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();

      // Logout
      await auth.logout();
    });

    test('admin_dashboard_access - Verify admin can access dashboard with admin-specific UI elements', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login with admin credentials
      await auth.loginAsAdmin();

      // Verify admin dashboard access
      await expect(page).toHaveURL('**/dashboard');

      // Verify admin-specific UI elements
      await expect(page.locator('text=Admin')).toBeVisible();
      await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();

      // Verify admin navigation/menu items
    test('student_dashboard_accessibility - Verify student dashboard meets accessibility standards', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Verify dashboard access
      await expect(page).toHaveURL('**/dashboard');

      // Run accessibility audit on the student dashboard
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation for dashboard
      await accessibility.testKeyboardNavigation();

      // Check color contrast for dashboard elements
      await accessibility.checkColorContrast();
    });

    test('admin_dashboard_accessibility - Verify admin dashboard meets accessibility standards', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login with admin credentials
      await auth.loginAsAdmin();

      // Verify admin dashboard access
      await expect(page).toHaveURL('**/dashboard');

      // Run accessibility audit on the admin dashboard
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation for admin dashboard
      await accessibility.testKeyboardNavigation();

      // Check form accessibility for admin controls
      await accessibility.checkFormAccessibility();

      // Logout
      await auth.logout();
    });
  });

  test.describe('Logout Functionality', () => {
      await expect(page.locator('text=Users')).toBeVisible();
      await expect(page.locator('text=Analytics')).toBeVisible();

      // Verify admin role indicator
      const userRole = await auth.getCurrentUser();
      expect(userRole?.role).toBe('admin');

      // Visual regression: Take screenshot of admin dashboard
      await expect(page).toHaveScreenshot('admin-dashboard.png', {
        fullPage: true,
        mask: [
          page.locator('[data-testid="user-count"]'),
          page.locator('[data-testid="analytics-charts"]'),
        ],
      });

      // Logout
      await auth.logout();
    });
  });

  test.describe('Logout Functionality', () => {
    test('logout_redirects_to_home - Verify logout redirects to home page', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login first
      await auth.loginAsStudent();

      // Verify logout functionality
      await auth.logout();

      // Verify redirect after logout
      await expect(page).toHaveURL('**/');
      await expect(page.locator('text=Login')).toBeVisible();
    });
  });

  test.describe('Invalid Login Attempts', () => {
    test('wrong_password_shows_error - Test login with wrong password', async ({ page }) => {
      // Navigate to login
      await page.goto('#/login');

      // Test wrong password
      await page.fill('[data-testid="email-input"]', TEST_USERS.student.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword123');
      await page.click('[data-testid="login-button"]');

      // Verify error message for wrong password
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      await expect(page).toHaveURL('**/login'); // Should stay on login page
    });

    test('nonexistent_email_shows_error - Test login with non-existent email', async ({ page }) => {
      // Navigate to login
      await page.goto('#/login');

      // Test non-existent email
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.fill('[data-testid="password-input"]', 'anypassword123');
      await page.click('[data-testid="login-button"]');

      // Verify error message for non-existent email
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      await expect(page).toHaveURL('**/login'); // Should stay on login page
    });

    test('empty_fields_show_validation - Test login with empty fields', async ({ page }) => {
      // Navigate to login
      await page.goto('#/login');

      // Test empty fields
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', '');
      await page.click('[data-testid="login-button"]');

      // Verify validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('invalid_email_format_shows_error - Test login with invalid email format', async ({ page }) => {
      // Navigate to login
      await page.goto('#/login');

      // Test invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Verify email format validation
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('session_persists_after_login - Verify session is established after login', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login and verify session persistence
      await auth.loginAsStudent();

      // Verify initial login state
      await expect(page).toHaveURL('**/dashboard');
      expect(await auth.isLoggedIn()).toBe(true);
    });

    test('session_persists_after_page_refresh - Verify session persists after page refresh', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login
      await auth.loginAsStudent();

      // Test page refresh maintains login state
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify still logged in after refresh
      await expect(page).toHaveURL('**/dashboard');
      expect(await auth.isLoggedIn()).toBe(true);
    });

    test('session_persists_during_navigation - Verify session persists when navigating between pages', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login
      await auth.loginAsStudent();

      // Navigate to different pages and verify session persists
      await page.goto('#/courses');
      await expect(page).toHaveURL('**/courses');
      expect(await auth.isLoggedIn()).toBe(true);

      // Navigate back to dashboard
      await page.goto('#/dashboard');
      await expect(page).toHaveURL('**/dashboard');
      expect(await auth.isLoggedIn()).toBe(true);
    });

    test('user_info_persists_in_session - Verify user information persists in session', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login
      await auth.loginAsStudent();

      // Verify user info persists
      const userInfo = await auth.getCurrentUser();
      expect(userInfo?.name).toBe(TEST_USERS.student.fullName);
      expect(userInfo?.email).toBe(TEST_USERS.student.email);
    });

    test('logout_clears_session - Verify logout clears session completely', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login
      await auth.loginAsStudent();

      // Test logout clears session properly
      await auth.logout();

      // Verify logout redirect
      await expect(page).toHaveURL('**/');

      // Verify not logged in
      expect(await auth.isLoggedIn()).toBe(false);

      // Verify session is completely cleared
      const currentUser = await auth.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    test('protected_pages_require_login - Verify accessing protected pages redirects to login when not authenticated', async ({ page }) => {
      // Test that accessing protected page redirects to login
      await page.goto('#/dashboard');
      await expect(page).toHaveURL('**/login');
    });
  });
});