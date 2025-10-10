import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LessonPageSkeleton from './LessonPageSkeleton'

describe('LessonPageSkeleton', () => {
  it('should render with animate-pulse', () => {
    render(<LessonPageSkeleton />)

    const skeletonContainer = document.querySelector('.animate-pulse')
    expect(skeletonContainer).toBeInTheDocument()
  })

  it('should render table of contents skeleton', () => {
    render(<LessonPageSkeleton />)

    const toc = document.querySelector('.hidden.lg\\:block.lg\\:col-span-3')
    expect(toc).toBeInTheDocument()

    const tocTitle = toc?.querySelector('.h-6.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(tocTitle).toHaveClass('w-2/3')

    const tocItems = toc?.querySelectorAll('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(tocItems).toHaveLength(4)
  })

  it('should render main content skeleton', () => {
    render(<LessonPageSkeleton />)

    const main = document.querySelector('.lg\\:col-span-9')
    expect(main).toBeInTheDocument()
  })

  it('should render breadcrumbs and title skeleton', () => {
    render(<LessonPageSkeleton />)

    const breadcrumbs = document.querySelector('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(breadcrumbs).toHaveClass('w-1/3')

    const title = document.querySelector('.h-12.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(title).toHaveClass('w-5/6')
  })

  it('should render article content with multiple sections', () => {
    render(<LessonPageSkeleton />)

    const article = document.querySelector('article.mt-8.space-y-10')
    expect(article).toBeInTheDocument()

    const sections = article?.querySelectorAll('div')
    expect(sections?.length).toBeGreaterThan(2)
  })

  it('should render first content section', () => {
    render(<LessonPageSkeleton />)

    const firstSection = document.querySelector('article > div:first-child')

    const sectionTitle = firstSection?.querySelector('.h-8.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(sectionTitle).toHaveClass('w-1/2')

    const sectionParagraphs = firstSection?.querySelectorAll('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(sectionParagraphs).toHaveLength(3)
  })

  it('should render second content section with code block', () => {
    render(<LessonPageSkeleton />)

    const sections = document.querySelectorAll('article > div')
    const secondSection = sections[1]

    const sectionTitle = secondSection?.querySelector('.h-8.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(sectionTitle).toHaveClass('w-1/2')

    const codeBlock = secondSection?.querySelector('.h-40.bg-gray-200.dark\\:bg-gray-700.rounded-lg')
    expect(codeBlock).toHaveClass('w-full')
  })

  it('should render third content section', () => {
    render(<LessonPageSkeleton />)

    const sections = document.querySelectorAll('article > div')
    const thirdSection = sections[2]

    const sectionTitle = thirdSection?.querySelector('.h-8.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(sectionTitle).toHaveClass('w-1/2')

    const sectionParagraphs = thirdSection?.querySelectorAll('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(sectionParagraphs).toHaveLength(2)
  })

  it('should have correct grid layout', () => {
    render(<LessonPageSkeleton />)

    const grid = document.querySelector('.lg\\:grid.lg\\:grid-cols-12.lg\\:gap-12')
    expect(grid).toBeInTheDocument()
  })

  it('should have correct container classes', () => {
    render(<LessonPageSkeleton />)

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-12')
    expect(container).toBeInTheDocument()
  })

  it('should have sticky table of contents', () => {
    render(<LessonPageSkeleton />)

    const stickyToc = document.querySelector('.lg\\:sticky.lg\\:top-24')
    expect(stickyToc).toBeInTheDocument()
  })

  it('should have correct spacing classes', () => {
    render(<LessonPageSkeleton />)

    const mainSpacing = document.querySelector('.space-y-10')
    expect(mainSpacing).toBeInTheDocument()

    const tocSpacing = document.querySelector('.space-y-4')
    expect(tocSpacing).toBeInTheDocument()
  })

  it('should have consistent skeleton styling', () => {
    render(<LessonPageSkeleton />)

    const skeletonElements = document.querySelectorAll('.bg-gray-200.dark\\:bg-gray-700')
    expect(skeletonElements.length).toBeGreaterThan(10)
  })

  it('should have proper responsive classes', () => {
    render(<LessonPageSkeleton />)

    const responsiveGrid = document.querySelector('.lg\\:grid-cols-12')
    expect(responsiveGrid).toBeInTheDocument()

    const responsiveToc = document.querySelector('.hidden.lg\\:block')
    expect(responsiveToc).toBeInTheDocument()
  })

  it('should have correct width variations', () => {
    render(<LessonPageSkeleton />)

    const fullWidth = document.querySelector('[class*="w-full"]')
    expect(fullWidth).toBeInTheDocument()

    const fiveSixths = document.querySelector('[class*="w-5/6"]')
    expect(fiveSixths).toBeInTheDocument()

    const twoThirds = document.querySelector('[class*="w-2/3"]')
    expect(twoThirds).toBeInTheDocument()

    const oneThird = document.querySelector('[class*="w-1/3"]')
    expect(oneThird).toBeInTheDocument()

    const oneHalf = document.querySelector('[class*="w-1/2"]')
    expect(oneHalf).toBeInTheDocument()
  })

  it('should have correct height variations', () => {
    render(<LessonPageSkeleton />)

    const h4 = document.querySelector('.h-4')
    expect(h4).toBeInTheDocument()

    const h6 = document.querySelector('.h-6')
    expect(h6).toBeInTheDocument()

    const h8 = document.querySelector('.h-8')
    expect(h8).toBeInTheDocument()

    const h12 = document.querySelector('.h-12')
    expect(h12).toBeInTheDocument()

    const h40 = document.querySelector('.h-40')
    expect(h40).toBeInTheDocument()
  })

  it('should have proper dark mode support', () => {
    render(<LessonPageSkeleton />)

    const darkElements = document.querySelectorAll('.dark\\:bg-gray-700')
    expect(darkElements.length).toBeGreaterThan(0)
  })

  it('should render all skeleton elements in correct hierarchy', () => {
    render(<LessonPageSkeleton />)

    // Check that we have the expected structure
    const container = document.querySelector('.max-w-7xl')
    const grid = container?.querySelector('.lg\\:grid')
    const toc = grid?.querySelector('.lg\\:col-span-3')
    const main = grid?.querySelector('.lg\\:col-span-9')

    expect(container).toBeInTheDocument()
    expect(grid).toBeInTheDocument()
    expect(toc).toBeInTheDocument()
    expect(main).toBeInTheDocument()
  })
})