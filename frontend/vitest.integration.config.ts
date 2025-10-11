/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      // Integration tests run from frontend/tests/integration/
      include: ['tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      // Exclude unit tests to avoid conflicts
      exclude: [
        'node_modules/',
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'pages/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'services/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'contexts/**/*.{test,spec}.{js,ts,jsx,tsx}',
        '**/*.d.ts',
        '**/*.config.*',
        'vite.config.ts',
        'vitest.config.ts',
        'vitest.integration.config.ts',
      ],
      // Longer timeouts for API calls
      testTimeout: 30000,
      hookTimeout: 30000,
      // Global setup for backend startup and seeding
      globalSetup: './tests/integration-setup.ts',
      globalTeardown: './tests/integration-teardown.ts',
      // Environment setup
      env: {
        VITE_API_URL: 'http://127.0.0.1:8001/api',
        TESTING: 'true',
      },
      // Disable coverage for integration tests (can be enabled separately if needed)
      coverage: {
        enabled: false,
      },
    },
  }
})