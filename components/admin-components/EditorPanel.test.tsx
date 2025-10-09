var mockParseLessonRef: any

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditorPanel from './EditorPanel'
import type { ContentNode } from '../../types/admin'

// Mock react-simple-code-editor
vi.mock('react-simple-code-editor', () => ({
  default: ({ value, onValueChange, highlight, ...props }: any) => (
    <textarea
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
      data-testid="code-editor"
    />
  )
}))

// Mock prismjs
vi.mock('prismjs', () => ({
  default: {
    highlight: vi.fn((code) => `<span>${code}</span>`),
    languages: {
      markdown: {},
      yaml: {}
    }
  },
  highlight: vi.fn((code) => `<span>${code}</span>`)
}))

// Mock prismjs components
vi.mock('prismjs/components/prism-yaml', () => ({}))
vi.mock('prismjs/components/prism-markdown', () => ({}))

// Mock services
vi.mock('../../services/admin.service', () => ({
  getConfigFile: vi.fn(),
  updateConfigFile: vi.fn()
}))

// Mock lesson parser
vi.mock('../../lib/admin-utils/lessonParser', () => {
  const mock = vi.fn((content) => ({
    metadata: { title: 'Test Lesson', status: 'published' },
    cells: [{ type: 'text', content: 'Test content' }]
  }))
  mockParseLessonRef = mock
  return {
    parseLesson: mock
  }
})

// Mock child components
vi.mock('./admin/lessons/CellRenderer', () => ({
  default: ({ cell }: any) => <div data-testid="cell-renderer">{cell.content}</div>
}))

vi.mock('./admin/lessons/LessonSettingsDialog', () => ({
  default: ({ isOpen, onOpenChange }: any) => (
    isOpen ? <div data-testid="lesson-settings-dialog">
      <button onClick={() => onOpenChange(false)}>Close Settings</button>
    </div> : null
  )
}))

vi.mock('./ui/resizable', () => ({
  ResizableHandle: () => <div data-testid="resizable-handle" />,
  ResizablePanel: ({ children }: any) => <div data-testid="resizable-panel">{children}</div>,
  ResizablePanelGroup: ({ children }: any) => <div data-testid="resizable-panel-group">{children}</div>
}))

vi.mock('./ui/button', () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  )
}))

vi.mock('./ui/badge', () => ({
  default: ({ children, variant }: any) => <span data-testid="badge" data-variant={variant}>{children}</span>
}))

describe('EditorPanel', () => {
  const mockLessonNode: ContentNode = {
    id: 'lesson-1',
    name: 'Introduction to React',
    type: 'lesson',
    status: 'published'
  }

  const mockCourseNode: ContentNode = {
    id: 'course-1',
    name: 'React Course',
    type: 'course',
    status: 'published'
  }

  const mockPartNode: ContentNode = {
    id: 'part-1',
    name: 'Basics',
    type: 'part',
    status: 'draft'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no node is selected', () => {
    render(<EditorPanel selectedNode={null} />)

    expect(screen.getByText('Select a file')).toBeInTheDocument()
    expect(screen.getByText('Choose a file from the left panel to view or edit its content.')).toBeInTheDocument()
    // Check for FileText icon (it should be an SVG)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render lesson in read mode by default', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    expect(screen.getByText('Test Lesson')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('should display lesson status badge correctly', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'success')
    expect(badge).toHaveTextContent('Published')
  })

  it('should display different status badges', () => {
    const draftLesson: ContentNode = { ...mockLessonNode, status: 'draft' }
    render(<EditorPanel selectedNode={draftLesson} />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
    expect(badge).toHaveTextContent('Draft')
  })

  it('should render cell renderer for lesson content in read mode', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    expect(screen.getByTestId('cell-renderer')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should switch to edit mode when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should render resizable panels in edit mode', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument()
    expect(screen.getAllByTestId('resizable-panel')).toHaveLength(2)
    expect(screen.getByTestId('resizable-handle')).toBeInTheDocument()
  })

  it('should render code editor in edit mode', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
  })

  it('should show preview panel in edit mode', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    // Should show cell renderer in preview panel
    expect(screen.getByTestId('cell-renderer')).toBeInTheDocument()
  })

  it('should handle save functionality', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    // Should show saving state
    expect(screen.getByText('Saving...')).toBeInTheDocument()

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should handle cancel functionality', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Should switch back to read mode
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('should open settings dialog when settings button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const settingsButton = screen.getByText('Settings')
    await user.click(settingsButton)

    expect(screen.getByTestId('lesson-settings-dialog')).toBeInTheDocument()
  })

  it('should render course configuration editor', () => {
    render(<EditorPanel selectedNode={mockCourseNode} />)

    expect(screen.getByText('React Course Configuration')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('should render part configuration editor', () => {
    render(<EditorPanel selectedNode={mockPartNode} />)

    expect(screen.getByText('Basics Configuration')).toBeInTheDocument()
  })

  it('should render YAML editor for course/part configurations', () => {
    render(<EditorPanel selectedNode={mockCourseNode} />)

    const editor = screen.getByTestId('code-editor')
    expect(editor).toBeInTheDocument()
    // Should contain YAML placeholder content
    expect(editor).toHaveValue('# Configuration for: React Course\ntitle: A great title\ndescription: A comprehensive overview of fundamental concepts.\nauthor: AI Academy\nversion: 1.0.0\n')
  })

  it('should render unsupported item message for config type', () => {
    const configNode: ContentNode = {
      id: 'config-1',
      name: 'config.json',
      type: 'config'
    }

    render(<EditorPanel selectedNode={configNode} />)

    expect(screen.getByText('Unsupported Item')).toBeInTheDocument()
    expect(screen.getByText('This item type cannot be edited at this time.')).toBeInTheDocument()
  })

  it('should handle parsing errors gracefully', () => {
    // Mock parseLesson to throw error
    mockParseLessonRef.mockImplementationOnce(() => {
      throw new Error('Parse error')
    })

    render(<EditorPanel selectedNode={mockLessonNode} />)

    expect(screen.getByText('Failed to parse lesson content.')).toBeInTheDocument()
  })

  it('should update parsed content when raw content changes in edit mode', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    const editor = screen.getByTestId('code-editor')
    await user.clear(editor)
    await user.type(editor, '# New content')

    // Should re-parse and update preview
    expect(screen.getByTestId('cell-renderer')).toBeInTheDocument()
  })

  it('should show error in edit mode when parsing fails', async () => {
    const user = userEvent.setup()

    // Mock parseLesson to throw error
    mockParseLessonRef.mockImplementation(() => {
      throw new Error('Parse error')
    })

    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Error parsing lesson content. Check syntax.')).toBeInTheDocument()
  })

  it('should disable buttons during saving', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    await user.click(screen.getByText('Edit'))

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    // Save button should be disabled during saving
    expect(saveButton).toBeDisabled()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })

  it('should render book icon for lessons', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    // Check for book icon (assuming it has a test id or can be queried)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should render folder icon for courses/parts', () => {
    render(<EditorPanel selectedNode={mockCourseNode} />)

    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should handle lesson with no metadata title', () => {
    mockParseLessonRef.mockReturnValueOnce({
      metadata: {},
      cells: []
    })

    render(<EditorPanel selectedNode={mockLessonNode} />)

    expect(screen.getByText('Introduction to React')).toBeInTheDocument()
  })

  it('should render with proper card styling', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const card = document.querySelector('.bg-gray-800.border.border-gray-700')
    expect(card).toBeInTheDocument()
  })

  it('should render card header with proper layout', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const header = document.querySelector('.p-4.border-b.border-gray-700')
    expect(header).toBeInTheDocument()
  })

  it('should render card content with proper styling', () => {
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const content = document.querySelector('.p-4')
    expect(content).toBeInTheDocument()
  })

  it('should handle keyboard accessibility', async () => {
    const user = userEvent.setup()
    render(<EditorPanel selectedNode={mockLessonNode} />)

    const editButton = screen.getByText('Edit')
    editButton.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should render editor with proper styling classes', () => {
    render(<EditorPanel selectedNode={mockCourseNode} />)

    const editor = screen.getByTestId('code-editor')
    expect(editor).toHaveClass('font-mono', 'text-sm', 'leading-relaxed')
  })

  it('should handle empty lesson cells', () => {
    mockParseLessonRef.mockReturnValueOnce({
      metadata: { title: 'Empty Lesson' },
      cells: []
    })

    render(<EditorPanel selectedNode={mockLessonNode} />)

    // Should not crash and should render the title
    expect(screen.getByText('Empty Lesson')).toBeInTheDocument()
  })
})