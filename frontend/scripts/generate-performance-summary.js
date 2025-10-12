#!/usr/bin/env node

/**
 * Performance Summary Generator
 *
 * Generates a concise summary of performance test results
 * for CI/CD dashboards and notifications.
 */

const fs = require('fs');
const path = require('path');

function generatePerformanceSummary() {
  console.log('📊 Generating performance summary...');

  try {
    const historyPath = path.join(process.cwd(), 'performance-reports', 'performance-history.json');

    if (!fs.existsSync(historyPath)) {
      console.log('No performance history found. Run performance tests first.');
      process.exit(0);
    }

    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const summary = createSummary(history);

    // Write summary to file
    const summaryPath = path.join(process.cwd(), 'performance-reports', 'performance-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Also create a human-readable summary
    const readableSummary = createReadableSummary(summary);
    const readablePath = path.join(process.cwd(), 'performance-reports', 'performance-summary.md');
    fs.writeFileSync(readablePath, readableSummary);

    console.log(`✅ Performance summary generated: ${summaryPath}`);
    console.log(`✅ Readable summary generated: ${readablePath}`);

    // Output summary to console for CI
    console.log('\n📈 Performance Summary:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Average Score: ${summary.averageScore.toFixed(1)}%`);

    if (summary.regressions.length > 0) {
      console.log(`\n⚠️ Regressions Detected: ${summary.regressions.length}`);
      summary.regressions.forEach(regression => {
        console.log(`  - ${regression.test}: ${regression.metric} ${regression.change > 0 ? '+' : ''}${regression.change.toFixed(1)}%`);
      });
    }

    // Exit with failure if there are critical issues
    const hasCriticalIssues = summary.failedTests > 0 || summary.regressions.some(r => r.critical);
    process.exit(hasCriticalIssues ? 1 : 0);

  } catch (error) {
    console.error('❌ Error generating performance summary:', error);
    process.exit(1);
  }
}

function createSummary(history) {
  const summary = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.GITHUB_SHA || 'unknown',
    branch: process.env.GITHUB_REF_NAME || 'unknown',
    totalTests: history.length,
    passedTests: 0,
    failedTests: 0,
    averageScore: 0,
    regressions: [],
    trends: {},
    recommendations: []
  };

  let totalScore = 0;

  for (const testHistory of history) {
    if (!testHistory.results || testHistory.results.length === 0) continue;

    const latestResult = testHistory.results[testHistory.results.length - 1];
    const passed = latestResult.validation.passed;
    const score = calculateTestScore(latestResult);

    if (passed) {
      summary.passedTests++;
    } else {
      summary.failedTests++;
    }

    totalScore += score;

    // Check for regressions
    if (testHistory.results.length >= 2) {
      const previousResult = testHistory.results[testHistory.results.length - 2];
      const regression = detectRegression(testHistory.testName, previousResult, latestResult);

      if (regression) {
        summary.regressions.push(regression);
      }
    }

    // Calculate trend
    if (testHistory.results.length >= 3) {
      summary.trends[testHistory.testName] = calculateTrend(testHistory.results.slice(-7)); // Last 7 results
    }
  }

  summary.averageScore = summary.totalTests > 0 ? totalScore / summary.totalTests : 0;

  // Generate recommendations
  summary.recommendations = generateRecommendations(summary);

  return summary;
}

function calculateTestScore(result) {
  const { validation, metrics } = result;

  if (!validation.passed) return 0;

  // Calculate score based on how close metrics are to thresholds
  let score = 100;

  const metricsToScore = [
    { path: 'pageLoad.domContentLoaded', weight: 0.2, maxValue: 2000 },
    { path: 'pageLoad.loadComplete', weight: 0.2, maxValue: 5000 },
    { path: 'api.averageResponseTime', weight: 0.3, maxValue: 1000 },
    { path: 'interactions.averageInteractionTime', weight: 0.2, maxValue: 200 },
    { path: 'resources.totalResourceSize', weight: 0.1, maxValue: 5 * 1024 * 1024 }, // 5MB
  ];

  for (const { path, weight, maxValue } of metricsToScore) {
    const value = getMetricValue(metrics, path);
    if (value && value > maxValue) {
      const penalty = Math.min(weight * 100, (value - maxValue) / maxValue * weight * 100);
      score -= penalty;
    }
  }

  return Math.max(0, score);
}

function detectRegression(testName, previous, current) {
  const metricsToCheck = [
    { path: 'pageLoad.domContentLoaded', threshold: 10 }, // 10% increase
    { path: 'pageLoad.loadComplete', threshold: 10 },
    { path: 'api.averageResponseTime', threshold: 15 },
    { path: 'interactions.averageInteractionTime', threshold: 20 },
  ];

  for (const { path, threshold } of metricsToCheck) {
    const prevValue = getMetricValue(previous.metrics, path);
    const currValue = getMetricValue(current.metrics, path);

    if (prevValue && currValue && prevValue > 0) {
      const change = ((currValue - prevValue) / prevValue) * 100;
      if (change > threshold) {
        return {
          test: testName,
          metric: path,
          change: change,
          previous: prevValue,
          current: currValue,
          critical: change > threshold * 2 // Critical if more than double the threshold
        };
      }
    }
  }

  return null;
}

function calculateTrend(results) {
  if (results.length < 2) return null;

  const scores = results.map(r => calculateTestScore(r));
  const recent = scores.slice(-3); // Last 3 results
  const earlier = scores.slice(-6, -3); // Previous 3 results

  if (earlier.length === 0) return null;

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const change = recentAvg - earlierAvg;

  return {
    direction: change > 2 ? 'improving' : change < -2 ? 'degrading' : 'stable',
    change: change,
    recentAverage: recentAvg,
    earlierAverage: earlierAvg
  };
}

function generateRecommendations(summary) {
  const recommendations = [];

  if (summary.failedTests > 0) {
    recommendations.push(`${summary.failedTests} performance tests are failing. Review and fix performance issues.`);
  }

  if (summary.regressions.length > 0) {
    recommendations.push(`${summary.regressions.length} performance regressions detected. Investigate recent changes.`);
  }

  if (summary.averageScore < 80) {
    recommendations.push(`Average performance score is ${summary.averageScore.toFixed(1)}%. Consider optimization opportunities.`);
  }

  const degradingTests = Object.values(summary.trends).filter(t => t?.direction === 'degrading').length;
  if (degradingTests > 0) {
    recommendations.push(`${degradingTests} tests show degrading performance trends. Monitor closely.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance metrics are within acceptable ranges. Continue monitoring.');
  }

  return recommendations;
}

function createReadableSummary(summary) {
  let content = `# Performance Test Summary

**Generated:** ${new Date(summary.timestamp).toISOString()}
**Environment:** ${summary.environment}
**Commit:** ${summary.commit}
**Branch:** ${summary.branch}

## Overview
- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passedTests}
- **Failed:** ${summary.failedTests}
- **Average Score:** ${summary.averageScore.toFixed(1)}%

## Status
${summary.failedTests === 0 ? '✅ All tests passed' : `❌ ${summary.failedTests} tests failed`}

## Regressions
`;

  if (summary.regressions.length > 0) {
    summary.regressions.forEach(regression => {
      content += `- ${regression.critical ? '🚨' : '⚠️'} ${regression.test}: ${regression.metric} ${regression.change > 0 ? '+' : ''}${regression.change.toFixed(1)}%\n`;
    });
  } else {
    content += '✅ No regressions detected\n';
  }

  content += '\n## Trends\n';
  for (const [test, trend] of Object.entries(summary.trends)) {
    if (trend) {
      const icon = trend.direction === 'improving' ? '📈' : trend.direction === 'degrading' ? '📉' : '➡️';
      content += `${icon} ${test}: ${trend.direction} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)})\n`;
    }
  }

  content += '\n## Recommendations\n';
  summary.recommendations.forEach(rec => {
    content += `- ${rec}\n`;
  });

  return content;
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

// Run the script
if (require.main === module) {
  generatePerformanceSummary();
}

module.exports = { generatePerformanceSummary };