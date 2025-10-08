import { trackEvent } from '../services/analytics.service';

export const useAnalytics = () => {
  return { trackEvent };
};