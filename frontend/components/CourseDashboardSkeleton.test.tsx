import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseDashboardSkeleton from './CourseDashboardSkeleton'

describe('CourseDashboardSkeleton', () => {
  it('should render with animate-pulse', () => {
    render(<CourseDashboardSkeleton />)

    const skeletonContainer = document.querySelector('.animate-pulse')
    expect(skeletonContainer).toBeInTheDocument()
  })

  it('should render header skeleton elements', () => {
    render(<CourseDashboardSkeleton />)

    // Header title
    const headerTitle = document.querySelector('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(headerTitle).toHaveClass('w-1/4')

    // Header subtitle
    const headerSubtitle = document.querySelector('.h-12.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(headerSubtitle).toHaveClass('w-3/4')

    // Header description
    const headerDesc = document.querySelector('.h-6.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(headerDesc).toHaveClass('w-full', 'max-w-2xl')
  })

  it('should render overall progress card', () => {
    render(<CourseDashboardSkeleton />)

    const card = document.querySelector('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md.p-6')
    expect(card).toBeInTheDocument()

    // Progress title
    const progressTitle = card?.querySelector('.h-6.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(progressTitle).toHaveClass('w-1/3')

    // Progress labels
    const progressLabels = card?.querySelectorAll('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(progressLabels).toHaveLength(2)

    // Progress bar
    const progressBar = card?.querySelector('.h-2\\.5.bg-gray-200.dark\\:bg-gray-700.rounded-full')
    expect(progressBar).toHaveClass('w-full')

    // Progress description
    const progressDesc = card?.querySelector('.h-4.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(progressDesc).toHaveClass('w-1/2')
  })

  it('should render syllabus section', () => {
    render(<CourseDashboardSkeleton />)

    // Syllabus title
    const syllabusTitle = document.querySelector('.h-8.bg-gray-200.dark\\:bg-gray-700.rounded')
    expect(syllabusTitle).toHaveClass('w-1/4')

    // Syllabus card
    const syllabusCard = document.querySelector('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md.p-0')
    expect(syllabusCard).toBeInTheDocument()
  })

  it('should render syllabus items', () => {
    render(<CourseDashboardSkeleton />)

    const syllabusItems = document.querySelectorAll('.divide-y.divide-gray-200.dark\\:divide-gray-700 .p-4.py-6')
    expect(syllabusItems).toHaveLength(3)

    syllabusItems.forEach(item => {
      const title = item.querySelector('.h-6.bg-gray-200.dark\\:bg-gray-700.rounded')
      expect(title).toHaveClass('w-1/2')

      const status = item.querySelector('.h-5.w-5.bg-gray-200.dark\\:bg-gray-700.rounded-full')
      expect(status).toBeInTheDocument()
    })
  })

  it('should have correct container classes', () => {
    render(<CourseDashboardSkeleton />)

    const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-12')
    expect(container).toBeInTheDocument()
  })

  it('should have correct spacing classes', () => {
    render(<CourseDashboardSkeleton />)

    const mainContainer = document.querySelector('.space-y-12')
    expect(mainContainer).toBeInTheDocument()
  })

  it('should have correct header spacing', () => {
    render(<CourseDashboardSkeleton />)

    const header = document.querySelector('.space-y-12 > div:first-child')
    const headerElements = header?.querySelectorAll('.mb-4')
    expect(headerElements?.length).toBeGreaterThan(0)
  })

  it('should have correct progress card spacing', () => {
    render(<CourseDashboardSkeleton />)

    const progressCard = document.querySelector('.space-y-3')
    expect(progressCard).toBeInTheDocument()

    const progressElements = progressCard?.querySelector('.flex.justify-between')
    expect(progressElements).toBeInTheDocument()
  })

  it('should have correct syllabus layout', () => {
    render(<CourseDashboardSkeleton />)

    const syllabusSection = document.querySelector('.space-y-12 > section')
    expect(syllabusSection).toBeInTheDocument()

    const syllabusCard = syllabusSection?.querySelector('.divide-y')
    expect(syllabusCard).toBeInTheDocument()
  })

  it('should render all skeleton elements with consistent styling', () => {
    render(<CourseDashboardSkeleton />)

    const skeletonElements = document.querySelectorAll('.bg-gray-200.dark\\:bg-gray-700')
    expect(skeletonElements.length).toBeGreaterThan(10)
  })

  it('should have proper responsive padding', () => {
    render(<CourseDashboardSkeleton />)

    const container = document.querySelector('.px-4.sm\\:px-6.lg\\:px-8')
    expect(container).toBeInTheDocument()
  })

  it('should have proper flex layout for syllabus items', () => {
    render(<CourseDashboardSkeleton />)

    const syllabusItems = document.querySelectorAll('.flex.justify-between.items-center')
    expect(syllabusItems.length).toBe(3)
  })

  it('should have correct dark mode support', () => {
    render(<CourseDashboardSkeleton />)

    const darkElements = document.querySelectorAll('.dark\\:bg-gray-700')
    expect(darkElements.length).toBeGreaterThan(0)

    const darkDivides = document.querySelectorAll('.dark\\:divide-gray-700')
    expect(darkDivides.length).toBeGreaterThan(0)
  })

  it('should have correct border styling for syllabus card', () => {
    render(<CourseDashboardSkeleton />)

    const syllabusCard = document.querySelector('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-md')
    expect(syllabusCard).toBeInTheDocument()
  })
})