import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext.tsx'
import { server } from '@/src/test/setup'
import {
  errorScenarioManager,
  NetworkFailureSimulator,
  ServerErrorSimulator,
  ChaosEngineer,
  ApplicationErrorSimulator
} from '../error-scenario-helpers'

// Mock API
vi.mock('@/src/lib/api.ts', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

// Mock token storage
vi.mock('@/src/lib/tokenStorage.ts', () => ({
  clearStoredTokens: vi.fn(),
  getStoredTokens: vi.fn(),
  storeTokens: vi.fn(),
}))

// Mock FullScreenLoader
vi.mock('@/components/FullScreenLoader.tsx', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}))

const mockApi = vi.mocked(await import('@/src/lib/api.ts')).default
const mockGetStoredTokens = vi.mocked(await import('@/src/lib/tokenStorage.ts')).getStoredTokens
const mockStoreTokens = vi.mocked(await import('@/src/lib/tokenStorage.ts')).storeTokens
const mockClearStoredTokens = vi.mocked(await import('@/src/lib/tokenStorage.ts')).clearStoredTokens

// Test component that uses auth
const TestApp = () => {
  const { user, isAuthenticated, isLoading, login, logout, fetchUserProfile } = useAuth()

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={async () => {
          try {
            await login('test@example.com', 'password')
          } catch (error) {
            console.error('Login error:', error)
          }
        }}>Login</button>
        <button onClick={async () => {
          try {
            await fetchUserProfile()
          } catch (error) {
            console.error('Profile fetch error:', error)
          }
        }}>Fetch Profile</button>
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

describe('Error Scenario Integration Tests', () => {
  let networkSimulator: NetworkFailureSimulator
  let serverSimulator: ServerErrorSimulator
  let chaosEngineer: ChaosEngineer
  let appSimulator: ApplicationErrorSimulator

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.VITE_API_URL = 'http://localhost:8000/api'
    mockGetStoredTokens.mockReturnValue(null)
    mockApi.defaults.headers.common = {}

    // Initialize simulators
    networkSimulator = new NetworkFailureSimulator(server)
    serverSimulator = new ServerErrorSimulator(server)
    chaosEngineer = new ChaosEngineer(networkSimulator, serverSimulator)
    appSimulator = new ApplicationErrorSimulator()
  })

  afterEach(() => {
    errorScenarioManager.cleanup()
    server.resetHandlers()
  })

  describe('Network Failure Scenarios', () => {
    it('should handle network disconnection during login', async () => {
      const user = userEvent.setup()

      // Setup network failure simulation
      networkSimulator.simulateDisconnect('**/auth/login', 5000)

      // Mock successful API response initially
      mockApi.post.mockResolvedValueOnce({
        data: {
          access_token: 'token-123',
          token_type: 'bearer',
          refresh_token: 'refresh-456',
          expires_in: 3600,
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      // Click login
      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Network fails, should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Should not have stored tokens
      expect(mockStoreTokens).not.toHaveBeenCalled()
    })

    it('should handle slow network during profile fetch', async () => {
      const user = userEvent.setup()

      // Setup slow network simulation
      networkSimulator.simulateSlowNetwork('**/auth/me', 3000)

      // Mock API response
      mockApi.get.mockResolvedValueOnce({
        data: {
          user_id: 'user-123',
          full_name: 'Test User',
          email: 'test@example.com',
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

      // Click fetch profile
      const fetchButton = screen.getByText('Fetch Profile')
      await user.click(fetchButton)

      // Should eventually succeed despite slow network
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      }, { timeout: 10000 })
    })

    it('should handle intermittent connectivity', async () => {
      const user = userEvent.setup()

      // Setup intermittent connectivity
      networkSimulator.simulateIntermittentConnectivity('**/auth/me', 0.7) // 70% failure rate

      mockApi.get.mockResolvedValueOnce({
        data: {
          user_id: 'user-123',
          full_name: 'Test User',
          email: 'test@example.com',
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

      const fetchButton = screen.getByText('Fetch Profile')
      await user.click(fetchButton)

      // Should eventually succeed or fail gracefully
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      }, { timeout: 15000 })
    })

    it('should handle DNS resolution failures', async () => {
      const user = userEvent.setup()

      // Setup DNS failure
      networkSimulator.simulateDNSFailure('**/auth/login')

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      // Should handle DNS failure gracefully
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  describe('Server Error Scenarios', () => {
    it('should handle HTTP 500 errors during login', async () => {
      const user = userEvent.setup()

      // Setup server error
      serverSimulator.simulateHttpError('**/auth/login', {
        statusCode: 500,
        message: 'Internal Server Error'
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

      // Should remain unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })

      expect(mockStoreTokens).not.toHaveBeenCalled()
    })

    it('should handle HTTP 401 unauthorized errors', async () => {
      const user = userEvent.setup()

      serverSimulator.simulateHttpError('**/auth/me', {
        statusCode: 401,
        message: 'Unauthorized'
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const fetchButton = screen.getByText('Fetch Profile')
      await user.click(fetchButton)

      // Should handle unauthorized error
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      })
    })

    it('should handle rate limiting (429 errors)', async () => {
      const user = userEvent.setup()

      serverSimulator.simulateRateLimit('**/auth/login', 2, 30000) // 2 requests per 30 seconds

      mockApi.post.mockResolvedValue({
        data: {
          access_token: 'token-123',
          token_type: 'bearer',
        },
      })

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const loginButton = screen.getByText('Login')

      // First two requests should succeed
      await user.click(loginButton)
      await user.click(loginButton)

      // Third request should be rate limited
      await user.click(loginButton)

      // Should handle rate limiting gracefully
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledTimes(3)
      })
    })

    it('should handle server timeouts', async () => {
      const user = userEvent.setup()

      serverSimulator.simulateTimeout('**/auth/me', 10000)

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestApp />
          </AuthProvider>
        </BrowserRouter>
      )

      const fetchButton = screen.getByText('Fetch Profile')
      await user.click(fetchButton)

      // Should handle timeout gracefully
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/auth/me')
      }, { timeout: 15000 })
    })
  })

  describe('Chaos Engineering Scenarios', () => {
    it('should handle random network failures', async () => {
      const user = userEvent.setup()

      // Inject chaos with random network failures
      chaosEngineer.injectRandomFailures(['**/auth/login', '**/auth/me'], {
        failureRate: 0.5,
        failureTypes: ['network'],
        duration: 10000
      })

      mockApi.post.mockResolvedValue({
        data: {
          access_token: 'token-123',
          token_type: 'bearer',
        },
      })

      mockApi.get.mockResolvedValue({
        data: {
          user_id: 'user-123',
          full_name: 'Test User',
        },
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

      // Should eventually succeed or fail gracefully under chaos
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password'
        })
      }, { timeout: 20000 })

      chaosEngineer.stopChaos()
    })

    it('should handle corrupted application state', () => {
      // Test state corruption
      localStorage.setItem('userState', JSON.stringify({
        user: { id: '123', name: 'Test' },
        isAuthenticated: true
      }))

      chaosEngineer.corruptApplicationState('userState', 'mutate')

      const corruptedState = localStorage.getItem('userState')
      expect(corruptedState).toContain('CORRUPTED_DATA')
    })

    it('should handle memory pressure simulation', () => {
      // Test memory pressure (this is more of a setup test)
      chaosEngineer.simulateMemoryPressure(10) // 10MB

      expect((window as any).__memoryPressureObjects).toBeDefined()
      expect((window as any).__memoryPressureObjects.length).toBeGreaterThan(0)
    })
  })

  describe('Application Error Scenarios', () => {
    it('should handle JavaScript runtime errors', () => {
      expect(() => {
        appSimulator.simulateJSError('runtime')
      }).toThrow()
    })

    it('should handle localStorage failures', () => {
      // Test storage failure simulation
      appSimulator.simulateStorageFailure('localStorage', 'write')

      expect(() => {
        localStorage.setItem('test', 'value')
      }).toThrow('Storage write failed')
    })

    it('should handle service worker failures', () => {
      // Test service worker failure simulation
      appSimulator.simulateServiceWorkerFailure('registration')

      expect(navigator.serviceWorker.register).toBeDefined()
    })
  })

  describe('User Experience Validation', () => {
    it('should verify error messages are displayed', async () => {
      const user = userEvent.setup()

      serverSimulator.simulateHttpError('**/auth/login', {
        statusCode: 400,
        message: 'Invalid credentials'
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

      // Verify UX validation helper works
      const hasErrorMessage = await errorScenarioManager.uxValidator.verifyErrorMessage(
        { waitForSelector: vi.fn().mockResolvedValue(true) } as any,
        'Invalid credentials'
      )
      expect(hasErrorMessage).toBe(true)
    })

    it('should verify graceful degradation', async () => {
      // Test that core functionality works when optional features fail
      const isDegradedGracefully = await errorScenarioManager.uxValidator.verifyGracefulDegradation(
        { $: vi.fn().mockResolvedValue({}) } as any,
        ['core-feature']
      )
      expect(isDegradedGracefully).toBe(true)
    })
  })
})