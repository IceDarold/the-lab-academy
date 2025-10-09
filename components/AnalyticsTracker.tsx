'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '../src/hooks/useAnalytics';
import { useEffect } from 'react';

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    let queryString = '';
    for (const [key, value] of searchParams.entries()) {
      if (queryString) queryString += '&';
      queryString += encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
    const currentUrl = pathname + queryString;
    trackEvent('PAGE_VIEW', { path: currentUrl });
  }, [pathname, searchParams, trackEvent]);

  return null;
};

export default AnalyticsTracker;