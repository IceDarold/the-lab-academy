import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiConfig } from './config'

// Mock import.meta.env
const mockImportMetaEnv = (env: Record<string, string | boolean>) => {
  Object.defineProperty(import.meta, 'env', {
    value: env,
    writable: true,
  })
}

// Mock process.env
const mockProcessEnv = (env: Record<string, string>) => {
  Object.defineProperty(process, 'env', {
    value: env,
    writable: true,
  })
}

describe('Config', () => {
  const originalImportMeta = import.meta
  const originalProcess = process

  beforeEach(() => {
    // Reset mocks
    vi.restoreAllMocks()
  })

  afterEach(() => {
    // Restore original objects
    Object.defineProperty(globalThis, 'import', {
      value: originalImportMeta,
    })
    Object.defineProperty(globalThis, 'process', {
      value: originalProcess,
    })
  })

  describe('apiConfig', () => {
    it('should have correct baseURL', () => {
      expect(apiConfig.baseURL).toBe('/api')
    })

    it('should have reasonable timeout', () => {
      expect(apiConfig.timeoutMs).toBeGreaterThan(0)
      expect(apiConfig.timeoutMs).toBeLessThanOrEqual(60000) // Reasonable upper bound
    })

    it('should have retry configuration', () => {
      expect(apiConfig.retry).toBeDefined()
      expect(apiConfig.retry.maxAttempts).toBeGreaterThan(0)
      expect(apiConfig.retry.baseDelayMs).toBeGreaterThan(0)
      expect(apiConfig.retry.maxDelayMs).toBeGreaterThan(apiConfig.retry.baseDelayMs)
    })

    it('should have default values', () => {
      expect(apiConfig.timeoutMs).toBe(15000)
      expect(apiConfig.retry.maxAttempts).toBe(3)
      expect(apiConfig.retry.baseDelayMs).toBe(300)
      expect(apiConfig.retry.maxDelayMs).toBe(5000)
    })
  })
})