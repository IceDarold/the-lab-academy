#!/usr/bin/env node

/**
 * Test Alert Monitor
 *
 * Monitors test execution metrics and sends alerts based on configured thresholds.
 * Supports multiple notification channels (console, Slack, email, webhook).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

class TestAlertMonitor {
  constructor() {
    this.config = this.loadConfig();
    this.alertHistory = this.loadAlertHistory();
    this.cooldowns = new Map();
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), 'monitoring-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('Monitoring config not found, using defaults');
      return this.getDefaultConfig();
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.monitoring || this.getDefaultConfig();
    } catch (error) {
      console.error('Failed to load monitoring config:', error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      enabled: true,
      alerting: {
        enabled: true,
        channels: { console: true },
        thresholds: {
          testFailureRate: { warning: 0.05, critical: 0.15 },
          testDurationIncrease: { warning: 0.20, critical: 0.50 },
          validationFailures: { warning: 1, critical: 3 }
        },
        cooldown: { minutes: 5 }
      }
    };
  }

  loadAlertHistory() {
    const historyPath = path.join(process.cwd(), 'test-results', 'alert-history.json');
    if (!fs.existsSync(historyPath)) {
      return [];
    }

    try {
      return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (error) {
      console.warn('Failed to load alert history:', error.message);
      return [];
    }
  }

  saveAlertHistory() {
    const historyPath = path.join(process.cwd(), 'test-results', 'alert-history.json');
    const historyDir = path.dirname(historyPath);

    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    // Keep only last 100 alerts
    const recentHistory = this.alertHistory.slice(-100);
    fs.writeFileSync(historyPath, JSON.stringify(recentHistory, null, 2));
  }

  async checkMetrics() {
    console.log('🔍 Checking test metrics for alerts...');

    if (!this.config.enabled || !this.config.alerting.enabled) {
      console.log('Monitoring or alerting disabled');
      return;
    }

    const metrics = this.loadLatestMetrics();
    if (!metrics) {
      console.log('No recent metrics found');
      return;
    }

    const alerts = this.analyzeMetrics(metrics);
    await this.sendAlerts(alerts);
  }

  loadLatestMetrics() {
    const metricsDir = path.join(process.cwd(), 'test-results');

    if (!fs.existsSync(metricsDir)) {
      return null;
    }

    const files = fs.readdirSync(metricsDir)
      .filter(file => file.endsWith('-metrics.json'))
      .map(file => ({
        name: file,
        path: path.join(metricsDir, file),
        mtime: fs.statSync(path.join(metricsDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(files[0].path, 'utf8'));
    } catch (error) {
      console.error('Failed to load metrics:', error.message);
      return null;
    }
  }

  analyzeMetrics(metrics) {
    const alerts = [];

    // Check test failure rate
    if (metrics.exitCode !== 0) {
      alerts.push({
        type: 'critical',
        category: 'testFailure',
        message: `Test execution failed with exit code ${metrics.exitCode}`,
        details: {
          command: metrics.command,
          duration: metrics.duration,
          testType: metrics.testType
        }
      });
    }

    // Check validation failures
    if (metrics.validationPassed === false) {
      alerts.push({
        type: 'warning',
        category: 'validationFailure',
        message: 'Pre-test validation failed',
        details: {
          validationDuration: metrics.validationDuration
        }
      });
    }

    // Check for long-running tests
    const thresholds = this.config.alerting.thresholds;
    if (metrics.testDuration > 300000) { // 5 minutes
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: `Test execution took longer than expected: ${(metrics.testDuration / 1000).toFixed(1)}s`,
        details: {
          duration: metrics.testDuration,
          testType: metrics.testType
        }
      });
    }

    // Check for errors in metrics
    if (metrics.errors && metrics.errors.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'errors',
        message: `${metrics.errors.length} errors occurred during test execution`,
        details: {
          errors: metrics.errors.slice(0, 5) // Limit to first 5 errors
        }
      });
    }

    return alerts;
  }

  async sendAlerts(alerts) {
    if (alerts.length === 0) {
      return;
    }

    console.log(`🚨 Sending ${alerts.length} alert(s)...`);

    for (const alert of alerts) {
      if (this.isOnCooldown(alert)) {
        console.log(`⏰ Alert on cooldown: ${alert.category}`);
        continue;
      }

      await this.sendAlert(alert);
      this.recordAlert(alert);
    }

    this.saveAlertHistory();
  }

  isOnCooldown(alert) {
    const key = `${alert.category}:${alert.type}`;
    const lastAlert = this.cooldowns.get(key);

    if (!lastAlert) {
      return false;
    }

    const cooldownMs = (this.config.alerting.cooldown?.minutes || 5) * 60 * 1000;
    return Date.now() - lastAlert < cooldownMs;
  }

  recordAlert(alert) {
    const key = `${alert.category}:${alert.type}`;
    this.cooldowns.set(key, Date.now());

    this.alertHistory.push({
      timestamp: new Date().toISOString(),
      ...alert
    });
  }

  async sendAlert(alert) {
    const channels = this.config.alerting.channels;

    if (channels.console) {
      this.sendConsoleAlert(alert);
    }

    if (channels.slack) {
      await this.sendSlackAlert(alert);
    }

    if (channels.email) {
      await this.sendEmailAlert(alert);
    }

    if (channels.webhook) {
      await this.sendWebhookAlert(alert);
    }
  }

  sendConsoleAlert(alert) {
    const icon = alert.type === 'critical' ? '🚨' : '⚠️';
    console.log(`${icon} [${alert.type.toUpperCase()}] ${alert.message}`);

    if (alert.details) {
      console.log(`   Details: ${JSON.stringify(alert.details, null, 2)}`);
    }
  }

  async sendSlackAlert(alert) {
    const slackConfig = this.config.notifications?.slack;
    if (!slackConfig?.webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return;
    }

    const payload = {
      channel: slackConfig.channel || '#alerts',
      username: slackConfig.username || 'Test Monitor',
      icon_emoji: slackConfig.icon || ':warning:',
      text: `*${alert.type.toUpperCase()}*: ${alert.message}`,
      attachments: [{
        color: alert.type === 'critical' ? 'danger' : 'warning',
        fields: Object.entries(alert.details || {}).map(([key, value]) => ({
          title: key,
          value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
          short: true
        }))
      }]
    };

    await this.sendHttpRequest(slackConfig.webhookUrl, 'POST', payload);
  }

  async sendEmailAlert(alert) {
    const emailConfig = this.config.notifications?.email;
    if (!emailConfig) {
      console.warn('Email configuration not found');
      return;
    }

    // For now, just log email alerts (would need nodemailer in production)
    console.log(`📧 Would send email alert: ${alert.message}`);
    console.log(`   To: ${emailConfig.to?.join(', ')}`);
  }

  async sendWebhookAlert(alert) {
    const webhookConfig = this.config.notifications?.webhook;
    if (!webhookConfig?.url) {
      console.warn('Webhook URL not configured');
      return;
    }

    const payload = {
      alert: alert,
      timestamp: new Date().toISOString(),
      source: 'test-alert-monitor'
    };

    await this.sendHttpRequest(webhookConfig.url, webhookConfig.method || 'POST', payload, webhookConfig.headers);
  }

  async sendHttpRequest(url, method, payload, headers = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new TestAlertMonitor();
  monitor.checkMetrics().catch(error => {
    console.error('Alert monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = TestAlertMonitor;