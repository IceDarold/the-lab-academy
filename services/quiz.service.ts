import api from '../lib/api';

interface CheckAnswerPayload {
  question_id: string;
  selected_answer_id: string;
}

interface CheckAnswerResponse {
  is_correct: boolean;
  correct_answer_id?: string;
}

export const checkQuizAnswer = async (
  questionId: string,
  selectedAnswerId: string
): Promise<CheckAnswerResponse> => {
  const payload: CheckAnswerPayload = {
    question_id: questionId,
    selected_answer_id: selectedAnswerId,
  };

  const response = await api.post('/v1/quizzes/answers/check', payload);
  return response.data;
};
