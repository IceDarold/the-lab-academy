import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { TEST_USERS, APIHelper, BrowserHelper, Utils } from './test-utils';

/**
 * Comprehensive E2E Error Handling and Edge Case Tests for Course System
 *
 * Tests cover network failures, form validation, authentication edge cases,
 * content loading errors, permission issues, browser compatibility, and data integrity.
 */

test.describe('Course System Error Handling and Edge Cases E2E Tests', () => {
  let auth: AuthHelpers;
  let apiHelper: APIHelper;
  let browserHelper: BrowserHelper;

  test.beforeEach(async ({ page, context }) => {
    auth = new AuthHelpers(page);
    apiHelper = new APIHelper(context);
    browserHelper = new BrowserHelper(page);

    // Clear any existing state
    await browserHelper.clearBrowserState();
  });

  test.describe('Network Failure Handling', () => {
    test('test_network_failure_handling - Test behavior when backend API is unavailable, verify graceful error messages and retry mechanisms, test offline content access', async ({ page, context }) => {
      // Test API unavailability
      await page.route('**/api/**', async route => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Service temporarily unavailable' })
        });
      });

      // Navigate to dashboard - should handle API failure gracefully
      await page.goto('#/dashboard');

      // Verify error message is displayed
      await expect(page.locator('text=Service temporarily unavailable')).toBeVisible();

      // Test retry mechanism if implemented
      const retryButton = page.locator('button:has-text("Retry")');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        // Should attempt to reload or retry API call
        await expect(page.locator('text=Service temporarily unavailable')).toBeVisible();
      }

      // Test offline content access (if implemented)
      // This would test if cached content is available when offline
      await page.context().setOffline(true);

      await page.reload();
      // Check if offline indicator or cached content is shown
      const offlineIndicator = page.locator('text=You are currently offline');
      const cachedContent = page.locator('[data-testid="cached-content"]');

      // Either offline message or cached content should be visible
      await expect(offlineIndicator.or(cachedContent)).toBeVisible();

      // Restore online state
      await page.context().setOffline(false);
    });
  });

  test.describe('Form Validation Errors', () => {
    test('test_form_validation_errors - Test registration with invalid email formats, course creation with missing required fields, lesson editing with malformed content, verify appropriate error messages', async ({ page }) => {
      // Test registration with invalid email formats
      await page.goto('#/register');

      // Test various invalid email formats
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com'
      ];

      for (const email of invalidEmails) {
        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', 'ValidPass123!');
        await page.fill('[data-testid="full-name-input"]', 'Test User');
        await page.check('[data-testid="terms-checkbox"]');

        await page.click('[data-testid="register-button"]');

        // Verify email validation error
        await expect(page.locator('text=Please enter a valid email')).toBeVisible();

        // Clear form for next test
        await page.fill('input[id="email-address"]', '');
      }

      // Test course creation with missing required fields
      await auth.loginAsAdmin();

      // Navigate to course creation (assuming admin panel)
      await page.goto('#/admin/courses/new');

      // Try to submit without required fields
      await page.click('[data-testid="submit-button"]');

      // Verify validation errors for required fields
      await expect(page.locator('text=Course title is required')).toBeVisible();
      await expect(page.locator('text=Course description is required')).toBeVisible();

      // Test lesson editing with malformed content
      await page.goto('#/admin/lessons/new');

      // Fill with malformed content (e.g., invalid JSON or HTML)
      await page.fill('[data-testid="lesson-content"]', '<invalid><unclosed><tags>');

      await page.click('[data-testid="submit-button"]');

      // Verify content validation error
      await expect(page.locator('text=Invalid content format')).toBeVisible();

      await auth.logout();
    });
  });

  test.describe('Authentication Edge Cases', () => {
    test('test_authentication_edge_cases - Test session timeout scenarios, concurrent login attempts, password reset with expired tokens, test account lockout after failed attempts', async ({ page, context }) => {
      // Test session timeout scenarios
      await auth.loginAsStudent();

      // Simulate session timeout by clearing tokens and reloading
      await page.evaluate(() => {
        localStorage.removeItem('accessToken');
        sessionStorage.clear();
      });

      await page.reload();

      // Should redirect to login page
      await expect(page).toHaveURL('**/login');

      // Test concurrent login attempts
      const page2 = await context.newPage();
      const auth2 = new AuthHelpers(page2);

      // Login with same user on both pages simultaneously
      await Promise.all([
        auth.loginAsStudent(),
        auth2.loginAsStudent()
      ]);

      // Both should succeed or handle gracefully
      await expect(page).toHaveURL('**/dashboard');
      await expect(page2).toHaveURL('**/dashboard');

      // Test password reset with expired tokens
      await page2.goto('#/forgot-password');
      await page2.fill('[data-testid="email-input"]', TEST_USERS.student.email);
      await page2.click('[data-testid="submit-button"]');

      // Assuming password reset flow exists
      const resetToken = 'expired-reset-token-123';

      await page2.goto(`#/reset-password?token=${resetToken}`);

      await page2.fill('[data-testid="password-input"]', 'NewPassword123!');
      await page2.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
      await page2.click('[data-testid="submit-button"]');

      // Should show expired token error
      await expect(page2.locator('text=Reset token has expired')).toBeVisible();

      // Test account lockout after failed attempts
      await page2.goto('#/login');

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page2.fill('[data-testid="email-input"]', TEST_USERS.student.email);
        await page2.fill('[data-testid="password-input"]', 'wrongpassword123');
        await page2.click('[data-testid="login-button"]');

        // Clear form for next attempt
        await page2.fill('input[type="password"]', '');
      }

      // Should show account locked message
      await expect(page2.locator('text=Account temporarily locked')).toBeVisible();

      // Cleanup
      await page2.close();
      await auth.logout();
    });
  });

  test.describe('Content Loading Errors', () => {
    test('test_content_loading_errors - Test accessing non-existent courses/lessons, corrupted lesson file handling, large content loading timeouts, verify error recovery and navigation', async ({ page }) => {
      await auth.loginAsStudent();

      // Test accessing non-existent course
      await page.goto('#/courses/non-existent-course-123');

      // Should show 404 or course not found error
      await expect(page.locator('text=Course not found')).toBeVisible();
      await expect(page.locator('text=404')).toBeVisible();

      // Test accessing non-existent lesson
      await page.goto('#/lessons/non-existent-lesson-456');

      // Should show lesson not found error
      await expect(page.locator('text=Lesson not found')).toBeVisible();

      // Test corrupted lesson file handling
      // Mock API to return corrupted content
      await page.route('**/api/lessons/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'lesson-123',
            title: 'Corrupted Lesson',
            content: '<invalid><xml><content>' // Corrupted/malformed content
          })
        });
      });

      await page.goto('#/lessons/lesson-123');

      // Should handle corrupted content gracefully
      await expect(page.locator('text=Error loading lesson content')).toBeVisible();

      // Test large content loading timeouts
      await page.route('**/api/lessons/large-lesson', async route => {
        // Simulate slow response
        await page.waitForTimeout(30000); // 30 seconds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'large-lesson',
            title: 'Large Lesson',
            content: 'x'.repeat(1000000) // 1MB of content
          })
        });
      });

      const startTime = Date.now();
      await page.goto('#/lessons/large-lesson');

      // Should either load successfully or show timeout error
      const loadTime = Date.now() - startTime;
      if (loadTime > 10000) { // If it took more than 10 seconds
        await expect(page.locator('text=Loading timeout')).toBeVisible();
      }

      // Test error recovery and navigation
      // Click back to courses or dashboard
      await page.click('a:has-text("Back to Courses")');

      // Should navigate successfully
      await expect(page).toHaveURL('**/courses');

      await auth.logout();
    });
  });

  test.describe('Permission and Access Control', () => {
    test('test_permission_access_control - Test student accessing admin-only features, unauthenticated access to protected routes, role-based feature visibility, verify proper redirects and error messages', async ({ page }) => {
      // Test unauthenticated access to protected routes
      await page.goto('#/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL('**/login');

      await page.goto('#/admin/users');

      // Should redirect to login
      await expect(page).toHaveURL('**/login');

      // Test student accessing admin-only features
      await auth.loginAsStudent();

      await page.goto('#/admin/users');

      // Should show access denied error
      await expect(page.locator('text=Access denied')).toBeVisible();
      await expect(page.locator('text=Admin access required')).toBeVisible();

      // Test role-based feature visibility
      // Student should not see admin panel link
      await expect(page.locator('text=Admin Panel')).not.toBeVisible();

      // Student should see student-specific features
      await expect(page.locator('text=My Courses')).toBeVisible();
      await expect(page.locator('text=Progress')).toBeVisible();

      await auth.logout();

      // Test admin access to all features
      await auth.loginAsAdmin();

      await page.goto('#/admin/users');

      // Should have access
      await expect(page.locator('text=User Management')).toBeVisible();

      // Admin should see admin panel link
      await expect(page.locator('text=Admin Panel')).toBeVisible();

      await auth.logout();
    });
  });

  test.describe('Browser Compatibility Issues', () => {
    test('test_browser_compatibility - Test with different viewport sizes, keyboard navigation for accessibility, JavaScript disabled graceful degradation, verify consistent behavior across browsers', async ({ page, browserName }) => {
      await auth.loginAsStudent();

      // Test with different viewport sizes (mobile/tablet/desktop)
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        await page.goto('#/dashboard');

        // Verify responsive layout
        if (viewport.name === 'mobile') {
          // Mobile menu should be collapsed
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        } else {
          // Desktop/tablet should show full navigation
          await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
        }

        // Verify content is accessible
        await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();
      }

      // Test keyboard navigation for accessibility
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should focus on first interactive element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

      // Test navigation with arrow keys if applicable
      await page.keyboard.press('ArrowDown');

      // Test JavaScript disabled graceful degradation
      // Disable JavaScript
      await page.route('**/*', async route => {
        if (route.request().resourceType() === 'script') {
          await route.abort();
        } else {
          await route.continue();
        }
      });

      await page.reload();

      // Should show no-JS message or basic HTML version
      await expect(page.locator('text=JavaScript is required')).toBeVisible();

      // Or should have basic functionality without JS
      await expect(page.locator('text=Welcome')).toBeVisible();

      await auth.logout();
    });
  });

  test.describe('Data Integrity Edge Cases', () => {
    test('test_data_integrity_edge_cases - Test handling of special characters in content, Unicode text rendering, very long content loading, verify data consistency after errors', async ({ page }) => {
      await auth.loginAsAdmin();

      // Test handling of special characters in content
      const specialContent = {
        title: 'Test with Special Characters: ñáéíóú ¿¡! @#$%^&*()',
        description: 'Content with <script>alert("xss")</script> and SQL\' OR \'1\'=\'1',
        content: 'Unicode: 🎉 🚀 💻 🌟 📚 and emojis 🎨 🎵 🎬'
      };

      await page.goto('#/admin/courses/new');

      await page.fill('[data-testid="title-input"]', specialContent.title);
      await page.fill('[data-testid="description-textarea"]', specialContent.description);
      await page.fill('[data-testid="course-content"]', specialContent.content);

      await page.click('[data-testid="submit-button"]');

      // Should handle special characters without errors
      await expect(page.locator('text=Course created successfully')).toBeVisible();

      // Verify content is rendered correctly
      await page.goto('#/courses'); // Assuming course list shows the created course
      await expect(page.locator(`text=${specialContent.title}`)).toBeVisible();

      // Test Unicode text rendering
      await page.goto('#/admin/lessons/new');

      await page.fill('[data-testid="title-input"]', 'Unicode Test: 中文 العربية русский עברית');
      await page.fill('[data-testid="lesson-content"]', '🎯 Target 🎯 🎪 Circus 🎪 🎨 Art 🎨');

      await page.click('[data-testid="submit-button"]');

      // Should render Unicode correctly
      await expect(page.locator('text=Lesson created successfully')).toBeVisible();

      // Test very long content loading
      const longContent = 'A'.repeat(100000); // 100KB of content

      await page.goto('#/admin/lessons/new');

      await page.fill('[data-testid="title-input"]', 'Very Long Content Test');
      await page.fill('[data-testid="lesson-content"]', longContent);

      await page.click('[data-testid="submit-button"]');

      // Should handle large content
      await expect(page.locator('text=Lesson created successfully')).toBeVisible();

      // Test data consistency after errors
      // Create a course, then simulate an error during update
      await page.goto('#/admin/courses/1/edit'); // Assuming course ID 1 exists

      await page.fill('[data-testid="title-input"]', 'Updated Title');

      // Simulate network error during save
      await page.route('**/api/courses/1', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' })
        });
      });

      await page.click('[data-testid="submit-button"]');

      // Should show error but not corrupt data
      await expect(page.locator('text=Internal server error')).toBeVisible();

      // Verify original data is still intact
      await page.reload();
      await expect(page.locator('input[name="title"]')).toHaveValue('Updated Title');

      await auth.logout();
    });
  });
});