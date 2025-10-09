import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('should render label and input with correct attributes', () => {
    render(<Input label="Test Label" id="test-input" />)

    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'test-input')

    const input = screen.getByLabelText('Test Label')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('should apply default classes when no error', () => {
    render(<Input label="Test Label" id="test-input" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass(
      'block',
      'w-full',
      'rounded-md',
      'shadow-sm',
      'sm:text-sm',
      'px-3',
      'py-2',
      'border-gray-300',
      'focus:border-indigo-500',
      'focus:ring-indigo-500',
      'dark:bg-gray-700',
      'dark:border-gray-600',
      'dark:text-gray-100',
      'dark:placeholder-gray-400',
      'dark:focus:border-indigo-500',
      'dark:focus:ring-indigo-500'
    )
  })

  it('should apply error classes when error is provided', () => {
    render(<Input label="Test Label" id="test-input" error="This is an error" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass(
      'border-red-500',
      'focus:border-red-500',
      'focus:ring-red-500'
    )
  })

  it('should render error message when error is provided', () => {
    render(<Input label="Test Label" id="test-input" error="This is an error" />)

    const errorMessage = screen.getByText('This is an error')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveAttribute('id', 'test-input-error')
  })

  it('should not render error message when no error', () => {
    render(<Input label="Test Label" id="test-input" />)

    expect(screen.queryByText('This is an error')).not.toBeInTheDocument()
  })

  it('should set aria-invalid when error is provided', () => {
    render(<Input label="Test Label" id="test-input" error="Error" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should set aria-describedby when error is provided', () => {
    render(<Input label="Test Label" id="test-input" error="Error" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('should not set aria-invalid when no error', () => {
    render(<Input label="Test Label" id="test-input" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('should pass through other input props', () => {
    render(
      <Input
        label="Test Label"
        id="test-input"
        type="email"
        placeholder="Enter email"
        required
        disabled
      />
    )

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toBeRequired()
    expect(input).toBeDisabled()
  })

  it('should apply custom className to wrapper', () => {
    render(<Input label="Test Label" id="test-input" className="custom-class" />)

    const wrapper = document.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('should have correct label classes', () => {
    render(<Input label="Test Label" id="test-input" />)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700',
      'dark:text-gray-300'
    )
  })

  it('should have correct error message classes', () => {
    render(<Input label="Test Label" id="test-input" error="Error" />)

    const error = screen.getByText('Error')
    expect(error).toHaveClass(
      'mt-2',
      'text-sm',
      'text-red-600',
      'dark:text-red-400'
    )
  })

  it('should handle forwardRef correctly', () => {
    const ref = { current: null }
    render(<Input label="Test Label" id="test-input" ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should have correct wrapper structure', () => {
    render(<Input label="Test Label" id="test-input" />)

    const wrapper = document.querySelector('div')
    expect(wrapper).toBeInTheDocument()

    const label = wrapper?.querySelector('label')
    const inputWrapper = wrapper?.querySelector('.mt-1')

    expect(label).toBeInTheDocument()
    expect(inputWrapper).toBeInTheDocument()
  })

  it('should handle empty label', () => {
    render(<Input label="" id="test-input" />)

    const label = document.querySelector('label')
    expect(label).not.toBeInTheDocument()
  })

  it('should handle empty error', () => {
    render(<Input label="Test Label" id="test-input" error="" />)

    const error = document.querySelector('[id="test-input-error"]')
    expect(error).toBeInTheDocument()
    expect(error).toHaveTextContent('')
  })

  it('should be accessible with proper form structure', () => {
    render(<Input label="Email" id="email" type="email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Test Label" id="test-input" />)

    const input = screen.getByLabelText('Test Label')
    await user.type(input, 'test value')

    expect(input).toHaveValue('test value')
  })

  it('should maintain focus styles', () => {
    render(<Input label="Test Label" id="test-input" />)

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass('focus:border-indigo-500', 'focus:ring-indigo-500')
  })
})