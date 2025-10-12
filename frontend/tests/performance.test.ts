import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { TEST_USERS } from './test-utils';
import { PerformanceHelpers, performanceHelpers } from './performance-helpers';
import { getThresholdsForFlow, PERFORMANCE_CONFIG } from './performance-config';

/**
 * Comprehensive Performance Tests for E2E User Flows
 *
 * Tests measure and validate performance metrics for critical user journeys
 * including authentication, navigation, and content consumption.
 */

test.describe('Performance Tests', () => {
  test.describe('Authentication Performance', () => {
    test('login_performance - Measure login flow performance metrics', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      // Run performance test for login flow
      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Navigate to login page
          await page.goto('#/login');
          await expect(page).toHaveURL('**/login');

          // Measure the login interaction
          await perf.measureInteraction('login-form-submission', async () => {
            await auth.loginAsStudent();
          });

          // Verify successful login
          await expect(page).toHaveURL('**/dashboard');

          return await perf.stopMeasurement();
        },
        getThresholdsForFlow('login')
      );

      // Validate performance thresholds
      if (PERFORMANCE_CONFIG.failOnViolation.error && !validation.passed) {
        const errors = validation.violations.filter(v => v.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Login performance test failed with ${errors.length} errors: ${errors.map(e => `${e.category}.${e.metric}: ${e.actual} > ${e.threshold}`).join(', ')}`);
        }
      }

      // Log performance results
      console.log('Login Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));

      // Additional assertions for critical metrics
      expect(metrics.pageLoad.domContentLoaded).toBeLessThan(2000); // Should load within 2s
      expect(metrics.api.averageResponseTime).toBeLessThan(1000); // API should respond within 1s
      expect(metrics.interactions.averageInteractionTime).toBeLessThan(200); // Interactions should be fast
    });

    test('registration_performance - Measure registration flow performance metrics', async ({ page, context }) => {
      // Generate unique test data
      const timestamp = Date.now();
      const testUser = {
        fullName: `Perf Test User ${timestamp}`,
        email: `perftest${timestamp}@example.com`,
        password: 'TestPass123!'
      };

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Navigate to registration page
          await page.goto('#/register');
          await expect(page).toHaveURL('**/register');

          // Measure registration form interaction
          await perf.measureInteraction('registration-form-submission', async () => {
            await page.fill('[data-testid="full-name-input"]', testUser.fullName);
            await page.fill('[data-testid="email-input"]', testUser.email);
            await page.fill('[data-testid="password-input"]', testUser.password);
            await page.check('[data-testid="terms-checkbox"]');
            await page.click('[data-testid="register-button"]');
          });

          // Wait for completion (either dashboard or confirmation)
          try {
            await page.waitForURL('**/dashboard', { timeout: 10000 });
          } catch {
            // Handle email confirmation case
            await expect(page.locator('text=Email Confirmation')).toBeVisible();
          }

          return await perf.stopMeasurement();
        },
        getThresholdsForFlow('register')
      );

      // Validate performance
      if (PERFORMANCE_CONFIG.failOnViolation.error && !validation.passed) {
        const errors = validation.violations.filter(v => v.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Registration performance test failed with ${errors.length} errors: ${errors.map(e => `${e.category}.${e.metric}: ${e.actual} > ${e.threshold}`).join(', ')}`);
        }
      }

      console.log('Registration Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));
    });
  });

  test.describe('Dashboard Performance', () => {
    test('dashboard_load_performance - Measure dashboard loading performance', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login first
          await auth.loginAsStudent();

          // Dashboard should already be loaded from login, but measure navigation
          await perf.measureInteraction('dashboard-navigation', async () => {
            await page.goto('#/dashboard');
            await expect(page).toHaveURL('**/dashboard');
          });

          // Wait for dashboard content to load
          await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();

          return await perf.stopMeasurement();
        },
        getThresholdsForFlow('dashboard')
      );

      // Validate performance
      if (PERFORMANCE_CONFIG.failOnViolation.error && !validation.passed) {
        const errors = validation.violations.filter(v => v.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Dashboard performance test failed with ${errors.length} errors: ${errors.map(e => `${e.category}.${e.metric}: ${e.actual} > ${e.threshold}`).join(', ')}`);
        }
      }

      console.log('Dashboard Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));

      // Critical dashboard assertions
      expect(metrics.pageLoad.domContentLoaded).toBeLessThan(3000);
      expect(metrics.network.totalRequests).toBeLessThan(50);
    });
  });

  test.describe('Navigation Performance', () => {
    test('course_navigation_performance - Measure course navigation performance', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login and navigate to dashboard
          await auth.loginAsStudent();
          await expect(page).toHaveURL('**/dashboard');

          // Measure course navigation
          await perf.measureInteraction('courses-page-navigation', async () => {
            await page.goto('#/courses');
            await expect(page).toHaveURL('**/courses');
          });

          // Wait for courses to load
          await page.waitForSelector('[data-testid="course-card"], [data-testid="courses-list"]', { timeout: 5000 });

          return await perf.stopMeasurement();
        },
        getThresholdsForFlow('courseNavigation')
      );

      // Validate performance
      if (PERFORMANCE_CONFIG.failOnViolation.error && !validation.passed) {
        const errors = validation.violations.filter(v => v.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Course navigation performance test failed with ${errors.length} errors: ${errors.map(e => `${e.category}.${e.metric}: ${e.actual} > ${e.threshold}`).join(', ')}`);
        }
      }

      console.log('Course Navigation Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));
    });
  });

  test.describe('Lesson Loading Performance', () => {
    test('lesson_loading_performance - Measure lesson loading performance', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login and navigate to courses
          await auth.loginAsStudent();
          await page.goto('#/courses');
          await expect(page).toHaveURL('**/courses');

          // Find and click on first available course/lesson
          const courseLink = page.locator('[data-testid="course-card"] a, [data-testid="lesson-link"]').first();
          if (await courseLink.isVisible()) {
            await perf.measureInteraction('lesson-navigation', async () => {
              await courseLink.click();
              // Wait for lesson page to load
              await page.waitForURL('**/lesson/**', { timeout: 10000 });
            });

            // Wait for lesson content to load
            await page.waitForSelector('[data-testid="lesson-content"], .lesson-content, [data-testid="lesson-title"]', { timeout: 5000 });
          } else {
            // If no courses available, navigate to a known lesson path for testing
            await perf.measureInteraction('lesson-direct-navigation', async () => {
              await page.goto('#/lesson/sample-lesson');
              await expect(page).toHaveURL('**/lesson/**');
            });
          }

          return await perf.stopMeasurement();
        },
        getThresholdsForFlow('lessonLoading')
      );

      // Validate performance
      if (PERFORMANCE_CONFIG.failOnViolation.error && !validation.passed) {
        const errors = validation.violations.filter(v => v.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Lesson loading performance test failed with ${errors.length} errors: ${errors.map(e => `${e.category}.${e.metric}: ${e.actual} > ${e.threshold}`).join(', ')}`);
        }
      }

      console.log('Lesson Loading Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('resource_loading_efficiency - Measure resource loading and caching efficiency', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login and load dashboard
          await auth.loginAsStudent();
          await expect(page).toHaveURL('**/dashboard');

          // Navigate to courses to load more resources
          await page.goto('#/courses');
          await expect(page).toHaveURL('**/courses');

          // Wait for all resources to load
          await page.waitForLoadState('networkidle');

          return await perf.stopMeasurement();
        }
      );

      console.log('Resource Loading Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));

      // Resource-specific assertions
      expect(metrics.resources.totalResourceSize).toBeLessThan(5 * 1024 * 1024); // 5MB total
      expect(metrics.network.cachedRequests).toBeGreaterThan(0); // Should have some cached resources

      // Check resource breakdown
      const { resourceBreakdown } = metrics.resources;
      expect(resourceBreakdown.js.count).toBeGreaterThan(0); // Should have JS files
      expect(resourceBreakdown.css.count).toBeGreaterThan(0); // Should have CSS files
    });
  });

  test.describe('Memory Usage Performance', () => {
    test('memory_usage_monitoring - Monitor memory usage during user interactions', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login
          await auth.loginAsStudent();

          // Perform multiple navigation actions to stress memory
          await page.goto('#/courses');
          await page.goto('#/dashboard');
          await page.goto('#/courses');
          await page.goto('#/dashboard');

          // Wait for stability
          await page.waitForTimeout(2000);

          return await perf.stopMeasurement();
        }
      );

      console.log('Memory Usage Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));

      // Memory assertions
      expect(metrics.memory.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB max
      expect(metrics.memory.usedJSHeapSize).toBeGreaterThan(0); // Should use some memory
    });
  });

  test.describe('API Performance', () => {
    test('api_response_times - Measure API call performance', async ({ page, context }) => {
      const auth = new AuthHelpers(page);

      const { metrics, validation } = await performanceHelpers.runPerformanceTest(
        page,
        context,
        async (perf) => {
          await perf.startMeasurement();

          // Login (triggers API calls)
          await auth.loginAsStudent();

          // Navigate to courses (triggers more API calls)
          await page.goto('#/courses');
          await expect(page).toHaveURL('**/courses');

          // Wait for API calls to complete
          await page.waitForLoadState('networkidle');

          return await perf.stopMeasurement();
        }
      );

      console.log('API Performance Report:');
      console.log(performanceHelpers.create(page, context).generateReport(metrics, validation));

      // API-specific assertions
      expect(metrics.api.totalApiCalls).toBeGreaterThan(0); // Should have made API calls
      expect(metrics.api.averageResponseTime).toBeLessThan(1000); // APIs should respond within 1s
      expect(metrics.api.failedApiCalls).toBe(0); // No failed API calls
    });
  });
});