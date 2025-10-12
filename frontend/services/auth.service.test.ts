import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, register, getMe, checkEmail, logout, forgotPassword, resetPassword } from './auth.service'
import api from '../src/lib/api'

// Mock the API module
vi.mock('../src/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const mockApi = vi.mocked(api)

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should successfully login and return mapped tokens', async () => {
      const mockResponse = {
        data: {
          access_token: 'access-token-123',
          token_type: 'bearer',
          refresh_token: 'refresh-token-456',
          expires_in: 3600,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await login('test@example.com', 'password123')

      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', expect.any(URLSearchParams), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      // Check that the form data was constructed correctly
      const formData = mockApi.post.mock.calls[0][1] as URLSearchParams
      expect(formData.get('username')).toBe('test@example.com')
      expect(formData.get('password')).toBe('password123')

      expect(result).toEqual({
        accessToken: 'access-token-123',
        tokenType: 'bearer',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        expiresAt: undefined,
      })
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Invalid credentials')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })

    it('should handle axios error responses', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: 'Invalid login credentials' },
        },
        message: 'Request failed with status code 401',
      }
      mockApi.post.mockRejectedValueOnce(axiosError)

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow()
    })
  })

  describe('register', () => {
    it('should successfully register and return authenticated result', async () => {
      const mockResponse = {
        data: {
          access_token: 'access-token-123',
          token_type: 'bearer',
          refresh_token: 'refresh-token-456',
          expires_in: 3600,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await register('John Doe', 'john@example.com', 'password123')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })

      expect(result).toEqual({
        status: 'authenticated',
        tokens: {
          accessToken: 'access-token-123',
          tokenType: 'bearer',
          refreshToken: 'refresh-token-456',
          expiresIn: 3600,
          expiresAt: undefined,
        },
      })
    })

    it('should return pending confirmation status', async () => {
      const mockResponse = {
        data: {
          status: 'pending_confirmation',
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await register('John Doe', 'john@example.com', 'password123')

      expect(result).toEqual({
        status: 'pending_confirmation',
      })
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Email already exists')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(register('John Doe', 'existing@example.com', 'password123')).rejects.toThrow('Email already exists')
    })
  })

  describe('getMe', () => {
    it('should successfully fetch user profile', async () => {
      const mockResponse = {
        data: {
          user_id: 'user-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMe()

      expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual({
        id: 'user-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'student',
      })
    })

    it('should handle alternative field names', async () => {
      const mockResponse = {
        data: {
          id: 'user-456',
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          role: 'instructor',
        },
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await getMe()

      expect(result).toEqual({
        id: 'user-456',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        role: 'instructor',
      })
    })

    it('should throw error when response data is empty', async () => {
      const mockResponse = {
        data: null,
      }

      mockApi.get.mockResolvedValueOnce(mockResponse)

      await expect(getMe()).rejects.toThrow('Unable to load user profile')
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Unauthorized')
      mockApi.get.mockRejectedValueOnce(error)

      await expect(getMe()).rejects.toThrow('Unauthorized')
    })
  })

  describe('checkEmail', () => {
    it('should return true when email exists', async () => {
      const mockResponse = {
        data: {
          exists: true,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await checkEmail('existing@example.com')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/check-email', {
        email: 'existing@example.com',
      })
      expect(result).toBe(true)
    })

    it('should return false when email does not exist', async () => {
      const mockResponse = {
        data: {
          exists: false,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await checkEmail('new@example.com')

      expect(result).toBe(false)
    })

    it('should convert email to lowercase', async () => {
      const mockResponse = {
        data: {
          exists: true,
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      await checkEmail('Test@Example.COM')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/check-email', {
        email: 'test@example.com',
      })
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Network error')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(checkEmail('test@example.com')).rejects.toThrow('Network error')
    })
  })

  describe('logout', () => {
    it('should resolve successfully (no-op implementation)', async () => {
      await expect(logout()).resolves.toBeUndefined()
    })
  })

  describe('forgotPassword', () => {
    it('should successfully send forgot password request', async () => {
      mockApi.post.mockResolvedValueOnce({})

      await expect(forgotPassword('test@example.com')).resolves.toBeUndefined()

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      })
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Invalid email')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(forgotPassword('invalid@example.com')).rejects.toThrow('Invalid email')
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      mockApi.post.mockResolvedValueOnce({})

      await expect(resetPassword('reset-token-123', 'newpassword123')).resolves.toBeUndefined()

      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
      })
    })

    it('should throw error when API call fails', async () => {
      const error = new Error('Invalid token')
      mockApi.post.mockRejectedValueOnce(error)

      await expect(resetPassword('invalid-token', 'newpassword123')).rejects.toThrow('Invalid token')
    })
  })
})
