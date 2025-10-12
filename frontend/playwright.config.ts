import { devices } from '@playwright/test';

const config = {
  testDir: './tests',
  testMatch: ['**/*-e2e.test.ts', '**/*-journey-e2e.test.ts', '**/*visual-regression.test.ts', '**/accessibility.test.ts'],
  // globalSetup: './tests/global-setup.ts',
  // globalTeardown: './tests/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.ACCESSIBILITY_REPORT ? ['html', ['json', { outputFile: 'accessibility-results.json' }]] : 'html',
  workers: process.env.CI ? 3 : undefined,
  expect: {
    toHaveScreenshot: {
      threshold: 0.2, // Allow 0.2% pixel difference for visual regression
      maxDiffPixels: 100, // Maximum number of different pixels allowed
    },
  },
  use: {
    // Accessibility testing configuration
    actionTimeout: 10000, // Longer timeout for accessibility checks
    navigationTimeout: 30000,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};

// Validate configuration in development
if (process.env.NODE_ENV !== 'production') {
  // Lazy load validation to avoid import-time side effects
  import('./src/lib/config-validation.ts').then(({ validatePlaywrightConfig }) => {
    validatePlaywrightConfig(config, { verbose: true }).then(result => {
      if (!result.isValid) {
        console.error('❌ Playwright configuration validation failed:');
        result.errors.forEach(error => console.error(`  ${error}`));
        result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
        process.exit(1);
      } else if (result.warnings.length > 0) {
        console.warn('⚠️  Playwright configuration warnings:');
        result.warnings.forEach(warning => console.warn(`  ${warning}`));
      }
    }).catch(error => {
      console.error('❌ Failed to validate Playwright configuration:', error.message);
      process.exit(1);
    });
  }).catch(error => {
    console.error('❌ Failed to load config validation:', error.message);
  });
}

export default config;