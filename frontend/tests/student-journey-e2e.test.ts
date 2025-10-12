import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { AccessibilityHelpers, ACCESSIBILITY_CONFIGS } from './accessibility-helpers';
import { TEST_USERS, TEST_DATA } from './test-utils';

/**
 * Comprehensive E2E Tests for Student User Journey in Course System
 *
 * Tests cover the complete student experience from course discovery through
 * completion, including enrollment, lesson consumption, and progress tracking.
 */

test.describe('Student User Journey E2E Tests', () => {
  test.describe('Course Discovery', () => {
    test('course_catalog_displays - Navigate to courses page and verify catalog displays', async ({ page }) => {
      // Navigate to courses page (can be done without authentication)
      await page.goto('#/courses');
      await expect(page).toHaveURL('**/courses');

      // Verify courses page loads and displays course catalog
      await expect(page.locator('text=Courses')).toBeVisible();
      await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();

      // Verify course cards are displayed
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();

      // Verify multiple courses are available
      const courseCount = await courseCards.count();
      expect(courseCount).toBeGreaterThan(0);
    });

    test('course_cards_show_proper_info - Verify course cards display title and description', async ({ page }) => {
      // Navigate to courses page
      await page.goto('#/courses');

      // Verify course cards show proper information (title, description, etc.)
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await expect(firstCourseCard.locator('[data-testid="course-title"]')).toBeVisible();
      await expect(firstCourseCard.locator('[data-testid="course-description"]')).toBeVisible();
    });

    test('course_search_functionality - Test course filtering and search functionality', async ({ page }) => {
      // Navigate to courses page
      await page.goto('#/courses');

      // Test course filtering/search functionality
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill('Python');
        await page.keyboard.press('Enter');

        // Verify filtered results
        await expect(page.locator('text=Python')).toBeVisible();

        // Clear search
        await searchInput.clear();
        await page.keyboard.press('Enter');
      }

      // Test course category/tag filtering if available
      const filterButtons = page.locator('[data-testid="filter-all"], [data-testid="filter-beginner"], [data-testid="filter-advanced"]');
      if (await filterButtons.count() > 0) {
        // Click on a filter button
        await filterButtons.first().click();

        // Wait for filtering to complete by checking for network idle or UI update
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      }
    test('courses_page_accessibility - Verify courses page meets accessibility standards', async ({ page }) => {
      const accessibility = new AccessibilityHelpers(page);

      // Navigate to courses page
      await page.goto('#/courses');
      await expect(page).toHaveURL('**/courses');

      // Run accessibility audit on the courses page
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation for course catalog
      await accessibility.testKeyboardNavigation();

      // Check image accessibility for course cards
      await accessibility.checkImageAccessibility();
    });
  });

  test.describe('Course Detail View', () => {
    });

    test('course_card_navigation - Test clicking course cards navigates to detail page', async ({ page }) => {
      // Navigate to courses page
      await page.goto('#/courses');

      // Test course card clickability (should navigate to course detail)
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      const firstCourseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      // Should navigate to course detail page
      await expect(page).toHaveURL(/.*\/courses\/.*/);
      await expect(page.locator(`text=${firstCourseTitle}`)).toBeVisible();
    });
  });

  test.describe('Course Detail View', () => {
    test('course_detail_navigation - Navigate to course detail page', async ({ page }) => {
      // Navigate to courses page first
      await page.goto('#/courses');

      // Click on first available course
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await expect(firstCourseCard).toBeVisible();

      const courseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      // Verify navigation to course detail page
      await expect(page).toHaveURL(/.*\/courses\/.*/);
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Visual regression: Take screenshot of course detail page
      await expect(page).toHaveScreenshot('course-detail-page.png', {
        fullPage: true,
      });
    });

    test('course_metadata_display - Verify course metadata is displayed correctly', async ({ page }) => {
      // Navigate to course detail
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      const courseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      // Verify course title is displayed prominently
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Verify course metadata display (description, tags, etc.)
      await expect(page.locator('[data-testid="course-description"]')).toBeVisible();

      // Check for course tags/categories
      const courseTags = page.locator('[data-testid="course-tags"], .course-tags, .tags');
      if (await courseTags.isVisible()) {
        await expect(courseTags).toBeVisible();
      }
    });

    test('course_curriculum_display - Verify course curriculum and lessons are displayed', async ({ page }) => {
      // Navigate to course detail
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Verify course curriculum/lessons are displayed
      const curriculumSection = page.locator('[data-testid="course-curriculum"], [data-testid="lessons-list"], .curriculum, .lessons');
      await expect(curriculumSection).toBeVisible();

      // Verify lessons are listed
      const lessonItems = curriculumSection.locator('[data-testid="lesson-item"], .lesson-item, li');
      await expect(lessonItems.first()).toBeVisible();
    });

    test('enrollment_button_visibility - Check enrollment button visibility for unauthenticated users', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Navigate to course detail
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Check enrollment button visibility and functionality
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await expect(enrollButton).toBeVisible();

      // For unauthenticated users, enrollment should require login
      const isLoggedIn = await auth.isLoggedIn();
      if (!isLoggedIn) {
        await enrollButton.click();

        // Should redirect to login or show login modal
        await expect(page).toHaveURL(/.*(login|signin).*/);
      }
    });
  });

  test.describe('Course Enrollment', () => {
    test('enrollment_process - Login and enroll in a course', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();
      await expect(page).toHaveURL('**/dashboard');

      // Navigate to courses page
      await page.goto('#/courses');
      await expect(page).toHaveURL('**/courses');

      // Select first available course
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await expect(firstCourseCard).toBeVisible();

      const courseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      // Verify on course detail page
      await expect(page).toHaveURL(/.*\/courses\/.*/);
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Click enroll button
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await expect(enrollButton).toBeVisible();
      await enrollButton.click();

      // Verify enrollment confirmation (could be modal, toast, or redirect)
      try {
        // Check for success message
        await expect(page.locator('text=Successfully enrolled, text=Enrollment successful, text=You are now enrolled')).toBeVisible({ timeout: 5000 });
      } catch {
        // Check for redirect to first lesson or course dashboard
        await expect(page).toHaveURL(/.*\/lessons\/.*/, { timeout: 5000 });
      }
    });

    test('enrollment_confirmation - Verify enrollment success and course appears in dashboard', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Navigate to courses and enroll
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      const courseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      // Navigate to dashboard
      await page.goto('#/dashboard');
      await expect(page).toHaveURL('**/dashboard');

      // Check that course appears in student dashboard
      const enrolledCourses = page.locator('[data-testid="enrolled-courses"], [data-testid="my-courses"], .enrolled-courses');
      await expect(enrolledCourses).toBeVisible();

      // Verify the enrolled course is listed
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();
    });

    test('unenrollment_functionality - Test unenrollment process', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Navigate to courses and enroll
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      const courseTitle = await firstCourseCard.locator('[data-testid="course-title"]').textContent();
      await firstCourseCard.click();

      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      // Test unenrollment functionality if available
      const unenrollButton = page.locator('[data-testid="unenroll-button"]');
      if (await unenrollButton.isVisible()) {
        await unenrollButton.click();

        // Confirm unenrollment
        const confirmButton = page.locator('[data-testid="confirm-button"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify unenrollment success
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

        // Verify course no longer appears in dashboard
        await page.reload();
        await expect(page.locator(`text=${courseTitle}`).first()).not.toBeVisible();
      }
    });
  });

  test.describe('Lesson Consumption', () => {
    test('lesson_access - Access enrolled course and navigate to first lesson', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Navigate to courses and enroll in a course if not already enrolled
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Try to enroll if not already enrolled
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      // Navigate to first lesson
      const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
      await expect(firstLessonLink).toBeVisible();

      await firstLessonLink.click();

      // Verify navigation to lesson page
      await expect(page).toHaveURL(/.*\/lessons\/.*/);
    });

    test('lesson_content_rendering - Verify lesson content renders properly', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login and navigate to lesson
      await auth.loginAsStudent();
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
      await firstLessonLink.click();

      // Verify lesson content renders properly (text, code cells)
      await expect(page.locator('[data-testid="lesson-content"], .lesson-content, .markdown-content')).toBeVisible();

      // Check for code cells if present
      const codeCells = page.locator('[data-testid="code-cell"], .code-cell, pre, code');
      if (await codeCells.count() > 0) {
        await expect(codeCells.first()).toBeVisible();
      }
    });

    test('lesson_navigation - Test next/previous lesson navigation', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login and navigate to lesson
      await auth.loginAsStudent();
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
      const lessonTitle = await firstLessonLink.textContent();
      await firstLessonLink.click();

      // Test lesson navigation (next/previous)
      const nextButton = page.locator('[data-testid="next-lesson"]');
      const prevButton = page.locator('[data-testid="prev-lesson"]');

      // If next button exists, test navigation
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should navigate to next lesson
        await expect(page).toHaveURL(/.*\/lessons\/.*/);

        // Verify different lesson loaded
        const newLessonTitle = await page.locator('[data-testid="lesson-title"], h1, h2').first().textContent();
        expect(newLessonTitle).not.toBe(lessonTitle);

        // Test previous button if available
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await expect(page).toHaveURL(/.*\/lessons\/.*/);
        }
      }
    });

    test('lesson_completion_tracking - Verify lesson completion functionality', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login and navigate to lesson
      await auth.loginAsStudent();
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
      await firstLessonLink.click();

      // Verify lesson completion tracking
      const completeButton = page.locator('[data-testid="complete-lesson"]');
      if (await completeButton.isVisible()) {
        await completeButton.click();

        // Verify completion feedback
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

        // Check if progress indicator updates
        const progressIndicator = page.locator('[data-testid="lesson-progress"], .progress-indicator');
        if (await progressIndicator.isVisible()) {
          // Progress should show as complete or updated
        }
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('progress_calculation_after_completion - Complete lessons and verify progress updates', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Navigate to an enrolled course or enroll in one
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      // Ensure enrolled
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
      }

      // Get initial progress
      let initialProgress = 0;
      const progressBar = page.locator('[data-testid="course-progress"], .progress-bar');
      if (await progressBar.isVisible()) {
        const progressText = await progressBar.textContent();
        const progressMatch = progressText?.match(/(\d+)%/);
        if (progressMatch) {
          initialProgress = parseInt(progressMatch[1]);
        }
      }

      // Complete multiple lessons
      const lessonLinks = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a');
      const lessonCount = await lessonLinks.count();

      // Complete at least 2 lessons (or all if fewer)
      const lessonsToComplete = Math.min(3, lessonCount);

      for (let i = 0; i < lessonsToComplete; i++) {
        // Click on lesson
        await lessonLinks.nth(i).click();

        // Wait for lesson to load
        await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

        // Mark as complete if button available
        const completeButton = page.locator('[data-testid="complete-lesson"]');
        if (await completeButton.isVisible()) {
          await completeButton.click();

          // Wait for completion
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

          // Go back to course page
          await page.goBack();
          await expect(page).toHaveURL(/.*\/courses\/.*/);
        } else {
          // If no complete button, just navigate back
          await page.goBack();
        }
      }

      // Verify progress bar updates
      if (await progressBar.isVisible()) {
        const updatedProgressText = await progressBar.textContent();
        const updatedProgressMatch = updatedProgressText?.match(/(\d+)%/);
        if (updatedProgressMatch) {
          const updatedProgress = parseInt(updatedProgressMatch[1]);
          expect(updatedProgress).toBeGreaterThan(initialProgress);
        }
      }

      // Check course progress percentage calculation
      const progressPercentage = page.locator('[data-testid="progress-percentage"], .progress-percentage');
      if (await progressPercentage.isVisible()) {
        const percentageText = await progressPercentage.textContent();
        expect(percentageText).toMatch(/\d+%/);
      }
    });

    test('dashboard_progress_display - Verify progress display in student dashboard', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as student
      await auth.loginAsStudent();

      // Navigate to courses and enroll/complete some lessons
      await page.goto('#/courses');
      const firstCourseCard = page.locator('[data-testid="course-card"]').first();
      await firstCourseCard.click();

      const courseTitle = await page.locator('[data-testid="course-title"]').textContent();

      // Ensure enrolled and complete at least one lesson
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

        // Complete first lesson
        const firstLessonLink = page.locator('[data-testid="lesson-link"], [data-testid="lesson-item"] a').first();
        await firstLessonLink.click();
        const completeButton = page.locator('[data-testid="complete-lesson"]');
        if (await completeButton.isVisible()) {
          await completeButton.click();
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
        }
      }

      // Navigate to dashboard
      await page.goto('#/dashboard');
      await expect(page).toHaveURL('**/dashboard');

      // Test dashboard progress display
      const dashboardProgress = page.locator('[data-testid="course-progress"], .course-progress');
      await expect(dashboardProgress).toBeVisible();

      // Verify course appears with progress in dashboard
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Check if dashboard shows updated progress
      const dashboardCourseProgress = page.locator(`[data-testid="course-${courseTitle?.replace(/\s+/g, '-').toLowerCase()}-progress"]`);
      if (await dashboardCourseProgress.isVisible()) {
        const dashboardProgressText = await dashboardCourseProgress.textContent();
        expect(dashboardProgressText).toMatch(/\d+%/);
      }
    });
  });
});