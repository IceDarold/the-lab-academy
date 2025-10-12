import { Page, BrowserContext, APIResponse } from '@playwright/test';
import { TEST_USERS } from './test-utils';
import type { TestUser } from './test-utils';
// Re-export TEST_USERS and TestUser for convenience
export { TEST_USERS, TestUser } from './test-utils';

/**
 * Authentication helpers for E2E tests
 * Provides easy login/logout functionality for different user types
 */

export class AuthHelpers {
  private page: Page;
  private context?: BrowserContext;
  private baseURL: string;

  constructor(page: Page, context?: BrowserContext) {
    this.page = page;
    this.context = context;
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:8000/api';
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(): Promise<void> {
    await this.login(TEST_USERS.admin);
  }

  /**
   * Login as student user
   */
  async loginAsStudent(): Promise<void> {
    await this.login(TEST_USERS.student);
  }

  /**
   * Login as second student user
   */
  async loginAsStudent2(): Promise<void> {
    await this.login(TEST_USERS.student2);
  }

  /**
   * Login with specific user
   */
  async login(user: TestUser): Promise<void> {
    await this.page.goto('#/login');

    // Wait for login form with standardized selectors and fallbacks
    const loginSelectors = [
      '[data-testid="email-input"]',
      'input[id="email-address"]',
      'input[type="email"]',
      'input[name="email"]',
      '#email-address'
    ];

    let emailInput: string | null = null;
    for (const selector of loginSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        emailInput = selector;
        break;
      } catch {
        continue;
      }
    }

    if (!emailInput) {
      throw new Error('Could not find email input field');
    }

    // Fill in credentials
    await this.page.fill(emailInput, user.email);

    // Find password input
    const passwordSelectors = [
      '[data-testid="password-input"]',
      'input[id="password"]',
      'input[type="password"]',
      'input[name="password"]',
      '#password'
    ];

    let passwordInput: string | null = null;
    for (const selector of passwordSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        passwordInput = selector;
        break;
      } catch {
        continue;
      }
    }

    if (!passwordInput) {
      throw new Error('Could not find password input field');
    }

    await this.page.fill(passwordInput, user.password);

    // Click login button
    const loginButtonSelectors = [
      '[data-testid="login-button"]',
      'button[id="login-button"]',
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")'
    ];

    let loginButton: string | null = null;
    for (const selector of loginButtonSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        loginButton = selector;
        break;
      } catch {
        continue;
      }
    }

    if (!loginButton) {
      throw new Error('Could not find login button');
    }

    await this.page.click(loginButton);

    // Wait for successful login - check for dashboard or user menu
    const successSelectors = [
      'text="Welcome to your dashboard"',
      'text="Courses"',
      '[data-testid="dashboard"]',
      '[data-testid="user-menu"]',
      '[data-testid="user-avatar"]',
      '.dashboard',
      '[data-testid="courses-list"]'
    ];

    let successFound = false;
    for (const selector of successSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        successFound = true;
        break;
      } catch {
        continue;
      }
    }

    if (!successFound) {
      // Check for error messages
      const errorSelectors = [
        '[data-testid="error-message"]',
        '.error',
        '.alert-danger',
        '[data-testid="login-error"]'
      ];

      for (const selector of errorSelectors) {
        try {
          const errorText = await this.page.textContent(selector, { timeout: 2000 });
          if (errorText) {
            throw new Error(`Login failed: ${errorText}`);
          }
        } catch {
          continue;
        }
      }

      throw new Error('Login failed: Could not verify successful login');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Try different logout approaches with standardized selectors first
    const logoutSelectors = [
      '[data-testid="logout-button"]',
      '[data-testid="user-menu"] [data-testid="logout"]',
      '[data-testid="user-dropdown"] [data-testid="logout"]',
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      '[data-testid="user-dropdown"] button:has-text("Logout")'
    ];

    let logoutClicked = false;
    for (const selector of logoutSelectors) {
      try {
        // For dropdown menus, click the menu first
        if (selector.includes('user-menu') || selector.includes('user-dropdown')) {
          const menuSelector = selector.split(' ')[0];
          await this.page.click(menuSelector);
          // Wait for dropdown to appear
          await this.page.waitForSelector('[data-testid="logout"], button:has-text("Logout"), button:has-text("Sign Out")', { timeout: 2000 });
        }

        await this.page.click(selector);
        logoutClicked = true;
        break;
      } catch {
        continue;
      }
    }

    if (!logoutClicked) {
      throw new Error('Could not find logout button');
    }

    // Wait for redirect to login or home
    const redirectSelectors = [
      '#/login',
      '/',
      '#/home'
    ];

    let redirectFound = false;
    for (const path of redirectSelectors) {
      try {
        await this.page.waitForURL(`**${path}`, { timeout: 5000 });
        redirectFound = true;
        break;
      } catch {
        continue;
      }
    }

    if (!redirectFound) {
      // Check if we're still on the same page but logged out
      try {
        await this.page.waitForSelector('[data-testid="login-form"]', { timeout: 2000 });
        redirectFound = true;
      } catch {
        // Continue
      }
    }

    if (!redirectFound) {
      throw new Error('Logout failed: Could not verify successful logout');
    }
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const loggedInSelectors = [
      '[data-testid="user-menu"]',
      '[data-testid="user-avatar"]',
      '[data-testid="dashboard"]',
      '[data-testid="logout-button"]',
      '[data-testid="user-dropdown"]'
    ];

    for (const selector of loggedInSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        return true;
      } catch {
        continue;
      }
    }

    return false;
  }

  /**
   * Get current logged in user info
   */
  async getCurrentUser(): Promise<{ email?: string; name?: string; role?: string } | null> {
    try {
      const userInfo: any = {};

      // Try to get email
      const emailSelectors = [
        '[data-testid="user-email"]',
        '[data-testid="current-user-email"]',
        '[data-testid="user-info-email"]',
        '.user-email'
      ];

      for (const selector of emailSelectors) {
        try {
          const email = await this.page.getAttribute(selector, 'data-email') ||
                       await this.page.textContent(selector);
          if (email) {
            userInfo.email = email.trim();
            break;
          }
        } catch {
          continue;
        }
      }

      // Try to get name
      const nameSelectors = [
        '[data-testid="user-name"]',
        '[data-testid="current-user-name"]',
        '[data-testid="user-info-name"]',
        '.user-name'
      ];

      for (const selector of nameSelectors) {
        try {
          const name = await this.page.textContent(selector);
          if (name) {
            userInfo.name = name.trim();
            break;
          }
        } catch {
          continue;
        }
      }

      // Try to get role
      const roleSelectors = [
        '[data-testid="user-role"]',
        '[data-testid="user-info-role"]',
        '.user-role'
      ];

      for (const selector of roleSelectors) {
        try {
          const role = await this.page.getAttribute(selector, 'data-role') ||
                      await this.page.textContent(selector);
          if (role) {
            userInfo.role = role.trim().toLowerCase();
            break;
          }
        } catch {
          continue;
        }
      }

      return Object.keys(userInfo).length > 0 ? userInfo : null;
    } catch {
      return null;
    }
  }

  /**
   * Attempt login with invalid credentials and expect failure
   */
  async attemptInvalidLogin(email: string, password: string): Promise<void> {
    await this.page.goto('#/login');

    // Fill in invalid credentials
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);

    // Click login
    await this.page.click('[data-testid="login-button"]');

    // Should stay on login page or show error
    await this.page.waitForSelector('.error, [data-testid="error-message"]', { timeout: 5000 });
  }

  /**
   * Clear authentication state
   */
  async clearAuthState(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
  /**
   * Make authenticated API request
   */
  async apiRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<APIResponse> {
    if (!this.context) {
      throw new Error('BrowserContext is required for API requests');
    }

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
   * Login via API and get auth token
   */
  async loginViaAPI(user: TestUser): Promise<string> {
    if (!this.context) {
      throw new Error('BrowserContext is required for API login');
    }

    const response = await this.apiRequest('POST', '/auth/login', {
      email: user.email,
      password: user.password
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()} ${response.statusText()}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Make authenticated API request with token
   */
  async authenticatedRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    token: string,
    data?: any
  ): Promise<APIResponse> {
    if (!this.context) {
      throw new Error('BrowserContext is required for authenticated API requests');
    }

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
}

/**
 * Convenience functions for common auth operations
 */
export const authHelpers = {
  /**
   * Quick login as admin
   */
  async loginAsAdmin(page: Page): Promise<void> {
    const auth = new AuthHelpers(page);
    await auth.loginAsAdmin();
  },

  /**
   * Quick login as student
   */
  async loginAsStudent(page: Page): Promise<void> {
    const auth = new AuthHelpers(page);
    await auth.loginAsStudent();
  },

  /**
   * Quick logout
   */
  async logout(page: Page): Promise<void> {
    const auth = new AuthHelpers(page);
    await auth.logout();
  },

  /**
   * Check login status
   */
  async isLoggedIn(page: Page): Promise<boolean> {
    const auth = new AuthHelpers(page);
    return auth.isLoggedIn();
  }
};