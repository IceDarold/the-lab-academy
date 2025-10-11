import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock FullScreenLoader
vi.mock('../FullScreenLoader', () => ({
  default: () => <div data-testid="fullscreen-loader">Loading...</div>,
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location.hash
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    })
  })

  it('should show loader when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('fullscreen-loader')).not.toBeInTheDocument()
  })

  it('should redirect to login when not authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(window.location.hash).toBe('#/login')
    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should handle authentication state change from loading to authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()

    // Change to authenticated
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('fullscreen-loader')).not.toBeInTheDocument()
  })

  it('should handle authentication state change from loading to unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()

    // Change to unauthenticated
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(window.location.hash).toBe('#/login')
    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
  })

  it('should handle authentication state change from authenticated to unauthenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    // Change to unauthenticated
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(window.location.hash).toBe('#/login')
    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
  })

  it('should render complex children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>
          <h1>Title</h1>
          <p>Content</p>
          <button>Action</button>
        </div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        {null}
      </ProtectedRoute>
    )

    // Should render without errors
    expect(screen.queryByTestId('fullscreen-loader')).not.toBeInTheDocument()
  })

  it('should handle React.Fragment children', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <>
          <div>First</div>
          <div>Second</div>
        </>
      </ProtectedRoute>
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('should not redirect when authentication status changes during loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Change authentication while still loading
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should still show loader, no redirect
    expect(window.location.hash).toBe('')
    expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument()
  })

  it('should handle multiple re-renders correctly', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // First change
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    // Second change
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(window.location.hash).toBe('#/login')
  })
})
