import { Page, BrowserContext } from '@playwright/test';
import { APIResponse } from '@playwright/test';

/**
 * Test utilities and helper functions for E2E tests
 */

export type TestUser = {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'student';
};</search>
</search_and_replace></search>
</search_and_replace>

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface APIError {
  status: number;
  message: string;
  details?: any;
}

export interface PerformanceMetrics {
  responseTime: number;
  statusCode: number;
  payloadSize: number;
}

export interface CourseData {
  course_id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url?: string;
}

export interface LessonData {
  lesson_id: string;
  slug: string;
  title: string;
  content_markdown?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
}

/**
 * Custom error class for API testing
 */
export class APIError extends Error {
  status: number;
  details: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'testadmin@example.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'adminpass123',
    fullName: 'Test Admin',
    role: 'admin'
  },
  student: {
    email: process.env.E2E_STUDENT_EMAIL || 'teststudent@example.com',
    password: process.env.E2E_STUDENT_PASSWORD || 'studentpass123',
    fullName: 'Test Student',
    role: 'student'
  },
  student2: {
    email: process.env.E2E_STUDENT2_EMAIL || 'teststudent2@example.com',
    password: process.env.E2E_STUDENT2_PASSWORD || 'studentpass456',
    fullName: 'Test Student Two',
    role: 'student'
  },
  inactive: {
    email: process.env.E2E_INACTIVE_EMAIL || 'testinactive@example.com',
    password: process.env.E2E_INACTIVE_PASSWORD || 'inactivepass123',
    fullName: 'Inactive Test User',
    role: 'student'
  },
  // Additional users from integration seeding for compatibility
  student1: {
    email: process.env.E2E_STUDENT1_EMAIL || 'testuser1@example.com',
    password: process.env.E2E_STUDENT1_PASSWORD || 'testpass123',
    fullName: 'Test User One',
    role: 'student'
  },
  student3: {
    email: process.env.E2E_STUDENT3_EMAIL || 'testuser2@example.com',
    password: process.env.E2E_STUDENT3_PASSWORD || 'testpass123',
    fullName: 'Test User Two',
    role: 'student'
  }
};

/**
 * Enhanced API helpers for comprehensive backend testing
 */
export class APIHelper {
  private context: BrowserContext;
  private baseURL: string;
  private authTokens: Map<string, AuthTokens> = new Map();

  constructor(context: BrowserContext) {
    this.context = context;
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Register a new user
   */
  async register(userData: { full_name: string; email: string; password: string }): Promise<APIResponse> {
    return this.apiRequest('POST', '/auth/register', userData);
  }

  /**
   * Login and store tokens for user
   */
  async login(credentials: { email: string; password: string }, userKey: string = 'default'): Promise<AuthTokens> {
    const startTime = Date.now();
    const response = await this.apiRequest('POST', '/auth/login', credentials);
    const responseTime = Date.now() - startTime;

    if (!response.ok()) {
      throw new APIError(`Login failed: ${response.status()} ${response.statusText()}`, response.status(), await response.text());
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at
    };

    this.authTokens.set(userKey, tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshToken(userKey: string = 'default'): Promise<AuthTokens> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.apiRequest('POST', '/auth/refresh', {
      refresh_token: tokens.refreshToken
    });

    if (!response.ok()) {
      throw new APIError(`Token refresh failed: ${response.status()}`, response.status(), await response.text());
    }

    const data = await response.json();
    const newTokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at
    };

    this.authTokens.set(userKey, newTokens);
    return newTokens;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) {
      throw new Error('No authentication tokens available');
    }
    return this.authenticatedRequest('GET', '/auth/me', tokens.accessToken);
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<APIResponse> {
    return this.apiRequest('POST', '/auth/check-email', { email });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<APIResponse> {
    return this.apiRequest('POST', '/auth/forgot-password', { email });
  }

  // ===== COURSE METHODS =====

  /**
   * Get all public courses
   */
  async getCourses(): Promise<APIResponse> {
    return this.apiRequest('GET', '/courses');
  }

  /**
   * Get course details by slug
   */
  async getCourseDetails(slug: string): Promise<APIResponse> {
    return this.apiRequest('GET', `/courses/${slug}`);
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(slug: string, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('POST', `/courses/${slug}/enroll`, tokens.accessToken);
  }

  /**
   * Get user's enrolled courses
   */
  async getUserCourses(userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('GET', '/dashboard/my-courses', tokens.accessToken);
  }

  /**
   * Get user's course progress
   */
  async getCourseProgress(slug: string, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('GET', `/dashboard/courses/${slug}`, tokens.accessToken);
  }

  // ===== LESSON METHODS =====

  /**
   * Get lesson content
   */
  async getLesson(lessonId: string, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('GET', `/lessons/${lessonId}`, tokens.accessToken);
  }

  /**
   * Complete a lesson
   */
  async completeLesson(lessonId: string, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('POST', `/lessons/${lessonId}/complete`, tokens.accessToken);
  }

  /**
   * Check quiz answer
   */
  async checkQuizAnswer(questionId: string, answerId: string, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('POST', '/quizzes/answers/check', tokens.accessToken, {
      question_id: questionId,
      selected_answer_id: answerId
    });
  }

  // ===== ANALYTICS METHODS =====

  /**
   * Track user activity
   */
  async trackActivity(activityType: string, details: any, userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('POST', '/activity-log', tokens.accessToken, {
      activity_type: activityType,
      details
    });
  }

  /**
   * Get user activity statistics
   */
  async getActivityStats(userKey: string = 'default'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Authentication required');
    return this.authenticatedRequest('GET', '/activity-log', tokens.accessToken);
  }

  // ===== ADMIN METHODS =====

  /**
   * Get content tree (Admin only)
   */
  async getContentTree(userKey: string = 'admin'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Admin authentication required');
    return this.authenticatedRequest('GET', '/admin/content-tree', tokens.accessToken);
  }

  /**
   * Get config file content (Admin only)
   */
  async getConfigFile(path: string, userKey: string = 'admin'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Admin authentication required');
    return this.authenticatedRequest('GET', `/admin/config-file?path=${encodeURIComponent(path)}`, tokens.accessToken);
  }

  /**
   * Update config file (Admin only)
   */
  async updateConfigFile(path: string, content: string, userKey: string = 'admin'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Admin authentication required');
    return this.authenticatedRequest('PUT', `/admin/config-file?path=${encodeURIComponent(path)}`, tokens.accessToken, content);
  }

  /**
   * Get raw lesson content (Admin only)
   */
  async getRawLesson(slug: string, userKey: string = 'admin'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Admin authentication required');
    return this.authenticatedRequest('GET', `/lessons/${slug}/raw`, tokens.accessToken);
  }

  /**
   * Update raw lesson content (Admin only)
   */
  async updateRawLesson(slug: string, content: string, userKey: string = 'admin'): Promise<APIResponse> {
    const tokens = this.authTokens.get(userKey);
    if (!tokens) throw new Error('Admin authentication required');
    return this.authenticatedRequest('PUT', `/lessons/${slug}/raw`, tokens.accessToken, content);
  }

  // ===== HEALTH CHECK METHODS =====

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<APIResponse> {
    return this.apiRequest('GET', '/');
  }

  // ===== UTILITY METHODS =====

  /**
   * Make authenticated API request with token
   */
  async authenticatedRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    token: string,
    data?: any
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;

    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.data = JSON.stringify(data);
    }

    return this.context.request.fetch(url, options);
  }

  /**
   * Make basic API request
   */
  async apiRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;

    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.data = JSON.stringify(data);
    }

    return this.context.request.fetch(url, options);
  }

  /**
   * Login via API and get auth token (legacy method for compatibility)
   */
  async loginViaAPI(user: TestUser): Promise<string> {
    const tokens = await this.login({ email: user.email, password: user.password }, user.email);
    return tokens.accessToken;
  }

  /**
   * Measure API response performance
   */
  async measurePerformance(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, token?: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();

    let response: APIResponse;
    if (token) {
      response = await this.authenticatedRequest(method, endpoint, token, data);
    } else {
      response = await this.apiRequest(method, endpoint, data);
    }

    const responseTime = Date.now() - startTime;
    const responseText = await response.text();
    const payloadSize = new Blob([responseText]).size;

    return {
      responseTime,
      statusCode: response.status(),
      payloadSize
    };
  }

  /**
   * Execute multiple requests concurrently
   */
  async concurrentRequests(requests: Array<{ method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, token?: string }>): Promise<APIResponse[]> {
    const promises = requests.map(req => {
      if (req.token) {
        return this.authenticatedRequest(req.method, req.endpoint, req.token, req.data);
      } else {
        return this.apiRequest(req.method, req.endpoint, req.data);
      }
    });

    return Promise.all(promises);
  }

  /**
   * Clear stored authentication tokens
   */
  clearTokens(userKey?: string): void {
    if (userKey) {
      this.authTokens.delete(userKey);
    } else {
      this.authTokens.clear();
    }
  }

  /**
   * Get stored tokens for a user
   */
  getTokens(userKey: string = 'default'): AuthTokens | undefined {
    return this.authTokens.get(userKey);
  }
}

/**
 * Browser context management
 */
export class BrowserHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clear all cookies and local storage
   */
  async clearBrowserState(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ path: `test-results/screenshot-${name}-${timestamp}.png` });
  }

  /**
   * Wait for element to be visible and clickable
   */
  async waitForClickable(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    await this.page.waitForSelector(selector, { state: 'attached', timeout });
  }
}

/**
 * Test data fixtures
 */
export const TEST_DATA = {
  courses: {
    pythonBasics: {
      slug: 'python-basics',
      title: 'Introduction to Python Programming',
      description: 'Learn the fundamentals of Python programming language'
    },
    mlFoundations: {
      slug: 'ml-foundations',
      title: 'Machine Learning Foundations',
      description: 'Comprehensive introduction to machine learning concepts'
    }
  },
  lessons: {
    gettingStarted: {
      slug: 'getting-started',
      title: 'Getting Started with Python'
    },
    variablesTypes: {
      slug: 'variables-types',
      title: 'Variables and Data Types'
    }
  }
};

/**
 * Utility functions
 */
export const Utils = {
  /**
   * Generate random string for unique test data
   */
  randomString(length = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  },

  /**
   * Wait for a specific amount of time
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Check if element exists without throwing
   */
  async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
};