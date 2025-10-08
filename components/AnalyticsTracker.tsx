'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '../src/hooks/useAnalytics';
import { useEffect } from 'react';

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString();
    trackEvent('PAGE_VIEW', { path: currentUrl });
  }, [pathname, searchParams, trackEvent]);

  return null;
};

export default AnalyticsTracker;