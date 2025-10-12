import { Page, BrowserContext } from '@playwright/test';

/**
 * Performance metrics collected during test execution
 */
export interface PerformanceMetrics {
  // Page load metrics
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
  };

  // Network metrics
  network: {
    totalRequests: number;
    totalTransferred: number;
    cachedRequests: number;
    failedRequests: number;
    requestBreakdown: {
      html: number;
      css: number;
      js: number;
      images: number;
      fonts: number;
      other: number;
    };
  };

  // API metrics
  api: {
    totalApiCalls: number;
    averageResponseTime: number;
    slowestApiCall: {
      url: string;
      duration: number;
    };
    failedApiCalls: number;
  };

  // UI interaction metrics
  interactions: {
    totalInteractions: number;
    averageInteractionTime: number;
    slowestInteraction: {
      type: string;
      duration: number;
    };
  };

  // Resource loading metrics
  resources: {
    totalResources: number;
    totalResourceSize: number;
    averageResourceLoadTime: number;
    resourceBreakdown: {
      js: { count: number; size: number; loadTime: number };
      css: { count: number; size: number; loadTime: number };
      images: { count: number; size: number; loadTime: number };
      fonts: { count: number; size: number; loadTime: number };
    };
  };

  // Memory metrics
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };

  // Timing data
  timing: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

/**
 * Performance thresholds and budgets
 */
export interface PerformanceThresholds {
  pageLoad: {
    domContentLoaded: number; // ms
    loadComplete: number; // ms
    firstContentfulPaint: number; // ms
    largestContentfulPaint: number; // ms
  };
  network: {
    maxRequests: number;
    maxTransferred: number; // bytes
  };
  api: {
    maxResponseTime: number; // ms
    maxFailedCalls: number;
  };
  interactions: {
    maxInteractionTime: number; // ms
  };
  resources: {
    maxResourceSize: number; // bytes
  };
  memory: {
    maxHeapSize: number; // bytes
  };
}

/**
 * Default performance thresholds
 */
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
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
    maxFailedCalls: 0,
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
};

/**
 * Performance testing helpers for E2E tests
 */
export class PerformanceHelpers {
  private page: Page;
  private context: BrowserContext;
  private startTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};
  private interactionTimings: Array<{ type: string; start: number; end: number }> = [];
  private apiCallTimings: Array<{ url: string; start: number; end: number; status: number }> = [];

  constructor(page: Page, context?: BrowserContext) {
    this.page = page;
    this.context = context || page.context();
  }

  /**
   * Start performance measurement session
   */
  async startMeasurement(): Promise<void> {
    this.startTime = Date.now();
    this.metrics = {};
    this.interactionTimings = [];
    this.apiCallTimings = [];

    // Enable performance monitoring
    await this.page.evaluate(() => {
      // Clear any existing performance marks
      if ('performance' in window && performance.clearMarks) {
        performance.clearMarks();
      }
      if ('performance' in window && performance.clearMeasures) {
        performance.clearMeasures();
      }
    });

    // Start monitoring network requests
    this.context.on('request', (request) => {
      if (request.url().includes('/api/')) {
        this.apiCallTimings.push({
          url: request.url(),
          start: Date.now(),
          end: 0,
          status: 0,
        });
      }
    });

    this.context.on('response', (response) => {
      const apiCall = this.apiCallTimings.find(call => call.url === response.url());
      if (apiCall) {
        apiCall.end = Date.now();
        apiCall.status = response.status();
      }
    });
  }

  /**
   * Stop performance measurement and collect metrics
   */
  async stopMeasurement(): Promise<PerformanceMetrics> {
    const endTime = Date.now();

    // Collect page load metrics
    const pageLoadMetrics = await this.collectPageLoadMetrics();

    // Collect network metrics
    const networkMetrics = await this.collectNetworkMetrics();

    // Collect API metrics
    const apiMetrics = this.collectApiMetrics();

    // Collect interaction metrics
    const interactionMetrics = this.collectInteractionMetrics();

    // Collect resource metrics
    const resourceMetrics = await this.collectResourceMetrics();

    // Collect memory metrics
    const memoryMetrics = await this.collectMemoryMetrics();

    this.metrics = {
      pageLoad: pageLoadMetrics,
      network: networkMetrics,
      api: apiMetrics,
      interactions: interactionMetrics,
      resources: resourceMetrics,
      memory: memoryMetrics,
      timing: {
        startTime: this.startTime,
        endTime,
        duration: endTime - this.startTime,
      },
    };

    return this.metrics as PerformanceMetrics;
  }

  /**
   * Measure time for a specific user interaction
   */
  async measureInteraction<T>(
    interactionType: string,
    interactionFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    const result = await interactionFn();
    const end = Date.now();

    this.interactionTimings.push({
      type: interactionType,
      start,
      end,
    });

    return result;
  }

  /**
   * Collect page load performance metrics
   */
  private async collectPageLoadMetrics() {
    const timing = await this.page.evaluate(() => {
      const perf = performance.timing;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        loadComplete: perf.loadEventEnd - perf.navigationStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        largestContentfulPaint: lcpEntries[0]?.startTime,
      };
    });

    return timing;
  }

  /**
   * Collect network request metrics
   */
  private async collectNetworkMetrics() {
    const requests = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const navigation = performance.getEntriesByType('navigation')[0];

      let totalTransferred = 0;
      let cachedRequests = 0;
      let failedRequests = 0;
      const breakdown = {
        html: 0,
        css: 0,
        js: 0,
        images: 0,
        fonts: 0,
        other: 0,
      };

      entries.forEach((entry: any) => {
        if (entry.transferSize !== undefined) {
          totalTransferred += entry.transferSize;

          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            cachedRequests++;
          }
        }

        if (entry.responseEnd === 0) {
          failedRequests++;
        }

        // Categorize by resource type
        const url = entry.name.toLowerCase();
        if (url.includes('.html') || entry.initiatorType === 'navigation') {
          breakdown.html++;
        } else if (url.includes('.css') || entry.initiatorType === 'link') {
          breakdown.css++;
        } else if (url.includes('.js') || entry.initiatorType === 'script') {
          breakdown.js++;
        } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)/.test(url) || entry.initiatorType === 'img') {
          breakdown.images++;
        } else if (/\.(woff|woff2|ttf|eot)/.test(url)) {
          breakdown.fonts++;
        } else {
          breakdown.other++;
        }
      });

      return {
        totalRequests: entries.length + 1, // +1 for main document
        totalTransferred,
        cachedRequests,
        failedRequests,
        requestBreakdown: breakdown,
      };
    });

    return requests;
  }

  /**
   * Collect API call metrics
   */
  private collectApiMetrics() {
    const totalApiCalls = this.apiCallTimings.length;
    const successfulCalls = this.apiCallTimings.filter(call => call.status >= 200 && call.status < 300);
    const failedCalls = this.apiCallTimings.filter(call => call.status >= 400 || call.status === 0);

    const responseTimes = successfulCalls.map(call => call.end - call.start);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const slowestCall = successfulCalls.reduce((slowest, current) => {
      const duration = current.end - current.start;
      return duration > (slowest.end - slowest.start) ? current : slowest;
    }, successfulCalls[0]);

    return {
      totalApiCalls,
      averageResponseTime,
      slowestApiCall: slowestCall ? {
        url: slowestCall.url,
        duration: slowestCall.end - slowestCall.start,
      } : { url: '', duration: 0 },
      failedApiCalls: failedCalls.length,
    };
  }

  /**
   * Collect UI interaction metrics
   */
  private collectInteractionMetrics() {
    const totalInteractions = this.interactionTimings.length;
    const durations = this.interactionTimings.map(timing => timing.end - timing.start);
    const averageInteractionTime = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const slowestInteraction = this.interactionTimings.reduce((slowest, current) => {
      const duration = current.end - current.start;
      return duration > (slowest.end - slowest.start) ? current : slowest;
    }, this.interactionTimings[0]);

    return {
      totalInteractions,
      averageInteractionTime,
      slowestInteraction: slowestInteraction ? {
        type: slowestInteraction.type,
        duration: slowestInteraction.end - slowestInteraction.start,
      } : { type: '', duration: 0 },
    };
  }

  /**
   * Collect resource loading metrics
   */
  private async collectResourceMetrics() {
    const resources = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');

      let totalSize = 0;
      let totalLoadTime = 0;
      const breakdown = {
        js: { count: 0, size: 0, loadTime: 0 },
        css: { count: 0, size: 0, loadTime: 0 },
        images: { count: 0, size: 0, loadTime: 0 },
        fonts: { count: 0, size: 0, loadTime: 0 },
      };

      entries.forEach((entry: any) => {
        const duration = entry.responseEnd - entry.requestStart;
        const size = entry.transferSize || entry.decodedBodySize || 0;

        totalSize += size;
        totalLoadTime += duration;

        const url = entry.name.toLowerCase();
        if (url.includes('.js') || entry.initiatorType === 'script') {
          breakdown.js.count++;
          breakdown.js.size += size;
          breakdown.js.loadTime += duration;
        } else if (url.includes('.css') || entry.initiatorType === 'link') {
          breakdown.css.count++;
          breakdown.css.size += size;
          breakdown.css.loadTime += duration;
        } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)/.test(url) || entry.initiatorType === 'img') {
          breakdown.images.count++;
          breakdown.images.size += size;
          breakdown.images.loadTime += duration;
        } else if (/\.(woff|woff2|ttf|eot)/.test(url)) {
          breakdown.fonts.count++;
          breakdown.fonts.size += size;
          breakdown.fonts.loadTime += duration;
        }
      });

      return {
        totalResources: entries.length,
        totalResourceSize: totalSize,
        averageResourceLoadTime: entries.length > 0 ? totalLoadTime / entries.length : 0,
        resourceBreakdown: breakdown,
      };
    });

    return resources;
  }

  /**
   * Collect memory usage metrics
   */
  private async collectMemoryMetrics() {
    const memory = await this.page.evaluate(() => {
      // @ts-ignore - performance.memory is not in types but available in Chrome
      const mem = performance.memory;
      return mem ? {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      } : {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      };
    });

    return memory;
  }

  /**
   * Validate metrics against thresholds
   */
  validateThresholds(metrics: PerformanceMetrics, thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS): PerformanceValidationResult {
    const violations: PerformanceViolation[] = [];

    // Page load validations
    if (metrics.pageLoad.domContentLoaded > thresholds.pageLoad.domContentLoaded) {
      violations.push({
        category: 'pageLoad',
        metric: 'domContentLoaded',
        actual: metrics.pageLoad.domContentLoaded,
        threshold: thresholds.pageLoad.domContentLoaded,
        severity: 'error',
      });
    }

    if (metrics.pageLoad.loadComplete > thresholds.pageLoad.loadComplete) {
      violations.push({
        category: 'pageLoad',
        metric: 'loadComplete',
        actual: metrics.pageLoad.loadComplete,
        threshold: thresholds.pageLoad.loadComplete,
        severity: 'error',
      });
    }

    if (metrics.pageLoad.firstContentfulPaint && metrics.pageLoad.firstContentfulPaint > thresholds.pageLoad.firstContentfulPaint) {
      violations.push({
        category: 'pageLoad',
        metric: 'firstContentfulPaint',
        actual: metrics.pageLoad.firstContentfulPaint,
        threshold: thresholds.pageLoad.firstContentfulPaint,
        severity: 'warning',
      });
    }

    if (metrics.pageLoad.largestContentfulPaint && metrics.pageLoad.largestContentfulPaint > thresholds.pageLoad.largestContentfulPaint) {
      violations.push({
        category: 'pageLoad',
        metric: 'largestContentfulPaint',
        actual: metrics.pageLoad.largestContentfulPaint,
        threshold: thresholds.pageLoad.largestContentfulPaint,
        severity: 'warning',
      });
    }

    // Network validations
    if (metrics.network.totalRequests > thresholds.network.maxRequests) {
      violations.push({
        category: 'network',
        metric: 'totalRequests',
        actual: metrics.network.totalRequests,
        threshold: thresholds.network.maxRequests,
        severity: 'warning',
      });
    }

    if (metrics.network.totalTransferred > thresholds.network.maxTransferred) {
      violations.push({
        category: 'network',
        metric: 'totalTransferred',
        actual: metrics.network.totalTransferred,
        threshold: thresholds.network.maxTransferred,
        severity: 'error',
      });
    }

    // API validations
    if (metrics.api.averageResponseTime > thresholds.api.maxResponseTime) {
      violations.push({
        category: 'api',
        metric: 'averageResponseTime',
        actual: metrics.api.averageResponseTime,
        threshold: thresholds.api.maxResponseTime,
        severity: 'error',
      });
    }

    if (metrics.api.failedApiCalls > thresholds.api.maxFailedCalls) {
      violations.push({
        category: 'api',
        metric: 'failedApiCalls',
        actual: metrics.api.failedApiCalls,
        threshold: thresholds.api.maxFailedCalls,
        severity: 'error',
      });
    }

    // Interaction validations
    if (metrics.interactions.averageInteractionTime > thresholds.interactions.maxInteractionTime) {
      violations.push({
        category: 'interactions',
        metric: 'averageInteractionTime',
        actual: metrics.interactions.averageInteractionTime,
        threshold: thresholds.interactions.maxInteractionTime,
        severity: 'warning',
      });
    }

    // Resource validations
    if (metrics.resources.totalResourceSize > thresholds.resources.maxResourceSize) {
      violations.push({
        category: 'resources',
        metric: 'totalResourceSize',
        actual: metrics.resources.totalResourceSize,
        threshold: thresholds.resources.maxResourceSize,
        severity: 'warning',
      });
    }

    // Memory validations
    if (metrics.memory.usedJSHeapSize > thresholds.memory.maxHeapSize) {
      violations.push({
        category: 'memory',
        metric: 'usedJSHeapSize',
        actual: metrics.memory.usedJSHeapSize,
        threshold: thresholds.memory.maxHeapSize,
        severity: 'warning',
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      summary: {
        totalViolations: violations.length,
        errorCount: violations.filter(v => v.severity === 'error').length,
        warningCount: violations.filter(v => v.severity === 'warning').length,
      },
    };
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics, validation?: PerformanceValidationResult): string {
    const report = [
      '# Performance Test Report',
      `Test Duration: ${metrics.timing.duration}ms`,
      '',
      '## Page Load Metrics',
      `- DOM Content Loaded: ${metrics.pageLoad.domContentLoaded}ms`,
      `- Load Complete: ${metrics.pageLoad.loadComplete}ms`,
      metrics.pageLoad.firstPaint ? `- First Paint: ${metrics.pageLoad.firstPaint}ms` : '',
      metrics.pageLoad.firstContentfulPaint ? `- First Contentful Paint: ${metrics.pageLoad.firstContentfulPaint}ms` : '',
      metrics.pageLoad.largestContentfulPaint ? `- Largest Contentful Paint: ${metrics.pageLoad.largestContentfulPaint}ms` : '',
      '',
      '## Network Metrics',
      `- Total Requests: ${metrics.network.totalRequests}`,
      `- Total Transferred: ${(metrics.network.totalTransferred / 1024).toFixed(2)} KB`,
      `- Cached Requests: ${metrics.network.cachedRequests}`,
      `- Failed Requests: ${metrics.network.failedRequests}`,
      '',
      '## API Metrics',
      `- Total API Calls: ${metrics.api.totalApiCalls}`,
      `- Average Response Time: ${metrics.api.averageResponseTime.toFixed(2)}ms`,
      `- Failed API Calls: ${metrics.api.failedApiCalls}`,
      metrics.api.slowestApiCall.url ? `- Slowest API Call: ${metrics.api.slowestApiCall.url} (${metrics.api.slowestApiCall.duration}ms)` : '',
      '',
      '## UI Interaction Metrics',
      `- Total Interactions: ${metrics.interactions.totalInteractions}`,
      `- Average Interaction Time: ${metrics.interactions.averageInteractionTime.toFixed(2)}ms`,
      metrics.interactions.slowestInteraction.type ? `- Slowest Interaction: ${metrics.interactions.slowestInteraction.type} (${metrics.interactions.slowestInteraction.duration}ms)` : '',
      '',
      '## Resource Loading Metrics',
      `- Total Resources: ${metrics.resources.totalResources}`,
      `- Total Resource Size: ${(metrics.resources.totalResourceSize / 1024).toFixed(2)} KB`,
      `- Average Load Time: ${metrics.resources.averageResourceLoadTime.toFixed(2)}ms`,
      '',
      '## Memory Usage',
      `- Used JS Heap: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      `- Total JS Heap: ${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      `- Heap Limit: ${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
    ];

    if (validation) {
      report.push('', '## Validation Results');
      report.push(`Status: ${validation.passed ? 'PASSED' : 'FAILED'}`);
      report.push(`Total Violations: ${validation.summary.totalViolations}`);
      report.push(`Errors: ${validation.summary.errorCount}`);
      report.push(`Warnings: ${validation.summary.warningCount}`);

      if (validation.violations.length > 0) {
        report.push('', '### Violations:');
        validation.violations.forEach(violation => {
          report.push(`- ${violation.severity.toUpperCase()}: ${violation.category}.${violation.metric} - ${violation.actual} > ${violation.threshold}`);
        });
      }
    }

    return report.filter(line => line !== '').join('\n');
  }
}

/**
 * Performance violation details
 */
export interface PerformanceViolation {
  category: string;
  metric: string;
  actual: number;
  threshold: number;
  severity: 'error' | 'warning';
}

/**
 * Performance validation result
 */
export interface PerformanceValidationResult {
  passed: boolean;
  violations: PerformanceViolation[];
  summary: {
    totalViolations: number;
    errorCount: number;
    warningCount: number;
  };
}

/**
 * Convenience functions for common performance operations
 */
export const performanceHelpers = {
  /**
   * Create performance helpers instance
   */
  create: (page: Page, context?: BrowserContext) => new PerformanceHelpers(page, context),

  /**
   * Run performance test with automatic measurement
   */
  async runPerformanceTest<T>(
    page: Page,
    context: BrowserContext | undefined,
    testFn: (perf: PerformanceHelpers) => Promise<T>,
    thresholds?: PerformanceThresholds
  ): Promise<{ result: T; metrics: PerformanceMetrics; validation: PerformanceValidationResult }> {
    const perf = new PerformanceHelpers(page, context);
    await perf.startMeasurement();

    try {
      const result = await testFn(perf);
      const metrics = await perf.stopMeasurement();
      const validation = perf.validateThresholds(metrics, thresholds);

      return { result, metrics, validation };
    } catch (error) {
      // Still collect metrics even if test fails
      const metrics = await perf.stopMeasurement();
      throw error;
    }
  },
};