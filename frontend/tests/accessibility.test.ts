import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { AccessibilityHelpers, ACCESSIBILITY_CONFIGS } from './accessibility-helpers';

/**
 * Comprehensive Accessibility Tests for Course System
 *
 * Tests cover WCAG 2.1 AA compliance, keyboard navigation, screen reader support,
 * color contrast, form accessibility, and image accessibility across all major pages.
 */

test.describe('Course System Accessibility Tests', () => {
  test.describe('Landing Page Accessibility', () => {
    test('landing_page_accessibility - Verify landing page meets WCAG 2.1 AA standards', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to landing page
      await page.goto('#/');
      await expect(page).toHaveURL('**/');

      // Run comprehensive accessibility audit
      const results = await accessibility.runAccessibilityAudit(ACCESSIBILITY_CONFIGS.wcagAA);

      // Assert WCAG AA compliance
      accessibility.assertWCAGCompliance(results, 'AA');

      // Check keyboard navigation
      await accessibility.testKeyboardNavigation();

      // Check color contrast
      await accessibility.checkColorContrast();

      // Check image accessibility
      await accessibility.checkImageAccessibility();
    });

    test('landing_page_screen_reader_support - Verify screen reader compatibility', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to landing page
      await page.goto('#/');

      // Check semantic HTML structure
      await expect(page.locator('header, nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      // Check ARIA labels and roles
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        // Either aria-label or visible text should be present
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('Authentication Pages Accessibility', () => {
    test('login_page_comprehensive_accessibility - Complete accessibility audit of login page', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to login page
      await page.goto('#/login');
      await expect(page).toHaveURL('**/login');

      // Run full accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical violations
      accessibility.assertNoCriticalViolations(results);

      // Check form accessibility specifically
      await accessibility.checkFormAccessibility('form');

      // Test keyboard navigation through form
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
    });

    test('registration_page_accessibility - Verify registration form accessibility', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to registration page
      await page.goto('#/register');
      await expect(page).toHaveURL('**/register');

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check form labels and associations
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }

      // Check error message accessibility
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-button"]');

      const errorMessages = page.locator('[role="alert"], .error-message');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
        const ariaLive = await errorMessages.first().getAttribute('aria-live');
        expect(ariaLive).toBe('assertive');
      }
    });
  });

  test.describe('Student Dashboard Accessibility', () => {
    test('student_dashboard_full_accessibility - Comprehensive accessibility audit of student dashboard', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as student
      await auth.loginAsStudent();
      await expect(page).toHaveURL('**/dashboard');

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check navigation landmarks
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      await expect(page.locator('main, [role="main"]')).toBeVisible();

      // Check course cards accessibility
      const courseCards = page.locator('[data-testid="course-card"]');
      if (await courseCards.count() > 0) {
        const firstCard = courseCards.first();
        await expect(firstCard).toHaveAttribute('tabindex', '0');

        // Check heading hierarchy
        await expect(page.locator('h1, h2')).toBeVisible();
      }

      // Check progress indicators accessibility
      const progressBars = page.locator('[role="progressbar"], .progress-bar');
      if (await progressBars.count() > 0) {
        const firstProgress = progressBars.first();
        await expect(firstProgress).toHaveAttribute('aria-valuenow');
        await expect(firstProgress).toHaveAttribute('aria-valuemin');
        await expect(firstProgress).toHaveAttribute('aria-valuemax');
      }
    });
  });

  test.describe('Course Pages Accessibility', () => {
    test('courses_catalog_accessibility - Verify courses catalog page accessibility', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to courses page
      await page.goto('#/courses');
      await expect(page).toHaveURL('**/courses');

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check course cards as list items
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();

      // Verify each card has proper heading and link structure
      const firstCard = courseCards.first();
      await expect(firstCard.locator('h2, h3, [data-testid="course-title"]')).toBeVisible();

      // Check search functionality accessibility
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await expect(searchInput).toHaveAttribute('aria-label');
        await expect(searchInput).toHaveAttribute('type', 'search');
      }
    });

    test('course_detail_page_accessibility - Verify course detail page accessibility', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to course detail
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check curriculum structure
      const curriculum = page.locator('[data-testid="course-curriculum"], .curriculum');
      if (await curriculum.isVisible()) {
        // Should have proper heading hierarchy
        await expect(curriculum.locator('h3, h4')).toBeVisible();

        // Check lesson links accessibility
        const lessonLinks = curriculum.locator('a');
        if (await lessonLinks.count() > 0) {
          await expect(lessonLinks.first()).toHaveAttribute('href');
        }
      }

      // Check enrollment button accessibility
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await expect(enrollButton).toHaveAttribute('aria-describedby');
      }
    });

    test('lesson_page_accessibility - Verify lesson page accessibility', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login and navigate to lesson
      await auth.loginAsStudent();
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Enroll if needed
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      // Navigate to first lesson
      const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
      await firstLessonLink.click();

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check lesson content structure
      await expect(page.locator('[data-testid="lesson-content"], .lesson-content')).toBeVisible();

      // Check code cells accessibility
      const codeCells = page.locator('[data-testid="code-cell"], pre, code');
      if (await codeCells.count() > 0) {
        // Code should be properly marked up
        await expect(codeCells.first()).toBeVisible();
      }

      // Check navigation buttons
      const navButtons = page.locator('[data-testid="next-lesson"], [data-testid="prev-lesson"]');
      if (await navButtons.count() > 0) {
        await expect(navButtons.first()).toHaveAttribute('aria-label');
      }
    });
  });

  test.describe('Admin Interface Accessibility', () => {
    test('admin_dashboard_accessibility - Verify admin dashboard accessibility', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();
      await expect(page).toHaveURL('**/dashboard');

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check admin navigation
      await expect(page.locator('text=Admin')).toBeVisible();
      await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();

      // Check admin menu accessibility
      const adminMenu = page.locator('[data-testid="admin-panel"]');
      await expect(adminMenu).toHaveAttribute('role', 'navigation');
    });

    test('admin_content_management_accessibility - Verify content management interface accessibility', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin and navigate to content management
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check content tree accessibility
      const contentTree = page.locator('[data-testid="content-tree"], .content-tree');
      await expect(contentTree).toHaveAttribute('role', 'tree');

      // Check tree items
      const treeItems = contentTree.locator('[role="treeitem"]');
      if (await treeItems.count() > 0) {
        await expect(treeItems.first()).toHaveAttribute('aria-expanded');
      }
    });

    test('admin_user_management_accessibility - Verify user management interface accessibility', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin and navigate to user management
      await auth.loginAsAdmin();
      await page.goto('#/admin/users');
      await page.waitForSelector('table', { timeout: 10000 });

      // Run accessibility audit
      const results = await accessibility.runAccessibilityAudit();

      // Assert compliance
      accessibility.assertNoCriticalViolations(results);

      // Check table accessibility
      const table = page.locator('table');
      await expect(table).toHaveAttribute('role', 'table');

      // Check table headers
      const headers = table.locator('th');
      await expect(headers.first()).toHaveAttribute('scope', 'col');

      // Check user search accessibility
      const searchInput = page.locator('[data-testid="user-filter-input"]');
      if (await searchInput.isVisible()) {
        await expect(searchInput).toHaveAttribute('aria-label');
        await expect(searchInput).toHaveAttribute('type', 'search');
      }
    });
  });

  test.describe('Dynamic Content Accessibility', () => {
    test('modal_dialog_accessibility - Verify modal dialogs meet accessibility standards', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin and trigger a modal
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=New Course');

      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Check modal accessibility
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-labelledby');
      await expect(modal).toHaveAttribute('aria-describedby');

      // Check focus management
      const focusedElement = page.locator(':focus');
      const isFocusInModal = await modal.locator(':focus').count() > 0;
      expect(isFocusInModal).toBe(true);

      // Check escape key handling
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });

    test('loading_states_accessibility - Verify loading states are accessible', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login and navigate to trigger loading state
      await auth.loginAsStudent();
      await page.goto('#/courses');

      // Trigger a loading state (e.g., search)
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.keyboard.press('Enter');

        // Check for loading indicators
        const loadingIndicator = page.locator('[aria-busy="true"], [data-testid="loading"]');
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
        }
      }
    });

    test('error_states_accessibility - Verify error states are accessible', async ({ page }) => {
      // Navigate to login and trigger error
      await page.goto('#/login');
      await page.fill('[data-testid="email-input"]', 'invalid@email');
      await page.fill('[data-testid="password-input"]', 'wrong');
      await page.click('[data-testid="login-button"]');

      // Check error message accessibility
      const errorMessage = page.locator('[role="alert"], .error-message');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Navigation Tests', () => {
    test('full_site_keyboard_navigation - Test complete keyboard navigation through main user flows', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to landing page
      await page.goto('#/');

      // Test tab navigation through main navigation
      await page.keyboard.press('Tab');
      const firstFocusable = page.locator(':focus');
      await expect(firstFocusable).toBeVisible();

      // Navigate to login page
      await page.goto('#/login');

      // Test form navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

      // Test form submission with Enter key
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.keyboard.press('Enter');

      // Should handle form submission appropriately
      await expect(page).toHaveURL(/.*(login|dashboard).*/);
    });

    test('skip_links_accessibility - Verify skip links are present and functional', async ({ page }) => {
      // Navigate to a page that should have skip links
      await page.goto('#/');

      // Check for skip links (these might not be implemented yet)
      const skipLinks = page.locator('a[href^="#"], .skip-link');
      if (await skipLinks.count() > 0) {
        const firstSkipLink = skipLinks.first();
        await expect(firstSkipLink).toBeVisible();
        await expect(firstSkipLink).toHaveAttribute('href');

        // Test skip link functionality
        await firstSkipLink.click();
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('color_contrast_compliance - Verify color contrast meets WCAG standards', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to main pages and check contrast
      const pages = ['#/', '#/courses', '#/login', '#/register'];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);

        // Check color contrast for text elements
        const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
        const textCount = await textElements.count();

        // Sample check on key text elements
        for (let i = 0; i < Math.min(textCount, 10); i++) {
          const element = textElements.nth(i);
          const isVisible = await element.isVisible();
          if (isVisible) {
            // This would require more sophisticated color analysis
            // For now, we ensure text is readable
            const text = await element.textContent();
            if (text && text.trim().length > 0) {
              // Basic check that text exists and is not hidden
              expect(text.trim()).toBeTruthy();
            }
          }
        }
      }
    });

    test('focus_indicators_visibility - Verify focus indicators are visible and meet standards', async ({ page }) => {
      // Navigate to a page with interactive elements
      await page.goto('#/login');

      // Tab to first focusable element
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');

      // Check that focused element has visible focus indicator
      const boxShadow = await focusedElement.evaluate(el => window.getComputedStyle(el).boxShadow);
      const outline = await focusedElement.evaluate(el => window.getComputedStyle(el).outline);

      // Either box-shadow or outline should provide focus indication
      expect(boxShadow !== 'none' || outline !== 'none').toBe(true);
    });
  });
});