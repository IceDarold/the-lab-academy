import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { forwardRef } from 'react'
import { BrowserRouter } from 'react-router-dom'
import RegistrationPage from './RegistrationPage'
import { useAuth } from '@/src/contexts/AuthContext'

// Mock the auth context
vi.mock('@/src/contexts/AuthContext', () => ({
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
  default: forwardRef<HTMLInputElement, any>(({ label, id, error, ...props }, ref) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={label ? "mt-1" : ""}>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>{error}</p>}
    </div>
  )),
}))

vi.mock('../components/Card', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('../components/Modal', () => ({
  default: ({ children, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="modal">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

vi.mock('../components/SocialLoginButton', () => ({
  default: ({ children, provider }: any) => (
    <button data-provider={provider}>{children}</button>
  ),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('RegistrationPage', () => {
  const mockRegister = vi.fn()
  const mockCheckEmail = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      checkEmail: mockCheckEmail,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    // Mock window.location.hash
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    })
  })

  const renderRegistrationPage = () => {
    return render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    )
  }

  it('should render registration form with all required fields', () => {
    renderRegistrationPage()

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Show password')).toBeInTheDocument()
    expect(screen.getByLabelText(/I agree to the/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('should render social registration buttons', () => {
    renderRegistrationPage()

    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByText('Sign up with GitHub')).toBeInTheDocument()
  })

  it('should show link to login page', () => {
    renderRegistrationPage()

    const loginLink = screen.getByText('sign in to your existing account')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '#/login')
  })

  it('should handle successful registration with authenticated response', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValueOnce({
      status: 'authenticated',
      tokens: { accessToken: 'token', tokenType: 'bearer' }
    })

    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.type(fullNameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(termsCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123')
    })
  })

  it('should handle pending confirmation registration', async () => {
    mockRegister.mockResolvedValueOnce({ status: 'pending_confirmation' })

    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(termsCheckbox)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('Email Confirmation')).toBeInTheDocument()
    })
  })

  it('should handle registration errors and display them', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email already exists'
    mockRegister.mockRejectedValueOnce(new Error(errorMessage))

    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.type(fullNameInput, 'John Doe')
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(termsCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should check email availability on blur', async () => {
    const user = userEvent.setup()
    mockCheckEmail.mockResolvedValueOnce(false) // Email available

    renderRegistrationPage()

    const emailInput = screen.getByLabelText('Email address')
    await user.type(emailInput, 'test@example.com')
    await user.tab() // Trigger blur

    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('should show error when email already exists', async () => {
    const user = userEvent.setup()
    mockCheckEmail.mockResolvedValueOnce(true) // Email exists

    renderRegistrationPage()

    const emailInput = screen.getByLabelText('Email address')
    await user.type(emailInput, 'existing@example.com')
    await user.tab() // Trigger blur

    await waitFor(() => {
      expect(screen.getByText('This email is already registered')).toBeInTheDocument()
    })
  })

  it('should prevent submission when email exists', async () => {
    const user = userEvent.setup()
    mockCheckEmail.mockResolvedValueOnce(true)

    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.type(fullNameInput, 'John Doe')
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(termsCheckbox)

    // Blur to trigger email check
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('This email is already registered')).toBeInTheDocument()
    })

    await user.click(submitButton)
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should clear email error when email changes', async () => {
    const user = userEvent.setup()
    mockCheckEmail.mockResolvedValueOnce(true)

    renderRegistrationPage()

    const emailInput = screen.getByLabelText('Email address')
    await user.type(emailInput, 'existing@example.com')
    await user.tab() // Trigger blur

    await waitFor(() => {
      expect(screen.getByText('This email is already registered')).toBeInTheDocument()
    })

    // Change email
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    expect(screen.queryByText('This email is already registered')).not.toBeInTheDocument()
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    renderRegistrationPage()

    const passwordInput = screen.getByLabelText('Password')
    const showPasswordCheckbox = screen.getByLabelText('Show password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(showPasswordCheckbox)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(showPasswordCheckbox)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should handle login link click', async () => {
    const user = userEvent.setup()
    renderRegistrationPage()

    const loginLink = screen.getByText('sign in to your existing account')
    await user.click(loginLink)

    expect(window.location.hash).toBe('#/login')
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.type(fullNameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(termsCheckbox)
    await user.click(submitButton)

    expect(fullNameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(termsCheckbox).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should clear previous errors on new submission', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockRegister.mockRejectedValueOnce(new Error('First error'))
    renderRegistrationPage()

    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    await user.type(fullNameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(termsCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockRegister.mockResolvedValueOnce({ status: 'authenticated', tokens: {} })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('should handle checkEmail errors gracefully', async () => {
    const user = userEvent.setup()
    mockCheckEmail.mockRejectedValueOnce(new Error('Network error'))

    renderRegistrationPage()

    const emailInput = screen.getByLabelText('Email address')
    await user.type(emailInput, 'test@example.com')
    await user.tab() // Trigger blur

    // Should not show error, allowing registration
    expect(screen.queryByText('This email is already registered')).not.toBeInTheDocument()
  })

  it('should close confirmation modal', async () => {
    mockRegister.mockResolvedValueOnce({ status: 'pending_confirmation' })

    renderRegistrationPage()

    // Fill and submit form
    const fullNameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const termsCheckbox = screen.getByLabelText(/I agree to the/)
    const submitButton = screen.getByRole('button', { name: 'Create account' })

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(termsCheckbox)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    const closeButton = screen.getByText('OK')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })
})
