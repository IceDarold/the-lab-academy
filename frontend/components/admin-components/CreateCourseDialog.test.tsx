import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateCourseDialog from './CreateCourseDialog'

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

describe('CreateCourseDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render trigger children', () => {
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument()
  })

  it('should not render dialog initially', () => {
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    expect(screen.queryByText('Create New Course')).not.toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    const trigger = screen.getByRole('button', { name: /open dialog/i })
    await user.click(trigger)

    expect(screen.getByText('Create New Course')).toBeInTheDocument()
  })

  it('should render dialog with correct title and description', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    expect(screen.getByText('Create New Course')).toBeInTheDocument()
    expect(screen.getByText('Enter the details for your new course. A unique slug will be generated automatically.')).toBeInTheDocument()
  })

  it('should render form fields', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Advanced Python Programming')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., advanced-python-programming')).toBeInTheDocument()
  })

  it('should render action buttons', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create course/i })).toBeInTheDocument()
  })

  it('should render close button with icon', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton.querySelector('svg')).toBeInTheDocument()
  })

  it('should close dialog when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(screen.getByText('Create New Course')).toBeInTheDocument()

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    await user.click(overlay!)

    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).not.toBeInTheDocument()
    })
  })

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(screen.getByText('Create New Course')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).not.toBeInTheDocument()
    })
  })

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(screen.getByText('Create New Course')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).not.toBeInTheDocument()
    })
  })

  it('should render dialog with proper accessibility attributes', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    // Check for screen reader text
    expect(screen.getByText('Close')).toHaveClass('sr-only')
  })

  it('should render form with proper structure', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const form = screen.getByRole('form', { hidden: true })
    expect(form).toBeInTheDocument()

    // Check grid layout
    const gridContainers = document.querySelectorAll('.grid.grid-cols-4')
    expect(gridContainers).toHaveLength(2) // title and slug fields
  })

  it('should have proper input attributes', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const titleInput = screen.getByLabelText('Title')
    const slugInput = screen.getByLabelText('Slug')

    expect(titleInput).toHaveAttribute('id', 'title')
    expect(slugInput).toHaveAttribute('id', 'slug')
    expect(titleInput).toHaveAttribute('type', 'text')
    expect(slugInput).toHaveAttribute('type', 'text')
  })

  it('should render dialog with correct styling classes', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const dialog = document.querySelector('.relative.z-10')
    expect(dialog).toHaveClass('w-full', 'max-w-lg', 'p-6', 'mx-4', 'bg-gray-800', 'border', 'border-gray-700', 'rounded-lg', 'shadow-2xl')
  })

  it('should render overlay with correct styling', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60')
    expect(overlay).toBeInTheDocument()
  })

  it('should render buttons with correct variants', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const createButton = screen.getByRole('button', { name: /create course/i })

    expect(cancelButton).toHaveClass('bg-gray-700')
    expect(createButton).toHaveClass('bg-blue-600')
  })

  it('should handle keyboard accessibility', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    const trigger = screen.getByRole('button', { name: /open dialog/i })
    trigger.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Create New Course')).toBeInTheDocument()
  })

  it('should render labels with correct styling', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const titleLabel = screen.getByText('Title')
    const slugLabel = screen.getByText('Slug')

    expect(titleLabel).toHaveClass('text-right')
    expect(slugLabel).toHaveClass('text-right')
  })

  it('should render inputs with correct styling', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const titleInput = screen.getByLabelText('Title')
    const slugInput = screen.getByLabelText('Slug')

    expect(titleInput).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-gray-600', 'bg-gray-900', 'px-3', 'py-2', 'text-sm')
    expect(slugInput).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-gray-600', 'bg-gray-900', 'px-3', 'py-2', 'text-sm')
  })

  it('should render error message containers', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    // Error containers should be present even if no errors
    const titleErrorContainer = document.querySelector('.col-span-3')
    expect(titleErrorContainer).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const form = screen.getByRole('form', { hidden: true })
    const submitButton = screen.getByRole('button', { name: /create course/i })

    // Note: Since we're mocking react-hook-form, the actual submission logic isn't tested here
    // In a real scenario, we'd test the form validation and submission
    expect(form).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should render dialog with responsive design classes', async () => {
    const user = userEvent.setup()
    render(
      <CreateCourseDialog>
        <button>Open Dialog</button>
      </CreateCourseDialog>
    )

    await user.click(screen.getByRole('button', { name: /open dialog/i }))

    const header = document.querySelector('.flex.flex-col')
    expect(header).toHaveClass('space-y-1.5', 'text-center', 'sm:text-left')
  })
})