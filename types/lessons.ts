export interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

export interface BaseCell {
  id: string;
  type: 'text' | 'code' | 'quiz' | 'challenge';
}

export interface TextCell extends BaseCell {
  type: 'text';
  content: string; // This will be markdown content
  title?: string; // For ToC
}

export interface CodeCell extends BaseCell {
  type: 'code';
  initialCode: string;
}

export interface QuizCell extends BaseCell {
  type: 'quiz';
  question: string;
  answers: QuizAnswer[];
  explanation: string;
}

export interface ChallengeCell extends BaseCell {
    type: 'challenge';
    initialCode: string;
    validationCode: string; // Not used for now, but good to have
    instructions: string;
    title?: string;
}


export type Cell = TextCell | CodeCell | QuizCell | ChallengeCell;

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  breadcrumbs: { title: string; href: string; }[];
  cells: Cell[];
}
