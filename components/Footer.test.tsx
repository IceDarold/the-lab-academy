import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('should render footer with correct structure', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render copyright text', () => {
    render(<Footer />)

    expect(screen.getByText('© 2024 ML-Practical. All rights reserved.')).toBeInTheDocument()
  })

  it('should render Twitter link with correct attributes', () => {
    render(<Footer />)

    const twitterLink = screen.getByLabelText('Twitter')
    expect(twitterLink).toHaveAttribute('href', '#')
    expect(twitterLink).toHaveClass('text-gray-400', 'hover:text-gray-500', 'dark:hover:text-gray-300')
  })

  it('should render GitHub link with correct attributes', () => {
    render(<Footer />)

    const githubLink = screen.getByLabelText('GitHub')
    expect(githubLink).toHaveAttribute('href', '#')
    expect(githubLink).toHaveClass('text-gray-400', 'hover:text-gray-500', 'dark:hover:text-gray-300')
  })

  it('should render social media icons', () => {
    render(<Footer />)

    const svgs = document.querySelectorAll('svg')
    expect(svgs).toHaveLength(2) // Twitter and GitHub icons
  })

  it('should have correct footer classes', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'border-t',
      'border-gray-200',
      'dark:border-gray-700'
    )
  })

  it('should have correct container classes', () => {
    render(<Footer />)

    const container = document.querySelector('.max-w-7xl.mx-auto.py-8.px-4.sm\\:px-6.lg\\:px-8')
    expect(container).toBeInTheDocument()
  })

  it('should have correct social links container', () => {
    render(<Footer />)

    const socialContainer = document.querySelector('.flex.justify-center.space-x-6')
    expect(socialContainer).toBeInTheDocument()
  })

  it('should have correct copyright text classes', () => {
    render(<Footer />)

    const copyright = screen.getByText('© 2024 ML-Practical. All rights reserved.')
    expect(copyright).toHaveClass(
      'mt-8',
      'text-center',
      'text-base',
      'text-gray-400',
      'dark:text-gray-500'
    )
  })

  it('should have screen reader only text for icons', () => {
    render(<Footer />)

    expect(screen.getByText('Twitter')).toHaveClass('sr-only')
    expect(screen.getByText('GitHub')).toHaveClass('sr-only')
  })

  it('should have correct icon dimensions', () => {
    render(<Footer />)

    const icons = document.querySelectorAll('svg.h-6.w-6')
    expect(icons).toHaveLength(2)
  })

  it('should have proper semantic structure', () => {
    render(<Footer />)

    const footer = document.querySelector('footer')
    expect(footer?.tagName).toBe('FOOTER')
  })

  it('should render links as anchor elements', () => {
    render(<Footer />)

    const links = document.querySelectorAll('a')
    expect(links).toHaveLength(2)
    links.forEach(link => {
      expect(link.tagName).toBe('A')
    })
  })

  it('should have accessible social media links', () => {
    render(<Footer />)

    const twitterLink = screen.getByLabelText('Twitter')
    const githubLink = screen.getByLabelText('GitHub')

    expect(twitterLink).toBeInTheDocument()
    expect(githubLink).toBeInTheDocument()
  })
})