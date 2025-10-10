import api from '../lib/api';
import type { ContentNode } from '../types';

export const getContentTree = async (): Promise<ContentNode[]> => {
  const response = await api.get('/admin/content-tree');
  return response.data;
};

export const getConfigFile = async (path: string): Promise<string> => {
  const response = await api.get('/admin/config-file', { params: { path } });
  return response.data;
};

export const updateConfigFile = async (path: string, content: string): Promise<void> => {
  await api.put('/admin/config-file', content, {
    params: { path },
    headers: { 'Content-Type': 'text/plain' }
  });
};

export interface CreateCourseRequest {
  title: string;
  slug: string;
  description?: string;
}

export interface CreateLessonRequest {
  title: string;
  slug: string;
  course_slug: string;
  part_slug?: string;
}

export interface CreatePartRequest {
  title: string;
  slug: string;
  course_slug: string;
}

export const createCourse = async (data: CreateCourseRequest): Promise<void> => {
  await api.post('/admin/create/course', data);
};

export const createLesson = async (data: CreateLessonRequest): Promise<void> => {
  await api.post('/admin/create/lesson', data);
};

export const createPart = async (data: CreatePartRequest): Promise<void> => {
  await api.post('/admin/create/part', data);
};

export const deleteContentItem = async (path: string): Promise<void> => {
  await api.delete('/admin/item', { params: { path } });
};