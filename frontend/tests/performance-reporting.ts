import { PerformanceMetrics, PerformanceValidationResult } from './performance-helpers';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Performance test result data structure
 */
export interface PerformanceTestResult {
  testName: string;
  timestamp: number;
  environment: string;
  metrics: PerformanceMetrics;
  validation: PerformanceValidationResult;
  metadata?: {
    browser?: string;
    viewport?: string;
    network?: string;
    commit?: string;
    branch?: string;
  };
}

/**
 * Historical performance data
 */
export interface PerformanceHistory {
  testName: string;
  results: PerformanceTestResult[];
  baseline?: PerformanceMetrics;
}

/**
 * Performance reporting and visualization utilities
 */
export class PerformanceReporter {
  private reportDir: string;
  private historyFile: string;

  constructor(reportDir = './performance-reports') {
    this.reportDir = reportDir;
    this.historyFile = join(reportDir, 'performance-history.json');

    // Ensure report directory exists
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
  }

  /**
   * Generate and save performance report
   */
  async generateReport(
    testName: string,
    metrics: PerformanceMetrics,
    validation: PerformanceValidationResult,
    metadata?: PerformanceTestResult['metadata']
  ): Promise<string> {
    const timestamp = Date.now();
    const environment = process.env.NODE_ENV || 'development';
    const isCI = process.env.CI === 'true';

    const result: PerformanceTestResult = {
      testName,
      timestamp,
      environment,
      metrics,
      validation,
      metadata: {
        browser: metadata?.browser || 'chromium',
        viewport: metadata?.viewport || '1920x1080',
        network: metadata?.network || 'fast',
        commit: metadata?.commit || process.env.GITHUB_SHA || 'unknown',
        branch: metadata?.branch || process.env.GITHUB_REF_NAME || 'unknown',
        ...metadata,
      },
    };

    // Generate report content
    const reportContent = this.generateReportContent(result);

    // Save individual report
    const reportFileName = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.md`;
    const reportPath = join(this.reportDir, reportFileName);
    writeFileSync(reportPath, reportContent);

    // Save to history
    this.saveToHistory(result);

    // Generate comparison report if baseline exists
    const comparisonReport = await this.generateComparisonReport(testName, result);
    if (comparisonReport) {
      const comparisonPath = join(this.reportDir, `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_comparison_${timestamp}.md`);
      writeFileSync(comparisonPath, comparisonReport);
    }

    // Generate JSON data for CI/tools
    const jsonPath = join(this.reportDir, `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`);
    writeFileSync(jsonPath, JSON.stringify(result, null, 2));

    return reportPath;
  }

  /**
   * Generate human-readable report content
   */
  private generateReportContent(result: PerformanceTestResult): string {
    const { testName, timestamp, environment, metrics, validation, metadata } = result;

    const report = [
      '# Performance Test Report',
      '',
      `**Test:** ${testName}`,
      `**Timestamp:** ${new Date(timestamp).toISOString()}`,
      `**Environment:** ${environment}`,
      `**Browser:** ${metadata?.browser}`,
      `**Viewport:** ${metadata?.viewport}`,
      `**Network:** ${metadata?.network}`,
      metadata?.commit !== 'unknown' ? `**Commit:** ${metadata?.commit}` : '',
      metadata?.branch !== 'unknown' ? `**Branch:** ${metadata?.branch}` : '',
      '',
      '## Executive Summary',
      '',
      `**Status:** ${validation.passed ? '✅ PASSED' : '❌ FAILED'}`,
      `**Total Violations:** ${validation.summary.totalViolations}`,
      `**Errors:** ${validation.summary.errorCount}`,
      `**Warnings:** ${validation.summary.warningCount}`,
      '',
      '## Performance Metrics',
      '',
      '### Page Load Performance',
      `- DOM Content Loaded: **${metrics.pageLoad.domContentLoaded}ms**`,
      `- Load Complete: **${metrics.pageLoad.loadComplete}ms**`,
      metrics.pageLoad.firstPaint ? `- First Paint: **${metrics.pageLoad.firstPaint}ms**` : '',
      metrics.pageLoad.firstContentfulPaint ? `- First Contentful Paint: **${metrics.pageLoad.firstContentfulPaint}ms**` : '',
      metrics.pageLoad.largestContentfulPaint ? `- Largest Contentful Paint: **${metrics.pageLoad.largestContentfulPaint}ms**` : '',
      '',
      '### Network Performance',
      `- Total Requests: **${metrics.network.totalRequests}**`,
      `- Total Transferred: **${(metrics.network.totalTransferred / 1024).toFixed(2)} KB**`,
      `- Cached Requests: **${metrics.network.cachedRequests}**`,
      `- Failed Requests: **${metrics.network.failedRequests}**`,
      '',
      '### Request Breakdown',
      `- HTML: ${metrics.network.requestBreakdown.html}`,
      `- CSS: ${metrics.network.requestBreakdown.css}`,
      `- JavaScript: ${metrics.network.requestBreakdown.js}`,
      `- Images: ${metrics.network.requestBreakdown.images}`,
      `- Fonts: ${metrics.network.requestBreakdown.fonts}`,
      `- Other: ${metrics.network.requestBreakdown.other}`,
      '',
      '### API Performance',
      `- Total API Calls: **${metrics.api.totalApiCalls}**`,
      `- Average Response Time: **${metrics.api.averageResponseTime.toFixed(2)}ms**`,
      `- Failed API Calls: **${metrics.api.failedApiCalls}**`,
      metrics.api.slowestApiCall.url ? `- Slowest API Call: **${metrics.api.slowestApiCall.url}** (${metrics.api.slowestApiCall.duration}ms)` : '',
      '',
      '### UI Interaction Performance',
      `- Total Interactions: **${metrics.interactions.totalInteractions}**`,
      `- Average Interaction Time: **${metrics.interactions.averageInteractionTime.toFixed(2)}ms**`,
      metrics.interactions.slowestInteraction.type ? `- Slowest Interaction: **${metrics.interactions.slowestInteraction.type}** (${metrics.interactions.slowestInteraction.duration}ms)` : '',
      '',
      '### Resource Loading Performance',
      `- Total Resources: **${metrics.resources.totalResources}**`,
      `- Total Resource Size: **${(metrics.resources.totalResourceSize / 1024).toFixed(2)} KB**`,
      `- Average Load Time: **${metrics.resources.averageResourceLoadTime.toFixed(2)}ms**`,
      '',
      '### Resource Breakdown',
      `- JavaScript: ${metrics.resources.resourceBreakdown.js.count} files, ${(metrics.resources.resourceBreakdown.js.size / 1024).toFixed(2)} KB`,
      `- CSS: ${metrics.resources.resourceBreakdown.css.count} files, ${(metrics.resources.resourceBreakdown.css.size / 1024).toFixed(2)} KB`,
      `- Images: ${metrics.resources.resourceBreakdown.images.count} files, ${(metrics.resources.resourceBreakdown.images.size / 1024).toFixed(2)} KB`,
      `- Fonts: ${metrics.resources.resourceBreakdown.fonts.count} files, ${(metrics.resources.resourceBreakdown.fonts.size / 1024).toFixed(2)} KB`,
      '',
      '### Memory Usage',
      `- Used JS Heap: **${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB**`,
      `- Total JS Heap: **${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB**`,
      `- Heap Limit: **${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB**`,
      '',
      '### Test Timing',
      `- Start Time: ${new Date(metrics.timing.startTime).toISOString()}`,
      `- End Time: ${new Date(metrics.timing.endTime).toISOString()}`,
      `- Duration: **${metrics.timing.duration}ms**`,
    ];

    if (validation.violations.length > 0) {
      report.push('', '## Performance Violations');
      report.push('');
      validation.violations.forEach(violation => {
        const icon = violation.severity === 'error' ? '❌' : '⚠️';
        report.push(`${icon} **${violation.category}.${violation.metric}**: ${violation.actual} > ${violation.threshold} (${violation.severity})`);
      });
    }

    report.push('', '## Recommendations');
    report.push('');
    this.generateRecommendations(metrics, validation).forEach(rec => {
      report.push(`- ${rec}`);
    });

    return report.filter(line => line !== '').join('\n');
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics, validation: PerformanceValidationResult): string[] {
    const recommendations: string[] = [];

    // Page load recommendations
    if (metrics.pageLoad.domContentLoaded > 2000) {
      recommendations.push('Consider optimizing DOM content loading - reduce render-blocking resources');
    }
    if (metrics.pageLoad.loadComplete > 5000) {
      recommendations.push('Page load time is high - optimize resource loading and reduce bundle sizes');
    }

    // Network recommendations
    if (metrics.network.totalRequests > 50) {
      recommendations.push('High number of requests - consider bundling resources and using HTTP/2');
    }
    if (metrics.network.totalTransferred > 2 * 1024 * 1024) {
      recommendations.push('Large transfer size - optimize images, minify assets, and enable compression');
    }
    if (metrics.network.cachedRequests === 0) {
      recommendations.push('No cached resources detected - implement proper caching headers');
    }

    // API recommendations
    if (metrics.api.averageResponseTime > 1000) {
      recommendations.push('API response times are slow - optimize backend performance or implement caching');
    }
    if (metrics.api.failedApiCalls > 0) {
      recommendations.push('API calls are failing - investigate network issues or API errors');
    }

    // Resource recommendations
    if (metrics.resources.totalResourceSize > 5 * 1024 * 1024) {
      recommendations.push('Large resource footprint - consider code splitting and lazy loading');
    }

    // Memory recommendations
    const memoryUsagePercent = (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      recommendations.push('High memory usage detected - investigate memory leaks and optimize memory usage');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges - keep monitoring for regressions');
    }

    return recommendations;
  }

  /**
   * Generate comparison report with historical data
   */
  private async generateComparisonReport(testName: string, currentResult: PerformanceTestResult): Promise<string | null> {
    const history = this.loadHistory();
    const testHistory = history.find(h => h.testName === testName);

    if (!testHistory || testHistory.results.length < 2) {
      return null; // Not enough historical data
    }

    const baseline = testHistory.baseline || testHistory.results[testHistory.results.length - 2].metrics;
    const current = currentResult.metrics;

    const comparison = this.compareMetrics(baseline, current);

    const report = [
      '# Performance Comparison Report',
      '',
      `**Test:** ${testName}`,
      `**Current Run:** ${new Date(currentResult.timestamp).toISOString()}`,
      `**Baseline:** ${testHistory.baseline ? 'Configured baseline' : 'Previous run'}`,
      '',
      '## Metric Changes',
      '',
      '| Metric | Baseline | Current | Change | Status |',
      '|--------|----------|---------|--------|--------|',
    ];

    const metricsToCompare = [
      { key: 'pageLoad.domContentLoaded', label: 'DOM Content Loaded', unit: 'ms' },
      { key: 'pageLoad.loadComplete', label: 'Load Complete', unit: 'ms' },
      { key: 'pageLoad.firstContentfulPaint', label: 'First Contentful Paint', unit: 'ms' },
      { key: 'network.totalRequests', label: 'Total Requests', unit: '' },
      { key: 'network.totalTransferred', label: 'Total Transferred', unit: 'KB' },
      { key: 'api.averageResponseTime', label: 'Avg API Response', unit: 'ms' },
      { key: 'interactions.averageInteractionTime', label: 'Avg Interaction Time', unit: 'ms' },
      { key: 'resources.totalResourceSize', label: 'Total Resources', unit: 'KB' },
      { key: 'memory.usedJSHeapSize', label: 'Memory Usage', unit: 'MB' },
    ];

    metricsToCompare.forEach(({ key, label, unit }) => {
      const change = comparison[key];
      if (change !== undefined) {
        const status = this.getChangeStatus(change.value, change.percent, key);
        const statusIcon = status === 'improved' ? '✅' : status === 'degraded' ? '❌' : '➡️';

        report.push(`| ${label} | ${change.baseline}${unit} | ${change.current}${unit} | ${change.percent > 0 ? '+' : ''}${change.percent.toFixed(1)}% | ${statusIcon} ${status} |`);
      }
    });

    report.push('', '## Summary');
    report.push('');
    const improvements = Object.values(comparison).filter(c => c.percent < -5).length;
    const degradations = Object.values(comparison).filter(c => c.percent > 5).length;

    report.push(`**Improvements:** ${improvements}`);
    report.push(`**Degradations:** ${degradations}`);

    if (degradations > 0) {
      report.push('', '**⚠️ Performance regression detected!**');
    } else if (improvements > 0) {
      report.push('', '**✅ Performance improvements detected!**');
    } else {
      report.push('', '**➡️ Performance is stable**');
    }

    return report.join('\n');
  }

  /**
   * Compare two sets of metrics
   */
  private compareMetrics(baseline: PerformanceMetrics, current: PerformanceMetrics): Record<string, any> {
    const comparison: Record<string, any> = {};

    const compareValue = (key: string, baselineVal: number, currentVal: number, higherIsBetter = false) => {
      const diff = currentVal - baselineVal;
      const percent = baselineVal !== 0 ? (diff / baselineVal) * 100 : 0;

      // For metrics where lower is better (most timing metrics), invert the logic
      const effectivePercent = higherIsBetter ? percent : -percent;

      comparison[key] = {
        baseline: baselineVal,
        current: currentVal,
        difference: diff,
        percent: effectivePercent,
      };
    };

    // Page load metrics (lower is better)
    compareValue('pageLoad.domContentLoaded', baseline.pageLoad.domContentLoaded, current.pageLoad.domContentLoaded);
    compareValue('pageLoad.loadComplete', baseline.pageLoad.loadComplete, current.pageLoad.loadComplete);
    if (baseline.pageLoad.firstContentfulPaint && current.pageLoad.firstContentfulPaint) {
      compareValue('pageLoad.firstContentfulPaint', baseline.pageLoad.firstContentfulPaint, current.pageLoad.firstContentfulPaint);
    }

    // Network metrics
    compareValue('network.totalRequests', baseline.network.totalRequests, current.network.totalRequests);
    compareValue('network.totalTransferred', baseline.network.totalTransferred / 1024, current.network.totalTransferred / 1024); // Convert to KB

    // API metrics (lower is better)
    compareValue('api.averageResponseTime', baseline.api.averageResponseTime, current.api.averageResponseTime);

    // Interaction metrics (lower is better)
    compareValue('interactions.averageInteractionTime', baseline.interactions.averageInteractionTime, current.interactions.averageInteractionTime);

    // Resource metrics
    compareValue('resources.totalResourceSize', baseline.resources.totalResourceSize / 1024, current.resources.totalResourceSize / 1024); // Convert to KB

    // Memory metrics (lower is better, but can be complex)
    compareValue('memory.usedJSHeapSize', baseline.memory.usedJSHeapSize / (1024 * 1024), current.memory.usedJSHeapSize / (1024 * 1024)); // Convert to MB

    return comparison;
  }

  /**
   * Get status of metric change
   */
  private getChangeStatus(value: number, percent: number, metricKey: string): string {
    const absPercent = Math.abs(percent);

    // Define what constitutes improvement vs degradation for different metrics
    const isImprovement = (percent < 0 && absPercent > 1) ? 'improved' :
                         (percent > 0 && absPercent > 1) ? 'degraded' : 'stable';

    // For memory and resource size, higher might be okay, but we generally want lower
    if (metricKey.includes('memory.') || metricKey.includes('resources.totalResourceSize')) {
      return percent < -5 ? 'improved' : percent > 5 ? 'degraded' : 'stable';
    }

    return isImprovement;
  }

  /**
   * Save result to historical data
   */
  private saveToHistory(result: PerformanceTestResult): void {
    const history = this.loadHistory();

    let testHistory = history.find(h => h.testName === result.testName);
    if (!testHistory) {
      testHistory = {
        testName: result.testName,
        results: [],
      };
      history.push(testHistory);
    }

    // Keep only recent results (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    testHistory.results = testHistory.results.filter(r => r.timestamp > thirtyDaysAgo);

    // Add new result
    testHistory.results.push(result);

    // Sort by timestamp
    testHistory.results.sort((a, b) => a.timestamp - b.timestamp);

    // Save to file
    writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * Load historical performance data
   */
  private loadHistory(): PerformanceHistory[] {
    try {
      if (existsSync(this.historyFile)) {
        const data = readFileSync(this.historyFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load performance history:', error);
    }
    return [];
  }

  /**
   * Set baseline for a test
   */
  setBaseline(testName: string, metrics: PerformanceMetrics): void {
    const history = this.loadHistory();
    let testHistory = history.find(h => h.testName === testName);

    if (!testHistory) {
      testHistory = {
        testName,
        results: [],
      };
      history.push(testHistory);
    }

    testHistory.baseline = metrics;

    writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * Get performance trend for a test
   */
  getTrend(testName: string, days = 7): any {
    const history = this.loadHistory();
    const testHistory = history.find(h => h.testName === testName);

    if (!testHistory || testHistory.results.length < 2) {
      return null;
    }

    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentResults = testHistory.results.filter(r => r.timestamp > cutoff);

    if (recentResults.length < 2) {
      return null;
    }

    // Calculate trends for key metrics
    const trends: Record<string, any> = {};
    const metrics = ['pageLoad.domContentLoaded', 'pageLoad.loadComplete', 'api.averageResponseTime'];

    metrics.forEach(metric => {
      const values = recentResults.map(r => this.getMetricValue(r.metrics, metric)).filter(v => v !== null);
      if (values.length >= 2) {
        const trend = this.calculateTrend(values);
        trends[metric] = trend;
      }
    });

    return {
      testName,
      period: `${days} days`,
      trends,
      dataPoints: recentResults.length,
    };
  }

  /**
   * Calculate trend from array of values
   */
  private calculateTrend(values: number[]): any {
    if (values.length < 2) return null;

    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = (change / first) * 100;

    // Simple linear regression for trend direction
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return {
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      slope,
      change,
      percentChange,
      first,
      last,
    };
  }

  /**
   * Get nested metric value
   */
  private getMetricValue(metrics: PerformanceMetrics, path: string): number | null {
    const keys = path.split('.');
    let value: any = metrics;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return null;
    }

    return typeof value === 'number' ? value : null;
  }

  /**
   * Generate summary report for all tests
   */
  generateSummaryReport(): string {
    const history = this.loadHistory();
    const now = new Date();

    const report = [
      '# Performance Summary Report',
      '',
      `Generated: ${now.toISOString()}`,
      `Environment: ${process.env.NODE_ENV || 'development'}`,
      '',
      '## Test Results Overview',
      '',
      '| Test | Runs | Last Run | Status | Violations |',
      '|------|------|----------|--------|------------|',
    ];

    history.forEach(testHistory => {
      const lastResult = testHistory.results[testHistory.results.length - 1];
      if (lastResult) {
        const status = lastResult.validation.passed ? '✅ PASS' : '❌ FAIL';
        const violations = lastResult.validation.summary.totalViolations;
        const lastRun = new Date(lastResult.timestamp).toLocaleDateString();

        report.push(`| ${testHistory.testName} | ${testHistory.results.length} | ${lastRun} | ${status} | ${violations} |`);
      }
    });

    report.push('', '## Performance Trends (Last 7 days)', '');

    history.forEach(testHistory => {
      const trend = this.getTrend(testHistory.testName, 7);
      if (trend) {
        report.push(`### ${testHistory.testName}`);
        report.push(`Data points: ${trend.dataPoints}`);

        Object.entries(trend.trends).forEach(([metric, trendData]: [string, any]) => {
          const direction = trendData.direction === 'increasing' ? '📈' :
                           trendData.direction === 'decreasing' ? '📉' : '➡️';
          report.push(`${direction} ${metric}: ${trendData.percentChange.toFixed(1)}% (${trendData.direction})`);
        });

        report.push('');
      }
    });

    return report.join('\n');
  }
}

/**
 * Convenience functions for performance reporting
 */
export const performanceReporting = {
  /**
   * Create performance reporter instance
   */
  create: (reportDir?: string) => new PerformanceReporter(reportDir),

  /**
   * Generate quick report
   */
  async quickReport(
    testName: string,
    metrics: PerformanceMetrics,
    validation: PerformanceValidationResult,
    metadata?: any
  ): Promise<string> {
    const reporter = new PerformanceReporter();
    return reporter.generateReport(testName, metrics, validation, metadata);
  },

  /**
   * Generate summary report
   */
  generateSummary: () => {
    const reporter = new PerformanceReporter();
    return reporter.generateSummaryReport();
  },
};