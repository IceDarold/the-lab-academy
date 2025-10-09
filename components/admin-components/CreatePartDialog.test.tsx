import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreatePartDialog from './CreatePartDialog'
import type { ContentNode } from '../../types/admin'

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn((name) => ({ name })),
    handleSubmit: vi.fn((fn) => fn),
    formState: {
      errors: {},
      dirtyFields: {},
      isSubmitting: false
    },
    watch: vi.fn(() => ''),
    setValue: vi.fn(),
    reset: vi.fn()
  }))
}))

// Mock zodResolver
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn())
}))

describe('CreatePartDialog', () => {
  const mockCourse: ContentNode = {
    id: 'course-1',
    name: 'Python Programming',
    type: 'course',
    status: 'published'
  }

  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByText(/Create New Part/)).not.toBeInTheDocument()
  })

  it('should render dialog when isOpen is true', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Part in 'Python Programming'")).toBeInTheDocument()
  })

  it('should render dialog with correct title and description', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Part in 'Python Programming'")).toBeInTheDocument()
    expect(screen.getByText('Enter a title for the new part (e.g., a module or section).')).toBeInTheDocument()
  })

  it('should render form fields', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toBeInTheDocument()
  })

  it('should render inputs with correct placeholders', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByPlaceholderText('e.g., Supervised Learning Basics')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., supervised-learning-basics')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create part/i })).toBeInTheDocument()
  })

  it('should render close button with icon', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton.querySelector('svg')).toBeInTheDocument()
  })

  it('should close dialog when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    await user.click(overlay!)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should render form with proper structure', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()

    // Check grid layout for 2 fields
    const gridContainers = document.querySelectorAll('.grid.grid-cols-4')
    expect(gridContainers).toHaveLength(2)
  })

  it('should render inputs with correct styling', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-gray-600', 'bg-gray-900', 'px-3', 'py-2', 'text-sm')
    })
  })

  it('should render labels with correct styling', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const titleLabel = screen.getByText('Title')
    const slugLabel = screen.getByText('Slug')

    expect(titleLabel).toHaveClass('text-right')
    expect(slugLabel).toHaveClass('text-right')
  })

  it('should render dialog with correct styling classes', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const dialog = document.querySelector('.relative.z-10')
    expect(dialog).toHaveClass('w-full', 'max-w-lg', 'p-6', 'mx-4', 'bg-gray-800', 'border', 'border-gray-700', 'rounded-lg', 'shadow-2xl')
  })

  it('should render overlay with correct styling', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    expect(overlay).toBeInTheDocument()
  })

  it('should render buttons with correct variants', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const createButton = screen.getByRole('button', { name: /create part/i })

    expect(cancelButton).toHaveClass('bg-gray-700')
    expect(createButton).toHaveClass('bg-blue-600')
  })

  it('should render with responsive design classes', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const header = document.querySelector('.flex.flex-col')
    expect(header).toHaveClass('space-y-1.5', 'text-center', 'sm:text-left')
  })

  it('should be accessible with proper ARIA labels', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('Close')).toHaveClass('sr-only')
  })

  it('should render error message containers', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    // Error containers should be present even if no errors
    const errorContainers = document.querySelectorAll('.col-span-3')
    expect(errorContainers).toHaveLength(2) // title and slug
  })

  it('should handle form submission', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const form = document.querySelector('form')
    const submitButton = screen.getByRole('button', { name: /create part/i })

    expect(form).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should render different course names in title', () => {
    const differentCourse: ContentNode = {
      id: 'course-2',
      name: 'Machine Learning',
      type: 'course',
      status: 'draft'
    }

    render(<CreatePartDialog course={differentCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Part in 'Machine Learning'")).toBeInTheDocument()
  })

  it('should have proper input attributes', () => {
    render(<CreatePartDialog course={mockCourse} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('Title')
    const slugInput = screen.getByLabelText('Slug')

    expect(titleInput).toHaveAttribute('id', 'title')
    expect(slugInput).toHaveAttribute('id', 'slug')
    // HTML input elements default to type="text" when not specified
    expect(titleInput).toHaveAttribute('type', 'text')
    expect(slugInput).toHaveAttribute('type', 'text')
  })
})