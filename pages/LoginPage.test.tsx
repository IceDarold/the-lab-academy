import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock components
vi.mock('../components/Button', () => ({
  default: ({ children, onClick, loading, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={loading || disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('../components/Input', () => ({
  default: ({ label, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}))

vi.mock('../components/Card', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('../components/SocialLoginButton', () => ({
  default: ({ children, provider }: any) => (
    <button data-provider={provider}>{children}</button>
  ),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('LoginPage', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      logout: vi.fn(),
      register: vi.fn(),
      checkEmail: vi.fn(),
    })

    // Mock window.location.hash
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    })
  })

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
  }

  it('should render login form with all required fields', () => {
    renderLoginPage()

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Show password')).toBeInTheDocument()
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('should render social login buttons', () => {
    renderLoginPage()

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
  })

  it('should show link to registration page', () => {
    renderLoginPage()

    const registerLink = screen.getByText('create an account')
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '#/register')
  })

  it('should show forgot password link', () => {
    renderLoginPage()

    const forgotLink = screen.getByText('Forgot your password?')
    expect(forgotLink).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    renderLoginPage()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    expect(submitButton).toBeDisabled()
  })

  it('should handle login errors and display them', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValueOnce(new Error(errorMessage))

    renderLoginPage()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword')
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderLoginPage()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Sign in')

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const passwordInput = screen.getByLabelText('Password')
    const showPasswordCheckbox = screen.getByLabelText('Show password')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Check the checkbox
    await user.click(showPasswordCheckbox)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Uncheck the checkbox
    await user.click(showPasswordCheckbox)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should handle forgot password link click', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const forgotLink = screen.getByText('Forgot your password?')
    await user.click(forgotLink)

    expect(window.location.hash).toBe('#/forgot-password')
  })

  it('should handle register link click', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const registerLink = screen.getByText('create an account')
    await user.click(registerLink)

    expect(window.location.hash).toBe('#/register')
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderLoginPage()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    const showPasswordCheckbox = screen.getByLabelText('Show password')
    const rememberMeCheckbox = screen.getByLabelText('Remember me')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(showPasswordCheckbox).toBeDisabled()
    expect(rememberMeCheckbox).toBeDisabled()
  })

  it('should clear previous errors on new submission', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockLogin.mockRejectedValueOnce(new Error('First error'))
    renderLoginPage()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockLogin.mockResolvedValueOnce(undefined)
    await user.clear(emailInput)
    await user.type(emailInput, 'test2@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('should handle form validation errors', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    // Submit empty form
    await user.click(submitButton)

    // Should show validation errors (handled by react-hook-form)
    // The actual validation is tested in the validators tests
    expect(mockLogin).not.toHaveBeenCalled()
  })
})