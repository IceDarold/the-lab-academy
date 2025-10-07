import api from '../lib/api';
import { Cell, Lesson, QuizAnswer } from '../types/lessons';

const mapQuizAnswers = (answers: any[]): QuizAnswer[] =>
  answers.map((answer: any) => ({
    id: answer.answer_id ?? answer.id,
    text: answer.text ?? '',
    isCorrect: answer.is_correct,
  }));

const mapCell = (cell: any, index: number): Cell => {
  const id = cell.id ?? `cell-${index}`;
  const type = (cell.cell_type ?? cell.type ?? 'text').toLowerCase();

  switch (type) {
    case 'code':
      return {
        id,
        type: 'code',
        initialCode: cell.content ?? cell.initial_code ?? '',
        language: cell.language,
      };
    case 'quiz':
      return {
        id,
        type: 'quiz',
        questionId: cell.question_id ?? cell.metadata?.question_id,
        question: cell.content?.question ?? cell.question ?? '',
        answers: Array.isArray(cell.answers) ? mapQuizAnswers(cell.answers) : [],
        explanation: cell.explanation,
      };
    case 'challenge':
      return {
        id,
        type: 'challenge',
        initialCode: cell.initial_code ?? cell.content ?? '',
        validationCode: cell.validation_code,
        instructions: cell.instructions ?? '',
        title: cell.title,
      };
    case 'text':
    default:
      return {
        id,
        type: 'text',
        content: typeof cell.content === 'string' ? cell.content : cell.content?.markdown ?? '',
        title: cell.metadata?.title ?? cell.title,
      };
  }
};

export const getLessonBySlug = async (slug: string): Promise<Lesson> => {
  const response = await api.get(`/v1/lessons/${slug}`);
  const data = response.data;

  if (!data) {
    throw new Error(`Lesson with slug "${slug}" not found.`);
  }

  const cells = Array.isArray(data.cells) ? data.cells.map(mapCell) : [];

  const breadcrumbs = Array.isArray(data.metadata?.breadcrumbs)
    ? data.metadata.breadcrumbs
        .map((crumb: any) => ({
          title: crumb.title ?? '',
          href: crumb.href ?? '#/',
        }))
        .filter((crumb: { title: string; href: string }) => crumb.title)
    : [
        {
          title: data.title ?? '',
          href: `#/lesson?slug=${data.slug ?? slug}`,
        },
      ];

  return {
    id: data.lesson_id ?? data.id ?? slug,
    lessonId: data.lesson_id ?? data.id ?? null,
    slug: data.slug ?? slug,
    title: data.title ?? '',
    courseSlug: data.course_slug ?? null,
    metadata: data.metadata ?? undefined,
    breadcrumbs,
    cells,
  };
};

export const getRawLessonBySlug = async (slug: string): Promise<string> => {
  const response = await api.get(`/v1/lessons/${slug}/raw`);
  return response.data;
};

export const updateRawLessonBySlug = async (slug: string, content: string): Promise<void> => {
  await api.put(`/v1/lessons/${slug}/raw`, content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
