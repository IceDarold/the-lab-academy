import api from '../lib/api';
import type { ComparisonActivityData } from '../../components/admin-components/admin/users/mock-chart-data';

export type ActivityType = string;

export const trackEvent = async (activity_type: ActivityType, details: Record<string, any>): Promise<void> => {
  try {
    await api.post('/activity-log', { activity_type, details });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

export const getUserActivityLog = async (userId: string): Promise<ComparisonActivityData[]> => {
  const response = await api.get(`/admin/users/${userId}/activity-log`);
  return response.data;
};
