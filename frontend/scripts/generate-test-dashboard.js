#!/usr/bin/env node

/**
 * Test Health Dashboard Generator
 *
 * Generates visual dashboards for monitoring test suite health,
 * performance trends, and quality metrics over time.
 */

const fs = require('fs');
const path = require('path');

class TestDashboardGenerator {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'test-results-history');
    this.dashboardDir = path.join(process.cwd(), 'test-dashboard');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.resultsDir, this.dashboardDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateDashboard() {
    console.log('📊 Generating test health dashboard...');

    try {
      // Load historical data
      const history = this.loadHistoricalData();
      const trends = this.loadTrendData();

      if (!history || history.length === 0) {
        console.log('No historical data available for dashboard generation');
        return;
      }

      // Generate dashboard components
      this.generateMainDashboard(history, trends);
      this.generateCoverageDashboard(history);
      this.generatePerformanceDashboard(history);
      this.generateQualityDashboard(history);
      this.generateTrendCharts(history, trends);

      console.log('✅ Test dashboard generated successfully');

    } catch (error) {
      console.error('❌ Error generating dashboard:', error);
      throw error;
    }
  }

  loadHistoricalData() {
    const historyFile = path.join(this.resultsDir, 'test-history.json');
    if (fs.existsSync(historyFile)) {
      return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    return [];
  }

  loadTrendData() {
    const trendsFile = path.join(this.resultsDir, 'test-trends.json');
    if (fs.existsSync(trendsFile)) {
      return JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
    }
    return null;
  }

  generateMainDashboard(history, trends) {
    const latest = history[history.length - 1];
    const previous = history.length > 1 ? history[history.length - 2] : null;

    const dashboard = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Health Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-title { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; }
        .metric-value { font-size: 32px; font-weight: bold; color: #333; }
        .metric-change { font-size: 14px; margin-top: 4px; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #6c757d; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .chart-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-good { background: #28a745; }
        .status-warning { background: #ffc107; }
        .status-bad { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Health Dashboard</h1>
            <p>Last updated: ${new Date().toLocaleString()}</p>
            <p>Commit: ${latest.commit.substring(0, 7)} | Branch: ${latest.branch}</p>
        </div>

        <div class="metrics-grid">
            ${this.generateMetricCards(latest, previous)}
        </div>

        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">Test Pass Rate Trend</div>
                <canvas id="passRateChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">Coverage Trend</div>
                <canvas id="coverageChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">Performance Regressions</div>
                <canvas id="performanceChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">Accessibility Violations</div>
                <canvas id="accessibilityChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">Recent Test Runs</div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Date</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Commit</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Tests</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Pass Rate</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Coverage</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateRecentRunsTable(history.slice(-10))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        ${this.generateChartScript(history)}
    </script>
</body>
</html>`;

    const dashboardPath = path.join(this.dashboardDir, 'index.html');
    fs.writeFileSync(dashboardPath, dashboard);
    console.log(`📄 Generated main dashboard: ${dashboardPath}`);
  }

  generateMetricCards(latest, previous) {
    const summary = latest.summary;
    const prevSummary = previous?.summary;

    const metrics = [
      {
        title: 'Total Tests',
        value: summary.totalTests,
        change: prevSummary ? summary.totalTests - prevSummary.totalTests : 0,
        format: 'number'
      },
      {
        title: 'Pass Rate',
        value: summary.totalTests > 0 ? (summary.passedTests / summary.totalTests) * 100 : 0,
        change: prevSummary && prevSummary.totalTests > 0 ?
          ((summary.passedTests / summary.totalTests) * 100) - ((prevSummary.passedTests / prevSummary.totalTests) * 100) : 0,
        format: 'percentage'
      },
      {
        title: 'Frontend Coverage',
        value: summary.coverage.frontend || 0,
        change: prevSummary ? (summary.coverage.frontend || 0) - (prevSummary.coverage.frontend || 0) : 0,
        format: 'percentage'
      },
      {
        title: 'Backend Coverage',
        value: summary.coverage.backend || 0,
        change: prevSummary ? (summary.coverage.backend || 0) - (prevSummary.coverage.backend || 0) : 0,
        format: 'percentage'
      },
      {
        title: 'Accessibility Violations',
        value: summary.accessibility.violations,
        change: prevSummary ? summary.accessibility.violations - prevSummary.accessibility.violations : 0,
        format: 'number',
        invert: true // Lower is better
      },
      {
        title: 'Performance Regressions',
        value: summary.performance.hasRegressions ? 1 : 0,
        change: 0,
        format: 'boolean'
      }
    ];

    return metrics.map(metric => {
      const changeClass = metric.change > 0 ? (metric.invert ? 'negative' : 'positive') :
                         metric.change < 0 ? (metric.invert ? 'positive' : 'negative') : 'neutral';
      const changeIcon = metric.change > 0 ? '↗️' : metric.change < 0 ? '↘️' : '→';
      const changeText = metric.change === 0 ? 'No change' :
                        `${changeIcon} ${Math.abs(metric.change)}${metric.format === 'percentage' ? '%' : ''}`;

      let displayValue;
      if (metric.format === 'percentage') {
        displayValue = `${metric.value.toFixed(1)}%`;
      } else if (metric.format === 'boolean') {
        displayValue = metric.value ? 'Yes' : 'No';
      } else {
        displayValue = metric.value;
      }

      return `
        <div class="metric-card">
          <div class="metric-title">${metric.title}</div>
          <div class="metric-value">${displayValue}</div>
          <div class="metric-change ${changeClass}">${changeText}</div>
        </div>
      `;
    }).join('');
  }

  generateRecentRunsTable(recentRuns) {
    return recentRuns.reverse().map(run => {
      const date = new Date(run.timestamp).toLocaleDateString();
      const passRate = run.summary.totalTests > 0 ? ((run.summary.passedTests / run.summary.totalTests) * 100).toFixed(1) : 0;
      const coverage = run.summary.coverage.frontend ? `${run.summary.coverage.frontend.toFixed(1)}%` : 'N/A';
      const issues = [];

      if (run.summary.failedTests > 0) issues.push(`${run.summary.failedTests} failed`);
      if (run.summary.accessibility.violations > 0) issues.push(`${run.summary.accessibility.violations} a11y`);
      if (run.summary.performance.hasRegressions) issues.push('perf regression');
      if (run.summary.visual.regressions > 0) issues.push(`${run.summary.visual.regressions} visual`);

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${date}</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6; font-family: monospace;">${run.commit.substring(0, 7)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${run.summary.totalTests}</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${passRate}%</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${coverage}</td>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${issues.join(', ') || 'None'}</td>
        </tr>
      `;
    }).join('');
  }

  generateChartScript(history) {
    // Prepare data for charts
    const labels = history.slice(-20).map(h => new Date(h.timestamp).toLocaleDateString());
    const passRates = history.slice(-20).map(h =>
      h.summary.totalTests > 0 ? (h.summary.passedTests / h.summary.totalTests) * 100 : 0
    );
    const frontendCoverage = history.slice(-20).map(h => h.summary.coverage.frontend || 0);
    const backendCoverage = history.slice(-20).map(h => h.summary.coverage.backend || 0);
    const performanceRegressions = history.slice(-20).map(h => h.summary.performance.hasRegressions ? 1 : 0);
    const accessibilityViolations = history.slice(-20).map(h => h.summary.accessibility.violations || 0);

    return `
      // Pass Rate Chart
      new Chart(document.getElementById('passRateChart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Pass Rate (%)',
            data: ${JSON.stringify(passRates)},
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });

      // Coverage Chart
      new Chart(document.getElementById('coverageChart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Frontend Coverage (%)',
            data: ${JSON.stringify(frontendCoverage)},
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }, {
            label: 'Backend Coverage (%)',
            data: ${JSON.stringify(backendCoverage)},
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });

      // Performance Chart
      new Chart(document.getElementById('performanceChart'), {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Performance Regressions',
            data: ${JSON.stringify(performanceRegressions)},
            backgroundColor: 'rgb(255, 159, 64)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      // Accessibility Chart
      new Chart(document.getElementById('accessibilityChart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Accessibility Violations',
            data: ${JSON.stringify(accessibilityViolations)},
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    `;
  }

  generateCoverageDashboard(history) {
    // Generate detailed coverage dashboard
    const coverageData = history.filter(h => h.summary.coverage.frontend || h.summary.coverage.backend);

    if (coverageData.length === 0) return;

    const coverageDashboard = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coverage Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Code Coverage Dashboard</h1>

        <div class="chart-container">
            <h2>Coverage Trends</h2>
            <canvas id="coverageTrendsChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>Coverage Distribution</h2>
            <canvas id="coverageDistributionChart"></canvas>
        </div>
    </div>

    <script>
        const coverageHistory = ${JSON.stringify(coverageData)};

        // Coverage Trends
        const labels = coverageHistory.map(h => new Date(h.timestamp).toLocaleDateString());
        const frontendData = coverageHistory.map(h => h.summary.coverage.frontend || 0);
        const backendData = coverageHistory.map(h => h.summary.coverage.backend || 0);

        new Chart(document.getElementById('coverageTrendsChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frontend Coverage (%)',
                    data: frontendData,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }, {
                    label: 'Backend Coverage (%)',
                    data: backendData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });

        // Coverage Distribution (latest values)
        const latest = coverageHistory[coverageHistory.length - 1];
        const coverageValues = [];
        const coverageLabels = [];

        if (latest.summary.coverage.frontend) {
            coverageValues.push(latest.summary.coverage.frontend);
            coverageLabels.push('Frontend');
        }
        if (latest.summary.coverage.backend) {
            coverageValues.push(latest.summary.coverage.backend);
            coverageLabels.push('Backend');
        }

        new Chart(document.getElementById('coverageDistributionChart'), {
            type: 'doughnut',
            data: {
                labels: coverageLabels,
                datasets: [{
                    data: coverageValues,
                    backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)']
                }]
            },
            options: {
                responsive: true
            }
        });
    </script>
</body>
</html>`;

    const coveragePath = path.join(this.dashboardDir, 'coverage.html');
    fs.writeFileSync(coveragePath, coverageDashboard);
    console.log(`📄 Generated coverage dashboard: ${coveragePath}`);
  }

  generatePerformanceDashboard(history) {
    // Generate performance dashboard
    const perfData = history.filter(h => h.summary.performance.metrics);

    if (perfData.length === 0) return;

    const perfDashboard = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ Performance Dashboard</h1>

        <div class="chart-container">
            <h2>Performance Regressions Over Time</h2>
            <canvas id="performanceRegressionsChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>Performance Metrics Summary</h2>
            <div id="performanceMetrics"></div>
        </div>
    </div>

    <script>
        const perfHistory = ${JSON.stringify(perfData)};

        // Performance Regressions Chart
        const labels = perfHistory.map(h => new Date(h.timestamp).toLocaleDateString());
        const regressions = perfHistory.map(h => h.summary.performance.hasRegressions ? 1 : 0);

        new Chart(document.getElementById('performanceRegressionsChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance Regressions',
                    data: regressions,
                    backgroundColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Performance Metrics Summary
        const latestPerf = perfHistory[perfHistory.length - 1];
        const metricsDiv = document.getElementById('performanceMetrics');

        if (latestPerf.summary.performance.metrics) {
            const metrics = latestPerf.summary.performance.metrics;
            let html = '<table style="width: 100%; border-collapse: collapse;">';
            html += '<tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Metric</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Status</th></tr>';

            Object.keys(metrics).forEach(key => {
                const metric = metrics[key];
                const status = metric.direction === 'decreasing' ? '⚠️ Regressing' :
                              metric.direction === 'increasing' ? '✅ Improving' : '➡️ Stable';
                html += \`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">\${key}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">\${status}</td></tr>\`;
            });

            html += '</table>';
            metricsDiv.innerHTML = html;
        }
    </script>
</body>
</html>`;

    const perfPath = path.join(this.dashboardDir, 'performance.html');
    fs.writeFileSync(perfPath, perfDashboard);
    console.log(`📄 Generated performance dashboard: ${perfPath}`);
  }

  generateQualityDashboard(history) {
    // Generate quality metrics dashboard (accessibility, test failures, etc.)
    const qualityDashboard = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Quality Dashboard</h1>

        <div class="chart-container">
            <h2>Accessibility Violations Trend</h2>
            <canvas id="accessibilityChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>Test Failures Trend</h2>
            <canvas id="failuresChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>Quality Metrics Summary</h2>
            <div id="qualitySummary"></div>
        </div>
    </div>

    <script>
        const qualityHistory = ${JSON.stringify(history)};

        // Accessibility Violations Chart
        const labels = qualityHistory.map(h => new Date(h.timestamp).toLocaleDateString());
        const violations = qualityHistory.map(h => h.summary.accessibility.violations || 0);

        new Chart(document.getElementById('accessibilityChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accessibility Violations',
                    data: violations,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Test Failures Chart
        const failures = qualityHistory.map(h => h.summary.failedTests || 0);

        new Chart(document.getElementById('failuresChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Test Failures',
                    data: failures,
                    backgroundColor: 'rgb(255, 159, 64)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Quality Summary
        const latest = qualityHistory[qualityHistory.length - 1];
        const summaryDiv = document.getElementById('qualitySummary');

        const summary = {
            'Total Tests': latest.summary.totalTests,
            'Pass Rate': latest.summary.totalTests > 0 ? ((latest.summary.passedTests / latest.summary.totalTests) * 100).toFixed(1) + '%' : 'N/A',
            'Accessibility Violations': latest.summary.accessibility.violations,
            'Critical A11y Violations': latest.summary.accessibility.criticalViolations,
            'Performance Regressions': latest.summary.performance.hasRegressions ? 'Yes' : 'No',
            'Visual Regressions': latest.summary.visual.regressions
        };

        let html = '<table style="width: 100%; border-collapse: collapse;">';
        Object.keys(summary).forEach(key => {
            const value = summary[key];
            const status = (key.includes('Violations') && value > 0) || (key.includes('Regressions') && value !== 'No') ? '⚠️' : '✅';
            html += \`<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">\${key}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">\${value} \${status}</td></tr>\`;
        });
        html += '</table>';

        summaryDiv.innerHTML = html;
    </script>
</body>
</html>`;

    const qualityPath = path.join(this.dashboardDir, 'quality.html');
    fs.writeFileSync(qualityPath, qualityDashboard);
    console.log(`📄 Generated quality dashboard: ${qualityPath}`);
  }

  generateTrendCharts(history, trends) {
    if (!trends) return;

    const trendsDashboard = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trends Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .trend-card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .trend-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .trend-direction { font-size: 24px; margin: 10px 0; }
        .trend-details { color: #666; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📈 Test Trends Dashboard</h1>
        <p>Analysis of test metrics trends over time</p>

        ${this.generateTrendCards(trends)}
    </div>
</body>
</html>`;

    const trendsPath = path.join(this.dashboardDir, 'trends.html');
    fs.writeFileSync(trendsPath, trendsDashboard);
    console.log(`📄 Generated trends dashboard: ${trendsPath}`);
  }

  generateTrendCards(trends) {
    const metrics = trends.metrics;

    const trendCards = Object.keys(metrics).map(key => {
      const metric = metrics[key];
      if (!metric) return '';

      const direction = metric.direction;
      const directionIcon = direction === 'increasing' ? '↗️' :
                           direction === 'decreasing' ? '↘️' : '→';
      const directionClass = direction === 'increasing' ? 'positive' :
                            direction === 'decreasing' ? 'negative' : 'neutral';

      return `
        <div class="trend-card">
          <div class="trend-title">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
          <div class="trend-direction ${directionClass}">${directionIcon} ${direction}</div>
          <div class="trend-details">
            <div>Change: ${metric.percentChange.toFixed(1)}%</div>
            <div>Slope: ${metric.slope.toFixed(3)}</div>
            <div>Data Points: ${metric.dataPoints}</div>
            <div>Period: ${new Date(metric.period.start).toLocaleDateString()} - ${new Date(metric.period.end).toLocaleDateString()}</div>
          </div>
        </div>
      `;
    }).join('');

    return trendCards;
  }
}

// Run the script
if (require.main === module) {
  const generator = new TestDashboardGenerator();
  generator.generateDashboard();
}

module.exports = TestDashboardGenerator;