import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseCardSkeleton from './CourseCardSkeleton'

describe('CourseCardSkeleton', () => {
  it('should render skeleton with animate-pulse', () => {
    render(<CourseCardSkeleton />)

    const skeletonContainer = document.querySelector('.animate-pulse')
    expect(skeletonContainer).toBeInTheDocument()
  })

  it('should render image placeholder with correct aspect ratio', () => {
    render(<CourseCardSkeleton />)

    const imagePlaceholder = document.querySelector('.aspect-w-16.aspect-h-9')
    expect(imagePlaceholder).toHaveClass('bg-gray-200', 'dark:bg-gray-700')
  })

  it('should render tag placeholders', () => {
    render(<CourseCardSkeleton />)

    const tagPlaceholders = document.querySelectorAll('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(tagPlaceholders).toHaveLength(2)
  })

  it('should render title placeholder', () => {
    render(<CourseCardSkeleton />)

    const titlePlaceholder = document.querySelector('.h-6.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(titlePlaceholder).toHaveClass('w-3/4')
  })

  it('should render progress bar placeholder', () => {
    render(<CourseCardSkeleton />)

    const progressContainer = document.querySelector('.space-y-2')
    expect(progressContainer).toBeInTheDocument()

    const progressLabels = progressContainer?.querySelectorAll('.h-3.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(progressLabels).toHaveLength(2)

    const progressBar = progressContainer?.querySelector('.h-2\\.5.bg-gray-200.dark\\:bg-gray-700.rounded-full')
    expect(progressBar).toHaveClass('w-full')
  })

  it('should render button placeholder', () => {
    render(<CourseCardSkeleton />)

    const buttonPlaceholder = document.querySelector('.h-10.bg-gray-200.dark\\:bg-gray-700.rounded-md')
    expect(buttonPlaceholder).toHaveClass('w-full')
  })

  it('should have correct card structure', () => {
    render(<CourseCardSkeleton />)

    const card = document.querySelector('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md.p-0.overflow-hidden.flex.flex-col.h-full')
    expect(card).toBeInTheDocument()
  })

  it('should have correct padding classes', () => {
    render(<CourseCardSkeleton />)

    const contentArea = document.querySelector('.p-6.flex-grow.flex.flex-col')
    expect(contentArea).toBeInTheDocument()
  })

  it('should have correct flex layout', () => {
    render(<CourseCardSkeleton />)

    const mainContainer = document.querySelector('.flex.flex-col.h-full')
    expect(mainContainer).toBeInTheDocument()
  })

  it('should have correct spacing in content area', () => {
    render(<CourseCardSkeleton />)

    const contentArea = document.querySelector('.flex-grow.mt-4.space-y-4')
    expect(contentArea).toBeInTheDocument()
  })

  it('should have correct tag container classes', () => {
    render(<CourseCardSkeleton />)

    const tagContainer = document.querySelector('.flex.flex-wrap.gap-2.mb-3')
    expect(tagContainer).toBeInTheDocument()
  })

  it('should have correct button container classes', () => {
    render(<CourseCardSkeleton />)

    const buttonContainer = document.querySelector('.mt-6')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('should render all skeleton elements', () => {
    render(<CourseCardSkeleton />)

    // Count all skeleton divs
    const skeletonElements = document.querySelectorAll('.bg-gray-200.dark\\:bg-gray-700')
    expect(skeletonElements.length).toBeGreaterThan(5) // At least image, tags, title, progress elements, button
  })

  it('should have consistent dark mode classes', () => {
    render(<CourseCardSkeleton />)

    const darkElements = document.querySelectorAll('.dark\\:bg-gray-700')
    expect(darkElements.length).toBeGreaterThan(0)
  })

  it('should have proper responsive classes', () => {
    render(<CourseCardSkeleton />)

    // Check for aspect ratio classes which are responsive
    const aspectElement = document.querySelector('.aspect-w-16')
    expect(aspectElement).toBeInTheDocument()
  })
})