const fs = require('fs');
const path = require('path');

// Metrics collection
const metrics = {
  startTime: null,
  endTime: null,
  duration: null,
  exitCode: null,
  command: null,
  validationPassed: false,
  validationDuration: null,
  errors: [],
  warnings: [],
  testType: null
};

function collectMetrics() {
  const metricsFile = path.join(__dirname, '..', 'test-results', 'test-run-metrics.json');
  const metricsDir = path.dirname(metricsFile);

  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  // Add additional metadata
  metrics.timestamp = new Date().toISOString();
  metrics.runId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
  metrics.commit = process.env.GITHUB_SHA || 'unknown';
  metrics.branch = process.env.GITHUB_REF_NAME || 'unknown';
  metrics.nodeVersion = process.version;
  metrics.platform = process.platform;

  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  console.log(`📊 Test run metrics saved: ${metricsFile}`);
}

function logError(message) {
  console.error(`❌ ${message}`);
  metrics.errors.push({
    timestamp: new Date().toISOString(),
    message: message
  });
}

function logWarning(message) {
  console.warn(`⚠️  ${message}`);
  metrics.warnings.push({
    timestamp: new Date().toISOString(),
    message: message
  });
}

const lockFile = path.join(__dirname, '..', '.playwright-lock');

function acquireLock() {
  if (fs.existsSync(lockFile)) {
    console.log('Another Playwright test is running. Please wait.');
    process.exit(1);
  }
  fs.writeFileSync(lockFile, process.pid.toString());
}

function releaseLock() {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
}

acquireLock();

// Initialize metrics
metrics.startTime = Date.now();
metrics.command = process.argv[2];

// Run validation before executing tests
const { execSync } = require('child_process');

const validationStart = Date.now();
try {
  console.log('Running pre-test validation...');
  execSync(`node ${path.join(__dirname, 'validate-test-setup.js')}`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  metrics.validationPassed = true;
  metrics.validationDuration = Date.now() - validationStart;
  console.log('✅ Pre-test validation passed');
} catch (error) {
  logError('Pre-test validation failed');
  metrics.validationPassed = false;
  metrics.validationDuration = Date.now() - validationStart;
  releaseLock();
  collectMetrics();
  process.exit(1);
}

const { spawn } = require('child_process');
const command = process.argv[2];

if (!command) {
  logError('No command provided');
  releaseLock();
  collectMetrics();
  process.exit(1);
}

// Determine test type from command
if (command.includes('integration')) {
  metrics.testType = 'integration';
} else if (command.includes('e2e') || command.includes('playwright')) {
  metrics.testType = 'e2e';
} else if (command.includes('unit') || command.includes('vitest')) {
  metrics.testType = 'unit';
} else {
  metrics.testType = 'unknown';
}

console.log(`🚀 Starting ${metrics.testType} tests...`);
const testStartTime = Date.now();

const child = spawn(command, { stdio: 'inherit', shell: true });

child.on('exit', (code) => {
  metrics.endTime = Date.now();
  metrics.duration = metrics.endTime - metrics.startTime;
  metrics.testDuration = metrics.endTime - testStartTime;
  metrics.exitCode = code;

  if (code === 0) {
    console.log(`✅ ${metrics.testType} tests completed successfully in ${(metrics.testDuration / 1000).toFixed(2)}s`);
  } else {
    logError(`${metrics.testType} tests failed with exit code ${code} after ${(metrics.testDuration / 1000).toFixed(2)}s`);
  }

  collectMetrics();

  // Run alert monitoring
  console.log('🔍 Running alert monitoring...');
  const { spawn } = require('child_process');
  const alertProcess = spawn('node', [path.join(__dirname, 'test-alert-monitor.js')], {
    stdio: 'inherit',
    cwd: __dirname
  });

  alertProcess.on('exit', (alertCode) => {
    if (alertCode !== 0) {
      console.warn(`⚠️ Alert monitoring exited with code ${alertCode}`);
    }

    // Run trend analysis
    console.log('📈 Running performance trend analysis...');
    const trendProcess = spawn('node', [path.join(__dirname, 'generate-performance-trends.js')], {
      stdio: 'inherit',
      cwd: __dirname
    });

    trendProcess.on('exit', (trendCode) => {
      if (trendCode !== 0) {
        console.warn(`⚠️ Trend analysis exited with code ${trendCode}`);
      }

      // Run result aggregation
      console.log('📊 Running test result aggregation...');
      const aggregatorProcess = spawn('node', [path.join(__dirname, 'test-result-aggregator.js')], {
        stdio: 'inherit',
        cwd: __dirname
      });

      aggregatorProcess.on('exit', (aggCode) => {
        if (aggCode !== 0) {
          console.warn(`⚠️ Result aggregation exited with code ${aggCode}`);
        }
        releaseLock();
        process.exit(code);
      });

      aggregatorProcess.on('error', (err) => {
        console.warn('⚠️ Failed to run result aggregation:', err.message);
        releaseLock();
        process.exit(code);
      });
    });

    trendProcess.on('error', (err) => {
      console.warn('⚠️ Failed to run trend analysis:', err.message);
      releaseLock();
      process.exit(code);
    });
  });

  alertProcess.on('error', (err) => {
    console.warn('⚠️ Failed to run alert monitoring:', err.message);
    releaseLock();
    process.exit(code);
  });
});

child.on('error', (err) => {
  metrics.endTime = Date.now();
  metrics.duration = metrics.endTime - metrics.startTime;
  metrics.exitCode = 1;
  logError(`Failed to start command: ${err.message}`);
  collectMetrics();
  releaseLock();
  process.exit(1);
});

process.on('SIGINT', () => {
  logWarning('Test run interrupted by SIGINT');
  metrics.endTime = Date.now();
  metrics.duration = metrics.endTime - metrics.startTime;
  metrics.exitCode = 130; // SIGINT exit code
  collectMetrics();
  releaseLock();
  process.exit(130);
});

process.on('SIGTERM', () => {
  logWarning('Test run terminated by SIGTERM');
  metrics.endTime = Date.now();
  metrics.duration = metrics.endTime - metrics.startTime;
  metrics.exitCode = 143; // SIGTERM exit code
  collectMetrics();
  releaseLock();
  process.exit(143);
});