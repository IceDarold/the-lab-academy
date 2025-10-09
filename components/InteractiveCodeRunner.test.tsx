var mockEditorRef: any

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InteractiveCodeRunner from './InteractiveCodeRunner'

// Mock react-simple-code-editor
vi.mock('react-simple-code-editor', () => {
  const mock = vi.fn()
  mockEditorRef = mock
  return {
    default: mock,
  }
})

// Mock components
vi.mock('./Button', () => ({
  default: ({ children, onClick, disabled, loading, variant }: any) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  ),
}))

vi.mock('./Card', () => ({
  default: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

// Mock useAnalytics
const mockTrackEvent = vi.fn()
vi.mock('../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: mockTrackEvent,
  }),
}))

// Mock Prism
const mockPrism = {
  highlight: vi.fn(() => 'highlighted code'),
  languages: {
    python: {},
  },
}
;(global as any).Prism = mockPrism

describe('InteractiveCodeRunner', () => {
  const defaultProps = {
    initialCode: 'print("hello")',
    pyodideState: 'ready' as const,
    onExecute: vi.fn(),
    lessonSlug: 'test-lesson',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEditorRef.mockImplementation(({ value, onValueChange, highlight }: any) => (
      <textarea
        data-testid="code-editor"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={false}
      />
    ))
  })

  it('should render with initial code', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    const editor = screen.getByTestId('code-editor')
    expect(editor).toHaveValue('print("hello")')
  })

  it('should render toolbar with buttons', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    expect(screen.getByText('Live Python Editor')).toBeInTheDocument()
    expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    expect(screen.getByTestId('button-primary')).toBeInTheDocument()
  })

  it('should render reset and run buttons', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    expect(screen.getByText('Reset')).toBeInTheDocument()
    expect(screen.getByText('Run')).toBeInTheDocument()
  })

  it('should render console output section', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    expect(screen.getByText('Console Output')).toBeInTheDocument()
    expect(screen.getByText('> Output will appear here...')).toBeInTheDocument()
  })

  it('should call onExecute when run button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue(['output'])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    expect(mockOnExecute).toHaveBeenCalledWith('print("hello")')
  })

  it('should track code execution event', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue(['output'])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    expect(mockTrackEvent).toHaveBeenCalledWith('CODE_EXECUTION', {
      lesson_slug: 'test-lesson',
      character_count: 14, // length of 'print("hello")'
    })
  })

  it('should reset code when reset button is clicked', async () => {
    const user = userEvent.setup()

    render(<InteractiveCodeRunner {...defaultProps} />)

    const editor = screen.getByTestId('code-editor')
    await user.clear(editor)
    await user.type(editor, 'new code')

    expect(editor).toHaveValue('new code')

    const resetButton = screen.getByTestId('button-secondary')
    await user.click(resetButton)

    expect(editor).toHaveValue('print("hello")')
  })

  it('should display execution output', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue(['line 1', 'line 2'])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    await waitFor(() => {
      expect(screen.getByText('line 1')).toBeInTheDocument()
      expect(screen.getByText('line 2')).toBeInTheDocument()
    })
  })

  it('should handle execution errors', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockRejectedValue(new Error('Execution failed'))

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    await waitFor(() => {
      expect(screen.getByText('Execution failed')).toBeInTheDocument()
    })
  })

  it('should disable buttons when pyodide is not ready', () => {
    render(<InteractiveCodeRunner {...defaultProps} pyodideState="loading" />)

    const resetButton = screen.getByTestId('button-secondary')
    const runButton = screen.getByTestId('button-primary')

    expect(resetButton).toBeDisabled()
    expect(runButton).toBeDisabled()
  })

  it('should show error overlay when pyodide state is error', () => {
    render(<InteractiveCodeRunner {...defaultProps} pyodideState="error" />)

    expect(screen.getByText('❌ Python environment failed to load.')).toBeInTheDocument()
  })

  it('should disable run button during execution', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(['done']), 100)))

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    expect(runButton).toBeDisabled()

    await waitFor(() => {
      expect(runButton).not.toBeDisabled()
    })
  })

  it('should reset output when reset is clicked', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue(['output'])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    // Execute code
    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    await waitFor(() => {
      expect(screen.getByText('output')).toBeInTheDocument()
    })

    // Reset
    const resetButton = screen.getByTestId('button-secondary')
    await user.click(resetButton)

    expect(screen.queryByText('output')).not.toBeInTheDocument()
    expect(screen.getByText('> Output will appear here...')).toBeInTheDocument()
  })

  it('should update code when editor changes', async () => {
    const user = userEvent.setup()

    render(<InteractiveCodeRunner {...defaultProps} />)

    const editor = screen.getByTestId('code-editor')
    await user.clear(editor)
    await user.type(editor, 'new code')

    expect(editor).toHaveValue('new code')
  })

  it('should highlight error lines in output', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue(['Error: something went wrong', 'normal output'])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    await waitFor(() => {
      const errorLine = screen.getByText('Error: something went wrong')
      const normalLine = screen.getByText('normal output')

      expect(errorLine).toHaveClass('text-red-400')
      expect(normalLine).toHaveClass('text-gray-300')
    })
  })

  it('should reset to initial code when initialCode changes', () => {
    const { rerender } = render(<InteractiveCodeRunner {...defaultProps} />)

    const editor = screen.getByTestId('code-editor')
    expect(editor).toHaveValue('print("hello")')

    rerender(<InteractiveCodeRunner {...defaultProps} initialCode='print("world")' />)

    expect(editor).toHaveValue('print("world")')
  })

  it('should have correct card classes', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    const card = screen.getByTestId('card')
    expect(card).toHaveClass('!p-0', 'overflow-hidden', 'shadow-lg', 'relative', 'border', 'border-gray-200', 'dark:border-gray-700')
  })

  it('should have correct toolbar classes', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    const toolbar = document.querySelector('.flex.justify-between.items-center.p-2')
    expect(toolbar).toBeInTheDocument()
  })

  it('should have correct editor container classes', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    const editorContainer = document.querySelector('.relative.text-sm.font-mono')
    expect(editorContainer).toBeInTheDocument()
  })

  it('should have correct output container classes', () => {
    render(<InteractiveCodeRunner {...defaultProps} />)

    const outputContainer = document.querySelector('.border-t.border-gray-200.dark\\:border-gray-700')
    expect(outputContainer).toBeInTheDocument()
  })

  it('should handle Prism highlighting failure gracefully', () => {
    mockPrism.highlight.mockImplementation(() => {
      throw new Error('Highlighting failed')
    })

    render(<InteractiveCodeRunner {...defaultProps} />)

    // Should not crash
    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
  })

  it('should handle empty output', async () => {
    const user = userEvent.setup()
    const mockOnExecute = vi.fn().mockResolvedValue([])

    render(<InteractiveCodeRunner {...defaultProps} onExecute={mockOnExecute} />)

    const runButton = screen.getByTestId('button-primary')
    await user.click(runButton)

    await waitFor(() => {
      expect(screen.getByText('> Output will appear here...')).toBeInTheDocument()
    })
  })
})