export interface Lesson {
  id: number;
  slug: string;
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
  duration: string;
}

export interface SyllabusSection {
  title: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  progress: number;
  lessons: Lesson[];
}

export interface CourseStats {
  partsCompleted: number;
  partsTotal: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  progress: number;
  // FIX: Standardized to 'in-progress' with a hyphen for consistency.
  status: 'not_started' | 'in-progress' | 'completed';
  tags: string[];
  stats: CourseStats;
  syllabus: SyllabusSection[];
}