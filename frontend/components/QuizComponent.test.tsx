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

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}))

describe('QuizComponent', () => {
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

  it('should render explanation when provided', () => {
    render(<QuizComponent {...defaultProps} />)

    expect(screen.getByText('Paris is the capital and most populous city of France.')).toBeInTheDocument()
  })

  it('should not render explanation when not provided', () => {
    render(<QuizComponent {...defaultProps} explanation={undefined} />)

    expect(screen.queryByText('Paris is the capital and most populous city of France.')).not.toBeInTheDocument()
  })

  it('should allow answer selection', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    // Check that the selected answer has the correct styling
    const selectedButton = optionA.closest('button')
    expect(selectedButton).toHaveClass('bg-indigo-50', 'dark:bg-indigo-900/30', 'border-indigo-500')
  })

  it('should only allow one answer to be selected at a time', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    const optionB = screen.getByText('Option B')

    await user.click(optionA)
    expect(optionA.closest('button')).toHaveClass('border-indigo-500')

    await user.click(optionB)
    expect(optionA.closest('button')).not.toHaveClass('border-indigo-500')
    expect(optionB.closest('button')).toHaveClass('border-indigo-500')
  })

  it('should show check answer button when answer is selected', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const checkButton = screen.getByText('Check Answer')
    expect(checkButton).toBeInTheDocument()

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    expect(screen.getByText('Check Answer')).toBeInTheDocument()
  })

  it('should disable check answer button when no answer is selected', () => {
    render(<QuizComponent {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    expect(checkButton).toBeDisabled()
  })

  it('should disable check answer button when checking', async () => {
    const user = userEvent.setup()

    // Mock a slow API call
    mockCheckQuizAnswer.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    const checkButton = screen.getByRole('button', { name: /check answer/i })
    await user.click(checkButton)

    // Wait for the button text to change to "Checking…"
    await waitFor(() => {
      expect(screen.getByText('Checking…')).toBeInTheDocument()
    })

    const checkingButton = screen.getByText('Checking…')
    expect(checkingButton.closest('button')).toBeDisabled()
  })

  it('should disable all answer buttons when submitted', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText('Check Answer')).not.toBeInTheDocument()
    })

    // All answer buttons should be disabled
    const answerButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Option')
    )
    answerButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
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

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    // Check correct answer styling
    const correctButton = optionB.closest('button')
    expect(correctButton).toHaveClass('bg-green-100', 'dark:bg-green-900/40', 'border-green-300')
  })

  it('should show incorrect answer styling when answer is wrong', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: false,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Not quite.')).toBeInTheDocument()
    })

    // Check incorrect answer styling
    const selectedButton = optionA.closest('button')
    expect(selectedButton).toHaveClass('bg-red-100', 'dark:bg-red-900/40', 'border-red-300')

    // Check correct answer styling
    const correctButton = screen.getByText('Option B').closest('button')
    expect(correctButton).toHaveClass('bg-green-100', 'dark:bg-green-900/40', 'border-green-300')
  })

  it('should show check icon for correct answers', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: true,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionB = screen.getByText('Option B')
    await user.click(optionB)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      const checkIcon = document.querySelector('svg')
      expect(checkIcon).toBeInTheDocument()
    })
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

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      // Should have both check (for correct) and X (for incorrect) icons
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBe(2)
    })
  })

  it('should show explanation after submission', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: true,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    const optionB = screen.getByText('Option B')
    await user.click(optionB)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Paris is the capital and most populous city of France.')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockCheckQuizAnswer.mockRejectedValue(new Error('Network error'))

    render(<QuizComponent {...defaultProps} />)

    const optionA = screen.getByText('Option A')
    await user.click(optionA)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Quiz answer verification failed', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should work without questionId (client-side validation)', async () => {
    const user = userEvent.setup()

    render(<QuizComponent {...defaultProps} questionId={undefined} />)

    const optionB = screen.getByText('Option B') // Correct answer
    await user.click(optionB)

    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    // Should not call API
    expect(mockCheckQuizAnswer).not.toHaveBeenCalled()
  })

  it('should handle answers without IDs gracefully', () => {
    const answersWithoutIds = [
      { text: 'Option A', isCorrect: false },
      { text: 'Option B', isCorrect: true },
    ]

    render(<QuizComponent
      questionId="question-1"
      question="Test question"
      answers={answersWithoutIds}
    />)

    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('should apply correct styling classes for different states', async () => {
    const user = userEvent.setup()

    mockCheckQuizAnswer.mockResolvedValue({
      is_correct: false,
      correct_answer_id: 'answer-2',
    })

    render(<QuizComponent {...defaultProps} />)

    // Initial state
    const optionA = screen.getByText('Option A')
    let buttonA = optionA.closest('button')
    expect(buttonA).toHaveClass('bg-white', 'dark:bg-gray-800', 'border-gray-300')

    // Selected state
    await user.click(optionA)
    buttonA = optionA.closest('button')
    expect(buttonA).toHaveClass('bg-indigo-50', 'dark:bg-indigo-900/30', 'border-indigo-500')

    // After submission - incorrect
    const checkButton = screen.getByText('Check Answer')
    await user.click(checkButton)

    await waitFor(() => {
      buttonA = screen.getByText('Option A').closest('button')
      expect(buttonA).toHaveClass('bg-red-100', 'dark:bg-red-900/40', 'border-red-300')
    })
  })

  it('should render in Card component', () => {
    render(<QuizComponent {...defaultProps} />)

    // Check if Card wrapper is present
    const card = document.querySelector('.rounded-lg')
    expect(card).toBeInTheDocument()
  })

  it('should handle empty answers array', () => {
    render(<QuizComponent
      questionId="question-1"
      question="Test question"
      answers={[]}
    />)

    expect(screen.getByText('Test question')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /option/i })).not.toBeInTheDocument()
  })

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()
    render(<QuizComponent {...defaultProps} />)

    const firstOption = screen.getByText('Option A')
    const button = firstOption.closest('button')

    // Focus on button
    button?.focus()
    expect(button).toHaveFocus()

    // Select with Enter
    await user.keyboard('{Enter}')
    expect(button).toHaveClass('border-indigo-500')
  })
})