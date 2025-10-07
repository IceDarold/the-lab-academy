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

export const getRawLessonBySlug = async (slug: string): Promise<string> => {
    const response = await api.get(`/lessons/${slug}/raw`);
    // Raw text response
    return response.data;
};

export const updateRawLessonBySlug = async (slug: string, content: string): Promise<void> => {
    // We send plain text, so we set the content-type header
    await api.put(`/lessons/${slug}/raw`, content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
};
