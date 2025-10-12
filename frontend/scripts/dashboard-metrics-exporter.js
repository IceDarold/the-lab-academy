#!/usr/bin/env node

/**
 * Dashboard Metrics Exporter
 *
 * Exports test metrics in formats suitable for dashboards and monitoring systems.
 * Supports JSON, Prometheus, and InfluxDB formats.
 */

const fs = require('fs');
const path = require('path');

class DashboardMetricsExporter {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'dashboard-metrics');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportAllMetrics() {
    console.log('📊 Exporting dashboard metrics...');

    const metrics = this.collectAllMetrics();
    if (!metrics) {
      console.log('No metrics available for export');
      return;
    }

    // Export in different formats
    this.exportJSON(metrics);
    this.exportPrometheus(metrics);
    this.exportInfluxDB(metrics);
    this.exportGrafana(metrics);

    console.log('✅ Dashboard metrics exported successfully');
  }

  collectAllMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      testRun: null,
      validation: null,
      trends: null,
      alerts: null
    };

    // Load test run metrics
    try {
      const testMetricsDir = path.join(process.cwd(), 'test-results');
      const files = fs.readdirSync(testMetricsDir)
        .filter(file => file.endsWith('-metrics.json'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(testMetricsDir, a));
          const statB = fs.statSync(path.join(testMetricsDir, b));
          return statB.mtime - statA.mtime;
        });

      if (files.length > 0) {
        metrics.testRun = JSON.parse(fs.readFileSync(path.join(testMetricsDir, files[0]), 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load test run metrics:', error.message);
    }

    // Load validation metrics
    try {
      const validationMetricsPath = path.join(process.cwd(), 'test-results', 'validation-metrics.json');
      if (fs.existsSync(validationMetricsPath)) {
        metrics.validation = JSON.parse(fs.readFileSync(validationMetricsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load validation metrics:', error.message);
    }

    // Load trend data
    try {
      const trendsPath = path.join(process.cwd(), 'test-results', 'test-trends.json');
      if (fs.existsSync(trendsPath)) {
        metrics.trends = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load trend data:', error.message);
    }

    // Load alert history
    try {
      const alertsPath = path.join(process.cwd(), 'test-results', 'alert-history.json');
      if (fs.existsSync(alertsPath)) {
        const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
        metrics.alerts = {
          total: alerts.length,
          critical: alerts.filter(a => a.type === 'critical').length,
          warning: alerts.filter(a => a.type === 'warning').length,
          recent: alerts.slice(-10) // Last 10 alerts
        };
      }
    } catch (error) {
      console.warn('Could not load alert history:', error.message);
    }

    return metrics;
  }

  exportJSON(metrics) {
    const outputPath = path.join(this.outputDir, 'metrics.json');
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    console.log(`📄 JSON metrics exported: ${outputPath}`);
  }

  exportPrometheus(metrics) {
    const prometheusMetrics = [];

    // Test run metrics
    if (metrics.testRun) {
      const testRun = metrics.testRun;
      prometheusMetrics.push(`# HELP test_execution_duration_seconds Total test execution duration in seconds`);
      prometheusMetrics.push(`# TYPE test_execution_duration_seconds gauge`);
      prometheusMetrics.push(`test_execution_duration_seconds{test_type="${testRun.testType || 'unknown'}"} ${testRun.duration / 1000}`);

      prometheusMetrics.push(`# HELP test_execution_exit_code Exit code of test execution`);
      prometheusMetrics.push(`# TYPE test_execution_exit_code gauge`);
      prometheusMetrics.push(`test_execution_exit_code{test_type="${testRun.testType || 'unknown'}"} ${testRun.exitCode || 0}`);

      if (testRun.testDuration) {
        prometheusMetrics.push(`# HELP test_duration_seconds Test duration in seconds`);
        prometheusMetrics.push(`# TYPE test_duration_seconds gauge`);
        prometheusMetrics.push(`test_duration_seconds{test_type="${testRun.testType || 'unknown'}"} ${testRun.testDuration / 1000}`);
      }
    }

    // Validation metrics
    if (metrics.validation) {
      const validation = metrics.validation;
      prometheusMetrics.push(`# HELP validation_duration_seconds Validation duration in seconds`);
      prometheusMetrics.push(`# TYPE validation_duration_seconds gauge`);
      prometheusMetrics.push(`validation_duration_seconds ${validation.duration / 1000}`);

      prometheusMetrics.push(`# HELP validation_passed Validation success status`);
      prometheusMetrics.push(`# TYPE validation_passed gauge`);
      prometheusMetrics.push(`validation_passed ${validation.passed ? 1 : 0}`);

      prometheusMetrics.push(`# HELP validation_errors_total Total validation errors`);
      prometheusMetrics.push(`# TYPE validation_errors_total gauge`);
      prometheusMetrics.push(`validation_errors_total ${validation.totalErrors || 0}`);
    }

    // Alert metrics
    if (metrics.alerts) {
      const alerts = metrics.alerts;
      prometheusMetrics.push(`# HELP alerts_total Total number of alerts`);
      prometheusMetrics.push(`# TYPE alerts_total gauge`);
      prometheusMetrics.push(`alerts_total ${alerts.total || 0}`);

      prometheusMetrics.push(`# HELP alerts_critical_total Total number of critical alerts`);
      prometheusMetrics.push(`# TYPE alerts_critical_total gauge`);
      prometheusMetrics.push(`alerts_critical_total ${alerts.critical || 0}`);

      prometheusMetrics.push(`# HELP alerts_warning_total Total number of warning alerts`);
      prometheusMetrics.push(`# TYPE alerts_warning_total gauge`);
      prometheusMetrics.push(`alerts_warning_total ${alerts.warning || 0}`);
    }

    const outputPath = path.join(this.outputDir, 'metrics.prometheus');
    fs.writeFileSync(outputPath, prometheusMetrics.join('\n') + '\n');
    console.log(`📄 Prometheus metrics exported: ${outputPath}`);
  }

  exportInfluxDB(metrics) {
    const influxLines = [];

    const addPoint = (measurement, tags, fields, timestamp) => {
      const tagStr = Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(',');
      const fieldStr = Object.entries(fields).map(([k, v]) => `${k}=${v}`).join(',');
      influxLines.push(`${measurement},${tagStr} ${fieldStr} ${timestamp}`);
    };

    const timestamp = Date.now() * 1000000; // Nanoseconds

    // Test run metrics
    if (metrics.testRun) {
      const testRun = metrics.testRun;
      addPoint('test_execution', {
        test_type: testRun.testType || 'unknown',
        run_id: testRun.runId || 'unknown'
      }, {
        duration_seconds: testRun.duration / 1000,
        exit_code: testRun.exitCode || 0,
        test_duration_seconds: (testRun.testDuration || 0) / 1000
      }, timestamp);
    }

    // Validation metrics
    if (metrics.validation) {
      const validation = metrics.validation;
      addPoint('validation', {}, {
        duration_seconds: validation.duration / 1000,
        passed: validation.passed ? 1 : 0,
        errors_total: validation.totalErrors || 0,
        warnings_total: validation.totalWarnings || 0
      }, timestamp);
    }

    // Alert metrics
    if (metrics.alerts) {
      const alerts = metrics.alerts;
      addPoint('alerts', {}, {
        total: alerts.total || 0,
        critical_total: alerts.critical || 0,
        warning_total: alerts.warning || 0
      }, timestamp);
    }

    const outputPath = path.join(this.outputDir, 'metrics.influxdb');
    fs.writeFileSync(outputPath, influxLines.join('\n') + '\n');
    console.log(`📄 InfluxDB metrics exported: ${outputPath}`);
  }

  exportGrafana(metrics) {
    // Create Grafana dashboard JSON
    const dashboard = {
      dashboard: {
        title: 'Test Infrastructure Monitoring',
        tags: ['test', 'monitoring', 'ci-cd'],
        timezone: 'browser',
        panels: [],
        time: {
          from: 'now-1h',
          to: 'now'
        },
        refresh: '5m'
      }
    };

    let panelId = 1;

    // Test Execution Panel
    if (metrics.testRun) {
      dashboard.dashboard.panels.push({
        id: panelId++,
        title: 'Test Execution',
        type: 'stat',
        targets: [{
          expr: 'test_execution_duration_seconds',
          legendFormat: '{{test_type}}'
        }],
        fieldConfig: {
          defaults: {
            unit: 's',
            color: {
              mode: 'thresholds'
            },
            thresholds: {
              mode: 'absolute',
              steps: [
                { color: 'green', value: null },
                { color: 'red', value: 300 }
              ]
            }
          }
        }
      });
    }

    // Validation Status Panel
    if (metrics.validation) {
      dashboard.dashboard.panels.push({
        id: panelId++,
        title: 'Validation Status',
        type: 'stat',
        targets: [{
          expr: 'validation_passed',
          legendFormat: 'Validation Passed'
        }],
        fieldConfig: {
          defaults: {
            unit: 'none',
            color: {
              mode: 'thresholds'
            },
            thresholds: {
              mode: 'absolute',
              steps: [
                { color: 'red', value: null },
                { color: 'green', value: 1 }
              ]
            }
          }
        }
      });
    }

    // Alerts Panel
    if (metrics.alerts) {
      dashboard.dashboard.panels.push({
        id: panelId++,
        title: 'Active Alerts',
        type: 'table',
        targets: [{
          expr: 'alerts_total',
          legendFormat: 'Total Alerts'
        }],
        fieldConfig: {
          defaults: {
            unit: 'none'
          }
        }
      });
    }

    const outputPath = path.join(this.outputDir, 'grafana-dashboard.json');
    fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));
    console.log(`📄 Grafana dashboard exported: ${outputPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const exporter = new DashboardMetricsExporter();
  exporter.exportAllMetrics().catch(error => {
    console.error('Dashboard metrics export failed:', error);
    process.exit(1);
  });
}

module.exports = DashboardMetricsExporter;