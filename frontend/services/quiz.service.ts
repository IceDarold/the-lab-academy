import api from '../src/lib/api';

interface CheckAnswerPayload {
  question_id: string;
  selected_answer_id: string;
}

interface CheckAnswerResponse {
  is_correct: boolean;
  correct_answer_id?: string;
}

const isDebug = import.meta.env.VITE_MODE === 'DEBUG';

export const checkQuizAnswer = async (
  questionId: string,
  selectedAnswerId: string
): Promise<CheckAnswerResponse> => {
  if (isDebug) {
    // In debug mode, always return correct
    return {
      is_correct: true,
    };
  }

  const payload: CheckAnswerPayload = {
    question_id: questionId,
    selected_answer_id: selectedAnswerId,
  };

  const response = await api.post('/v1/quizzes/answers/check', payload);
  return response.data;
};
