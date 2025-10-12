import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { errorScenarioManager } from './error-scenario-helpers';

/**
 * Chaos Engineering E2E Tests
 *
 * Tests the application under chaotic conditions including random failures,
 * component crashes, state corruption, and memory pressure to ensure
 * robustness and graceful degradation.
 */

test.describe('Chaos Engineering E2E Tests', () => {
  let auth: AuthHelpers;

  test.beforeEach(async ({ page, context }) => {
    auth = new AuthHelpers(page, context);

    // Clear any existing state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Random Failure Injection', () => {
    test('test_random_network_failures_during_user_journey - Inject random network failures during complete user journey from login to course completion', async ({ page, context }) => {
      // Login as student first
      await auth.loginAsStudent();

      // Start chaos engineering with random network failures
      errorScenarioManager.chaosEngineer.injectRandomFailures([
        '**/api/courses*',
        '**/api/lessons*',
        '**/api/auth/me',
        '**/api/progress*'
      ], {
        failureRate: 0.3, // 30% failure rate
        failureTypes: ['network', 'server'],
        duration: 120000 // 2 minutes
      });

      // Navigate through the application
      await page.goto('#/dashboard');
      await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();

      // Try to access courses
      const courseLink = page.locator('[data-testid="course-link"]').first();
      if (await courseLink.isVisible()) {
        await courseLink.click();

        // Navigate to a lesson
        const lessonLink = page.locator('[data-testid="lesson-link"]').first();
        if (await lessonLink.isVisible()) {
          await lessonLink.click();

          // Try to complete lesson
          const completeButton = page.locator('[data-testid="complete-lesson"]');
          if (await completeButton.isVisible()) {
            await completeButton.click();
          }
        }
      }

      // Check if application remains functional despite chaos
      await page.goto('#/dashboard');
      const dashboardVisible = await page.locator('[data-testid="dashboard"]').isVisible();

      // Application should either work or show appropriate error messages
      expect(dashboardVisible || await page.locator('text=Error').isVisible()).toBe(true);

      // Stop chaos
      errorScenarioManager.chaosEngineer.stopChaos();
    });

    test('test_component_failure_injection - Test application behavior when React components fail randomly', async ({ page }) => {
      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Simulate component failures by injecting errors
      await page.addScriptTag({
        content: `
          window.simulateComponentFailure = function() {
            // Randomly throw errors in components
            if (Math.random() < 0.2) {
              throw new Error('Simulated component failure');
            }
          };
        `
      });

      // Navigate and interact while components might fail
      await page.click('[data-testid="courses-list"]');

      // Check for error boundaries or graceful handling
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      const fallbackUI = page.locator('[data-testid="fallback-ui"]');

      // Either normal operation or error handling should be visible
      await expect(page.locator('[data-testid="courses-list"]').or(errorBoundary).or(fallbackUI)).toBeVisible();
    });
  });

  test.describe('State Corruption Scenarios', () => {
    test('test_state_corruption_recovery - Test application recovery when localStorage/sessionStorage data becomes corrupted', async ({ page }) => {
      await auth.loginAsStudent();

      // Corrupt stored state
      await page.evaluate(() => {
        localStorage.setItem('userPreferences', 'invalid json {{{');
        localStorage.setItem('appState', '{"corrupted": "data", "missing": }');
        sessionStorage.setItem('sessionData', null);
      });

      // Reload page to trigger state loading
      await page.reload();

      // Application should handle corrupted state gracefully
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

      // Check if corrupted data was cleaned up
      const corruptedData = await page.evaluate(() => {
        return {
          userPrefs: localStorage.getItem('userPreferences'),
          appState: localStorage.getItem('appState'),
          sessionData: sessionStorage.getItem('sessionData')
        };
      });

      // Corrupted data should be handled (either cleaned or ignored)
      expect(corruptedData.userPrefs).not.toBe('invalid json {{{');
    });

    test('test_memory_pressure_handling - Test application behavior under memory pressure conditions', async ({ page }) => {
      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Simulate memory pressure
      await page.evaluate(() => {
        // Allocate large amounts of memory
        const largeArrays = [];
        for (let i = 0; i < 50; i++) {
          largeArrays.push(new Array(1000000).fill('memory_pressure_test'));
        }
        (window as any).memoryPressureTest = largeArrays;
      });

      // Continue using the application
      await page.click('[data-testid="courses-list"]');

      // Application should remain functional or show appropriate warnings
      const isStillFunctional = await page.locator('[data-testid="courses-list"]').isVisible() ||
                               await page.locator('text=Low memory').isVisible();

      expect(isStillFunctional).toBe(true);
    });
  });

  test.describe('Service Worker Failure Scenarios', () => {
    test('test_service_worker_failure_handling - Test application when service worker fails to register or function properly', async ({ page }) => {
      // Mock service worker registration failure
      await page.addScriptTag({
        content: `
          navigator.serviceWorker.register = () => Promise.reject(new Error('SW registration failed'));
        `
      });

      await page.goto('#/');

      // Application should work without service worker
      await expect(page.locator('[data-testid="landing-page"]')).toBeVisible();

      // Try login flow
      await auth.loginAsStudent();

      // Should still work despite SW failure
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

    test('test_offline_functionality_without_service_worker - Test offline capabilities when service worker is unavailable', async ({ page }) => {
      // Disable service worker
      await page.addScriptTag({
        content: `
          navigator.serviceWorker = undefined;
        `
      });

      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Go offline
      await page.context().setOffline(true);

      // Try to access cached content
      await page.reload();

      // Should show offline indicator or basic functionality
      const offlineIndicator = page.locator('text=offline').or(page.locator('text=connection lost'));
      const basicContent = page.locator('[data-testid="basic-layout"]');

      await expect(offlineIndicator.or(basicContent)).toBeVisible();

      // Restore online
      await page.context().setOffline(false);
    });
  });

  test.describe('Resource Loading Failure Scenarios', () => {
    test('test_css_font_loading_failures - Test application when CSS or font resources fail to load', async ({ page }) => {
      await page.route('**/*.{css,woff,woff2,ttf}', route => route.abort());

      await page.goto('#/');

      // Application should still be functional with failed resources
      await expect(page.locator('body')).toBeVisible();

      // Text should still be readable (fallback fonts)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length).toBeGreaterThan(0);
    });

    test('test_image_loading_failures - Test application when images fail to load', async ({ page }) => {
      await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort());

      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Should show alt text or placeholders for failed images
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const altText = await img.getAttribute('alt');
          const hasError = await img.evaluate(el => el.complete && el.naturalHeight === 0);

          // Either has alt text or shows error gracefully
          expect(altText || hasError).toBeTruthy();
        }
      }

      // Core functionality should still work
      await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();
    });
  });

  test.describe('JavaScript Error Scenarios', () => {
    test('test_javascript_error_boundaries - Test error boundaries catch and handle JavaScript errors gracefully', async ({ page }) => {
      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Inject a JavaScript error
      await page.addScriptTag({
        content: `
          setTimeout(() => {
            throw new Error('Simulated JavaScript error');
          }, 1000);
        `
      });

      // Wait for error to occur
      await page.waitForTimeout(2000);

      // Check for error boundary or graceful handling
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      const errorMessage = page.locator('text=Something went wrong');
      const fallbackUI = page.locator('[data-testid="fallback-ui"]');

      // Should show error boundary or fallback UI
      await expect(errorBoundary.or(errorMessage).or(fallbackUI)).toBeVisible();

      // Core navigation should still work
      await page.goto('#/');
      await expect(page.locator('[data-testid="landing-page"]')).toBeVisible();
    });

    test('test_async_error_handling - Test handling of errors in async operations', async ({ page }) => {
      await auth.loginAsStudent();

      // Mock API to return errors
      await page.route('**/api/courses', route => route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      }));

      await page.goto('#/dashboard');

      // Try to load courses (should handle API error)
      await page.click('[data-testid="refresh-courses"]');

      // Should show error message but not crash
      await expect(page.locator('text=Server error').or(page.locator('text=Failed to load'))).toBeVisible();

      // Navigation should still work
      await page.click('[data-testid="profile-link"]');
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible();
    });
  });

  test.describe('Browser Compatibility Edge Cases', () => {
    test('test_localstorage_unavailable - Test application when localStorage is disabled', async ({ page }) => {
      // Disable localStorage
      await page.addScriptTag({
        content: `
          Object.defineProperty(window, 'localStorage', {
            get: () => {
              throw new Error('localStorage disabled');
            }
          });
        `
      });

      await page.goto('#/');

      // Application should handle localStorage failure
      await expect(page.locator('body')).toBeVisible();

      // Try login (should work without localStorage)
      await auth.loginAsStudent();

      // Should redirect appropriately
      await expect(page).toHaveURL(/dashboard|profile/);
    });

    test('test_websocket_failure - Test application when WebSocket connections fail', async ({ page }) => {
      // Mock WebSocket failure
      await page.addScriptTag({
        content: `
          window.WebSocket = function() {
            throw new Error('WebSocket not supported');
          };
        `
      });

      await auth.loginAsStudent();
      await page.goto('#/dashboard');

      // Application should work without WebSocket
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

      // Real-time features might be disabled but core functionality works
      const realtimeIndicator = page.locator('[data-testid="realtime-status"]');
      if (await realtimeIndicator.isVisible()) {
        await expect(realtimeIndicator).toHaveText(/offline|disconnected/i);
      }
    });
  });
});