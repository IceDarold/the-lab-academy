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
