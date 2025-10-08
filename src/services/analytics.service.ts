import api from '../../lib/api';

export type ActivityType = string;

export const trackEvent = async (activity_type: ActivityType, details: Record<string, any>): Promise<void> => {
  try {
    await api.post('/activity-log', { activity_type, details });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};