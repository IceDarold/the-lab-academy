import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should render with primary variant by default', () => {
    render(<Button>Primary Button</Button>)

    const button = screen.getByRole('button', { name: /primary button/i })
    expect(button).toHaveClass('bg-indigo-600', 'hover:bg-indigo-700', 'text-white')
  })

  it('should render with secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>)

    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toHaveClass('bg-white', 'hover:bg-gray-50', 'text-gray-900')
    expect(button).toHaveClass('dark:bg-gray-800', 'dark:text-gray-100', 'dark:hover:bg-gray-700')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)

    const button = screen.getByRole('button', { name: /custom button/i })
    expect(button).toHaveClass('custom-class')
  })

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Clickable Button</Button>)

    const button = screen.getByRole('button', { name: /clickable button/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: /disabled button/i })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should be disabled when loading prop is true', () => {
    render(<Button loading>Loading Button</Button>)

    const button = screen.getByRole('button', { name: /loading button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should show loading spinner when loading is true', () => {
    render(<Button loading>Loading Button</Button>)

    // Check for spinner SVG
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should hide text content when loading is true', () => {
    render(<Button loading>Loading Button</Button>)

    const button = screen.getByRole('button', { name: /loading button/i })
    const textSpan = button.querySelector('span.opacity-0')

    expect(textSpan).toBeInTheDocument()
    expect(textSpan).toHaveTextContent('Loading Button')
  })

  it('should show text content when not loading', () => {
    render(<Button>Normal Button</Button>)

    const button = screen.getByRole('button', { name: /normal button/i })
    const textSpan = button.querySelector('span.opacity-100')

    expect(textSpan).toBeInTheDocument()
    expect(textSpan).toHaveTextContent('Normal Button')
  })

  it('should apply correct spinner color for primary variant', () => {
    render(<Button variant="primary" loading>Primary Loading</Button>)

    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toHaveClass('text-white')
  })

  it('should apply correct spinner color for secondary variant', () => {
    render(<Button variant="secondary" loading>Secondary Loading</Button>)

    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toHaveClass('text-indigo-500')
  })

  it('should pass through other button props', () => {
    render(<Button type="submit" id="submit-btn">Submit Button</Button>)

    const button = screen.getByRole('button', { name: /submit button/i })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('id', 'submit-btn')
  })

  it('should have correct base classes', () => {
    render(<Button>Base Classes Button</Button>)

    const button = screen.getByRole('button', { name: /base classes button/i })
    expect(button).toHaveClass(
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'px-4',
      'py-2',
      'border',
      'text-sm',
      'font-semibold',
      'rounded-md',
      'shadow-sm',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'dark:focus:ring-offset-gray-800',
      'transition-colors',
      'duration-200'
    )
  })

  it('should have correct focus ring color for primary variant', () => {
    render(<Button variant="primary">Primary Focus</Button>)

    const button = screen.getByRole('button', { name: /primary focus/i })
    expect(button).toHaveClass('focus:ring-indigo-500')
  })

  it('should have correct focus ring color for secondary variant', () => {
    render(<Button variant="secondary">Secondary Focus</Button>)

    const button = screen.getByRole('button', { name: /secondary focus/i })
    expect(button).toHaveClass('focus:ring-indigo-500')
  })

  it('should handle keyboard activation', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Keyboard Button</Button>)

    const button = screen.getByRole('button', { name: /keyboard button/i })

    // Focus and press Enter
    button.focus()
    await user.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalledTimes(1)

    // Focus and press Space
    await user.keyboard('{ }')

    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('should be accessible with proper role', () => {
    render(<Button>Accessible Button</Button>)

    const button = screen.getByRole('button', { name: /accessible button/i })
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })
})