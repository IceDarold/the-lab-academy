#!/usr/bin/env node

/**
 * Test Summary Generator
 *
 * Generates comprehensive test summary reports from CI artifacts
 * and creates markdown summaries for PR comments.
 */

const fs = require('fs');
const path = require('path');

class TestSummaryGenerator {
  constructor() {
    this.artifactsPath = path.join(process.cwd(), '..', 'test-artifacts');
    this.summary = {
      timestamp: new Date().toISOString(),
      frontend: { unit: {}, integration: {} },
      backend: {},
      e2e: { api: {}, ui: {} },
      visual: {},
      performance: {},
      accessibility: {},
      overall: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };
  }

  generateSummary() {
    console.log('🔍 Generating comprehensive test summary...');

    try {
      // Analyze each test artifact
      this.analyzeFrontendUnitTests();
      this.analyzeFrontendIntegrationTests();
      this.analyzeBackendTests();
      this.analyzeE2ETests();
      this.analyzeVisualTests();
      this.analyzePerformanceTests();
      this.analyzeAccessibilityTests();

      // Calculate overall statistics
      this.calculateOverallStats();

      // Generate markdown report
      const markdownReport = this.generateMarkdownReport();

      // Write summary file
      const summaryPath = path.join(process.cwd(), 'test-summary.md');
      fs.writeFileSync(summaryPath, markdownReport);

      console.log(`✅ Test summary generated: ${summaryPath}`);

      // Generate JSON summary for further processing
      const jsonPath = path.join(process.cwd(), 'test-summary.json');
      fs.writeFileSync(jsonPath, JSON.stringify(this.summary, null, 2));

      return summaryPath;

    } catch (error) {
      console.error('❌ Error generating test summary:', error);
      process.exit(1);
    }
  }

  analyzeFrontendUnitTests() {
    const unitResultsPath = path.join(this.artifactsPath, 'integration-test-results-*', 'coverage', 'coverage-summary.json');

    try {
      // Look for coverage files
      const coverageFiles = this.findFiles(unitResultsPath.replace('*', this.getLatestRunId()));
      if (coverageFiles.length > 0) {
        const coverage = JSON.parse(fs.readFileSync(coverageFiles[0], 'utf8'));
        this.summary.frontend.unit.coverage = {
          lines: coverage.total.lines.pct,
          functions: coverage.total.functions.pct,
          branches: coverage.total.branches.pct,
          statements: coverage.total.statements.pct
        };
      }
    } catch (error) {
      console.warn('Could not analyze frontend unit test results:', error.message);
    }
  }

  analyzeFrontendIntegrationTests() {
    // Similar to unit tests but for integration
    const integrationResultsPath = path.join(this.artifactsPath, 'integration-test-results-*', 'test-results', 'results.json');

    try {
      const resultFiles = this.findFiles(integrationResultsPath.replace('*', this.getLatestRunId()));
      if (resultFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(resultFiles[0], 'utf8'));
        this.summary.frontend.integration = this.parseTestResults(results);
      }
    } catch (error) {
      console.warn('Could not analyze frontend integration test results:', error.message);
    }
  }

  analyzeBackendTests() {
    const backendResultsPath = path.join(this.artifactsPath, 'backend-test-results-*', 'coverage', 'coverage.xml');

    try {
      // Parse coverage.xml for backend
      const coverageFiles = this.findFiles(backendResultsPath.replace('*', this.getLatestRunId()));
      if (coverageFiles.length > 0) {
        // Simple XML parsing for coverage percentage
        const xmlContent = fs.readFileSync(coverageFiles[0], 'utf8');
        const lineMatch = xmlContent.match(/line-rate="([0-9.]+)"/);
        if (lineMatch) {
          this.summary.backend.coverage = {
            lines: parseFloat(lineMatch[1]) * 100
          };
        }
      }
    } catch (error) {
      console.warn('Could not analyze backend test results:', error.message);
    }
  }

  analyzeE2ETests() {
    // Analyze API and UI E2E tests
    const apiResultsPath = path.join(this.artifactsPath, 'e2e-api-test-results-*', 'playwright-report', 'results.json');
    const uiResultsPath = path.join(this.artifactsPath, 'e2e-ui-test-results-*', 'playwright-report', 'results.json');

    try {
      const apiFiles = this.findFiles(apiResultsPath.replace('*', this.getLatestRunId()));
      if (apiFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(apiFiles[0], 'utf8'));
        this.summary.e2e.api = this.parsePlaywrightResults(results);
      }

      const uiFiles = this.findFiles(uiResultsPath.replace('*', this.getLatestRunId()));
      if (uiFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(uiFiles[0], 'utf8'));
        this.summary.e2e.ui = this.parsePlaywrightResults(results);
      }
    } catch (error) {
      console.warn('Could not analyze E2E test results:', error.message);
    }
  }

  analyzeVisualTests() {
    const visualResultsPath = path.join(this.artifactsPath, 'visual-regression-results-*', 'playwright-report', 'results.json');

    try {
      const resultFiles = this.findFiles(visualResultsPath.replace('*', this.getLatestRunId()));
      if (resultFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(resultFiles[0], 'utf8'));
        this.summary.visual = this.parsePlaywrightResults(results);
      }
    } catch (error) {
      console.warn('Could not analyze visual test results:', error.message);
    }
  }

  analyzePerformanceTests() {
    const perfResultsPath = path.join(this.artifactsPath, 'performance-test-results-*', 'performance-reports', 'performance-summary.json');

    try {
      const resultFiles = this.findFiles(perfResultsPath.replace('*', this.getLatestRunId()));
      if (resultFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(resultFiles[0], 'utf8'));
        this.summary.performance = results;
      }
    } catch (error) {
      console.warn('Could not analyze performance test results:', error.message);
    }
  }

  analyzeAccessibilityTests() {
    const accessibilityResultsPath = path.join(this.artifactsPath, 'accessibility-results-*', 'accessibility-results.json');

    try {
      const resultFiles = this.findFiles(accessibilityResultsPath.replace('*', this.getLatestRunId()));
      if (resultFiles.length > 0) {
        const results = JSON.parse(fs.readFileSync(resultFiles[0], 'utf8'));
        this.summary.accessibility = this.parseAccessibilityResults(results);
      }
    } catch (error) {
      console.warn('Could not analyze accessibility test results:', error.message);
    }
  }

  parseTestResults(results) {
    // Parse Vitest/Jest results
    const stats = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      duration: results.testResults?.reduce((sum, suite) => sum + (suite.perfStats?.runtime || 0), 0) || 0
    };
    return stats;
  }

  parsePlaywrightResults(results) {
    // Parse Playwright results
    let total = 0, passed = 0, failed = 0, skipped = 0;

    results.suites?.forEach(suite => {
      suite.specs?.forEach(spec => {
        spec.tests?.forEach(test => {
          total++;
          const lastResult = test.results?.[test.results.length - 1];
          if (lastResult?.status === 'passed') passed++;
          else if (lastResult?.status === 'failed') failed++;
          else if (lastResult?.status === 'skipped') skipped++;
        });
      });
    });

    return { total, passed, failed, skipped };
  }

  parseAccessibilityResults(results) {
    // Parse accessibility audit results
    return {
      violations: results.violations?.length || 0,
      critical: results.criticalViolations?.length || 0,
      serious: results.seriousViolations?.length || 0,
      moderate: results.moderateViolations?.length || 0,
      minor: results.minorViolations?.length || 0
    };
  }

  calculateOverallStats() {
    const categories = ['frontend.unit', 'frontend.integration', 'backend', 'e2e.api', 'e2e.ui', 'visual', 'performance', 'accessibility'];

    categories.forEach(category => {
      const parts = category.split('.');
      const data = parts.length === 1 ? this.summary[parts[0]] : this.summary[parts[0]][parts[1]];

      if (data && typeof data === 'object' && 'total' in data) {
        this.summary.overall.total += data.total || 0;
        this.summary.overall.passed += data.passed || 0;
        this.summary.overall.failed += data.failed || 0;
        this.summary.overall.skipped += data.skipped || 0;
      }
    });
  }

  generateMarkdownReport() {
    const { overall } = this.summary;
    const passRate = overall.total > 0 ? ((overall.passed / overall.total) * 100).toFixed(1) : 0;

    let report = `# 🧪 Test Results Summary\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // Overall status
    const status = overall.failed === 0 ? '✅ All tests passed' : `❌ ${overall.failed} test(s) failed`;
    report += `## Overall Status: ${status}\n\n`;

    // Summary table
    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Tests | ${overall.total} |\n`;
    report += `| Passed | ${overall.passed} |\n`;
    report += `| Failed | ${overall.failed} |\n`;
    report += `| Skipped | ${overall.skipped} |\n`;
    report += `| Pass Rate | ${passRate}% |\n\n`;

    // Detailed results
    report += `## Detailed Results\n\n`;

    // Frontend Unit Tests
    if (this.summary.frontend.unit.coverage) {
      report += `### Frontend Unit Tests\n`;
      const cov = this.summary.frontend.unit.coverage;
      report += `- Coverage: ${cov.lines}% lines, ${cov.functions}% functions, ${cov.branches}% branches\n\n`;
    }

    // Frontend Integration Tests
    if (this.summary.frontend.integration.total) {
      report += `### Frontend Integration Tests\n`;
      const int = this.summary.frontend.integration;
      report += `- ${int.passed}/${int.total} passed\n\n`;
    }

    // Backend Tests
    if (this.summary.backend.coverage) {
      report += `### Backend Tests\n`;
      report += `- Coverage: ${this.summary.backend.coverage.lines.toFixed(1)}% lines\n\n`;
    }

    // E2E Tests
    if (this.summary.e2e.api.total || this.summary.e2e.ui.total) {
      report += `### E2E Tests\n`;
      if (this.summary.e2e.api.total) {
        const api = this.summary.e2e.api;
        report += `- API Tests: ${api.passed}/${api.total} passed\n`;
      }
      if (this.summary.e2e.ui.total) {
        const ui = this.summary.e2e.ui;
        report += `- UI Tests: ${ui.passed}/${ui.total} passed\n`;
      }
      report += `\n`;
    }

    // Visual Regression
    if (this.summary.visual.total) {
      report += `### Visual Regression Tests\n`;
      const vis = this.summary.visual;
      report += `- ${vis.passed}/${vis.total} passed\n\n`;
    }

    // Performance
    if (this.summary.performance && Object.keys(this.summary.performance).length > 0) {
      report += `### Performance Tests\n`;
      report += `- Performance metrics collected\n`;
      if (this.summary.performance.hasRegressions) {
        report += `- ⚠️ Performance regressions detected\n`;
      }
      report += `\n`;
    }

    // Accessibility
    if (this.summary.accessibility.violations !== undefined) {
      report += `### Accessibility Tests\n`;
      const acc = this.summary.accessibility;
      report += `- Total violations: ${acc.violations}\n`;
      if (acc.critical > 0) report += `- Critical: ${acc.critical} ⚠️\n`;
      if (acc.serious > 0) report += `- Serious: ${acc.serious} ⚠️\n`;
      report += `\n`;
    }

    // Links to artifacts
    report += `## 📊 Detailed Reports\n\n`;
    report += `Download the test artifacts from the GitHub Actions run for detailed reports:\n\n`;
    report += `- [Frontend Coverage Report](./coverage/lcov-report/index.html)\n`;
    report += `- [Backend Coverage Report](./htmlcov/index.html)\n`;
    report += `- [Playwright HTML Reports](./playwright-report/index.html)\n`;
    report += `- [Performance Reports](./performance-reports/)\n`;
    report += `- [Accessibility Reports](./accessibility-report/)\n`;

    return report;
  }

  findFiles(pattern) {
    // Simple file finder - in real implementation, use glob
    try {
      if (fs.existsSync(pattern)) {
        return [pattern];
      }

      // Try to find files in artifacts directory
      const artifactsDir = path.dirname(pattern);
      if (fs.existsSync(artifactsDir)) {
        const files = fs.readdirSync(artifactsDir, { recursive: true });
        const fileName = path.basename(pattern);
        return files
          .filter(file => file.includes(fileName.replace('*', '')))
          .map(file => path.join(artifactsDir, file));
      }
    } catch (error) {
      // Ignore errors
    }
    return [];
  }

  getLatestRunId() {
    // In CI, this would be the actual run ID
    return process.env.GITHUB_RUN_ID || '*';
  }
}

// Run the script
if (require.main === module) {
  const generator = new TestSummaryGenerator();
  generator.generateSummary();
}

module.exports = TestSummaryGenerator;