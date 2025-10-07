import api from '../lib/api';
import {
  CourseDetails,
  CourseLessonSummary,
  CourseModuleSummary,
  CourseProgressStatus,
  CourseSummary,
  PublicCourse,
  PublicCourseDetails,
} from '../types/courses';

const normalizeStatus = (status?: string, progress?: number): CourseProgressStatus => {
  if (status === 'completed') {
    return 'completed';
  }
  if (status === 'in_progress' || status === 'in-progress') {
    return 'in-progress';
  }
  if (status === 'not_started' || status === 'not-started') {
    return 'not_started';
  }

  if (typeof progress === 'number') {
    if (progress >= 100) {
      return 'completed';
    }
    if (progress > 0) {
      return 'in-progress';
    }
  }

  return 'not_started';
};

export const getMyCourses = async (): Promise<CourseSummary[]> => {
  const response = await api.get('/v1/dashboard/my-courses');
  const courses = Array.isArray(response.data) ? response.data : [];

  return courses.map((course: any) => {
    const progressPercent =
      typeof course.progress_percent === 'number' ? Math.round(course.progress_percent) : 0;

    return {
      courseId: course.course_id ?? course.id ?? '',
      slug: course.slug ?? '',
      title: course.title ?? '',
      description: course.description ?? '',
      coverImageUrl: course.cover_image_url ?? '',
      progressPercent,
      status: normalizeStatus(course.status, progressPercent),
    };
  });
};

const mapLesson = (lesson: any): CourseLessonSummary => ({
  lessonId: lesson.lesson_id ?? lesson.id ?? '',
  slug: lesson.slug ?? '',
  title: lesson.title ?? '',
  order: typeof lesson.order === 'number' ? lesson.order : undefined,
  status: normalizeStatus(lesson.status),
});

const mapModule = (module: any): CourseModuleSummary => ({
  title: module.title ?? '',
  order: typeof module.order === 'number' ? module.order : 0,
  lessons: Array.isArray(module.lessons) ? module.lessons.map(mapLesson) : [],
});

export const getCourseDetails = async (slug: string): Promise<CourseDetails> => {
  const response = await api.get(`/v1/dashboard/courses/${slug}`);
  const data = response.data ?? {};

  return {
    courseId: data.course_id ?? data.id ?? '',
    slug: data.slug ?? slug,
    title: data.title ?? '',
    description: data.description ?? '',
    coverImageUrl: data.cover_image_url ?? '',
    overallProgressPercent:
      typeof data.overall_progress_percent === 'number'
        ? Math.round(data.overall_progress_percent)
        : 0,
    modules: Array.isArray(data.modules) ? data.modules.map(mapModule) : [],
  };
};

export const completeLesson = async (lessonId: string): Promise<number | undefined> => {
  if (!lessonId) {
    throw new Error('Lesson identifier is required to complete a lesson.');
  }
  const response = await api.post(`/v1/lessons/${lessonId}/complete`);
  return response.data?.new_course_progress_percent;
};

export const listPublicCourses = async (params?: { limit?: number; offset?: number }): Promise<PublicCourse[]> => {
  const response = await api.get('/v1/courses', { params });
  const courses = Array.isArray(response.data) ? response.data : [];

  return courses.map((course: any) => ({
    courseId: course.course_id ?? course.id ?? '',
    slug: course.slug ?? '',
    title: course.title ?? '',
    description: course.description ?? '',
    coverImageUrl: course.cover_image_url ?? '',
  }));
};

export const getPublicCourseDetails = async (slug: string): Promise<PublicCourseDetails> => {
  const response = await api.get(`/v1/courses/${slug}`);
  const data = response.data ?? {};

  return {
    courseId: data.course_id ?? data.id ?? '',
    slug: data.slug ?? slug,
    title: data.title ?? '',
    description: data.description ?? '',
    coverImageUrl: data.cover_image_url ?? '',
    modules: Array.isArray(data.modules)
      ? data.modules.map((module: any) => ({
          title: module.title ?? '',
          order: typeof module.order === 'number' ? module.order : 0,
          lessons: Array.isArray(module.lessons)
            ? module.lessons.map((lesson: any) => ({
                title: lesson.title ?? '',
                description: lesson.description ?? '',
                order: typeof lesson.order === 'number' ? lesson.order : 0,
              }))
            : [],
        }))
      : [],
  };
};

export const enrollInCourse = async (slug: string): Promise<void> => {
  if (!slug) {
    throw new Error('Course slug is required to enroll.');
  }
  await api.post(`/v1/courses/${slug}/enroll`);
};
