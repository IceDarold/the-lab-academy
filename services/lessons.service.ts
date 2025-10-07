import api from '../lib/api';
import { Lesson } from '../types/lessons';

export const getLessonBySlug = async (slug: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/${slug}`);
    if (response.data) {
        return response.data;
    } else {
        throw new Error(`Lesson with slug "${slug}" not found.`);
    }
};
