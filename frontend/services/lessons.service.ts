import api from '../lib/api';
import { Cell, Lesson, QuizAnswer } from '../types/lessons';

const isDebug = import.meta.env.VITE_MODE === 'DEBUG';

const mockLesson: Lesson = {
  id: '1',
  lessonId: '1',
  slug: 'what-is-react',
  title: 'What is React?',
  courseSlug: 'intro-to-react',
  metadata: {},
  breadcrumbs: [
    { title: 'Introduction to React', href: '#/dashboard/course/intro-to-react' },
    { title: 'What is React?', href: '#/lesson/what-is-react' },
  ],
  cells: [
    {
      id: '1',
      type: 'text',
      content: 'React is a JavaScript library for building user interfaces.',
      title: 'Introduction',
    },
    {
      id: '2',
      type: 'code',
      initialCode: 'function Hello() {\n  return <h1>Hello World!</h1>;\n}',
      language: 'javascript',
    },
    {
      id: '3',
      type: 'quiz',
      questionId: '1',
      question: 'What is React?',
      answers: [
        { id: '1', text: 'A JavaScript library', isCorrect: true },
        { id: '2', text: 'A programming language', isCorrect: false },
        { id: '3', text: 'A database', isCorrect: false },
      ],
      explanation: 'React is a JavaScript library for building user interfaces.',
    },
  ],
};

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
  if (isDebug) {
    return mockLesson;
  }

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
