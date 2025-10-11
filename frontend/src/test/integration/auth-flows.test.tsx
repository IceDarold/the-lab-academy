import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../contexts/AuthContext.tsx'
import { login as loginService, register as registerService, getMe, checkEmail } from '../../../services/auth.service.ts'
import { clearStoredTokens, getStoredTokens, storeTokens } from '../../lib/tokenStorage.ts'
import api from '../../lib/api.ts'

// Mock API
vi.mock('../../../lib/api.ts', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

// Mock token storage
vi.mock('../../../lib/tokenStorage.ts', () => ({
  clearStoredTokens: vi.fn(),
  getStoredTokens: vi.fn(),
  storeTokens: vi.fn(),
}))

// Mock FullScreenLoader
vi.mock('../../../components/FullScreenLoader.tsx', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}))

const mockApi = vi.mocked(api)
const mockGetStoredTokens = vi.mocked(getStoredTokens)
const mockStoreTokens = vi.mocked(storeTokens)
const mockClearStoredTokens = vi.mocked(clearStoredTokens)

// Test component that uses auth
const TestApp = () => {
  const { user, isAuthenticated, isLoading, isAuthenticating, login, register, logout } = useAuth()

  if (isLoading || isAuthenticating) {
    return <div data-testid="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={async () => {
          try {
            await login('test@example.com', 'password')
          } catch (error) {
            // Error is handled by the test - ignore in component
          }
        }}>Login</button>
        <button onClick={async () => {
          try {
            await register('John Doe', 'john@example.com', 'password')
          } catch (error) {
            // Error is handled by the test - ignore in component
          }
        }}>Register</button>
      </div>
    )
  }

  return (
    <div>
      <div data-testid="user-info">Welcome {user?.fullName}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('Auth Integration Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStoredTokens.mockReturnValue(null)
    api.defaults.headers.common = {}
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      const user = userEvent.setup()

      // Mock successful API responses
      const mockTokens = {
        accessToken: 'access-token-123',
        tokenType: 'bearer',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      }

      const mockUser = {
        id: 'user-123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'student' as const,
      }

      mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        data: {
          access_token: 'access-token-123',
          token_type: 'bearer',
          refresh_token: 'refresh-token-456',
          expires_in: 3600,
        },
      }), 100)))

      mockApi.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        data: {
          user_id: 'user-123',
          full_name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      }), 100)))

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      // Initially not authenticated
      expect(screen.getByText('Login')).toBeInTheDocument()

      // Click login
      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      // Should show loading
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should complete authentication
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome Test User')
      })

      // Should have stored tokens
      expect(mockStoreTokens).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'access-token-123',
        tokenType: 'bearer',
        refreshToken: 'refresh-token-456',
        expiresAt: expect.any(Number),
      }))

      // Should have set API headers
      expect(api.defaults.headers.common.Authorization).toBe('Bearer access-token-123')
    })

    it('should handle login failure and remain unauthenticated', async () => {
      const user = userEvent.setup()

      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      // Should remain unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      // Should not have stored tokens
      expect(mockStoreTokens).not.toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })

  describe('Registration Flow', () => {
    it('should complete full authenticated registration flow', async () => {
      const user = userEvent.setup()

      const mockUser = {
        id: 'user-456',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'student' as const,
      }

      mockApi.post.mockResolvedValueOnce({
        data: {
          access_token: 'register-token-123',
          token_type: 'bearer',
          refresh_token: 'register-refresh-456',
          expires_in: 3600,
        },
      })

      mockApi.get.mockResolvedValueOnce({
        data: {
          user_id: 'user-456',
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome John Doe')
      })

      expect(mockStoreTokens).toHaveBeenCalledWith(expect.objectContaining({
        accessToken: 'register-token-123',
        tokenType: 'bearer',
        refreshToken: 'register-refresh-456',
        expiresAt: expect.any(Number),
      }))
      expect(api.defaults.headers.common.Authorization).toBe('Bearer register-token-123')
    })

    it('should handle pending confirmation registration', async () => {
      const user = userEvent.setup()

      mockApi.post.mockResolvedValueOnce({
        data: {
          status: 'pending_confirmation',
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      // Should remain unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Register')).toBeInTheDocument()
      })

      expect(mockStoreTokens).not.toHaveBeenCalled()
    })

    it('should handle registration failure', async () => {
      const user = userEvent.setup()

      mockApi.post.mockRejectedValueOnce(new Error('Email already exists'))

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByText('Register')).toBeInTheDocument()
      })

      expect(mockStoreTokens).not.toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('should restore session from stored tokens on app start', async () => {
      const mockTokens = {
        accessToken: 'stored-token',
        tokenType: 'bearer',
        refreshToken: 'stored-refresh',
        expiresAt: Date.now() + 3600000,
      }

      const mockUser = {
        id: 'user-789',
        fullName: 'Stored User',
        email: 'stored@example.com',
        role: 'instructor' as const,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockApi.get.mockResolvedValueOnce({
        data: {
          user_id: 'user-789',
          full_name: 'Stored User',
          email: 'stored@example.com',
          role: 'instructor',
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should restore session
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome Stored User')
      })

      expect(api.defaults.headers.common.Authorization).toBe('Bearer stored-token')
    })

    it('should clear invalid stored tokens', async () => {
      const mockTokens = {
        accessToken: 'invalid-token',
        tokenType: 'bearer',
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockApi.get.mockRejectedValueOnce(new Error('Invalid token'))

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      expect(mockClearStoredTokens).toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })

  describe('Logout Flow', () => {
    it('should complete full logout flow', async () => {
      const user = userEvent.setup()

      // Set up authenticated state
      const mockTokens = {
        accessToken: 'logout-token',
        tokenType: 'bearer',
      }

      const mockUser = {
        id: 'user-999',
        fullName: 'Logout User',
        email: 'logout@example.com',
        role: 'student' as const,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockApi.get.mockResolvedValue({
        data: {
          user_id: 'user-999',
          full_name: 'Logout User',
          email: 'logout@example.com',
          role: 'student',
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome Logout User')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      expect(mockClearStoredTokens).toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })

  describe('API Error Handling', () => {
    it('should handle network errors during login', async () => {
      const user = userEvent.setup()

      mockApi.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          data: { message: 'Network error' },
        },
        message: 'Request failed',
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      // Should remain unauthenticated
      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument()
    })

    it('should handle malformed API responses', async () => {
      const user = userEvent.setup()

      // Login succeeds but getMe fails with malformed data
      mockApi.post.mockResolvedValueOnce({
        data: {
          access_token: 'token',
          token_type: 'bearer',
        },
      })

      mockApi.get.mockResolvedValueOnce({
        data: null, // Malformed response
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      // Should clear tokens on malformed response
      expect(mockClearStoredTokens).toHaveBeenCalled()
    })
  })
})