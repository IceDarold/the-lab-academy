import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import CellRenderer from './CellRenderer'
import type { Cell } from '../types/lessons'

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="react-markdown">{children}</div>,
}))

// Mock remarkGfm
vi.mock('remark-gfm', () => ({
  default: vi.fn(),
}))

// Mock lazy loaded components
const MockInteractiveCodeRunner = ({ initialCode, pyodideState, onExecute }: any) => (
  <div data-testid="interactive-code-runner">
    Code: {initialCode}, State: {pyodideState}
  </div>
)

const MockQuizComponent = ({ questionId, question, answers, explanation }: any) => (
  <div data-testid="quiz-component">
    {question} - {answers?.length} answers
  </div>
)

vi.mock('./InteractiveCodeRunner', () => ({
  default: MockInteractiveCodeRunner,
}))

vi.mock('./QuizComponent', () => ({
  default: MockQuizComponent,
}))

describe('CellRenderer', () => {
  const mockOnExecute = vi.fn()

  it('should render text cell correctly', () => {
    const cell: Cell = {
      id: 'text-1',
      type: 'text',
      content: 'Hello **world**',
      title: 'Test Title',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByTestId('react-markdown')).toHaveTextContent('Hello **world**')
    expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument()
  })

  it('should render text cell without title', () => {
    const cell: Cell = {
      id: 'text-2',
      type: 'text',
      content: 'Content without title',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByTestId('react-markdown')).toHaveTextContent('Content without title')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should render code cell with InteractiveCodeRunner', async () => {
    const cell: Cell = {
      id: 'code-1',
      type: 'code',
      initialCode: 'print("hello")',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    await waitFor(() => {
      expect(screen.getByTestId('interactive-code-runner')).toBeInTheDocument()
    })
    expect(screen.getByText(/Code: print\("hello"\)/)).toBeInTheDocument()
    expect(screen.getByText(/State: ready/)).toBeInTheDocument()
  })

  it('should render quiz cell with QuizComponent', async () => {
    const cell: Cell = {
      id: 'quiz-1',
      type: 'quiz',
      question: 'What is 2+2?',
      answers: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
      ],
      explanation: 'Basic math',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    await waitFor(() => {
      expect(screen.getByTestId('quiz-component')).toBeInTheDocument()
    })
    expect(screen.getByText('What is 2+2? - 2 answers')).toBeInTheDocument()
  })

  it('should render challenge cell with Card and InteractiveCodeRunner', () => {
    const cell: Cell = {
      id: 'challenge-1',
      type: 'challenge',
      initialCode: 'def solution():',
      instructions: 'Write a function',
      title: 'Coding Challenge',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Coding Challenge')).toBeInTheDocument()
    expect(screen.getByText('Write a function')).toBeInTheDocument()
    expect(screen.getByTestId('interactive-code-runner')).toBeInTheDocument()
  })

  it('should render challenge cell without title', () => {
    const cell: Cell = {
      id: 'challenge-2',
      type: 'challenge',
      initialCode: 'code',
      instructions: 'Instructions',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Challenge')).toBeInTheDocument()
  })

  it('should render default case for unknown cell type', () => {
    const cell = {
      id: 'unknown-1',
      type: 'unknown' as any,
    }

    render(<CellRenderer cell={cell as Cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Unsupported cell type.')).toBeInTheDocument()
  })

  it('should apply correct classes for text cell', () => {
    const cell: Cell = {
      id: 'text-3',
      type: 'text',
      content: 'Content',
      title: 'Title',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    const section = screen.getByRole('heading', { name: /title/i }).closest('section')
    expect(section).toHaveClass('mb-8')
  })

  it('should apply correct classes for code cell', () => {
    const cell: Cell = {
      id: 'code-2',
      type: 'code',
      initialCode: 'code',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    const div = screen.getByTestId('interactive-code-runner').parentElement
    expect(div).toHaveClass('not-prose', 'my-12')
  })

  it('should apply correct classes for quiz cell', () => {
    const cell: Cell = {
      id: 'quiz-2',
      type: 'quiz',
      question: 'Question?',
      answers: [],
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    const div = screen.getByTestId('quiz-component').parentElement
    expect(div).toHaveClass('not-prose', 'my-12')
  })

  it('should apply correct classes for challenge cell', () => {
    const cell: Cell = {
      id: 'challenge-3',
      type: 'challenge',
      initialCode: 'code',
      instructions: 'Instructions',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    const div = screen.getByTestId('interactive-code-runner').closest('.not-prose')
    expect(div).toHaveClass('not-prose', 'my-12')
  })

  it('should render challenge with correct Card styling', () => {
    const cell: Cell = {
      id: 'challenge-4',
      type: 'challenge',
      initialCode: 'code',
      instructions: 'Instructions',
      title: 'Title',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    // Check for Card classes
    const card = screen.getByText('Instructions').closest('.bg-indigo-50')
    expect(card).toHaveClass('bg-indigo-50', 'dark:bg-indigo-900/20', 'border-indigo-200', 'dark:border-indigo-700/50', 'shadow-lg')
  })

  it('should pass correct props to InteractiveCodeRunner in code cell', () => {
    const cell: Cell = {
      id: 'code-3',
      type: 'code',
      initialCode: 'test code',
    }

    render(<CellRenderer cell={cell} pyodideState="loading" onExecute={mockOnExecute} />)

    expect(screen.getByText('Code: test code, State: loading')).toBeInTheDocument()
  })

  it('should pass correct props to InteractiveCodeRunner in challenge cell', () => {
    const cell: Cell = {
      id: 'challenge-5',
      type: 'challenge',
      initialCode: 'challenge code',
      instructions: 'Do this',
    }

    render(<CellRenderer cell={cell} pyodideState="error" onExecute={mockOnExecute} />)

    expect(screen.getByText('Code: challenge code, State: error')).toBeInTheDocument()
  })

  it('should pass correct props to QuizComponent', () => {
    const cell: Cell = {
      id: 'quiz-3',
      type: 'quiz',
      question: 'Test question?',
      answers: [{ text: 'Answer 1' }, { text: 'Answer 2' }],
      explanation: 'Explanation',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Test question? - 2 answers')).toBeInTheDocument()
  })

  it('should handle empty content in text cell', () => {
    const cell: Cell = {
      id: 'text-4',
      type: 'text',
      content: '',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByTestId('react-markdown')).toHaveTextContent('')
  })

  it('should handle empty initialCode in code cell', () => {
    const cell: Cell = {
      id: 'code-4',
      type: 'code',
      initialCode: '',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Code: , State: ready')).toBeInTheDocument()
  })

  it('should handle empty answers in quiz cell', () => {
    const cell: Cell = {
      id: 'quiz-4',
      type: 'quiz',
      question: 'Question?',
      answers: [],
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    expect(screen.getByText('Question? - 0 answers')).toBeInTheDocument()
  })

  it('should handle empty instructions in challenge cell', async () => {
    const cell: Cell = {
      id: 'challenge-6',
      type: 'challenge',
      initialCode: 'code',
      instructions: '',
    }

    render(<CellRenderer cell={cell} pyodideState="ready" onExecute={mockOnExecute} />)

    await waitFor(() => {
      expect(screen.getByTestId('interactive-code-runner')).toBeInTheDocument()
    })

    // Find the instructions paragraph and verify it's empty
    const instructionsElement = screen.getByText('Challenge').nextElementSibling as HTMLElement
    expect(instructionsElement.tagName).toBe('P')
    expect(instructionsElement.textContent).toBe('')
  })
})