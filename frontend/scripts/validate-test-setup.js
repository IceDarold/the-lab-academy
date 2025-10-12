#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const net = require('net');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Validation metrics
const validationMetrics = {
  startTime: Date.now(),
  endTime: null,
  duration: null,
  checks: {
    configSyntax: { passed: false, duration: null, errors: [], warnings: [] },
    dependencies: { passed: false, duration: null, errors: [], warnings: [] },
    environmentVariables: { passed: false, duration: null, errors: [], warnings: [] },
    fileSystemPermissions: { passed: false, duration: null, errors: [], warnings: [] },
    portAvailability: { passed: false, duration: null, errors: [], warnings: [] }
  },
  totalErrors: 0,
  totalWarnings: 0,
  passed: false
};

function saveValidationMetrics() {
  validationMetrics.endTime = Date.now();
  validationMetrics.duration = validationMetrics.endTime - validationMetrics.startTime;

  const metricsFile = path.join(process.cwd(), 'test-results', 'validation-metrics.json');
  const metricsDir = path.dirname(metricsFile);

  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  fs.writeFileSync(metricsFile, JSON.stringify(validationMetrics, null, 2));
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

let hasErrors = false;

async function checkConfigSyntax() {
  const startTime = Date.now();
  info('Checking configuration file syntax and validation...');

  const configFiles = [
    'playwright.config.ts',
    'vitest.config.ts',
    'vitest.integration.config.ts'
  ];

  // Check if the centralized validation module exists
  const validationModulePath = path.join(process.cwd(), 'src/lib/config-validation.ts');
  let hasCentralizedValidation = false;

  try {
    if (fs.existsSync(validationModulePath)) {
      hasCentralizedValidation = true;
      info('Found centralized configuration validation module');
    }
  } catch (err) {
    warning('Centralized validation module not found, falling back to basic checks');
  }

  for (const configFile of configFiles) {
    try {
      const configPath = path.join(process.cwd(), configFile);
      if (!fs.existsSync(configPath)) {
        error(`Configuration file not found: ${configFile}`);
        hasErrors = true;
        continue;
      }

      // Try to parse TypeScript config by checking if it can be read
      const content = fs.readFileSync(configPath, 'utf8');
      if (!content.trim()) {
        error(`Configuration file is empty: ${configFile}`);
        hasErrors = true;
        continue;
      }

      // Basic syntax check - look for common issues
      if (configFile.endsWith('.ts')) {
        if (!content.includes('export default') && !content.includes('export')) {
          warning(`Configuration file may not have proper exports: ${configFile}`);
        }
      }

      success(`Configuration file syntax OK: ${configFile}`);
    } catch (err) {
      error(`Failed to read configuration file ${configFile}: ${err.message}`);
      hasErrors = true;
    }
  }

  // Run centralized validation if available
  if (hasCentralizedValidation) {
    try {
      info('Running centralized configuration validation...');

      // Import the validation module dynamically
      const { validateAllConfigs } = await import('../src/lib/config-validation.ts');
      const result = await validateAllConfigs({ verbose: true });

      if (!result.isValid) {
        error('Centralized configuration validation failed:');
        result.errors.forEach(err => error(`  ${err}`));
        hasErrors = true;
      } else {
        success('Centralized configuration validation passed');
      }

      if (result.warnings.length > 0) {
        warning('Configuration warnings:');
        result.warnings.forEach(warn => warning(`  ${warn}`));
      }

    } catch (err) {
      warning(`Failed to run centralized validation: ${err.message}`);
      warning('Falling back to basic configuration checks');
    }
  }
}

function checkDependencies() {
  info('Checking dependency versions and conflicts...');

  try {
    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      error('package.json not found');
      hasErrors = true;
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check for required testing dependencies
    const requiredDeps = [
      '@playwright/test',
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom'
    ];

    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        error(`Required dependency not found: ${dep}`);
        hasErrors = true;
      } else {
        const version = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
        success(`Dependency found: ${dep}@${version}`);
      }
    }

    // Check for dependency conflicts using npm ls
    try {
      execSync('npm ls --depth=0 --json', { stdio: 'pipe' });
      success('No dependency conflicts detected');
    } catch (err) {
      warning('Potential dependency conflicts detected. Run "npm ls" for details.');
    }

  } catch (err) {
    error(`Failed to check dependencies: ${err.message}`);
    hasErrors = true;
  }
}

function checkEnvironmentVariables() {
  info('Checking required environment variables...');

  const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_MODE'
  ];

  const optionalEnvVars = [
    'VITE_API_TIMEOUT',
    'VITE_API_MAX_RETRIES',
    'SUPABASE_URL',
    'SUPABASE_KEY'
  ];

  // Load .env file if it exists
  const envPath = path.join(process.cwd(), '..', '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !key.startsWith('#')) {
          process.env[key.trim()] = value.trim();
        }
      });
    } catch (err) {
      warning(`Could not load .env file: ${err.message}`);
    }
  }

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      error(`Required environment variable not set: ${envVar}`);
      hasErrors = true;
    } else {
      success(`Environment variable set: ${envVar}`);
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warning(`Optional environment variable not set: ${envVar}`);
    } else {
      success(`Environment variable set: ${envVar}`);
    }
  }
}

function checkFileSystemPermissions() {
  info('Checking file system permissions...');

  const directories = [
    'tests',
    'coverage',
    'playwright-report',
    'test-results'
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        success(`Created directory: ${dir}`);
      } else {
        // Check if directory is writable
        const testFile = path.join(dirPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        success(`Directory writable: ${dir}`);
      }
    } catch (err) {
      error(`File system permission issue with directory ${dir}: ${err.message}`);
      hasErrors = true;
    }
  }
}

async function checkPortAvailability() {
  info('Checking port availability for test servers...');

  const ports = [
    { port: 3000, service: 'Frontend dev server' },
    { port: 8000, service: 'Backend API server' },
    { port: 8001, service: 'Backend test API server' }
  ];

  for (const { port, service } of ports) {
    await new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close();
        success(`Port ${port} available for ${service}`);
        resolve();
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          warning(`Port ${port} in use by ${service} - this may affect tests`);
        } else {
          error(`Port ${port} check failed: ${err.message}`);
          hasErrors = true;
        }
        resolve();
      });
    });
  }
}

async function main() {
  log('🔍 Starting test setup validation...', 'cyan');

  try {
    await checkConfigSyntax();
    checkDependencies();
    checkEnvironmentVariables();
    checkFileSystemPermissions();
    await checkPortAvailability();

    log('\n' + '='.repeat(50), 'cyan');

    validationMetrics.passed = !hasErrors;
    saveValidationMetrics();

    if (hasErrors) {
      error('❌ Test setup validation failed! Please fix the issues above before running tests.');
      process.exit(1);
    } else {
      success('✅ All validation checks passed! Test setup is ready.');
    }

  } catch (err) {
    error(`Unexpected error during validation: ${err.message}`);
    validationMetrics.passed = false;
    saveValidationMetrics();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };