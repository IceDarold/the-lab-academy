import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  it('should render children correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    render(
      <Card>
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'dark:border',
      'dark:border-gray-700'
    )
  })

  it('should apply custom className', () => {
    render(
      <Card className="custom-class another-class">
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('custom-class', 'another-class')
  })

  it('should combine default and custom classes', () => {
    render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'dark:border',
      'dark:border-gray-700',
      'custom-class'
    )
  })

  it('should render complex children', () => {
    render(
      <Card>
        <div>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </div>
      </Card>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <Card>
        <h1>Header</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </Card>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    render(
      <Card>
        {null}
      </Card>
    )

    // Should render the card wrapper without errors
    const card = document.querySelector('.bg-white')
    expect(card).toBeInTheDocument()
  })

  it('should handle React.Fragment children', () => {
    render(
      <Card>
        <>
          <span>First</span>
          <span>Second</span>
        </>
      </Card>
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('should handle string children', () => {
    render(
      <Card>
        Simple text content
      </Card>
    )

    expect(screen.getByText('Simple text content')).toBeInTheDocument()
  })

  it('should handle number children', () => {
    render(
      <Card>
        {42}
      </Card>
    )

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should handle empty string className', () => {
    render(
      <Card className="">
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'dark:border',
      'dark:border-gray-700'
    )
  })

  it('should handle undefined className', () => {
    render(
      <Card className={undefined}>
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'dark:border',
      'dark:border-gray-700'
    )
  })

  it('should have correct semantic structure', () => {
    render(
      <Card>
        <p>Content</p>
      </Card>
    )

    const card = screen.getByText('Content').parentElement
    expect(card?.tagName).toBe('DIV')
  })

  it('should render with accessibility-friendly structure', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    )

    expect(screen.getByRole('heading', { name: /card title/i })).toBeInTheDocument()
  })
})