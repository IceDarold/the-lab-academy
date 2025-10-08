import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Card from './Card';
import Button from './Button';
import { checkQuizAnswer } from '../services/quiz.service';
import { useAnalytics } from '../src/hooks/useAnalytics';

export interface QuizAnswerOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizComponentProps {
  questionId?: string;
  question: string;
  answers: QuizAnswerOption[];
  explanation?: string;
  lessonSlug: string;
}

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
      clipRule="evenodd"
    />
  </svg>
);

const QuizComponent: React.FC<QuizComponentProps> = ({ questionId, question, answers, explanation, lessonSlug }) => {
  const { trackEvent } = useAnalytics();
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<string | null>(null);

  const answersWithFallbackIds = useMemo(
    () =>
      answers.map((answer, index) => ({
        ...answer,
        id: answer.id ?? `answer-${index}`,
      })),
    [answers]
  );

  const selectedAnswer =
    selectedAnswerIndex !== null ? answersWithFallbackIds[selectedAnswerIndex] : null;

  const handleSelectAnswer = (index: number) => {
    if (isSubmitted || isChecking) {
      return;
    }
    setSelectedAnswerIndex(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswerIndex === null) {
      return;
    }

    const selected = answersWithFallbackIds[selectedAnswerIndex];

    if (questionId && selected.id) {
      setIsChecking(true);
      try {
        const response = await checkQuizAnswer(questionId, selected.id);
        setIsCorrect(response.is_correct);
        setCorrectAnswerId(response.correct_answer_id ?? null);
        trackEvent('QUIZ_ATTEMPT', { lesson_slug: lessonSlug, question_id: questionId, is_correct: response.is_correct });
      } catch (error) {
        console.error('Quiz answer verification failed', error);
        toast.error('Could not verify your answer. Please try again.');
        setIsCorrect(null);
        setCorrectAnswerId(null);
      } finally {
        setIsChecking(false);
        setIsSubmitted(true);
      }
      return;
    }

    setIsCorrect(Boolean(selected.isCorrect));
    setCorrectAnswerId(
      selected.isCorrect ? selected.id ?? null : answersWithFallbackIds.find((a) => a.isCorrect)?.id ?? null
    );
    trackEvent('QUIZ_ATTEMPT', { lesson_slug: lessonSlug, question_id: questionId, is_correct: Boolean(selected.isCorrect) });
    setIsSubmitted(true);
  };

  const isAnswerCorrect = (index: number) => {
    const answer = answersWithFallbackIds[index];
    if (correctAnswerId) {
      return answer.id === correctAnswerId;
    }
    return Boolean(answer.isCorrect);
  };

  const getAnswerClasses = (index: number) => {
    const baseClasses =
      'w-full text-left p-4 my-2 border rounded-lg transition-all duration-200 flex items-center';

    if (isSubmitted) {
      const isSelected = index === selectedAnswerIndex;
      const isCorrectAnswer = isAnswerCorrect(index);

      if (isCorrectAnswer) {
        return `${baseClasses} bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 cursor-not-allowed`;
      }
      if (isSelected) {
        return `${baseClasses} bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 cursor-not-allowed`;
      }
      return `${baseClasses} bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed`;
    }

    if (selectedAnswerIndex === index) {
      return `${baseClasses} bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700 text-gray-900 dark:text-gray-100`;
    }

    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500`;
  };

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-6">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question}</p>
        <div className="mt-4">
          {answersWithFallbackIds.map((answer, index) => (
            <button
              key={answer.id}
              disabled={isSubmitted || isChecking}
              onClick={() => handleSelectAnswer(index)}
              className={getAnswerClasses(index)}
            >
              <span className="font-medium flex-grow">{answer.text}</span>
              {isSubmitted && isAnswerCorrect(index) && <CheckIcon />}
              {isSubmitted && index === selectedAnswerIndex && !isAnswerCorrect(index) && <XMarkIcon />}
            </button>
          ))}
        </div>
        {!isSubmitted && (
          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswerIndex === null || isChecking}
              className="w-full sm:w-auto"
            >
              {isChecking ? 'Checking…' : 'Check Answer'}
            </Button>
          </div>
        )}
      </div>

      {isSubmitted && (
        <div
          className={`p-6 border-t ${
            isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <h3
            className={`text-lg font-bold flex items-center ${
              isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}
          >
            {isCorrect ? <CheckIcon /> : <XMarkIcon />}
            <span className="ml-2">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
          </h3>
          {explanation && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{explanation}</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default QuizComponent;
