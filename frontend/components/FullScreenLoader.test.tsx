import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FullScreenLoader from './FullScreenLoader'

describe('FullScreenLoader', () => {
  it('should render loader with correct aria-label', () => {
    render(<FullScreenLoader />)

    expect(screen.getByLabelText('Loading application')).toBeInTheDocument()
  })

  it('should render spinner SVG', () => {
    render(<FullScreenLoader />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('role', 'status')
  })

  it('should have correct overlay classes', () => {
    render(<FullScreenLoader />)

    const overlay = document.querySelector('.fixed.inset-0.bg-gray-900.bg-opacity-75.flex.items-center.justify-center.z-50')
    expect(overlay).toBeInTheDocument()
  })

  it('should have correct spinner classes', () => {
    render(<FullScreenLoader />)

    const spinner = document.querySelector('svg.animate-spin.h-10.w-10.text-white')
    expect(spinner).toBeInTheDocument()
  })

  it('should render spinner circles', () => {
    render(<FullScreenLoader />)

    const circles = document.querySelectorAll('circle')
    expect(circles).toHaveLength(2) // Background circle and foreground circle
  })

  it('should have correct circle attributes', () => {
    render(<FullScreenLoader />)

    const backgroundCircle = document.querySelector('circle.opacity-25')
    expect(backgroundCircle).toHaveAttribute('cx', '12')
    expect(backgroundCircle).toHaveAttribute('cy', '12')
    expect(backgroundCircle).toHaveAttribute('r', '10')
    expect(backgroundCircle).toHaveAttribute('stroke', 'currentColor')
  })

  it('should have correct foreground circle attributes', () => {
    render(<FullScreenLoader />)

    const foregroundCircle = document.querySelector('circle.opacity-75')
    expect(foregroundCircle).toHaveAttribute('cx', '12')
    expect(foregroundCircle).toHaveAttribute('cy', '12')
    expect(foregroundCircle).toHaveAttribute('r', '10')
    expect(foregroundCircle).toHaveAttribute('stroke', 'currentColor')
    expect(foregroundCircle).toHaveAttribute('stroke-width', '4')
  })

  it('should have correct SVG attributes', () => {
    render(<FullScreenLoader />)

    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('class', 'animate-spin h-10 w-10 text-white')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('role', 'status')
  })

  it('should be positioned fixed and cover entire viewport', () => {
    render(<FullScreenLoader />)

    const overlay = document.querySelector('.fixed.inset-0')
    expect(overlay).toBeInTheDocument()
  })

  it('should have dark background with opacity', () => {
    render(<FullScreenLoader />)

    const overlay = document.querySelector('.bg-gray-900.bg-opacity-75')
    expect(overlay).toBeInTheDocument()
  })

  it('should center the spinner', () => {
    render(<FullScreenLoader />)

    const container = document.querySelector('.flex.items-center.justify-center')
    expect(container).toBeInTheDocument()
  })

  it('should have high z-index', () => {
    render(<FullScreenLoader />)

    const overlay = document.querySelector('.z-50')
    expect(overlay).toBeInTheDocument()
  })

  it('should be accessible with proper ARIA attributes', () => {
    render(<FullScreenLoader />)

    const loader = screen.getByLabelText('Loading application')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveAttribute('aria-label', 'Loading application')
  })

  it('should have proper semantic structure', () => {
    render(<FullScreenLoader />)

    const div = document.querySelector('div[aria-label="Loading application"]')
    expect(div).toBeInTheDocument()
  })

  it('should render only one root element', () => {
    const { container } = render(<FullScreenLoader />)

    expect(container.firstChild).toBeInTheDocument()
    expect(container.children).toHaveLength(1)
  })
})