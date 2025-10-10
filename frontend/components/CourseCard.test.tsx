import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseCard from './CourseCard'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div onClick={onClick} {...props}>{children}</div>,
  },
}))

describe('CourseCard', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/image.jpg',
    courseName: 'Test Course',
    status: 'public' as const,
    onCourseClick: vi.fn(),
  }

  it('should render course card with basic information', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByAltText('Image for Test Course')).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('should call onCourseClick when clicked', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()

    render(<CourseCard {...defaultProps} onCourseClick={mockOnClick} />)

    const card = screen.getByText('Test Course').closest('div')
    await user.click(card!)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should render tags when provided', () => {
    const tags = ['React', 'JavaScript']

    render(<CourseCard {...defaultProps} tags={tags} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  it('should not render tags section when tags is empty', () => {
    render(<CourseCard {...defaultProps} tags={[]} />)

    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('should render description for public courses', () => {
    const description = 'This is a test course'

    render(<CourseCard {...defaultProps} description={description} />)

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('should not render description for non-public courses', () => {
    const description = 'This is a test course'

    render(<CourseCard {...defaultProps} status="not_started" description={description} />)

    expect(screen.queryByText(description)).not.toBeInTheDocument()
  })

  it('should render progress bar for in-progress courses', () => {
    render(<CourseCard {...defaultProps} status="in-progress" progress={75} />)

    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('should render progress bar for not_started courses', () => {
    render(<CourseCard {...defaultProps} status="not_started" progress={25} />)

    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should not render progress bar for public courses', () => {
    render(<CourseCard {...defaultProps} status="public" progress={50} />)

    expect(screen.queryByText('Progress')).not.toBeInTheDocument()
  })

  it('should not render progress bar for completed courses', () => {
    render(<CourseCard {...defaultProps} status="completed" progress={100} />)

    expect(screen.queryByText('Progress')).not.toBeInTheDocument()
  })

  it('should render completion overlay for completed courses', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    expect(screen.getByText('Course Complete')).toBeInTheDocument()
  })

  it('should apply green border for completed courses', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    const card = screen.getByText('Test Course').closest('.bg-white')
    expect(card).toHaveClass('border-green-500')
  })

  it('should show correct button text for different statuses', () => {
    const { rerender } = render(<CourseCard {...defaultProps} status="public" />)
    expect(screen.getByText('Learn More')).toBeInTheDocument()

    rerender(<CourseCard {...defaultProps} status="not_started" />)
    expect(screen.getByText('Start Course')).toBeInTheDocument()

    rerender(<CourseCard {...defaultProps} status="in-progress" />)
    expect(screen.getByText('Continue Course')).toBeInTheDocument()

    rerender(<CourseCard {...defaultProps} status="completed" />)
    expect(screen.getByText('Repeat / View Materials')).toBeInTheDocument()
  })

  it('should apply correct button variant for completed courses', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    const button = screen.getByText('Repeat / View Materials')
    expect(button).toHaveClass('bg-white', 'hover:bg-gray-50') // secondary variant classes
  })

  it('should apply correct button variant for non-completed courses', () => {
    render(<CourseCard {...defaultProps} status="in-progress" />)

    const button = screen.getByText('Continue Course')
    expect(button).toHaveClass('bg-indigo-600', 'hover:bg-indigo-700') // primary variant classes
  })

  it('should have correct aspect ratio for image', () => {
    render(<CourseCard {...defaultProps} />)

    const imageContainer = screen.getByAltText('Image for Test Course').parentElement
    expect(imageContainer).toHaveClass('aspect-w-16', 'aspect-h-9')
  })

  it('should have correct card classes', () => {
    render(<CourseCard {...defaultProps} />)

    const card = screen.getByText('Test Course').closest('.bg-white')
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'dark:border',
      'dark:border-gray-700',
      'p-0',
      'overflow-hidden',
      'flex',
      'flex-col',
      'h-full'
    )
  })

  it('should have correct motion div classes', () => {
    render(<CourseCard {...defaultProps} />)

    const motionDiv = screen.getByText('Test Course').parentElement?.parentElement?.parentElement
    expect(motionDiv).toHaveClass('cursor-pointer', 'rounded-lg', 'h-full', 'shadow-lg')
  })

  it('should handle empty tags array', () => {
    render(<CourseCard {...defaultProps} tags={[]} />)

    // Should not crash and should render normally
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('should handle undefined progress', () => {
    render(<CourseCard {...defaultProps} status="in-progress" progress={undefined} />)

    // Should not render progress section
    expect(screen.queryByText('Progress')).not.toBeInTheDocument()
  })

  it('should handle zero progress', () => {
    render(<CourseCard {...defaultProps} status="in-progress" progress={0} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('should handle 100 progress', () => {
    render(<CourseCard {...defaultProps} status="in-progress" progress={100} />)

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should handle undefined onCourseClick', () => {
    render(<CourseCard {...defaultProps} onCourseClick={undefined} />)

    // Should not crash
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('should render tag with correct classes', () => {
    render(<CourseCard {...defaultProps} tags={['Test Tag']} />)

    const tag = screen.getByText('Test Tag')
    expect(tag).toHaveClass(
      'inline-block',
      'bg-indigo-100',
      'text-indigo-800',
      'text-xs',
      'font-semibold',
      'px-2.5',
      'py-0.5',
      'rounded-full',
      'dark:bg-indigo-900',
      'dark:text-indigo-300'
    )
  })

  it('should render check icon for completed courses', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    // Check for SVG with check path
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render completion check icon with correct classes', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    const checkIcon = document.querySelector('svg.w-5.h-5')
    expect(checkIcon).toHaveClass('w-5', 'h-5')
  })

  it('should have correct completion text styling', () => {
    render(<CourseCard {...defaultProps} status="completed" />)

    const completionText = screen.getByText('Course Complete')
    expect(completionText).toHaveClass('text-green-600', 'dark:text-green-400', 'font-semibold')
  })

  it('should have correct progress text styling', () => {
    render(<CourseCard {...defaultProps} status="in-progress" progress={50} />)

    const progressText = screen.getByText('50%')
    expect(progressText).toHaveClass('text-indigo-600', 'dark:text-indigo-400')
  })
})