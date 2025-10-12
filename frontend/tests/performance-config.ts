import { PerformanceThresholds } from './performance-helpers';

/**
 * Performance thresholds for different environments
 */
export const PERFORMANCE_THRESHOLDS: Record<string, PerformanceThresholds> = {
  development: {
    pageLoad: {
      domContentLoaded: 3000, // 3s - more lenient for dev
      loadComplete: 8000, // 8s
      firstContentfulPaint: 3000, // 3s
      largestContentfulPaint: 5000, // 5s
    },
    network: {
      maxRequests: 100, // More requests in dev
      maxTransferred: 5 * 1024 * 1024, // 5MB
    },
    api: {
      maxResponseTime: 2000, // 2s - APIs might be slower in dev
      maxFailedCalls: 1, // Allow 1 failed call
    },
    interactions: {
      maxInteractionTime: 200, // 200ms
    },
    resources: {
      maxResourceSize: 10 * 1024 * 1024, // 10MB - dev builds are larger
    },
    memory: {
      maxHeapSize: 100 * 1024 * 1024, // 100MB
    },
  },

  production: {
    pageLoad: {
      domContentLoaded: 2000, // 2s
      loadComplete: 5000, // 5s
      firstContentfulPaint: 2000, // 2s
      largestContentfulPaint: 3000, // 3s
    },
    network: {
      maxRequests: 50,
      maxTransferred: 2 * 1024 * 1024, // 2MB
    },
    api: {
      maxResponseTime: 1000, // 1s
      maxFailedCalls: 0, // No failed calls in prod
    },
    interactions: {
      maxInteractionTime: 100, // 100ms
    },
    resources: {
      maxResourceSize: 5 * 1024 * 1024, // 5MB
    },
    memory: {
      maxHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },

  ci: {
    pageLoad: {
      domContentLoaded: 2500, // 2.5s - slightly more lenient for CI
      loadComplete: 6000, // 6s
      firstContentfulPaint: 2500, // 2.5s
      largestContentfulPaint: 4000, // 4s
    },
    network: {
      maxRequests: 60,
      maxTransferred: 3 * 1024 * 1024, // 3MB
    },
    api: {
      maxResponseTime: 1500, // 1.5s
      maxFailedCalls: 0,
    },
    interactions: {
      maxInteractionTime: 150, // 150ms
    },
    resources: {
      maxResourceSize: 7 * 1024 * 1024, // 7MB
    },
    memory: {
      maxHeapSize: 75 * 1024 * 1024, // 75MB
    },
  },
};

/**
 * Performance budgets for different user flows
 */
export const PERFORMANCE_BUDGETS = {
  // Landing page
  landing: {
    pageLoad: {
      domContentLoaded: 1500,
      loadComplete: 3000,
      firstContentfulPaint: 1500,
      largestContentfulPaint: 2500,
    },
    network: {
      maxRequests: 30,
      maxTransferred: 1 * 1024 * 1024, // 1MB
    },
  },

  // Authentication flows
  login: {
    pageLoad: {
      domContentLoaded: 1000,
      loadComplete: 2000,
    },
    interactions: {
      maxInteractionTime: 500, // Login might involve API calls
    },
    api: {
      maxResponseTime: 800,
    },
  },

  register: {
    pageLoad: {
      domContentLoaded: 1200,
      loadComplete: 2500,
    },
    interactions: {
      maxInteractionTime: 600,
    },
    api: {
      maxResponseTime: 1000,
    },
  },

  // Dashboard
  dashboard: {
    pageLoad: {
      domContentLoaded: 2000,
      loadComplete: 4000,
      firstContentfulPaint: 2000,
      largestContentfulPaint: 3500,
    },
    network: {
      maxRequests: 40,
      maxTransferred: 2 * 1024 * 1024, // 2MB
    },
  },

  // Course navigation
  courseNavigation: {
    interactions: {
      maxInteractionTime: 300, // Navigation should be fast
    },
    api: {
      maxResponseTime: 500,
    },
  },

  // Lesson loading
  lessonLoading: {
    pageLoad: {
      domContentLoaded: 1800,
      loadComplete: 3500,
      firstContentfulPaint: 1800,
      largestContentfulPaint: 3000,
    },
    network: {
      maxRequests: 35,
      maxTransferred: 1.5 * 1024 * 1024, // 1.5MB
    },
    api: {
      maxResponseTime: 600,
    },
  },

  // Quiz interactions
  quizInteraction: {
    interactions: {
      maxInteractionTime: 200,
    },
    api: {
      maxResponseTime: 400,
    },
  },
};

/**
 * Get thresholds for current environment
 */
export function getCurrentThresholds(): PerformanceThresholds {
  const env = process.env.NODE_ENV || 'development';
  const ci = process.env.CI === 'true';

  if (ci) {
    return PERFORMANCE_THRESHOLDS.ci;
  }

  return PERFORMANCE_THRESHOLDS[env] || PERFORMANCE_THRESHOLDS.development;
}

/**
 * Get budget for specific user flow
 */
export function getFlowBudget(flowName: keyof typeof PERFORMANCE_BUDGETS): Partial<PerformanceThresholds> {
  return PERFORMANCE_BUDGETS[flowName];
}

/**
 * Merge base thresholds with flow-specific budget
 */
export function getThresholdsForFlow(flowName: keyof typeof PERFORMANCE_BUDGETS): PerformanceThresholds {
  const baseThresholds = getCurrentThresholds();
  const flowBudget = getFlowBudget(flowName);

  return {
    ...baseThresholds,
    ...flowBudget,
    pageLoad: {
      ...baseThresholds.pageLoad,
      ...flowBudget.pageLoad,
    },
    network: {
      ...baseThresholds.network,
      ...flowBudget.network,
    },
    api: {
      ...baseThresholds.api,
      ...flowBudget.api,
    },
    interactions: {
      ...baseThresholds.interactions,
      ...flowBudget.interactions,
    },
  };
}

/**
 * Performance test configuration
 */
export const PERFORMANCE_CONFIG = {
  // Whether to fail tests on performance violations
  failOnViolation: {
    error: true, // Always fail on errors
    warning: process.env.CI === 'true', // Fail on warnings in CI
  },

  // Performance reporting
  reporting: {
    generateReports: true,
    reportDirectory: './performance-reports',
    includeCharts: true,
    storeHistoricalData: true,
  },

  // Test configuration
  testConfig: {
    warmupIterations: 1, // Number of warmup runs before measurement
    measurementIterations: 3, // Number of measurement runs to average
    cooldownMs: 1000, // Cooldown between iterations
  },
};

/**
 * Critical performance metrics that should never be violated
 */
export const CRITICAL_METRICS = [
  'pageLoad.domContentLoaded',
  'pageLoad.loadComplete',
  'api.failedApiCalls',
  'network.failedRequests',
];

/**
 * Performance regression detection
 */
export const REGRESSION_CONFIG = {
  // Percentage threshold for considering a change a regression
  regressionThreshold: 10, // 10% degradation

  // Minimum absolute change to consider (in ms or bytes)
  minimumChangeThreshold: {
    time: 100, // 100ms
    size: 50 * 1024, // 50KB
  },

  // Historical data retention
  historyRetentionDays: 30,
  maxHistoryEntries: 100,
};