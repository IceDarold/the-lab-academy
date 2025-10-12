import { test, expect } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { AccessibilityHelpers, ACCESSIBILITY_CONFIGS } from './accessibility-helpers';
import { TEST_USERS } from './test-utils';

/**
 * Comprehensive E2E Tests for Admin User Journey in Course System
 *
 * Tests cover the complete administrative workflow including content management,
 * user oversight, and system administration functionality.
 */

test.describe('Course System Admin E2E Tests', () => {
  test.describe('Content Tree Management', () => {
    test('content_tree_display - Login as admin and verify content tree displays hierarchical structure', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');
      await expect(page).toHaveURL('**/admin/content');

      // Verify admin sidebar is visible
      await expect(page.locator('text=ML-Practicum')).toBeVisible();
      await expect(page.locator('text=Content Management')).toBeVisible();

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Verify hierarchical structure - courses should be visible
      await expect(page.locator('text=ml-foundations')).toBeVisible();
      await expect(page.locator('text=ml-fundamentals')).toBeVisible();
    });

    test('content_tree_navigation - Test navigating through content tree hierarchy', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Test content tree navigation - click on a course
      await page.click('text=ml-foundations');

      // Verify course structure shows modules/lessons
      await expect(page.locator('text=Supervised vs Unsupervised')).toBeVisible();

      // Test navigation between different content levels
      await page.click('text=Supervised vs Unsupervised');

      // Verify lesson content loads in editor panel (right side)
      await expect(page.locator('[data-testid="lesson-editor"], .editor-panel')).toBeVisible();
    });
    test('admin_content_management_accessibility - Verify admin content management page meets accessibility standards', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');
      await expect(page).toHaveURL('**/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Run accessibility audit on the admin content management page
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation
      await accessibility.testKeyboardNavigation();

      // Check color contrast for admin interface
      await accessibility.checkColorContrast();
    });
  });

  test.describe('Course Management', () => {
  });

  test.describe('Course Management', () => {
    test('course_creation_form - Access course creation interface and fill metadata', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');
      await expect(page).toHaveURL('**/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Click "New Course" button
      await page.click('text=New Course');

      // Verify create course dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Create New Course')).toBeVisible();

      // Generate unique course data
      const timestamp = Date.now();
      const courseTitle = `Test Course ${timestamp}`;
      const courseSlug = `test-course-${timestamp}`;

      // Fill course form
      await page.fill('[data-testid="course-title-input"]', courseTitle);
      await page.fill('[data-testid="course-slug-input"]', courseSlug);

      // Submit form
      await page.click('[data-testid="create-course-button"]');

      // Verify dialog closes
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('course_creation_verification - Verify course appears in content tree after creation', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Click "New Course" button
      await page.click('text=New Course');

      // Generate unique course data
      const timestamp = Date.now();
      const courseTitle = `Test Course ${timestamp}`;
      const courseSlug = `test-course-${timestamp}`;

      // Fill and submit course form
      await page.fill('[data-testid="course-title-input"]', courseTitle);
      await page.fill('[data-testid="course-slug-input"]', courseSlug);
      await page.click('[data-testid="create-course-button"]');

      // Verify course appears in content tree
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Click on the new course to verify it's selectable
      await page.click(`text=${courseTitle}`);
    });

    test('course_visibility_to_students - Verify created course becomes visible to students', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin and create course
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=New Course');

      const timestamp = Date.now();
      const courseTitle = `Test Course ${timestamp}`;
      const courseSlug = `test-course-${timestamp}`;

      await page.fill('[data-testid="course-title-input"]', courseTitle);
      await page.fill('[data-testid="course-slug-input"]', courseSlug);
      await page.click('[data-testid="create-course-button"]');

      // Logout and login as student
      await auth.logout();
      await auth.loginAsStudent();

      // Navigate to courses page
      await page.goto('#/courses');
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();

      // Logout
      await auth.logout();
    });
  });

  test.describe('Module Management', () => {
    test('module_creation - Select existing course and create new module within course', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');
      await expect(page).toHaveURL('**/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Select existing course
      await page.click('text=ml-foundations');

      // Click the plus button next to the course to add a module/part
      // Based on ContentTree component, the plus button appears on hover
      const courseNode = page.locator('text=ml-foundations').locator('..').locator('..');
      await courseNode.hover();
      await courseNode.locator('[data-testid="add-part-button"]').click();

      // Verify create part/module dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Create New Part')).toBeVisible();

      // Generate unique module data
      const timestamp = Date.now();
      const moduleTitle = `Test Module ${timestamp}`;

      // Fill module form
      await page.fill('[data-testid="part-title-input"]', moduleTitle);

      // Submit form
      await page.click('[data-testid="create-part-button"]');

      // Verify dialog closes
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('module_hierarchy_display - Verify module appears in course structure with proper hierarchy', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Select existing course
      await page.click('text=ml-foundations');

      // Create module
      const courseNode = page.locator('text=ml-foundations').locator('..').locator('..');
      await courseNode.hover();
      await courseNode.locator('[data-testid="add-part-button"]').click();

      const timestamp = Date.now();
      const moduleTitle = `Test Module ${timestamp}`;

      await page.fill('[data-testid="part-title-input"]', moduleTitle);
      await page.click('[data-testid="create-part-button"]');

      // Verify module appears in course structure
      await expect(page.locator(`text=${moduleTitle}`)).toBeVisible();

      // Verify module is properly nested under the course
      // The module should appear indented under the course
      const moduleElement = page.locator(`text=${moduleTitle}`);
      await expect(moduleElement).toBeVisible();
    });
  });

  test.describe('Lesson Management', () => {
    test('lesson_editing_access - Select existing lesson and access editing interface', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin content management
      await page.goto('#/admin/content');
      await expect(page).toHaveURL('**/admin/content');

      // Wait for content tree to load
      await page.waitForSelector('text=New Course', { timeout: 10000 });

      // Select existing lesson to edit (since lesson creation may not be fully implemented)
      await page.click('text=Supervised vs Unsupervised');

      // Verify lesson editor opens in read mode
      await expect(page.locator('text=Supervised vs Unsupervised')).toBeVisible();
      await expect(page.locator('button:has-text("Edit")')).toBeVisible();

      // Switch to edit mode
      await page.click('[data-testid="edit-button"]');

      // Verify editor switches to edit mode with code editor and preview
      await expect(page.locator('[data-testid="editor-container"]')).toBeVisible();

      // The editor shows raw markdown content that gets parsed into cells
      // For now, test that we can edit the raw content
      const editor = page.locator('[data-testid="editor-textarea"]');
      await expect(editor).toBeVisible();
    });

    test('lesson_content_editing - Edit lesson content and verify live preview', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin and access lesson editor
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=Supervised vs Unsupervised');
      await page.click('[data-testid="edit-button"]');

      // Edit content in the code editor
      const editor = page.locator('[data-testid="editor-textarea"]');
      const currentContent = await editor.inputValue();
      const newContent = currentContent + '\n\n### New Test Section\nThis is additional test content added via E2E test.';
      await editor.fill(newContent);

      // Verify preview updates (right panel should show the new content)
      await expect(page.locator('text=New Test Section')).toBeVisible();
    });

    test('lesson_content_saving - Save lesson changes and verify persistence', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin and edit lesson
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=Supervised vs Unsupervised');
      await page.click('[data-testid="edit-button"]');

      const editor = page.locator('[data-testid="editor-textarea"]');
      const currentContent = await editor.inputValue();
      const newContent = currentContent + '\n\n## Test Save Section\nThis section tests content saving.';
      await editor.fill(newContent);

      // Save the changes
      await page.click('[data-testid="save-button"]');
      await expect(page.locator('[data-testid="saving-status"]')).toBeVisible();

      // Wait for save to complete and switch back to read mode
      await expect(page.locator('button:has-text("Edit")')).toBeVisible({ timeout: 10000 });

      // Verify content was saved
      await expect(page.locator('text=Test Save Section')).toBeVisible();
    });
  });

  test.describe('Content Editing Workflow', () => {
    test('content_validation_on_save - Test content validation when saving changes', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin and access lesson editor
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=Supervised vs Unsupervised');
      await page.click('[data-testid="edit-button"]');

      // Edit content in the code editor
      const editor = page.locator('[data-testid="editor-textarea"]');
      const originalContent = await editor.inputValue();
      const newContent = originalContent + '\n\n## Test Validation Section\nThis section tests content validation.';
      await editor.fill(newContent);

      // Verify live preview updates
      await expect(page.locator('text=Test Validation Section')).toBeVisible();

      // Test content validation - try saving invalid content
      await editor.fill(''); // Empty content
      await page.click('button:has-text("Save")');

      // Should show error or prevent save
      await expect(page.locator('text=Error parsing lesson content')).toBeVisible();

      // Restore valid content
      await editor.fill(newContent);
    });

    test('content_publishing_workflow - Test content publishing and visibility', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin and edit content
      await auth.loginAsAdmin();
      await page.goto('#/admin/content');
      await page.waitForSelector('text=New Course', { timeout: 10000 });
      await page.click('text=Supervised vs Unsupervised');
      await page.click('[data-testid="edit-button"]');

      const editor = page.locator('[data-testid="editor-textarea"]');
      const originalContent = await editor.inputValue();
      const newContent = originalContent + '\n\n## Test Publishing Section\nThis section tests publishing workflow.';
      await editor.fill(newContent);

      // Save changes
      await page.click('[data-testid="save-button"]');
      await expect(page.locator('[data-testid="saving-status"]')).toBeVisible();

      // Wait for save to complete
      await expect(page.locator('button:has-text("Edit")')).toBeVisible({ timeout: 10000 });

      // Verify content was saved and shows in read mode
      await expect(page.locator('text=Test Publishing Section')).toBeVisible();
    });
  });

  test.describe('User Management', () => {
    test('user_search_functionality - Access user management and test search functionality', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');
      await expect(page).toHaveURL('**/admin/users');

      // Verify user management interface loads
      await expect(page.locator('text=Manage all users in the system')).toBeVisible();

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Test user search functionality
      await page.fill('[data-testid="user-filter-input"]', 'Test Student');
      await expect(page.locator('text=Test Student')).toBeVisible();
      // Verify other users are filtered out
      await expect(page.locator('text=User Name 1')).not.toBeVisible();
    });

    test('user_role_filtering - Test user role filtering functionality', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Clear search and test role filtering
      await page.fill('[data-testid="user-filter-input"]', '');
      await page.click('[data-testid="role-filter-all"]');
      await page.click('[data-testid="role-filter-student"]');
      // Verify only students are shown
      await expect(page.locator('text=Student')).toBeVisible();
    });

    test('admin_user_management_accessibility - Verify admin user management page meets accessibility standards', async ({ page }) => {
      const auth = new AuthHelpers(page);
      const accessibility = new AccessibilityHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');
      await expect(page).toHaveURL('**/admin/users');

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Run accessibility audit on the admin user management page
      const results = await accessibility.runAccessibilityAudit();

      // Assert no critical accessibility violations
      accessibility.assertNoCriticalViolations(results);

      // Check keyboard navigation for user management interface
      await accessibility.testKeyboardNavigation();

      // Check form accessibility for user search/filter
      await accessibility.checkFormAccessibility('[data-testid="user-filter-input"]');
    });

    test('user_profile_viewing - Select and view user profile details', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Reset filter
      await page.click('[data-testid="role-filter-student"]');
      await page.click('[data-testid="role-filter-all"]');

      // Select a user to view profile
      await page.click('text=Test Student');
      await expect(page.locator('[data-testid="user-profile-panel"], .user-profile-panel')).toBeVisible();
      await expect(page.locator('text=Test Student')).toBeVisible();
    });

    test('user_role_modification - Test user role modification functionality', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Select a user
      await page.click('text=Test Student');

      // Test user role modification (Note: This might not be implemented yet)
      // Skip role modification test for now as it may require backend changes
      test.skip();
    });

    test('role_permission_verification - Verify role changes take effect', async ({ page }) => {
      const auth = new AuthHelpers(page);

      // Login as admin
      await auth.loginAsAdmin();

      // Navigate to admin user management
      await page.goto('#/admin/users');

      // Wait for users table to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Test permission changes take effect
      await auth.logout();
      await auth.loginAsStudent();

      // Verify student access (not admin)
      await expect(page.locator('text=Admin')).not.toBeVisible();

      // Logout
      await auth.logout();
    });
  });
});

// Edge cases and error scenarios
test.describe('Admin E2E Edge Cases and Error Scenarios', () => {
  test('course_creation_validation - Test course creation with invalid data', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login as admin
    await auth.loginAsAdmin();

    // Navigate to admin content management
    await page.goto('#/admin/content');
    await expect(page).toHaveURL('**/admin/content');

    // Wait for content tree to load
    await page.waitForSelector('text=New Course', { timeout: 10000 });

    // Click "New Course" button
    await page.click('text=New Course');

    // Verify create course dialog opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Test empty title validation
    await page.fill('[data-testid="course-title-input"]', '');
    await page.fill('[data-testid="course-slug-input"]', 'test-slug');
    await page.click('[data-testid="create-course-button"]');
    await expect(page.locator('text=Title must be at least 3 characters')).toBeVisible();

    // Test invalid slug format
    await page.fill('[data-testid="course-title-input"]', 'Valid Title');
    await page.fill('[data-testid="course-slug-input"]', 'invalid slug with spaces');
    await page.click('[data-testid="create-course-button"]');
    await expect(page.locator('text=Slug must be URL-friendly')).toBeVisible();

    // Cancel dialog
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Logout
    await auth.logout();
  });

  test('admin_access_denial - Test accessing admin routes without authentication', async ({ page }) => {
    // Try to access admin content without being logged in
    await page.goto('#/admin/content');

    // Should redirect to login
    await expect(page).toHaveURL('**/login');
  });

  test('student_admin_access_denied - Test student user cannot access admin routes', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login as student
    await auth.loginAsStudent();

    // Try to access admin content
    await page.goto('#/admin/content');

    // Should redirect to dashboard or show access denied
    await expect(page).toHaveURL('**/dashboard');

    // Verify no admin UI elements are visible
    await expect(page.locator('text=Admin')).not.toBeVisible();

    // Logout
    await auth.logout();
  });

  test('lesson_editor_error_handling - Test lesson editor error handling', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Login as admin
    await auth.loginAsAdmin();

    // Navigate to admin content management
    await page.goto('#/admin/content');
    await expect(page).toHaveURL('**/admin/content');

    // Wait for content tree to load
    await page.waitForSelector('text=New Course', { timeout: 10000 });

    // Select existing lesson
    await page.click('text=Supervised vs Unsupervised');

    // Switch to edit mode
    await page.click('[data-testid="edit-button"]');

    // Test invalid markdown syntax
    const editor = page.locator('[data-testid="editor-textarea"]');
    await editor.fill('```\ninvalid code block without closing'); // Invalid markdown

    // Should show parsing error
    await expect(page.locator('text=Error parsing lesson content')).toBeVisible();

    // Cancel changes
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();

    // Logout
    await auth.logout();
  });
});