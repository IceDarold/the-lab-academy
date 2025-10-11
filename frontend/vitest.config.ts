/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { default: react } = await import('@vitejs/plugin-react')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
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
})
