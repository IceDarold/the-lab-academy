export type CourseProgressStatus = 'not_started' | 'in-progress' | 'completed';

export interface CourseSummary {
  courseId: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  progressPercent: number;
  status: CourseProgressStatus;
}

export interface CourseLessonSummary {
  lessonId: string;
  slug: string;
  title: string;
  order?: number;
  status: CourseProgressStatus;
}

export interface CourseModuleSummary {
  title: string;
  order: number;
  lessons: CourseLessonSummary[];
}

export interface CourseDetails {
  courseId: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  overallProgressPercent: number;
  modules: CourseModuleSummary[];
}

export interface PublicCourse {
  courseId: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
}

export interface PublicCourseLesson {
  title: string;
  description: string;
  order: number;
}

export interface PublicCourseModule {
  title: string;
  order: number;
  lessons: PublicCourseLesson[];
}

export interface PublicCourseDetails extends PublicCourse {
  modules: PublicCourseModule[];
}
