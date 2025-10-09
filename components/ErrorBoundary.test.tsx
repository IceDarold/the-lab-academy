import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from './ErrorBoundary'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

// Component that throws an error
const ErrorComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that throws different types of errors
const DifferentErrorComponent = ({ errorType }: { errorType: 'string' | 'object' | 'null' }) => {
  if (errorType === 'string') {
    throw 'String error'
  }
  if (errorType === 'object') {
    throw { message: 'Object error' }
  }
  if (errorType === 'null') {
    throw null
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch and display error fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We apologize for the inconvenience/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
  })

  it('should use custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should retry and recover when Try Again is clicked', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /Retry loading the page/i })
    await user.click(retryButton)

    // Rerender with component that doesn't throw
    rerender(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should handle string errors', () => {
    render(
      <ErrorBoundary>
        <DifferentErrorComponent errorType="string" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should handle object errors', () => {
    render(
      <ErrorBoundary>
        <DifferentErrorComponent errorType="object" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should handle null errors', () => {
    render(
      <ErrorBoundary>
        <DifferentErrorComponent errorType="null" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeInTheDocument()
    expect(alertElement).toHaveAttribute('aria-live', 'assertive')
  })

  it('should call console.error with error details', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object) // errorInfo
    )

    consoleSpy.mockRestore()
  })

  it('should handle nested error boundaries', () => {
    render(
      <ErrorBoundary fallback={<div>Outer fallback</div>}>
        <div>
          <ErrorBoundary fallback={<div>Inner fallback</div>}>
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    )

    // Inner boundary should catch the error
    expect(screen.getByText('Inner fallback')).toBeInTheDocument()
    expect(screen.queryByText('Outer fallback')).not.toBeInTheDocument()
  })

  it('should handle errors in error boundary itself gracefully', () => {
    // Create a component that throws in the fallback render
    const BadFallback = () => {
      throw new Error('Fallback error')
    }

    render(
      <ErrorBoundary fallback={<BadFallback />}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    // Should still show the default fallback despite fallback throwing
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should reset error state on retry', async () => {
    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click retry
    await user.click(screen.getByRole('button', { name: /Retry loading the page/i }))

    // Should reset to no error state
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})