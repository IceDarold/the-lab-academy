import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateLessonDialog from './CreateLessonDialog'
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

describe('CreateLessonDialog', () => {
  const mockPart: ContentNode = {
    id: 'part-1',
    name: 'Introduction Part',
    type: 'part',
    status: 'published'
  }

  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByText(/Create New Lesson/)).not.toBeInTheDocument()
  })

  it('should render dialog when isOpen is true', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Lesson in 'Introduction Part'")).toBeInTheDocument()
  })

  it('should render dialog with correct title and description', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Lesson in 'Introduction Part'")).toBeInTheDocument()
    expect(screen.getByText('Enter details for the new lesson file.')).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByLabelText('Prefix')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toBeInTheDocument()
  })

  it('should render prefix input with correct attributes', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const prefixInput = screen.getByLabelText('Prefix')
    expect(prefixInput).toHaveAttribute('id', 'prefix')
    expect(prefixInput).toHaveAttribute('placeholder', '01')
    expect(prefixInput).toHaveAttribute('maxlength', '2')
    expect(prefixInput).toHaveClass('w-20')
  })

  it('should render title and slug inputs with correct placeholders', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByPlaceholderText('e.g., Introduction to Tensors')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., introduction-to-tensors')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create lesson/i })).toBeInTheDocument()
  })

  it('should render close button with icon', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton.querySelector('svg')).toBeInTheDocument()
  })

  it('should close dialog when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    await user.click(overlay!)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should render form with proper structure', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()

    // Check grid layout for 3 fields
    const gridContainers = document.querySelectorAll('.grid.grid-cols-4')
    expect(gridContainers).toHaveLength(3)
  })

  it('should render inputs with correct styling', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-gray-600', 'bg-gray-900', 'px-3', 'py-2', 'text-sm')
    })
  })

  it('should render labels with correct styling', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const labels = ['Prefix', 'Title', 'Slug']
    labels.forEach(label => {
      const labelElement = screen.getByText(label)
      expect(labelElement).toHaveClass('text-right')
    })
  })

  it('should render dialog with correct styling classes', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const dialog = document.querySelector('.relative.z-10')
    expect(dialog).toHaveClass('w-full', 'max-w-lg', 'p-6', 'mx-4', 'bg-gray-800', 'border', 'border-gray-700', 'rounded-lg', 'shadow-2xl')
  })

  it('should render overlay with correct styling', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    expect(overlay).toBeInTheDocument()
  })

  it('should render buttons with correct variants', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const createButton = screen.getByRole('button', { name: /create lesson/i })

    expect(cancelButton).toHaveClass('bg-gray-700')
    expect(createButton).toHaveClass('bg-blue-600')
  })

  it('should render with responsive design classes', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const header = document.querySelector('.flex.flex-col')
    expect(header).toHaveClass('space-y-1.5', 'text-center', 'sm:text-left')
  })

  it('should be accessible with proper ARIA labels', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('Close')).toHaveClass('sr-only')
  })

  it('should render error message containers', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    // Error containers should be present even if no errors
    const errorContainers = document.querySelectorAll('.col-span-3')
    expect(errorContainers).toHaveLength(3) // prefix, title, slug
  })

  it('should handle form submission', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const form = screen.getByRole('form', { hidden: true })
    const submitButton = screen.getByRole('button', { name: /create lesson/i })

    expect(form).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should render prefix input as smaller width', () => {
    render(<CreateLessonDialog part={mockPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    const prefixInput = screen.getByLabelText('Prefix')
    expect(prefixInput).toHaveClass('w-20')
  })

  it('should render different part names in title', () => {
    const differentPart: ContentNode = {
      id: 'part-2',
      name: 'Advanced Topics',
      type: 'part',
      status: 'draft'
    }

    render(<CreateLessonDialog part={differentPart} isOpen={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Create New Lesson in 'Advanced Topics'")).toBeInTheDocument()
  })
})