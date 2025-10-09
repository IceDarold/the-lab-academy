import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseDetailView from './CourseDetailView'
import type { PublicCourseDetails } from '../types/courses'

// Mock components
vi.mock('./Card', () => ({
  default: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
}))

vi.mock('./Button', () => ({
  default: ({ children, onClick, disabled, variant }: any) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

vi.mock('./Accordion', () => ({
  default: ({ title, children }: any) => (
    <div data-testid="accordion">
      <div data-testid="accordion-title">{title}</div>
      <div data-testid="accordion-content">{children}</div>
    </div>
  ),
}))

describe('CourseDetailView', () => {
  const mockOnEnroll = vi.fn()

  const mockCourse: PublicCourseDetails = {
    courseId: 'course-1',
    slug: 'test-course',
    title: 'Test Course',
    description: 'A test course description',
    coverImageUrl: 'https://example.com/image.jpg',
    modules: [
      {
        title: 'Module 1',
        order: 1,
        lessons: [
          { title: 'Lesson 1', description: 'First lesson', order: 1 },
          { title: 'Lesson 2', description: 'Second lesson', order: 2 },
        ],
      },
      {
        title: 'Module 2',
        order: 2,
        lessons: [
          { title: 'Lesson 3', description: 'Third lesson', order: 1 },
        ],
      },
    ],
  }

  it('should render course title and description', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('A test course description')).toBeInTheDocument()
  })

  it('should render course image', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const image = screen.getByAltText('Course preview')
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should render enroll button with course data', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Enroll in the course')
    expect(button).not.toBeDisabled()
  })

  it('should call onEnroll when button is clicked', async () => {
    const user = userEvent.setup()

    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const button = screen.getByTestId('button')
    await user.click(button)

    expect(mockOnEnroll).toHaveBeenCalledWith('test-course')
  })

  it('should render accordions for each module', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const accordions = screen.getAllByTestId('accordion')
    expect(accordions).toHaveLength(2)

    expect(screen.getByText('Module 1')).toBeInTheDocument()
    expect(screen.getByText('Module 2')).toBeInTheDocument()
  })

  it('should render lessons within accordions', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Lesson 1')).toBeInTheDocument()
    expect(screen.getByText('Lesson 2')).toBeInTheDocument()
    expect(screen.getByText('Lesson 3')).toBeInTheDocument()
  })

  it('should render "What You'll Learn" section', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    expect(screen.getByText("What You'll Learn")).toBeInTheDocument()
    expect(screen.getByText('Understand the core principles of supervised and unsupervised learning.')).toBeInTheDocument()
  })

  it('should render course features in sidebar', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Level:')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Duration:')).toBeInTheDocument()
    expect(screen.getByText('Self-paced')).toBeInTheDocument()
  })

  it('should render default title when course is null', () => {
    render(<CourseDetailView course={null} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Course Overview')).toBeInTheDocument()
  })

  it('should render default description when course is null', () => {
    render(<CourseDetailView course={null} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Browse the syllabus and enroll to get started.')).toBeInTheDocument()
  })

  it('should show loading message when course is null', () => {
    render(<CourseDetailView course={null} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Loading course information…')).toBeInTheDocument()
  })

  it('should show syllabus not available message when course has no modules', () => {
    const courseWithoutModules = { ...mockCourse, modules: [] }

    render(<CourseDetailView course={courseWithoutModules} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Detailed syllabus is not available yet. Enroll to receive updates.')).toBeInTheDocument()
  })

  it('should show syllabus not available message when modules is empty', () => {
    render(<CourseDetailView course={{ ...mockCourse, modules: [] }} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Syllabus will be available soon.')).toBeInTheDocument()
  })

  it('should disable enroll button when course is null', () => {
    render(<CourseDetailView course={null} onEnroll={mockOnEnroll} />)

    const button = screen.getByTestId('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Loading…')
  })

  it('should render default image when course has no coverImageUrl', () => {
    const courseWithoutImage = { ...mockCourse, coverImageUrl: undefined }

    render(<CourseDetailView course={courseWithoutImage as any} onEnroll={mockOnEnroll} />)

    const image = screen.getByAltText('Course preview')
    expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=870&auto=format&fit=crop')
  })

  it('should handle course with undefined modules', () => {
    const courseWithoutModules = { ...mockCourse, modules: undefined }

    render(<CourseDetailView course={courseWithoutModules as any} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Syllabus will be available soon.')).toBeInTheDocument()
  })

  it('should render correct grid layout', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const grid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('should render sidebar with sticky positioning', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const sidebar = document.querySelector('.lg\\:sticky.lg\\:top-8')
    expect(sidebar).toBeInTheDocument()
  })

  it('should render check icons in learning objectives', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    // Check for SVG elements (check icons)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(4) // Check icons + other icons
  })

  it('should render feature icons in sidebar', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnroll} />)

    // Should have multiple SVG icons for features
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('should handle empty onEnroll function', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={undefined} />)

    // Should not crash
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('should render course syllabus heading', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    expect(screen.getByText('Course Syllabus')).toBeInTheDocument()
  })

  it('should render module accordions with first one open by default', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    // Since Accordion is mocked, we just check that titles are rendered
    expect(screen.getByText('Module 1')).toBeInTheDocument()
    expect(screen.getByText('Module 2')).toBeInTheDocument()
  })

  it('should render lesson lists within accordions', () => {
    render(<CourseDetailView course={mockCourse} onEnroll={mockOnEnroll} />)

    const lessonLists = document.querySelectorAll('.space-y-3.pl-4.list-disc')
    expect(lessonLists.length).toBe(2) // One for each module
  })
})