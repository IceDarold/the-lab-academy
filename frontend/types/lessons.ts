export interface QuizAnswer {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

export interface BaseCell {
  id: string;
  type: 'text' | 'code' | 'quiz' | 'challenge';
}

export interface TextCell extends BaseCell {
  type: 'text';
  content: string;
  title?: string;
}

export interface CodeCell extends BaseCell {
  type: 'code';
  initialCode: string;
  language?: string;
}

export interface QuizCell extends BaseCell {
  type: 'quiz';
  questionId?: string;
  question: string;
  answers: QuizAnswer[];
  explanation?: string;
}

export interface ChallengeCell extends BaseCell {
  type: 'challenge';
  initialCode: string;
  validationCode?: string;
  instructions: string;
  title?: string;
}

export type Cell = TextCell | CodeCell | QuizCell | ChallengeCell;

export interface LessonBreadcrumb {
  title: string;
  href: string;
}

export interface Lesson {
  id: string;
  lessonId: string | null;
  slug: string;
  title: string;
  courseSlug: string | null;
  metadata?: Record<string, unknown>;
  breadcrumbs: LessonBreadcrumb[];
  cells: Cell[];
}
