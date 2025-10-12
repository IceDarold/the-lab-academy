#!/usr/bin/env node

/**
 * Error Scenario Report Generator
 *
 * Generates comprehensive reports on error scenario test results,
 * including failure rates, recovery times, and user experience metrics.
 */

const fs = require('fs');
const path = require('path');

class ErrorScenarioReporter {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSuite: 'Error Scenarios and Chaos Engineering',
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        errorRate: 0,
        averageRecoveryTime: 0
      },
      scenarios: {
        networkFailures: [],
        serverErrors: [],
        chaosEngineering: [],
        applicationErrors: [],
        userExperience: []
      },
      recommendations: []
    };
  }

  /**
   * Parse test results from various formats
   */
  parseResults(testResults) {
    // Parse Vitest results
    if (testResults.vitest) {
      this.parseVitestResults(testResults.vitest);
    }

    // Parse Playwright results
    if (testResults.playwright) {
      this.parsePlaywrightResults(testResults.playwright);
    }

    // Calculate summary metrics
    this.calculateSummary();
  }

  parseVitestResults(vitestResults) {
    vitestResults.forEach(result => {
      this.results.summary.totalTests++;

      if (result.status === 'passed') {
        this.results.summary.passedTests++;
      } else if (result.status === 'failed') {
        this.results.summary.failedTests++;
        this.categorizeFailure(result);
      } else {
        this.results.summary.skippedTests++;
      }

      // Extract recovery time if available
      if (result.recoveryTime) {
        this.results.summary.averageRecoveryTime += result.recoveryTime;
      }
    });
  }

  parsePlaywrightResults(playwrightResults) {
    playwrightResults.forEach(result => {
      this.results.summary.totalTests++;

      if (result.ok) {
        this.results.summary.passedTests++;
      } else {
        this.results.summary.failedTests++;
        this.categorizeFailure(result);
      }

      // Extract error scenario data
      if (result.error && result.error.message) {
        this.analyzeErrorMessage(result.error.message);
      }
    });
  }

  categorizeFailure(testResult) {
    const testName = testResult.title || testResult.name || '';

    if (testName.includes('network') || testName.includes('disconnect')) {
      this.results.scenarios.networkFailures.push(testResult);
    } else if (testName.includes('server') || testName.includes('http') || testName.includes('timeout')) {
      this.results.scenarios.serverErrors.push(testResult);
    } else if (testName.includes('chaos') || testName.includes('random')) {
      this.results.scenarios.chaosEngineering.push(testResult);
    } else if (testName.includes('javascript') || testName.includes('component') || testName.includes('storage')) {
      this.results.scenarios.applicationErrors.push(testResult);
    } else if (testName.includes('user') || testName.includes('experience') || testName.includes('ui')) {
      this.results.scenarios.userExperience.push(testResult);
    }
  }

  analyzeErrorMessage(errorMessage) {
    // Analyze error patterns for recommendations
    if (errorMessage.includes('timeout')) {
      this.results.recommendations.push({
        type: 'performance',
        message: 'Consider increasing timeout thresholds for slow network conditions',
        severity: 'medium'
      });
    }

    if (errorMessage.includes('memory') || errorMessage.includes('pressure')) {
      this.results.recommendations.push({
        type: 'resource',
        message: 'Implement memory management optimizations',
        severity: 'high'
      });
    }

    if (errorMessage.includes('storage') || errorMessage.includes('localStorage')) {
      this.results.recommendations.push({
        type: 'storage',
        message: 'Add fallback storage mechanisms when localStorage fails',
        severity: 'medium'
      });
    }
  }

  calculateSummary() {
    const total = this.results.summary.totalTests;
    if (total > 0) {
      this.results.summary.errorRate = (this.results.summary.failedTests / total) * 100;
      this.results.summary.averageRecoveryTime = this.results.summary.averageRecoveryTime / total;
    }
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Scenario Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .scenarios { margin: 20px 0; }
        .scenario { margin: 10px 0; padding: 10px; border-left: 4px solid #007acc; background: #f9f9f9; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 3px; }
        .severity-high { border-left: 4px solid #dc3545; }
        .severity-medium { border-left: 4px solid #ffc107; }
        .severity-low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Error Scenario Test Report</h1>
        <p>Generated on: ${new Date(this.results.timestamp).toLocaleString()}</p>
        <p>Test Suite: ${this.results.testSuite}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${this.results.summary.totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.results.summary.passedTests}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.results.summary.failedTests}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.results.summary.errorRate.toFixed(1)}%</div>
            <div>Error Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.results.summary.averageRecoveryTime.toFixed(0)}ms</div>
            <div>Avg Recovery Time</div>
        </div>
    </div>

    <div class="scenarios">
        <h2>Test Scenarios</h2>

        <h3>Network Failures (${this.results.scenarios.networkFailures.length})</h3>
        ${this.results.scenarios.networkFailures.map(test =>
          `<div class="scenario">${test.title || test.name || 'Unknown test'}</div>`
        ).join('')}

        <h3>Server Errors (${this.results.scenarios.serverErrors.length})</h3>
        ${this.results.scenarios.serverErrors.map(test =>
          `<div class="scenario">${test.title || test.name || 'Unknown test'}</div>`
        ).join('')}

        <h3>Chaos Engineering (${this.results.scenarios.chaosEngineering.length})</h3>
        ${this.results.scenarios.chaosEngineering.map(test =>
          `<div class="scenario">${test.title || test.name || 'Unknown test'}</div>`
        ).join('')}

        <h3>Application Errors (${this.results.scenarios.applicationErrors.length})</h3>
        ${this.results.scenarios.applicationErrors.map(test =>
          `<div class="scenario">${test.title || test.name || 'Unknown test'}</div>`
        ).join('')}

        <h3>User Experience (${this.results.scenarios.userExperience.length})</h3>
        ${this.results.scenarios.userExperience.map(test =>
          `<div class="scenario">${test.title || test.name || 'Unknown test'}</div>`
        ).join('')}
    </div>

    <div class="recommendations">
        <h2>Recommendations</h2>
        ${this.results.recommendations.map(rec =>
          `<div class="recommendation severity-${rec.severity}">
            <strong>${rec.type.toUpperCase()}</strong>: ${rec.message}
          </div>`
        ).join('')}
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate JSON report
   */
  generateJSONReport() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Save reports to files
   */
  saveReports(outputDir = './test-results/error-scenarios') {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(path.join(outputDir, 'error-scenario-report.html'), htmlReport);

    // Save JSON report
    const jsonReport = this.generateJSONReport();
    fs.writeFileSync(path.join(outputDir, 'error-scenario-report.json'), jsonReport);

    console.log(`Reports saved to: ${outputDir}`);
  }

  /**
   * Load test results from files
   */
  loadTestResults(vitestPath, playwrightPath) {
    const testResults = {};

    if (vitestPath && fs.existsSync(vitestPath)) {
      testResults.vitest = JSON.parse(fs.readFileSync(vitestPath, 'utf8'));
    }

    if (playwrightPath && fs.existsSync(playwrightPath)) {
      testResults.playwright = JSON.parse(fs.readFileSync(playwrightPath, 'utf8'));
    }

    this.parseResults(testResults);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const reporter = new ErrorScenarioReporter();

  if (args.length >= 2) {
    const [vitestResults, playwrightResults] = args;
    reporter.loadTestResults(vitestResults, playwrightResults);
  } else {
    // Generate sample data for demonstration
    reporter.parseResults({
      vitest: [
        { title: 'network failure test', status: 'passed', recoveryTime: 1500 },
        { title: 'server error test', status: 'failed', recoveryTime: 3000 },
        { title: 'chaos engineering test', status: 'passed', recoveryTime: 2000 }
      ],
      playwright: [
        { name: 'e2e chaos test', ok: true },
        { name: 'e2e error boundary test', ok: false, error: { message: 'Component crashed' } }
      ]
    });
  }

  reporter.saveReports();
}

module.exports = ErrorScenarioReporter;