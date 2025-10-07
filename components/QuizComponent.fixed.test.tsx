import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizComponent from './QuizComponent'
import { checkQuizAnswer } from '../services/quiz.service'

// Mock the quiz service
vi.mock('../services/quiz.service', () => ({
  checkQuizAnswer: vi.fn(),
}))

const mockCheckQuizAnswer = vi.mocked(checkQuizAnswer)

describe('QuizComponent - Fixed Tests', () => {
  const mockAnswers = [
    { id: 'answer-1', text: 'Option A', isCorrect: false },
    { id: 'answer-2', text: 'Option B', isCorrect: true },
    { id: 'answer-3', text: 'Option C', isCorrect: false },
  ]

  const defaultProps = {
    questionId: 'question-1',
    question: 'What is the capital of France?',
    answers: mockAnswers,
    explanation: 'Paris is the capital and most populous city of France.',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render question and answers', () => {
    render(<QuizComponent {...defaultProps} />)

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('should show check answer button initially', () => {
    render(<QuizComponent {...defaultProps} />)

    expect(screen.getByText('Check Answer')).toBeInTheDocument()
  })

  it('should disable check answer button when no answer is selected', () => {
    render(<QuizComponent {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    expect(checkButton).toBeDisabled()
  })

  it('should enable check answer button when answer is selected', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    expect(checkButton).toBeDisabled()

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    expect(checkButton).not.toBeDisabled()
  })

  it('should show correct answer styling when answer is correct', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: true,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionB = screen.getByText('Option B')
    await user.click(optionB)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    // Check correct answer styling
    const correctButton = optionB.closest('button')
    expect(correctButton).toHaveClass('bg-green-100', 'dark:bg-green-900/40', 'border-green-300')
  })

  it('should show X icon for incorrect selected answers', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: false,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Not quite.')).toBeInTheDocument()
    })

    // Should have both check (for correct) and X (for incorrect) icons
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBe(2)
  })

  it('should render explanation after submission', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: true,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionB = screen.getByText('Option B')
    await user.click(optionB)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Paris is the capital and most populous city of France.')).toBeInTheDocument()
    })
  })
})