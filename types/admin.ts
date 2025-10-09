import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ContentNode {
  id: string;
  name: string;
  type: 'course' | 'part' | 'lesson' | 'config';
  status?: 'published' | 'locked' | 'draft';
  children?: ContentNode[];
  configPath?: string;
}

// --- New Lesson Types ---

export interface LessonMetadata {
  title?: string;
  slug?: string;
  status?: 'published' | 'locked' | 'draft';
  [key: string]: any;
}

export interface TextCell {
  type: 'text';
  content: string;
}

export interface CodeCell {
  type: 'code';
  language?: string;
  initialCode?: string;
}

export interface QuizCell {
  type: 'quiz';
  question?: string;
  options?: string[];
  correctAnswer?: number;
}

export interface UnknownCell {
    type: 'unknown';
    data: Record<string, any>;
    rawContent: string;
}

export type LessonCell = TextCell | CodeCell | QuizCell | UnknownCell;

export interface ParsedLesson {
  metadata: LessonMetadata;
  cells: LessonCell[];
}