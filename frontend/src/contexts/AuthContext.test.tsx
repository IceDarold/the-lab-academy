import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import { login as loginService, register as registerService, logout as logoutService, getMe, checkEmail as checkEmailService } from '@/services/auth.service.ts'
import { clearStoredTokens, getStoredTokens, storeTokens } from '@/src/lib/tokenStorage.ts'
import api from '@/src/lib/api.ts'

// Mock all dependencies
vi.mock('@/services/auth.service.ts', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  checkEmail: vi.fn(),
}))

vi.mock('@/src/lib/tokenStorage.ts', () => ({
  clearStoredTokens: vi.fn(),
  getStoredTokens: vi.fn(),
  storeTokens: vi.fn(),
}))

vi.mock('@/src/lib/api.ts', () => ({
  default: {
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

vi.mock('@/components/FullScreenLoader.tsx', () => ({
  default: () => <div data-testid="fullscreen-loader" aria-label="Loading application"><div>Loading spinner</div></div>,
}))

const mockLogin = vi.mocked(loginService)
const mockRegister = vi.mocked(registerService)
const mockLogout = vi.mocked(logoutService)
const mockGetMe = vi.mocked(getMe)
const mockCheckEmail = vi.mocked(checkEmailService)
const mockClearStoredTokens = vi.mocked(clearStoredTokens)
const mockGetStoredTokens = vi.mocked(getStoredTokens)
const mockStoreTokens = vi.mocked(storeTokens)

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, register, checkEmail } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password')
    } catch (error) {
      // Error handled to prevent unhandled rejections in tests
    }
  }

  const handleRegister = async () => {
    try {
      await register('John Doe', 'john@example.com', 'password')
    } catch (error) {
      // Error handled to prevent unhandled rejections in tests
    }
  }

  const handleCheckEmail = async () => {
    try {
      await checkEmail('test@example.com')
    } catch (error) {
      // Error handled to prevent unhandled rejections in tests
    }
  }

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `User: ${user.fullName} (${user.email})` : 'No user'}
      </div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={handleCheckEmail}>Check Email</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeAll(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    })

    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true,
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location.hash
    window.location.hash = ''
    // Reset API headers
    api.defaults.headers.common = {}
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Initial session check', () => {
    it('should show loading initially', async () => {
      // Mock tokens to exist so getMe is called
      const mockTokens = {
        accessToken: 'valid-token',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      // Mock getMe to return a promise that doesn't resolve immediately
      mockGetMe.mockImplementation(() => new Promise(() => {}))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
    })

    it('should not authenticate when no stored tokens', async () => {
      mockGetStoredTokens.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(mockGetMe).not.toHaveBeenCalled()
    })

    it('should authenticate when valid tokens exist', async () => {
      const mockTokens = {
        accessToken: 'valid-token',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      const mockUser = {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: John Doe (john@example.com)')
      })

      expect(mockStoreTokens).toHaveBeenCalledWith(mockTokens)
      expect(api.defaults.headers.common.Authorization).toBe('Bearer valid-token')
    })

    it('should handle invalid stored tokens gracefully', async () => {
      const mockTokens = {
        accessToken: 'invalid-token',
        tokenType: 'bearer',
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockRejectedValue(new Error('Invalid token'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(mockClearStoredTokens).toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })

  describe('Login functionality', () => {
    it('should successfully login and redirect', async () => {
      const user = userEvent.setup()
      const mockTokens = {
        accessToken: 'login-token',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      }

      const mockUser = {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
      }

      mockLogin.mockResolvedValue(mockTokens)
      mockGetMe.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
        expect(window.location.hash).toBe('#/dashboard')
      })

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockStoreTokens).toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBe('Bearer login-token')
    })

    it('should handle login errors', async () => {
      const user = userEvent.setup()

      mockLogin.mockRejectedValue(new Error('Invalid credentials'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockStoreTokens).not.toHaveBeenCalled()
    })
  })

  describe('Registration functionality', () => {
    it('should successfully register authenticated user', async () => {
      const user = userEvent.setup()
      const mockTokens = {
        accessToken: 'register-token',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      }

      const mockUser = {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
      }

      mockRegister.mockResolvedValue({ status: 'authenticated', tokens: mockTokens })
      mockGetMe.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
        expect(window.location.hash).toBe('#/dashboard')
      })

      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password')
      expect(mockStoreTokens).toHaveBeenCalled()
    })

    it('should handle pending confirmation registration', async () => {
      const user = userEvent.setup()

      mockRegister.mockResolvedValue({ status: 'pending_confirmation' })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password')
      expect(mockStoreTokens).not.toHaveBeenCalled()
    })

    it('should handle registration errors', async () => {
      const user = userEvent.setup()

      mockRegister.mockRejectedValue(new Error('Email already exists'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password')
    })
  })

  describe('Logout functionality', () => {
    it('should successfully logout and clear session', async () => {
      const user = userEvent.setup()

      // Set up authenticated state
      const mockTokens = {
        accessToken: 'valid-token',
        tokenType: 'bearer',
      }

      const mockUser = {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
        expect(window.location.hash).toBe('#/')
      })

      expect(mockClearStoredTokens).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })

  describe('Email checking', () => {
    it('should check email availability', async () => {
      const user = userEvent.setup()

      mockCheckEmail.mockResolvedValue(true)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const checkButton = screen.getByText('Check Email')
      await user.click(checkButton)

      await waitFor(() => {
        expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com')
      })
    })

    it('should handle email check errors gracefully', async () => {
      const user = userEvent.setup()

      mockCheckEmail.mockRejectedValue(new Error('Network error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const checkButton = screen.getByText('Check Email')
      await user.click(checkButton)

      // Should not throw, should return true as fallback
      await waitFor(() => {
        expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com')
      })
    })
  })

  describe('Token management', () => {
    it('should apply tokens to API headers correctly', async () => {
      const mockTokens = {
        accessToken: 'test-token',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockResolvedValue({
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(api.defaults.headers.common.Authorization).toBe('Bearer test-token')
      })
    })

    it('should handle different token types', async () => {
      const mockTokens = {
        accessToken: 'test-token',
        tokenType: 'custom',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockResolvedValue({
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(api.defaults.headers.common.Authorization).toBe('Custom test-token')
      })
    })

    it('should clear API headers on logout', async () => {
      const user = userEvent.setup()

      // Set up authenticated state
      const mockTokens = {
        accessToken: 'valid-token',
        tokenType: 'bearer',
      }

      mockGetStoredTokens.mockReturnValue(mockTokens)
      mockGetMe.mockResolvedValue({
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(api.defaults.headers.common.Authorization).toBe('Bearer valid-token')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(api.defaults.headers.common.Authorization).toBeUndefined()
      })
    })
  })

  describe('Error handling', () => {
    it('should extract error message from axios response', async () => {
      const user = userEvent.setup()

      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: 'Custom error message' },
        },
      }

      mockLogin.mockRejectedValue(axiosError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      // The error should be caught and handled
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })

    it('should handle generic errors', async () => {
      const user = userEvent.setup()

      mockLogin.mockRejectedValue('String error')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })
  })

  describe('Context usage without provider', () => {
    it('should throw error when useAuth is used outside provider', () => {
      // Mock console.error to avoid noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})
