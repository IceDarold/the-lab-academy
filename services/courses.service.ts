import api from '../lib/api';
import { Course } from '../types/courses';

export const getMyCourses = async (): Promise<Course[]> => {
  const response = await api.get('/dashboard/my-courses');
  return response.data;
};

export const getCourseDetails = async (slug: string): Promise<Course | undefined> => {
  const response = await api.get(`/courses/${slug}`);
  return response.data;
};

export const getLessonNavigation = async (lessonSlug: string): Promise<{ previousLessonSlug: string | null; nextLessonSlug: string | null }> => {
  const response = await api.get(`/lessons/${lessonSlug}/navigation`);
  return response.data;
};

export const completeLesson = async (lessonSlug: string): Promise<void> => {
  await api.post(`/lessons/${lessonSlug}/complete`);
};
