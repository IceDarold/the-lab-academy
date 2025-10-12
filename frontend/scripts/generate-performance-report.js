#!/usr/bin/env node

/**
 * Performance Report Generator
 *
 * Generates comprehensive performance reports from test results
 * and historical data for CI/CD integration.
 */

const fs = require('fs');
const path = require('path');

// Import performance reporting utilities
const { performanceReporting } = require('../tests/performance-reporting.ts');

async function generatePerformanceReport() {
  console.log('🔍 Generating performance reports...');

  try {
    const reporter = performanceReporting.create();

    // Generate summary report
    const summaryReport = reporter.generateSummaryReport();
    const summaryPath = path.join(process.cwd(), 'performance-reports', 'performance-summary.md');

    fs.writeFileSync(summaryPath, summaryReport);
    console.log(`✅ Summary report generated: ${summaryPath}`);

    // Generate individual test reports from recent results
    const historyPath = path.join(process.cwd(), 'performance-reports', 'performance-history.json');

    if (fs.existsSync(historyPath)) {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

      for (const testHistory of history) {
        if (testHistory.results && testHistory.results.length > 0) {
          const latestResult = testHistory.results[testHistory.results.length - 1];

          // Generate detailed report for latest result
          const reportPath = await reporter.generateReport(
            testHistory.testName,
            latestResult.metrics,
            latestResult.validation,
            latestResult.metadata
          );

          console.log(`✅ Report generated for ${testHistory.testName}: ${reportPath}`);
        }
      }
    }

    // Generate trend analysis
    const trends = generateTrendAnalysis(history);
    const trendsPath = path.join(process.cwd(), 'performance-reports', 'performance-trends.json');
    fs.writeFileSync(trendsPath, JSON.stringify(trends, null, 2));
    console.log(`✅ Trend analysis generated: ${trendsPath}`);

    console.log('🎉 All performance reports generated successfully!');

    // Exit with appropriate code based on performance status
    const hasRegressions = checkForRegressions(history);
    process.exit(hasRegressions ? 1 : 0);

  } catch (error) {
    console.error('❌ Error generating performance reports:', error);
    process.exit(1);
  }
}

function generateTrendAnalysis(history) {
  const trends = {};

  for (const testHistory of history) {
    if (testHistory.results && testHistory.results.length >= 2) {
      const testName = testHistory.testName;
      trends[testName] = {};

      // Analyze trends for key metrics over last 7 days
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentResults = testHistory.results.filter(r => r.timestamp > sevenDaysAgo);

      if (recentResults.length >= 2) {
        const metrics = [
          'pageLoad.domContentLoaded',
          'pageLoad.loadComplete',
          'api.averageResponseTime',
          'interactions.averageInteractionTime'
        ];

        for (const metric of metrics) {
          const values = recentResults.map(r => getMetricValue(r.metrics, metric)).filter(v => v !== null);
          if (values.length >= 2) {
            trends[testName][metric] = calculateTrend(values);
          }
        }
      }
    }
  }

  return trends;
}

function calculateTrend(values) {
  if (values.length < 2) return null;

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const percentChange = first !== 0 ? (change / first) * 100 : 0;

  // Simple linear regression
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  return {
    direction: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
    slope: slope,
    change: change,
    percentChange: percentChange,
    first: first,
    last: last,
    dataPoints: n
  };
}

function getMetricValue(metrics, path) {
  const keys = path.split('.');
  let value = metrics;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return null;
  }

  return typeof value === 'number' ? value : null;
}

function checkForRegressions(history) {
  let hasRegressions = false;

  for (const testHistory of history) {
    if (testHistory.results && testHistory.results.length >= 2) {
      const latest = testHistory.results[testHistory.results.length - 1];
      const previous = testHistory.results[testHistory.results.length - 2];

      // Check for significant regressions
      const metricsToCheck = [
        { path: 'pageLoad.domContentLoaded', threshold: 200 }, // 200ms increase
        { path: 'pageLoad.loadComplete', threshold: 500 }, // 500ms increase
        { path: 'api.averageResponseTime', threshold: 100 }, // 100ms increase
      ];

      for (const { path, threshold } of metricsToCheck) {
        const latestValue = getMetricValue(latest.metrics, path);
        const previousValue = getMetricValue(previous.metrics, path);

        if (latestValue && previousValue && (latestValue - previousValue) > threshold) {
          console.warn(`⚠️ Performance regression detected in ${testHistory.testName}: ${path} increased by ${latestValue - previousValue}ms`);
          hasRegressions = true;
        }
      }

      // Check for validation failures
      if (!latest.validation.passed) {
        console.warn(`⚠️ Performance validation failed for ${testHistory.testName}`);
        hasRegressions = true;
      }
    }
  }

  return hasRegressions;
}

// Run the script
if (require.main === module) {
  generatePerformanceReport();
}

module.exports = { generatePerformanceReport };