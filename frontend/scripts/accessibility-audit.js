#!/usr/bin/env node

/**
 * Accessibility Audit Script
 *
 * This script analyzes accessibility test results and generates comprehensive reports.
 * It can be used to:
 * - Generate HTML reports from JSON results
 * - Check violation thresholds
 * - Create summary statistics
 * - Export results in various formats
 */

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(__dirname, '..', 'accessibility-results.json');
const REPORT_DIR = path.join(__dirname, '..', 'accessibility-report');

class AccessibilityAuditor {
  constructor() {
    this.results = null;
    this.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      violations: [],
      criticalViolations: [],
      seriousViolations: [],
      moderateViolations: [],
      minorViolations: []
    };
  }

  loadResults() {
    try {
      if (!fs.existsSync(RESULTS_FILE)) {
        console.error('❌ Accessibility results file not found:', RESULTS_FILE);
        console.log('Run accessibility tests first with: npm run e2e:accessibility');
        process.exit(1);
      }

      const data = fs.readFileSync(RESULTS_FILE, 'utf8');
      this.results = JSON.parse(data);
      console.log('✅ Loaded accessibility results');
    } catch (error) {
      console.error('❌ Error loading results:', error.message);
      process.exit(1);
    }
  }

  analyzeResults() {
    if (!this.results) {
      this.loadResults();
    }

    this.summary.totalTests = 0;
    this.summary.passedTests = 0;
    this.summary.failedTests = 0;
    this.summary.violations = [];

    // Analyze each test suite
    this.results.suites?.forEach(suite => {
      suite.specs?.forEach(spec => {
        spec.tests?.forEach(test => {
          this.summary.totalTests++;

          const lastResult = test.results?.[test.results.length - 1];
          if (lastResult?.status === 'passed') {
            this.summary.passedTests++;
          } else if (lastResult?.status === 'failed') {
            this.summary.failedTests++;

            // Extract violation information from test annotations or errors
            const violations = this.extractViolations(test);
            this.summary.violations.push(...violations);
          }
        });
      });
    });

    // Categorize violations by severity
    this.categorizeViolations();

    console.log('✅ Analyzed accessibility results');
  }

  extractViolations(test) {
    const violations = [];

    // Look for violations in test results
    test.results?.forEach(result => {
      result.errors?.forEach(error => {
        // Parse axe-core violation format
        if (error.message?.includes('accessibility violation')) {
          violations.push({
            test: test.title,
            message: error.message,
            severity: this.extractSeverity(error.message),
            rule: this.extractRule(error.message),
            element: this.extractElement(error.message)
          });
        }
      });
    });

    return violations;
  }

  extractSeverity(message) {
    if (message.includes('critical')) return 'critical';
    if (message.includes('serious')) return 'serious';
    if (message.includes('moderate')) return 'moderate';
    if (message.includes('minor')) return 'minor';
    return 'unknown';
  }

  extractRule(message) {
    // Extract rule ID from axe-core messages
    const ruleMatch = message.match(/([a-zA-Z][a-zA-Z0-9-_]+)\s*:/);
    return ruleMatch ? ruleMatch[1] : 'unknown';
  }

  extractElement(message) {
    // Extract element selector from messages
    const elementMatch = message.match(/element\s+([^;]+)/i);
    return elementMatch ? elementMatch[1].trim() : 'unknown';
  }

  categorizeViolations() {
    this.summary.violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          this.summary.criticalViolations.push(violation);
          break;
        case 'serious':
          this.summary.seriousViolations.push(violation);
          break;
        case 'moderate':
          this.summary.moderateViolations.push(violation);
          break;
        case 'minor':
          this.summary.minorViolations.push(violation);
          break;
      }
    });
  }

  checkThresholds(maxViolations = 10, maxSerious = 0) {
    const totalViolations = this.summary.violations.length;
    const seriousViolations = this.summary.seriousViolations.length;

    console.log('\n📊 Accessibility Threshold Check:');
    console.log(`Total violations: ${totalViolations} (threshold: ${maxViolations})`);
    console.log(`Serious violations: ${seriousViolations} (threshold: ${maxSerious})`);

    let passed = true;

    if (totalViolations > maxViolations) {
      console.log(`❌ Total violations (${totalViolations}) exceed threshold (${maxViolations})`);
      passed = false;
    }

    if (seriousViolations > maxSerious) {
      console.log(`❌ Serious violations (${seriousViolations}) exceed threshold (${maxSerious})`);
      passed = false;
    }

    if (passed) {
      console.log('✅ All accessibility thresholds passed');
    }

    return passed;
  }

  generateReport() {
    // Ensure report directory exists
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const reportPath = path.join(REPORT_DIR, 'accessibility-summary.html');
    const reportHtml = this.generateHtmlReport();

    fs.writeFileSync(reportPath, reportHtml);
    console.log(`📄 Generated HTML report: ${reportPath}`);

    // Generate JSON summary
    const summaryPath = path.join(REPORT_DIR, 'accessibility-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(this.summary, null, 2));
    console.log(`📄 Generated JSON summary: ${summaryPath}`);
  }

  generateHtmlReport() {
    const date = new Date().toISOString();
    const passRate = this.summary.totalTests > 0 ?
      ((this.summary.passedTests / this.summary.totalTests) * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .violations { margin-top: 30px; }
        .violation { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-bottom: 10px; }
        .violation.critical { background: #f8d7da; border-color: #f5c6cb; }
        .violation.serious { background: #fff3cd; border-color: #ffeaa7; }
        .violation.moderate { background: #d1ecf1; border-color: #bee5eb; }
        .violation-title { font-weight: bold; margin-bottom: 5px; }
        .violation-details { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Accessibility Audit Report</h1>
            <p>Generated on ${date}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${this.summary.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Pass Rate</h3>
                <div class="value ${passRate >= 90 ? 'passed' : passRate >= 70 ? 'warning' : 'failed'}">${passRate}%</div>
            </div>
            <div class="metric">
                <h3>Passed Tests</h3>
                <div class="value passed">${this.summary.passedTests}</div>
            </div>
            <div class="metric">
                <h3>Failed Tests</h3>
                <div class="value ${this.summary.failedTests === 0 ? 'passed' : 'failed'}">${this.summary.failedTests}</div>
            </div>
            <div class="metric">
                <h3>Total Violations</h3>
                <div class="value ${this.summary.violations.length === 0 ? 'passed' : 'failed'}">${this.summary.violations.length}</div>
            </div>
            <div class="metric">
                <h3>Critical Violations</h3>
                <div class="value ${this.summary.criticalViolations.length === 0 ? 'passed' : 'failed'}">${this.summary.criticalViolations.length}</div>
            </div>
        </div>

        ${this.summary.violations.length > 0 ? `
        <div class="violations">
            <h2>Accessibility Violations</h2>
            ${this.summary.violations.map(violation => `
            <div class="violation ${violation.severity}">
                <div class="violation-title">${violation.severity.toUpperCase()}: ${violation.rule}</div>
                <div class="violation-details">
                    <strong>Test:</strong> ${violation.test}<br>
                    <strong>Element:</strong> ${violation.element}<br>
                    <strong>Message:</strong> ${violation.message}
                </div>
            </div>
            `).join('')}
        </div>
        ` : '<div class="violations"><h2>🎉 No Accessibility Violations Found!</h2></div>'}
    </div>
</body>
</html>`;
  }

  printSummary() {
    console.log('\n📊 Accessibility Audit Summary:');
    console.log('================================');
    console.log(`Total Tests: ${this.summary.totalTests}`);
    console.log(`Passed: ${this.summary.passedTests}`);
    console.log(`Failed: ${this.summary.failedTests}`);
    console.log(`Pass Rate: ${this.summary.totalTests > 0 ? ((this.summary.passedTests / this.summary.totalTests) * 100).toFixed(1) : 0}%`);
    console.log('');
    console.log('Violations by Severity:');
    console.log(`Critical: ${this.summary.criticalViolations.length}`);
    console.log(`Serious: ${this.summary.seriousViolations.length}`);
    console.log(`Moderate: ${this.summary.moderateViolations.length}`);
    console.log(`Minor: ${this.summary.minorViolations.length}`);
    console.log(`Total: ${this.summary.violations.length}`);
  }
}

// Main execution
function main() {
  const auditor = new AccessibilityAuditor();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const maxViolations = parseInt(process.env.ACCESSIBILITY_MAX_VIOLATIONS) || 10;
  const maxSerious = parseInt(process.env.ACCESSIBILITY_MAX_SERIOUS_VIOLATIONS) || 0;

  try {
    auditor.loadResults();
    auditor.analyzeResults();
    auditor.printSummary();

    const thresholdsPassed = auditor.checkThresholds(maxViolations, maxSerious);

    if (args.includes('--report') || args.includes('-r')) {
      auditor.generateReport();
    }

    if (!thresholdsPassed) {
      console.log('\n❌ Accessibility audit failed - thresholds exceeded');
      process.exit(1);
    }

    console.log('\n✅ Accessibility audit completed successfully');
  } catch (error) {
    console.error('❌ Accessibility audit failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AccessibilityAuditor;