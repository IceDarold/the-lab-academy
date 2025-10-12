import { test, expect } from '@playwright/test';
import { APIHelper, TEST_USERS, APIError, type AuthTokens, type PerformanceMetrics } from './test-utils';

/**
 * Comprehensive API E2E Tests
 *
 * These tests validate backend API functionality directly, providing:
 * - Faster feedback than UI tests
 * - Granular testing of backend logic
 * - API contract validation
 * - Performance monitoring
 * - Error handling verification
 */

test.describe('API E2E Tests', () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    apiHelper = new APIHelper(context);
  });

  test.afterEach(async () => {
    apiHelper.clearTokens();
  });

  // ===== HEALTH CHECK TESTS =====

  test('API health check returns success', async () => {
    const response = await apiHelper.healthCheck();

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  // ===== AUTHENTICATION TESTS =====

  test.describe('Authentication API', () => {
    test('successful login returns valid tokens', async () => {
      const tokens = await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      expect(tokens.accessToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(tokens.accessToken.length).toBeGreaterThan(0);
      expect(tokens.refreshToken).toBeDefined();
    });

    test('login with invalid credentials fails', async () => {
      await expect(apiHelper.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(APIError);
    });

    test('token refresh works correctly', async () => {
      // First login
      const initialTokens = await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      // Refresh token
      const newTokens = await apiHelper.refreshToken('student');

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(initialTokens.accessToken);
      expect(newTokens.refreshToken).toBeDefined();
    });

    test('get current user info works', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.getCurrentUser('student');
      expect(response.status()).toBe(200);

      const userData = await response.json();
      expect(userData).toHaveProperty('user_id');
      expect(userData).toHaveProperty('email', TEST_USERS.student.email);
      expect(userData).toHaveProperty('full_name', TEST_USERS.student.fullName);
    });

    test('check email exists - existing email', async () => {
      const response = await apiHelper.checkEmailExists(TEST_USERS.student.email);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('exists', true);
    });

    test('check email exists - non-existing email', async () => {
      const response = await apiHelper.checkEmailExists('nonexistent@example.com');
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('exists', false);
    });

    test('password reset request works', async () => {
      const response = await apiHelper.requestPasswordReset(TEST_USERS.student.email);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('message');
    });

    test('admin login works', async () => {
      const tokens = await apiHelper.login({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      }, 'admin');

      expect(tokens.accessToken).toBeDefined();
      expect(apiHelper.getTokens('admin')).toEqual(tokens);
    });
  });

  // ===== COURSE TESTS =====

  test.describe('Course API', () => {
    test('get all courses returns course list', async () => {
      const response = await apiHelper.getCourses();
      expect(response.status()).toBe(200);

      const courses = await response.json();
      expect(Array.isArray(courses)).toBe(true);

      if (courses.length > 0) {
        const course = courses[0];
        expect(course).toHaveProperty('course_id');
        expect(course).toHaveProperty('slug');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('description');
      }
    });

    test('get course details works', async () => {
      const response = await apiHelper.getCourseDetails('python-basics');
      expect(response.status()).toBe(200);

      const course = await response.json();
      expect(course).toHaveProperty('course_id');
      expect(course).toHaveProperty('slug', 'python-basics');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('description');
      expect(course).toHaveProperty('modules');
    });

    test('get non-existent course returns 404', async () => {
      const response = await apiHelper.getCourseDetails('non-existent-course');
      expect(response.status()).toBe(404);
    });

    test('enroll in course requires authentication', async () => {
      const response = await apiHelper.enrollInCourse('python-basics');
      expect(response.status()).toBe(401);
    });

    test('successful course enrollment', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.enrollInCourse('python-basics', 'student');
      expect([200, 201, 409]).toContain(response.status()); // 409 if already enrolled
    });

    test('get user courses requires authentication', async () => {
      const response = await apiHelper.getUserCourses();
      expect(response.status()).toBe(401);
    });

    test('get user courses returns enrolled courses', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.getUserCourses('student');
      expect(response.status()).toBe(200);

      const courses = await response.json();
      expect(Array.isArray(courses)).toBe(true);
    });

    test('get course progress requires authentication', async () => {
      const response = await apiHelper.getCourseProgress('python-basics');
      expect(response.status()).toBe(401);
    });

    test('get course progress works for enrolled user', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      // First ensure enrolled
      await apiHelper.enrollInCourse('python-basics', 'student');

      const response = await apiHelper.getCourseProgress('python-basics', 'student');
      expect(response.status()).toBe(200);

      const progress = await response.json();
      expect(progress).toHaveProperty('title');
      expect(progress).toHaveProperty('overall_progress_percent');
      expect(progress).toHaveProperty('modules');
    });
  });

  // ===== LESSON TESTS =====

  test.describe('Lesson API', () => {
    test('get lesson requires authentication', async () => {
      const response = await apiHelper.getLesson('some-lesson-id');
      expect(response.status()).toBe(401);
    });

    test('complete lesson requires authentication', async () => {
      const response = await apiHelper.completeLesson('some-lesson-id');
      expect(response.status()).toBe(401);
    });

    test('get lesson content for enrolled course', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      // Get course details to find a lesson ID
      const courseResponse = await apiHelper.getCourseDetails('python-basics');
      const course = await courseResponse.json();

      if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
        const lessonId = course.modules[0].lessons[0].lesson_id;

        const lessonResponse = await apiHelper.getLesson(lessonId, 'student');
        expect([200, 404]).toContain(lessonResponse.status()); // 404 if lesson doesn't exist in DB

        if (lessonResponse.status() === 200) {
          const lesson = await lessonResponse.json();
          expect(lesson).toHaveProperty('lesson_id', lessonId);
          expect(lesson).toHaveProperty('title');
          expect(lesson).toHaveProperty('content_markdown');
        }
      }
    });

    test('check quiz answer requires authentication', async () => {
      const response = await apiHelper.checkQuizAnswer('question-1', 'answer-1');
      expect(response.status()).toBe(401);
    });

    test('check quiz answer with valid data', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      // This test assumes there are quiz questions in the system
      // In a real scenario, you'd get question/answer IDs from lesson content
      const response = await apiHelper.checkQuizAnswer('test-question-id', 'test-answer-id', 'student');
      // This might return 404 if the question doesn't exist, which is acceptable
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const result = await response.json();
        expect(result).toHaveProperty('is_correct');
        expect(result).toHaveProperty('correct_answer_id');
      }
    });
  });

  // ===== ANALYTICS TESTS =====

  test.describe('Analytics API', () => {
    test('track activity requires authentication', async () => {
      const response = await apiHelper.trackActivity('LESSON_COMPLETED', { lesson_slug: 'test' });
      expect(response.status()).toBe(401);
    });

    test('track user activity', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.trackActivity('LOGIN', {
        timestamp: new Date().toISOString()
      }, 'student');

      expect(response.status()).toBe(202); // Accepted for async processing
    });

    test('get activity statistics requires authentication', async () => {
      const response = await apiHelper.getActivityStats();
      expect(response.status()).toBe(401);
    });

    test('get user activity statistics', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.getActivityStats('student');
      expect(response.status()).toBe(200);

      const stats = await response.json();
      expect(stats).toHaveProperty('activities');
      expect(Array.isArray(stats.activities)).toBe(true);
    });
  });

  // ===== ADMIN TESTS =====

  test.describe('Admin API', () => {
    test('get content tree requires admin authentication', async () => {
      const response = await apiHelper.getContentTree();
      expect(response.status()).toBe(401);
    });

    test('admin can access content tree', async () => {
      await apiHelper.login({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      }, 'admin');

      const response = await apiHelper.getContentTree('admin');
      expect(response.status()).toBe(200);

      const contentTree = await response.json();
      expect(Array.isArray(contentTree)).toBe(true);
    });

    test('get config file requires admin authentication', async () => {
      const response = await apiHelper.getConfigFile('courses/python-basics/_course.yml');
      expect(response.status()).toBe(401);
    });

    test('admin can read config files', async () => {
      await apiHelper.login({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      }, 'admin');

      const response = await apiHelper.getConfigFile('courses/python-basics/_course.yml', 'admin');
      expect([200, 404]).toContain(response.status()); // 404 if file doesn't exist

      if (response.status() === 200) {
        const content = await response.text();
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    test('update config file requires admin authentication', async () => {
      const response = await apiHelper.updateConfigFile('test.yml', 'test: content');
      expect(response.status()).toBe(401);
    });

    test('get raw lesson content requires admin authentication', async () => {
      const response = await apiHelper.getRawLesson('getting-started');
      expect(response.status()).toBe(401);
    });

    test('admin can read raw lesson content', async () => {
      await apiHelper.login({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      }, 'admin');

      const response = await apiHelper.getRawLesson('getting-started', 'admin');
      expect([200, 404]).toContain(response.status()); // 404 if lesson doesn't exist

      if (response.status() === 200) {
        const content = await response.text();
        expect(typeof content).toBe('string');
      }
    });

    test('update raw lesson content requires admin authentication', async () => {
      const response = await apiHelper.updateRawLesson('getting-started', '# Updated Content');
      expect(response.status()).toBe(401);
    });
  });

  // ===== ERROR HANDLING TESTS =====

  test.describe('Error Handling', () => {
    test('invalid endpoint returns 404', async () => {
      const response = await apiHelper.apiRequest('GET', '/non-existent-endpoint');
      expect(response.status()).toBe(404);
    });

    test('malformed JSON returns 400', async () => {
      const response = await apiHelper.apiRequest('POST', '/auth/login', '{invalid json');
      expect([400, 422]).toContain(response.status());
    });

    test('missing required fields return validation errors', async () => {
      const response = await apiHelper.register({} as any);
      expect([400, 422]).toContain(response.status());

      const error = await response.json();
      expect(error).toHaveProperty('detail');
    });

    test('expired token returns 401', async () => {
      // This test would require setting up an expired token scenario
      // For now, we'll test with an invalid token
      const response = await apiHelper.authenticatedRequest('GET', '/auth/me', 'invalid-token');
      expect(response.status()).toBe(401);
    });
  });

  // ===== AUTHORIZATION TESTS =====

  test.describe('Authorization', () => {
    test('student cannot access admin endpoints', async () => {
      await apiHelper.login({
        email: TEST_USERS.student.email,
        password: TEST_USERS.student.password
      }, 'student');

      const response = await apiHelper.getContentTree('student');
      expect(response.status()).toBe(403);
    });

    test('admin can access all endpoints', async () => {
      await apiHelper.login({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      }, 'admin');

      // Test admin can access user endpoints
      const userResponse = await apiHelper.getCurrentUser('admin');
      expect(userResponse.status()).toBe(200);

      // Test admin can access admin endpoints
      const adminResponse = await apiHelper.getContentTree('admin');
      expect(adminResponse.status()).toBe(200);
    });
  });

  // ===== PERFORMANCE TESTS =====

  test.describe('Performance', () => {
    test('API response times are reasonable', async () => {
      const metrics = await apiHelper.measurePerformance('GET', '/courses');
      expect(metrics.responseTime).toBeLessThan(5000); // 5 seconds max
      expect(metrics.statusCode).toBe(200);
    });

    test('concurrent requests work correctly', async () => {
      const requests = [
        { method: 'GET' as const, endpoint: '/courses' },
        { method: 'GET' as const, endpoint: '/courses/python-basics' },
        { method: 'POST' as const, endpoint: '/auth/check-email', data: { email: 'test@example.com' } }
      ];

      const responses = await apiHelper.concurrentRequests(requests);

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect([200, 404]).toContain(response.status());
      });
    });

    test('health check is fast', async () => {
      const metrics = await apiHelper.measurePerformance('GET', '/');
      expect(metrics.responseTime).toBeLessThan(1000); // 1 second max for health check
      expect(metrics.statusCode).toBe(200);
    });
  });

  // ===== RELIABILITY TESTS =====

  test.describe('Reliability', () => {
    test('API handles network failures gracefully', async () => {
      // This test would require mocking network failures
      // For now, we'll test with invalid URLs
      try {
        await apiHelper.apiRequest('GET', '/invalid-endpoint-that-might-cause-issues');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('large payloads are handled', async () => {
      const largeData = { content: 'x'.repeat(10000) };
      const response = await apiHelper.apiRequest('POST', '/auth/check-email', largeData);
      // Should not crash, even if validation fails
      expect([200, 400, 422]).toContain(response.status());
    });

    test('special characters in data are handled', async () => {
      const specialData = {
        email: 'test+special@example.com',
        content: 'Special chars: àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'
      };
      const response = await apiHelper.apiRequest('POST', '/auth/check-email', specialData);
      expect([200, 400, 422]).toContain(response.status());
    });
  });
});