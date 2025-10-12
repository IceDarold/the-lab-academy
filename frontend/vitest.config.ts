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
      testTimeout: 30000, // Increase default timeout to 30 seconds for slow component tests
      include: [
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'components/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'pages/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'services/**/*.{test,spec}.{js,ts,jsx,tsx}',
      ],
      exclude: [
        'tests/**/*',
        'e2e/**/*',
        'playwright.config.*',
        'node_modules/**/*',
      ],
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          'vite.config.ts',
          'vitest.config.ts',
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
        console.error('❌ Vitest configuration validation failed:')
        result.errors.forEach(error => console.error(`  ${error}`))
        result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
        process.exit(1)
      } else if (result.warnings.length > 0) {
        console.warn('⚠️  Vitest configuration warnings:')
        result.warnings.forEach(warning => console.warn(`  ${warning}`))
      }
    } catch (error) {
      console.error('❌ Failed to validate Vitest configuration:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  }

  return config
})
