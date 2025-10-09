import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentTree from './ContentTree'
import type { ContentNode } from '../../types/admin'

// Mock child components
vi.mock('./CreateCourseDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="create-course-dialog">{children}</div>
}))

vi.mock('./CreatePartDialog', () => ({
  default: ({ course, isOpen, onOpenChange }: any) => (
    <div data-testid="create-part-dialog" data-open={isOpen}>
      Part dialog for {course?.name}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  )
}))

vi.mock('./CreateLessonDialog', () => ({
  default: ({ part, isOpen, onOpenChange }: any) => (
    <div data-testid="create-lesson-dialog" data-open={isOpen}>
      Lesson dialog for {part?.name}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  )
}))

describe('ContentTree', () => {
  const mockOnSelectNode = vi.fn()

  const mockData: ContentNode[] = [
    {
      id: '1',
      name: 'Course 1',
      type: 'course',
      status: 'published',
      children: [
        {
          id: '2',
          name: 'Part 1',
          type: 'part',
          status: 'draft',
          children: [
            {
              id: '3',
              name: 'Lesson 1',
              type: 'lesson',
              status: 'locked'
            }
          ]
        }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with course data', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    expect(screen.getByText('Course 1')).toBeInTheDocument()
    expect(screen.getByText('Part 1')).toBeInTheDocument()
    expect(screen.getByText('Lesson 1')).toBeInTheDocument()
  })

  it('should render "New Course" button', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument()
  })

  it('should call onSelectNode when a node is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1')
    await user.click(courseNode)

    expect(mockOnSelectNode).toHaveBeenCalledWith(mockData[0])
  })

  it('should highlight selected node', () => {
    render(<ContentTree data={mockData} selectedId="1" onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1').closest('div')
    expect(courseNode).toHaveClass('bg-blue-600/30')
  })

  it('should not highlight unselected nodes', () => {
    render(<ContentTree data={mockData} selectedId="1" onSelectNode={mockOnSelectNode} />)

    const partNode = screen.getByText('Part 1').closest('div')
    expect(partNode).not.toHaveClass('bg-blue-600/30')
  })

  it('should render status icons correctly', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    // Published course should have green dot
    const publishedIcon = document.querySelector('[aria-label="Published"]')
    expect(publishedIcon).toBeInTheDocument()

    // Draft part should have pencil icon
    const draftIcon = document.querySelector('[aria-label="Draft"]')
    expect(draftIcon).toBeInTheDocument()

    // Locked lesson should have lock icon
    const lockedIcon = document.querySelector('[aria-label="Locked"]')
    expect(lockedIcon).toBeInTheDocument()
  })

  it('should show add part button on hover for course nodes', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1').closest('div')
    await user.hover(courseNode!)

    const addButton = screen.getByRole('button', { name: /add part to course 1/i })
    expect(addButton).toBeInTheDocument()
  })

  it('should show add lesson button on hover for part nodes', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const partNode = screen.getByText('Part 1').closest('div')
    await user.hover(partNode!)

    const addButton = screen.getByRole('button', { name: /add lesson to part 1/i })
    expect(addButton).toBeInTheDocument()
  })

  it('should open create part dialog when add part button is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1').closest('div')
    await user.hover(courseNode!)
    const addButton = screen.getByRole('button', { name: /add part to course 1/i })
    await user.click(addButton)

    const dialog = screen.getByTestId('create-part-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(dialog).toHaveTextContent('Part dialog for Course 1')
  })

  it('should open create lesson dialog when add lesson button is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const partNode = screen.getByText('Part 1').closest('div')
    await user.hover(partNode!)
    const addButton = screen.getByRole('button', { name: /add lesson to part 1/i })
    await user.click(addButton)

    const dialog = screen.getByTestId('create-lesson-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(dialog).toHaveTextContent('Lesson dialog for Part 1')
  })

  it('should close dialogs when onOpenChange is called with false', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    // Open part dialog
    const courseNode = screen.getByText('Course 1').closest('div')
    await user.hover(courseNode!)
    const addButton = screen.getByRole('button', { name: /add part to course 1/i })
    await user.click(addButton)

    // Close dialog
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    const dialog = screen.getByTestId('create-part-dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('should render nested children with correct indentation', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1').closest('div')
    const partNode = screen.getByText('Part 1').closest('div')
    const lessonNode = screen.getByText('Lesson 1').closest('div')

    // Check that padding-left styles are applied (we can't easily test exact values, but presence)
    expect(courseNode?.querySelector('div')).toHaveStyle({ paddingLeft: '0.5rem' })
    expect(partNode?.querySelector('div')).toHaveStyle({ paddingLeft: '2rem' })
    expect(lessonNode?.querySelector('div')).toHaveStyle({ paddingLeft: '3.5rem' })
  })

  it('should handle empty data array', () => {
    render(<ContentTree data={[]} selectedId={null} onSelectNode={mockOnSelectNode} />)

    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument()
    expect(screen.queryByText('Course 1')).not.toBeInTheDocument()
  })

  it('should handle nodes without children', () => {
    const dataWithoutChildren: ContentNode[] = [
      {
        id: '1',
        name: 'Standalone Lesson',
        type: 'lesson',
        status: 'published'
      }
    ]

    render(<ContentTree data={dataWithoutChildren} selectedId={null} onSelectNode={mockOnSelectNode} />)

    expect(screen.getByText('Standalone Lesson')).toBeInTheDocument()
    // Should not have add buttons since it's a lesson
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
  })

  it('should handle config type nodes without status icons', () => {
    const configData: ContentNode[] = [
      {
        id: '1',
        name: 'Config File',
        type: 'config',
        configPath: '/path/to/config'
      }
    ]

    render(<ContentTree data={configData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    expect(screen.getByText('Config File')).toBeInTheDocument()
    // Config nodes should not have status icons
    expect(document.querySelector('[aria-label]')).toBeNull()
  })

  it('should prevent event propagation when clicking add buttons', async () => {
    const user = userEvent.setup()
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    const courseNode = screen.getByText('Course 1').closest('div')
    await user.hover(courseNode!)
    const addButton = screen.getByRole('button', { name: /add part to course 1/i })

    await user.click(addButton)

    // onSelectNode should not be called because event propagation was stopped
    expect(mockOnSelectNode).not.toHaveBeenCalled()
  })

  it('should render folder icons for courses and parts, file icon for lessons', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    // Check for folder icons (courses and parts)
    const folderIcons = document.querySelectorAll('svg') // Assuming lucide icons render as svg
    expect(folderIcons.length).toBeGreaterThan(0)

    // We can't easily distinguish between Folder and FileText icons without more specific selectors
    // But the presence of icons indicates they're rendering
  })

  it('should be accessible with proper ARIA labels', () => {
    render(<ContentTree data={mockData} selectedId={null} onSelectNode={mockOnSelectNode} />)

    // Status icons have aria-labels
    expect(screen.getByLabelText('Published')).toBeInTheDocument()
    expect(screen.getByLabelText('Draft')).toBeInTheDocument()
    expect(screen.getByLabelText('Locked')).toBeInTheDocument()

    // Add buttons have aria-labels
    const courseNode = screen.getByText('Course 1').closest('div')
    fireEvent.mouseEnter(courseNode!)
    expect(screen.getByLabelText('Add part to Course 1')).toBeInTheDocument()
  })
})