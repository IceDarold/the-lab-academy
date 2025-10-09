import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Accordion from './Accordion'

describe('Accordion', () => {
  it('should render with title and children', () => {
    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should be closed by default', () => {
    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Content should be visible since it's rendered but check if it's in the DOM
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should be open when defaultOpen is true', () => {
    render(
      <Accordion title="Test Title" defaultOpen={true}>
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should toggle open/close when clicked', async () => {
    const user = userEvent.setup()

    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })

    // Initially closed
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Click to open
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Click to close
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should rotate chevron icon when open', async () => {
    const user = userEvent.setup()

    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const chevron = document.querySelector('svg')

    // Initially not rotated
    expect(chevron).not.toHaveClass('rotate-180')

    // Click to open
    const button = screen.getByRole('button', { name: /test title/i })
    await user.click(button)

    // Should be rotated
    expect(chevron).toHaveClass('rotate-180')
  })

  it('should handle ReactNode title', () => {
    render(
      <Accordion title={<span>Custom Title</span>}>
        <p>Test content</p>
      </Accordion>
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should handle complex children', () => {
    render(
      <Accordion title="Test Title">
        <div>
          <h3>Header</h3>
          <p>Paragraph</p>
        </div>
      </Accordion>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
  })

  it('should have correct button classes', () => {
    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })
    expect(button).toHaveClass(
      'w-full',
      'flex',
      'justify-between',
      'items-center',
      'py-4',
      'text-left',
      'font-semibold',
      'text-gray-800',
      'dark:text-gray-200',
      'hover:bg-gray-50',
      'dark:hover:bg-gray-700/50',
      'px-2',
      'rounded-md',
      'transition-colors'
    )
  })

  it('should have correct content classes when open', () => {
    render(
      <Accordion title="Test Title" defaultOpen={true}>
        <p>Test content</p>
      </Accordion>
    )

    const content = screen.getByText('Test content').parentElement
    expect(content).toHaveClass('px-2', 'pb-4', 'text-gray-600', 'dark:text-gray-400')
  })

  it('should have correct chevron classes', () => {
    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const chevron = document.querySelector('svg')
    expect(chevron).toHaveClass('w-5', 'h-5', 'transition-transform', 'duration-300', 'flex-shrink-0', 'ml-4')
  })

  it('should handle empty title', () => {
    render(
      <Accordion title="">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    render(
      <Accordion title="Test Title">
        {null}
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })
    expect(button).toBeInTheDocument()
  })

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()

    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })

    // Focus and press Enter
    button.focus()
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Press Enter again to close
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should have proper ARIA attributes', () => {
    render(
      <Accordion title="Test Title">
        <p>Test content</p>
      </Accordion>
    )

    const button = screen.getByRole('button', { name: /test title/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render multiple accordions independently', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <Accordion title="First">
          <p>First content</p>
        </Accordion>
        <Accordion title="Second">
          <p>Second content</p>
        </Accordion>
      </div>
    )

    const firstButton = screen.getByRole('button', { name: /first/i })
    const secondButton = screen.getByRole('button', { name: /second/i })

    // Open first
    await user.click(firstButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    expect(secondButton).toHaveAttribute('aria-expanded', 'false')

    // Open second
    await user.click(secondButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    expect(secondButton).toHaveAttribute('aria-expanded', 'true')
  })
})