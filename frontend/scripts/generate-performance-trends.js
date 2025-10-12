#!/usr/bin/env node

/**
 * Performance Trends Generator
 *
 * Analyzes performance trends over time and generates
 * visualizations and insights for performance monitoring.
 */

const fs = require('fs');
const path = require('path');

function generatePerformanceTrends() {
  console.log('📈 Generating performance trends...');

  const historyPath = path.join(process.cwd(), 'performance-reports', 'performance-history.json');

  if (!fs.existsSync(historyPath)) {
    console.log('No performance history found. Run performance tests first.');
    process.exit(0);
  }

  try {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const trends = analyzeTrends(history);

    // Generate JSON output
    const trendsPath = path.join(process.cwd(), 'performance-reports', 'performance-trends.json');
    fs.writeFileSync(trendsPath, JSON.stringify(trends, null, 2));

    // Generate human-readable report
    const report = generateTrendsReport(trends);
    const reportPath = path.join(process.cwd(), 'performance-reports', 'performance-trends.md');
    fs.writeFileSync(reportPath, report);

    // Generate chart data for visualization
    const chartData = generateChartData(trends);
    const chartPath = path.join(process.cwd(), 'performance-reports', 'performance-charts.json');
    fs.writeFileSync(chartPath, JSON.stringify(chartData, null, 2));

    console.log(`✅ Trends analysis generated: ${trendsPath}`);
    console.log(`✅ Trends report generated: ${reportPath}`);
    console.log(`✅ Chart data generated: ${chartPath}`);

    // Summary output
    console.log('\n📊 Trends Summary:');
    Object.entries(trends).forEach(([testName, testTrends]) => {
      console.log(`\n${testName}:`);
      Object.entries(testTrends).forEach(([metric, trend]) => {
        if (trend) {
          const icon = trend.direction === 'improving' ? '📈' :
                      trend.direction === 'degrading' ? '📉' : '➡️';
          console.log(`  ${icon} ${metric}: ${trend.direction} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)} over ${trend.period})`);
        }
      });
    });

  } catch (error) {
    console.error('❌ Error generating performance trends:', error);
    process.exit(1);
  }
}

function analyzeTrends(history) {
  const trends = {};
  const now = Date.now();

  // Analyze different time periods
  const periods = [
    { name: '24h', ms: 24 * 60 * 60 * 1000 },
    { name: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
    { name: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  for (const testHistory of history) {
    if (!testHistory.results || testHistory.results.length < 2) continue;

    trends[testHistory.testName] = {};

    for (const period of periods) {
      const cutoff = now - period.ms;
      const periodResults = testHistory.results.filter(r => r.timestamp > cutoff);

      if (periodResults.length >= 2) {
        // Analyze key metrics
        const metrics = [
          'pageLoad.domContentLoaded',
          'pageLoad.loadComplete',
          'pageLoad.firstContentfulPaint',
          'api.averageResponseTime',
          'interactions.averageInteractionTime',
          'resources.totalResourceSize',
          'memory.usedJSHeapSize',
        ];

        for (const metric of metrics) {
          const values = periodResults.map(r => getMetricValue(r.metrics, metric)).filter(v => v !== null);
          if (values.length >= 2) {
            const trend = calculateTrend(values, period.name);
            if (trend) {
              trends[testHistory.testName][`${metric}_${period.name}`] = trend;
            }
          }
        }

        // Overall test score trend
        const scores = periodResults.map(r => calculateTestScore(r));
        if (scores.length >= 2) {
          const scoreTrend = calculateTrend(scores, period.name);
          if (scoreTrend) {
            trends[testHistory.testName][`overall_score_${period.name}`] = scoreTrend;
          }
        }
      }
    }
  }

  return trends;
}

function calculateTrend(values, period) {
  if (values.length < 2) return null;

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const percentChange = first !== 0 ? (change / first) * 100 : 0;

  // Simple linear regression for trend direction
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Determine direction based on slope and magnitude
  let direction = 'stable';
  if (Math.abs(slope) > 0.1) { // Minimum slope threshold
    if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
  }

  // For performance metrics, increasing might be bad (slower times)
  // For scores, increasing is good
  const isPerformanceMetric = true; // Assume performance metrics (higher = worse)
  const effectiveDirection = isPerformanceMetric ?
    (direction === 'increasing' ? 'degrading' : direction === 'decreasing' ? 'improving' : 'stable') :
    direction;

  return {
    direction: effectiveDirection,
    slope: slope,
    change: change,
    percentChange: percentChange,
    first: first,
    last: last,
    dataPoints: n,
    period: period,
    values: values, // Include raw values for charting
  };
}

function calculateTestScore(result) {
  const { validation, metrics } = result;

  if (!validation.passed) return 0;

  // Simplified scoring for trends
  let score = 100;

  const penalties = [
    { path: 'pageLoad.domContentLoaded', threshold: 2000, weight: 20 },
    { path: 'pageLoad.loadComplete', threshold: 5000, weight: 20 },
    { path: 'api.averageResponseTime', threshold: 1000, weight: 30 },
    { path: 'interactions.averageInteractionTime', threshold: 200, weight: 20 },
    { path: 'resources.totalResourceSize', threshold: 5 * 1024 * 1024, weight: 10 },
  ];

  for (const { path, threshold, weight } of penalties) {
    const value = getMetricValue(metrics, path);
    if (value && value > threshold) {
      const excess = (value - threshold) / threshold;
      score -= Math.min(weight, excess * weight);
    }
  }

  return Math.max(0, score);
}

function generateTrendsReport(trends) {
  const report = [
    '# Performance Trends Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
  ];

  // Overall trend summary
  const allTrends = Object.values(trends).flatMap(testTrends => Object.values(testTrends));
  const improving = allTrends.filter(t => t?.direction === 'improving').length;
  const degrading = allTrends.filter(t => t?.direction === 'degrading').length;
  const stable = allTrends.filter(t => t?.direction === 'stable').length;

  report.push(`- **Improving:** ${improving} metrics`);
  report.push(`- **Degrading:** ${degrading} metrics`);
  report.push(`- **Stable:** ${stable} metrics`);
  report.push('');

  // Detailed trends by test
  for (const [testName, testTrends] of Object.entries(trends)) {
    report.push(`## ${testName}`, '');

    const periods = ['24h', '7d', '30d'];
    for (const period of periods) {
      const periodTrends = Object.entries(testTrends)
        .filter(([key]) => key.endsWith(`_${period}`))
        .map(([key, trend]) => [key.replace(`_${period}`, ''), trend]);

      if (periodTrends.length > 0) {
        report.push(`### ${period.toUpperCase()} Trends`, '');

        for (const [metric, trend] of periodTrends) {
          if (trend) {
            const icon = trend.direction === 'improving' ? '📈' :
                        trend.direction === 'degrading' ? '📉' : '➡️';
            const change = trend.change > 0 ? '+' : '';
            report.push(`${icon} **${metric}:** ${trend.direction} (${change}${trend.change.toFixed(1)}) - ${trend.dataPoints} data points`);
          }
        }
        report.push('');
      }
    }
  }

  // Recommendations
  report.push('## Recommendations', '');
  const recommendations = generateTrendRecommendations(trends);
  recommendations.forEach(rec => report.push(`- ${rec}`));

  return report.join('\n');
}

function generateTrendRecommendations(trends) {
  const recommendations = [];

  let degradingCount = 0;
  let improvingCount = 0;

  for (const testTrends of Object.values(trends)) {
    for (const trend of Object.values(testTrends)) {
      if (trend?.direction === 'degrading') degradingCount++;
      if (trend?.direction === 'improving') improvingCount++;
    }
  }

  if (degradingCount > 0) {
    recommendations.push(`${degradingCount} performance metrics are trending downward. Investigate recent changes and consider optimization.`);
  }

  if (improvingCount > 0) {
    recommendations.push(`${improvingCount} performance metrics are improving. Keep up the good work!`);
  }

  if (degradingCount === 0 && improvingCount === 0) {
    recommendations.push('Performance metrics are stable. Continue monitoring for any changes.');
  }

  return recommendations;
}

function generateChartData(trends) {
  const chartData = {
    datasets: [],
    timestamps: [],
  };

  // Collect all timestamps
  const allTimestamps = new Set();
  for (const testTrends of Object.values(trends)) {
    for (const trend of Object.values(testTrends)) {
      if (trend?.values) {
        // We don't have actual timestamps, so we'll use indices
        // In a real implementation, you'd want to include timestamps with the values
      }
    }
  }

  // For now, create sample chart data structure
  // In production, you'd want to align this with actual historical data
  for (const [testName, testTrends] of Object.entries(trends)) {
    for (const [metricKey, trend] of Object.entries(testTrends)) {
      if (trend && trend.values) {
        chartData.datasets.push({
          label: `${testName} - ${metricKey}`,
          data: trend.values,
          trend: trend.direction,
          change: trend.change,
        });
      }
    }
  }

  return chartData;
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
  generatePerformanceTrends();
}

module.exports = { generatePerformanceTrends };