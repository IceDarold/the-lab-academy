import { describe, it, expect, beforeAll } from 'vitest'
import { login } from '../../services/auth.service'

// Test user credentials from integration seeding script
const TEST_USERS = {
  valid: {
    email: 'testuser1@example.com',
    password: 'testpass123',
    expectedName: 'Test User One'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
}

describe('Login Integration Tests', () => {
  beforeAll(() => {
    // Ensure we're using the real API for integration tests
    // The VITE_API_URL should be set to point to the running backend
    expect(process.env.VITE_API_URL).toBeDefined()
    expect(process.env.VITE_API_URL).not.toBe('/api') // Should not be the default dev proxy
  })

  describe('Successful Login', () => {
    it('should successfully authenticate with valid credentials and return tokens', async () => {
      const { email, password } = TEST_USERS.valid

      const result = await login(email, password)

      // Verify the response structure
      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('tokenType')
      expect(result.tokenType).toBe('bearer')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('expiresIn')
      expect(typeof result.expiresIn).toBe('number')
      expect(result.expiresIn).toBeGreaterThan(0)

      // Verify token format (should be a non-empty string)
      expect(typeof result.accessToken).toBe('string')
      expect(result.accessToken.length).toBeGreaterThan(0)
      expect(typeof result.refreshToken).toBe('string')
      expect(result.refreshToken.length).toBeGreaterThan(0)
    })

    it('should return different tokens for different login attempts', async () => {
      const { email, password } = TEST_USERS.valid

      const result1 = await login(email, password)
      const result2 = await login(email, password)

      // Tokens should be different (fresh tokens each time)
      expect(result1.accessToken).not.toBe(result2.accessToken)
      expect(result1.refreshToken).not.toBe(result2.refreshToken)
    })
  })

  describe('Invalid Credentials', () => {
    it('should reject login with invalid email', async () => {
      const { email, password } = TEST_USERS.invalid

      await expect(login(email, password)).rejects.toThrow()

      // The error should indicate authentication failure
      try {
        await login(email, password)
        expect.fail('Login should have failed')
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
        expect(error.response?.data?.detail).toContain('Incorrect email or password')
      }
    })

    it('should reject login with valid email but wrong password', async () => {
      const { email } = TEST_USERS.valid
      const wrongPassword = 'wrongpassword123'

      await expect(login(email, wrongPassword)).rejects.toThrow()

      try {
        await login(email, wrongPassword)
        expect.fail('Login should have failed')
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
        expect(error.response?.data?.detail).toContain('Incorrect email or password')
      }
    })

    it('should reject login with empty credentials', async () => {
      await expect(login('', '')).rejects.toThrow()

      try {
        await login('', '')
        expect.fail('Login should have failed')
      } catch (error: any) {
        // Could be 401 or 422 depending on backend validation
        expect([401, 422]).toContain(error.response?.status)
      }
    })
  })

})