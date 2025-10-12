#!/usr/bin/env node

/**
 * Test Result Aggregator
 *
 * Aggregates test results from multiple sources and provides
 * comprehensive analysis and trend reporting.
 */

const fs = require('fs');
const path = require('path');

class TestResultAggregator {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'test-results-history');
    this.ensureResultsDir();
  }

  ensureResultsDir() {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  aggregateResults() {
    console.log('🔍 Aggregating test results...');

    const aggregated = {
      timestamp: new Date().toISOString(),
      runId: process.env.GITHUB_RUN_ID || 'local',
      commit: process.env.GITHUB_SHA || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      results: {}
    };

    try {
      // Aggregate different test types
      aggregated.results.frontend = this.aggregateFrontendResults();
      aggregated.results.backend = this.aggregateBackendResults();
      aggregated.results.e2e = this.aggregateE2EResults();
      aggregated.results.performance = this.aggregatePerformanceResults();
      aggregated.results.accessibility = this.aggregateAccessibilityResults();
      aggregated.results.visual = this.aggregateVisualResults();

      // Calculate overall metrics
      aggregated.summary = this.calculateOverallSummary(aggregated.results);

      // Save aggregated results
      this.saveAggregatedResults(aggregated);

      // Update historical data
      this.updateHistoricalData(aggregated);

      // Generate trend analysis
      this.generateTrendAnalysis();

      console.log('✅ Test results aggregated successfully');

      return aggregated;

    } catch (error) {
      console.error('❌ Error aggregating test results:', error);
      throw error;
    }
  }

  aggregateFrontendResults() {
    const results = {
      unit: { coverage: null, tests: null },
      integration: { coverage: null, tests: null }
    };

    // Unit test coverage
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        results.unit.coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read unit test coverage:', error.message);
    }

    // Integration test results
    try {
      const testResultsPath = path.join(process.cwd(), 'test-results', 'results.json');
      if (fs.existsSync(testResultsPath)) {
        results.integration.tests = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read integration test results:', error.message);
    }

    return results;
  }

  aggregateBackendResults() {
    const results = { coverage: null, tests: null };

    // Backend coverage
    try {
      const coveragePath = path.join(process.cwd(), '..', 'backend', 'coverage.xml');
      if (fs.existsSync(coveragePath)) {
        const xmlContent = fs.readFileSync(coveragePath, 'utf8');
        const lineMatch = xmlContent.match(/line-rate="([0-9.]+)"/);
        if (lineMatch) {
          results.coverage = {
            lines: parseFloat(lineMatch[1]) * 100,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('Could not read backend coverage:', error.message);
    }

    return results;
  }

  aggregateE2EResults() {
    const results = { api: null, ui: null };

    // E2E API results
    try {
      const apiResultsPath = path.join(process.cwd(), 'playwright-report', 'results.json');
      if (fs.existsSync(apiResultsPath)) {
        results.api = this.parsePlaywrightResults(JSON.parse(fs.readFileSync(apiResultsPath, 'utf8')));
      }
    } catch (error) {
      console.warn('Could not read E2E API results:', error.message);
    }

    // E2E UI results (same file, different filtering would be applied in CI)
    results.ui = results.api; // Simplified for this implementation

    return results;
  }

  aggregatePerformanceResults() {
    const results = { metrics: null, regressions: null };

    try {
      const perfSummaryPath = path.join(process.cwd(), 'performance-reports', 'performance-summary.json');
      if (fs.existsSync(perfSummaryPath)) {
        results.metrics = JSON.parse(fs.readFileSync(perfSummaryPath, 'utf8'));
      }

      const perfTrendsPath = path.join(process.cwd(), 'performance-reports', 'performance-trends.json');
      if (fs.existsSync(perfTrendsPath)) {
        results.regressions = JSON.parse(fs.readFileSync(perfTrendsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read performance results:', error.message);
    }

    return results;
  }

  aggregateAccessibilityResults() {
    const results = { violations: null, summary: null };

    try {
      const violationsPath = path.join(process.cwd(), 'accessibility-results.json');
      if (fs.existsSync(violationsPath)) {
        results.violations = JSON.parse(fs.readFileSync(violationsPath, 'utf8'));
      }

      const summaryPath = path.join(process.cwd(), 'accessibility-report', 'accessibility-summary.json');
      if (fs.existsSync(summaryPath)) {
        results.summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read accessibility results:', error.message);
    }

    return results;
  }

  aggregateVisualResults() {
    const results = { screenshots: null, diffs: null };

    try {
      const visualResultsPath = path.join(process.cwd(), 'test-results', 'visual-regression-results.json');
      if (fs.existsSync(visualResultsPath)) {
        results.diffs = JSON.parse(fs.readFileSync(visualResultsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read visual regression results:', error.message);
    }

    return results;
  }

  parsePlaywrightResults(results) {
    let total = 0, passed = 0, failed = 0, skipped = 0, duration = 0;

    results.suites?.forEach(suite => {
      suite.specs?.forEach(spec => {
        spec.tests?.forEach(test => {
          total++;
          const lastResult = test.results?.[test.results.length - 1];
          if (lastResult?.status === 'passed') passed++;
          else if (lastResult?.status === 'failed') failed++;
          else if (lastResult?.status === 'skipped') skipped++;

          if (lastResult?.duration) duration += lastResult.duration;
        });
      });
    });

    return { total, passed, failed, skipped, duration };
  }

  calculateOverallSummary(results) {
    const summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverage: {
        frontend: null,
        backend: null
      },
      performance: {
        hasRegressions: false,
        metrics: null
      },
      accessibility: {
        violations: 0,
        criticalViolations: 0
      },
      visual: {
        regressions: 0
      }
    };

    // Aggregate test counts
    if (results.frontend?.unit?.tests) {
      const unit = results.frontend.unit.tests;
      summary.totalTests += unit.numTotalTests || 0;
      summary.passedTests += unit.numPassedTests || 0;
      summary.failedTests += unit.numFailedTests || 0;
      summary.skippedTests += unit.numPendingTests || 0;
    }

    if (results.frontend?.integration?.tests) {
      const integration = results.frontend.integration.tests;
      summary.totalTests += integration.numTotalTests || 0;
      summary.passedTests += integration.numPassedTests || 0;
      summary.failedTests += integration.numFailedTests || 0;
      summary.skippedTests += integration.numPendingTests || 0;
    }

    if (results.e2e?.api) {
      summary.totalTests += results.e2e.api.total || 0;
      summary.passedTests += results.e2e.api.passed || 0;
      summary.failedTests += results.e2e.api.failed || 0;
      summary.skippedTests += results.e2e.api.skipped || 0;
    }

    // Coverage
    if (results.frontend?.unit?.coverage?.total) {
      summary.coverage.frontend = results.frontend.unit.coverage.total.lines.pct;
    }
    if (results.backend?.coverage) {
      summary.coverage.backend = results.backend.coverage.lines;
    }

    // Performance
    if (results.performance?.regressions) {
      summary.performance.hasRegressions = Object.keys(results.performance.regressions).length > 0;
      summary.performance.metrics = results.performance.regressions;
    }

    // Accessibility
    if (results.accessibility?.summary) {
      const acc = results.accessibility.summary;
      summary.accessibility.violations = acc.violations || 0;
      summary.accessibility.criticalViolations = acc.criticalViolations || 0;
    }

    // Visual
    if (results.visual?.diffs) {
      summary.visual.regressions = results.visual.diffs.length || 0;
    }

    return summary;
  }

  saveAggregatedResults(aggregated) {
    const filename = `test-results-${aggregated.runId}.json`;
    const filepath = path.join(this.resultsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(aggregated, null, 2));
    console.log(`📄 Saved aggregated results: ${filepath}`);
  }

  updateHistoricalData(newResults) {
    const historyFile = path.join(this.resultsDir, 'test-history.json');

    let history = [];
    if (fs.existsSync(historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.warn('Could not read history file, starting fresh');
      }
    }

    // Add new results
    history.push({
      timestamp: newResults.timestamp,
      runId: newResults.runId,
      commit: newResults.commit,
      branch: newResults.branch,
      summary: newResults.summary
    });

    // Keep only last 100 entries
    if (history.length > 100) {
      history = history.slice(-100);
    }

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log(`📄 Updated test history: ${history.length} entries`);
  }

  generateTrendAnalysis() {
    const historyFile = path.join(this.resultsDir, 'test-history.json');
    const trendsFile = path.join(this.resultsDir, 'test-trends.json');

    if (!fs.existsSync(historyFile)) {
      console.log('No history available for trend analysis');
      return;
    }

    try {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      if (history.length < 2) {
        console.log('Need at least 2 data points for trend analysis');
        return;
      }

      const trends = {
        generated: new Date().toISOString(),
        dataPoints: history.length,
        timeRange: {
          from: history[0].timestamp,
          to: history[history.length - 1].timestamp
        },
        metrics: {
          testPassRate: this.calculateTrend(history.map(h => ({
            value: h.summary.totalTests > 0 ? (h.summary.passedTests / h.summary.totalTests) * 100 : 0,
            timestamp: h.timestamp
          }))),
          frontendCoverage: this.calculateTrend(history.map(h => ({
            value: h.summary.coverage.frontend || 0,
            timestamp: h.timestamp
          })).filter(p => p.value > 0)),
          backendCoverage: this.calculateTrend(history.map(h => ({
            value: h.summary.coverage.backend || 0,
            timestamp: h.timestamp
          })).filter(p => p.value > 0)),
          accessibilityViolations: this.calculateTrend(history.map(h => ({
            value: h.summary.accessibility.violations || 0,
            timestamp: h.timestamp
          }))),
          performanceRegressions: this.calculateTrend(history.map(h => ({
            value: h.summary.performance.hasRegressions ? 1 : 0,
            timestamp: h.timestamp
          })))
        }
      };

      fs.writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
      console.log(`📈 Generated trend analysis: ${trendsFile}`);

    } catch (error) {
      console.error('Error generating trend analysis:', error.message);
    }
  }

  calculateTrend(dataPoints) {
    if (dataPoints.length < 2) return null;

    const values = dataPoints.map(p => p.value);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first !== 0 ? (change / first) * 100 : 0;

    // Simple linear regression
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    values.forEach((value, index) => {
      sumX += index;
      sumY += value;
      sumXY += index * value;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return {
      direction: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      slope: slope,
      change: change,
      percentChange: percentChange,
      first: first,
      last: last,
      dataPoints: n,
      period: {
        start: dataPoints[0].timestamp,
        end: dataPoints[dataPoints.length - 1].timestamp
      }
    };
  }
}

// Run the script
if (require.main === module) {
  const aggregator = new TestResultAggregator();
  aggregator.aggregateResults();
}

module.exports = TestResultAggregator;