import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';

/**
 * Visual Regression Tests for The Lab Academy
 *
 * Tests visual consistency of key pages and components using screenshot comparison.
 * Baselines are stored in test-results/ and can be updated with --update-snapshots.
 */

test.describe('visual-regression - Visual Regression Tests', () => {
  test.describe('Public Pages', () => {
    test('landing_page_visual_consistency - Verify landing page layout and design', async ({ page }) => {
      // Navigate to landing page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(1000);

      // Take full page screenshot for visual regression
      await expect(page).toHaveScreenshot('landing-page.png', {
        fullPage: true,
        mask: [
          // Mask any dynamic content like timestamps or random elements
          page.locator('[data-testid="dynamic-timestamp"]'),
          page.locator('[data-testid="random-quote"]'),
        ],
      });
    });

    test('login_page_visual_consistency - Verify login form layout', async ({ page }) => {
      await page.goto('#/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
      });
    });

    test('registration_page_visual_consistency - Verify registration form layout', async ({ page }) => {
      await page.goto('#/register');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('registration-page.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Authenticated Student Pages', () => {
    test('student_dashboard_visual_consistency - Verify student dashboard layout', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();
      await page.waitForLoadState('networkidle');

      // Wait for dashboard content to load
      await page.waitForSelector('[data-testid="courses-list"]');

      await expect(page).toHaveScreenshot('student-dashboard.png', {
        fullPage: true,
        mask: [
          // Mask user-specific content that might vary
          page.locator('[data-testid="user-avatar"]'),
          page.locator('[data-testid="last-login-time"]'),
        ],
      });

      await auth.logout();
    });

    test('course_catalog_visual_consistency - Verify course catalog page', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsStudent();
      await page.goto('#/courses');
      await page.waitForLoadState('networkidle');

      // Wait for course cards to load
      await page.waitForSelector('[data-testid="course-card"]');

      await expect(page).toHaveScreenshot('course-catalog.png', {
        fullPage: true,
      });

      await auth.logout();
    });

    test('course_detail_page_visual_consistency - Verify individual course page', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsStudent();
      // Navigate to a specific course (assuming first course in catalog)
      await page.goto('#/courses');
      await page.waitForLoadState('networkidle');

      // Click on first course card
      await page.locator('[data-testid="course-card"]').first().click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('course-detail.png', {
        fullPage: true,
      });

      await auth.logout();
    });

    test('lesson_page_visual_consistency - Verify lesson content page', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsStudent();
      // Navigate to courses and select a lesson
      await page.goto('#/courses');
      await page.waitForLoadState('networkidle');

      // Click on first course
      await page.locator('[data-testid="course-card"]').first().click();
      await page.waitForLoadState('networkidle');

      // Click on first lesson
      await page.locator('[data-testid="lesson-link"]').first().click();
      await page.waitForLoadState('networkidle');

      // Wait for lesson content to load
      await page.waitForSelector('[data-testid="lesson-content"]');

      await expect(page).toHaveScreenshot('lesson-page.png', {
        fullPage: true,
        mask: [
          // Mask interactive code runner output if present
          page.locator('[data-testid="code-output"]'),
        ],
      });

      await auth.logout();
    });
  });

  test.describe('Admin Interface', () => {
    test('admin_dashboard_visual_consistency - Verify admin dashboard layout', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsAdmin();
      await page.waitForLoadState('networkidle');

      // Wait for admin panel to load
      await page.waitForSelector('[data-testid="admin-panel"]');

      await expect(page).toHaveScreenshot('admin-dashboard.png', {
        fullPage: true,
        mask: [
          // Mask dynamic admin stats that might change
          page.locator('[data-testid="user-count"]'),
          page.locator('[data-testid="analytics-charts"]'),
        ],
      });

      await auth.logout();
    });

    test('admin_users_page_visual_consistency - Verify admin users management page', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsAdmin();
      // Navigate to users page (assuming admin navigation)
      await page.locator('text=Users').click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('admin-users.png', {
        fullPage: true,
        mask: [
          // Mask user list with dynamic data
          page.locator('[data-testid="user-list"]'),
        ],
      });

      await auth.logout();
    });

    test('admin_content_management_visual_consistency - Verify content management interface', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsAdmin();
      // Navigate to content management (assuming admin navigation)
      await page.locator('text=Courses').click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('admin-content-management.png', {
        fullPage: true,
      });

      await auth.logout();
    });
  });

  test.describe('Error Pages', () => {
    test('404_error_page_visual_consistency - Verify 404 error page layout', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('#/non-existent-page');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('404-error-page.png', {
        fullPage: true,
      });
    });

    test('500_error_page_visual_consistency - Verify 500 error page layout', async ({ page }) => {
      // This would require triggering a 500 error, for now skip or mock
      test.skip();
      // Implementation would depend on how errors are handled in the app
    });
  });

  test.describe('Component Screenshots', () => {
    test('login_form_component_visual_consistency - Screenshot of login form component only', async ({ page }) => {
      await page.goto('#/login');
      await page.waitForLoadState('networkidle');

      // Take screenshot of just the login form
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toHaveScreenshot('login-form-component.png');
    });

    test('course_card_component_visual_consistency - Screenshot of course card component', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await auth.loginAsStudent();
      await page.goto('#/courses');
      await page.waitForLoadState('networkidle');

      // Take screenshot of first course card
      const courseCard = page.locator('[data-testid="course-card"]').first();
      await expect(courseCard).toHaveScreenshot('course-card-component.png');

      await auth.logout();
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile_dashboard_visual_consistency - Verify dashboard on mobile viewport', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await auth.loginAsStudent();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
      });

      await auth.logout();
    });

    test('tablet_course_catalog_visual_consistency - Verify course catalog on tablet viewport', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await auth.loginAsStudent();
      await page.goto('#/courses');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('course-catalog-tablet.png', {
        fullPage: true,
      });

      await auth.logout();
    });
  });

  test.describe('State Changes', () => {
    test('form_validation_states_visual_consistency - Verify form validation error states', async ({ page }) => {
      await page.goto('#/login');
      await page.waitForLoadState('networkidle');

      // Trigger validation errors
      await page.click('[data-testid="login-button"]');

      // Wait for validation messages
      await page.waitForSelector('text=Email is required');

      await expect(page).toHaveScreenshot('login-form-validation-errors.png', {
        fullPage: true,
      });
    });

    test('loading_states_visual_consistency - Verify loading states during navigation', async ({ page }) => {
      const auth = new AuthHelpers(page);

      await page.goto('#/login');

      // Start login process
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');

      // Take screenshot during loading state (before redirect)
      await expect(page).toHaveScreenshot('login-loading-state.png', {
        fullPage: true,
      });

      // Wait for navigation to complete
      await page.waitForURL('**/dashboard');
    });
  });
});