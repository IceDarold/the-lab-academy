/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
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
      globalSetup: ['./tests/integration-setup.ts'],
      globalTeardown: ['./tests/integration-teardown.ts'],
      // Environment setup - use dynamic port from integration setup
      env: {
        VITE_API_URL: `http://127.0.0.1:${process.env.INTEGRATION_TEST_PORT || '8001'}/api`,
        TESTING: 'true',
      },
      // Disable coverage for integration tests (can be enabled separately if needed)
      coverage: {
        enabled: false,
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          'vite.config.ts',
          'vitest.config.ts',
          'vitest.integration.config.ts',
        ],
      },
    },
  }

  // Validate configuration in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { validateVitestConfig } = await import('./src/lib/config-validation.ts')
      const result = await validateVitestConfig(config, { verbose: true })

      if (!result.isValid) {
        console.error('❌ Vitest integration configuration validation failed:')
        result.errors.forEach(error => console.error(`  ${error}`))
        result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
        process.exit(1)
      } else if (result.warnings.length > 0) {
        console.warn('⚠️  Vitest integration configuration warnings:')
        result.warnings.forEach(warning => console.warn(`  ${warning}`))
      }
    } catch (error) {
      console.error('❌ Failed to validate Vitest integration configuration:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  }

  return config
})