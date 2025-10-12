# Configuration Management Guide

This guide explains how to safely modify and manage test infrastructure configurations for The Lab Academy project.

## Configuration Overview

The test infrastructure uses a layered configuration approach:

1. **Base Configurations**: Core test settings in config files
2. **Environment Overrides**: Environment-specific settings via `.env` files
3. **Runtime Configuration**: Dynamic settings via environment variables
4. **Validation Layer**: Automated validation of all configurations

## Configuration Files

### Frontend Configuration Files

#### `vitest.config.ts` - Unit Test Configuration
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
```

**Safe Modifications:**
- ✅ Add new test file patterns to `include`
- ✅ Modify coverage settings
- ✅ Add new setup files
- ❌ Change `globals: true` (breaks existing tests)
- ❌ Remove core setup files

#### `vitest.integration.config.ts` - Integration Test Configuration
```typescript
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    testTimeout: 30000,
    globalSetup: ['./tests/integration-setup.ts'],
    env: {
      VITE_API_URL: 'http://127.0.0.1:8001/api'
    }
  }
})
```

**Safe Modifications:**
- ✅ Adjust `testTimeout` (within reason)
- ✅ Add environment variables
- ❌ Change `globalSetup` without testing
- ❌ Modify API URL structure

#### `playwright.config.ts` - E2E Test Configuration
```typescript
const config = {
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 100
    }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
}
```

**Safe Modifications:**
- ✅ Add new browser projects
- ✅ Adjust screenshot thresholds (gradually)
- ✅ Modify retry counts
- ❌ Change `fullyParallel` without performance testing
- ❌ Remove browser projects without coverage analysis

### Backend Configuration Files

#### `pytest.ini` - Backend Test Configuration
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = --strict-markers --disable-warnings
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
```

**Safe Modifications:**
- ✅ Add new markers
- ✅ Adjust test discovery patterns
- ❌ Change core test paths
- ❌ Remove essential markers

### Environment Configuration

#### `.env` Files
Environment variables are managed through `.env` files:

```env
# Frontend .env
VITE_API_URL=http://127.0.0.1:8001/api
VITE_TESTING=true
VITE_ENVIRONMENT=development

# Backend .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
SECRET_KEY=your-secret-key-here
TESTING=true
```

**Safe Modifications:**
- ✅ Update URLs for different environments
- ✅ Add new environment variables
- ✅ Toggle feature flags
- ❌ Change database connection strings without testing
- ❌ Modify security-related keys

## Configuration Validation

All configurations are automatically validated:

### Frontend Validation
```bash
# Validate all frontend configs
npm run config:validate

# Validate specific config
npx vitest --run --config vitest.config.ts --reporter verbose
```

### Backend Validation
```bash
# Validate pytest configuration
cd backend
poetry run pytest --collect-only

# Validate database configuration
poetry run python -c "import os; from src.core.config import settings; print('Config valid')"
```

## Safe Configuration Change Process

### Step 1: Assess Impact
Before making changes:

1. **Identify affected tests**: Which test suites use this configuration?
2. **Check dependencies**: What other configurations depend on this?
3. **Review validation rules**: Are there automated checks?

### Step 2: Create Backup
```bash
# Create configuration backup
cp vitest.config.ts vitest.config.ts.backup
cp playwright.config.ts playwright.config.ts.backup
```

### Step 3: Make Incremental Changes
```typescript
// Instead of large changes, make small increments
export default defineConfig({
  test: {
    // Change one setting at a time
    testTimeout: 10000, // Was 5000
    // ... rest unchanged
  }
})
```

### Step 4: Validate Changes
```bash
# Run validation
npm run validate:test-setup

# Run affected tests
npm run test:integration
npm run e2e:api
```

### Step 5: Test in Isolation
```bash
# Test configuration changes in isolation
npx vitest --run --config vitest.config.ts --reporter json
npx playwright test --config playwright.config.ts --grep "smoke"
```

### Step 6: Commit with Care
```bash
git add .
git commit -m "feat: update test timeout to 10s

- Increased testTimeout from 5s to 10s for integration tests
- Validated with full test suite
- No breaking changes"
```

## Common Configuration Scenarios

### Adding New Test Types

#### Example: Adding Component Tests
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'components/**/*.{test,spec}.{js,ts,jsx,tsx}', // New pattern
    ],
  }
})
```

#### Validation Steps:
```bash
# Test new pattern
npx vitest --run --include "components/**/*.{test,spec}.{js,ts,jsx,tsx}"

# Full validation
npm run test:run
```

### Modifying Browser Configuration

#### Example: Adding Mobile Testing
```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile', use: { ...devices['iPhone 12'] } }, // New
]
```

#### Validation Steps:
```bash
# Test mobile configuration
npx playwright test --project mobile --grep "mobile"

# Performance check
time npm run e2e
```

### Updating Performance Thresholds

#### Example: Adjusting Screenshot Thresholds
```typescript
// playwright.config.ts
expect: {
  toHaveScreenshot: {
    threshold: 0.15, // Was 0.2, now more strict
    maxDiffPixels: 75, // Was 100, now more strict
  },
}
```

#### Validation Steps:
```bash
# Update baseline screenshots
npm run e2e:visual:update

# Run visual regression tests
npm run e2e:visual
```

### Environment-Specific Configurations

#### Example: CI-Specific Settings
```typescript
// playwright.config.ts
retries: process.env.CI ? 3 : 0, // Increased retries for CI
workers: process.env.CI ? 4 : undefined, // More workers in CI
```

#### Validation Steps:
```bash
# Simulate CI environment
CI=true npm run e2e

# Check resource usage
npm run performance
```

## Configuration Monitoring

### Automated Validation
The system includes automated configuration validation:

```bash
# Daily validation check
npm run validate:test-setup

# Configuration drift detection
npm run config:drift-check
```

### Configuration Metrics
Monitor configuration effectiveness:

```bash
# Test execution times
npm run performance:trend

# Configuration validation status
npm run monitor:alerts
```

## Troubleshooting Configuration Issues

### Common Issues

#### Configuration Validation Failures
```bash
# Check validation output
npm run validate:test-setup

# Debug specific config
DEBUG=config npx vitest --run
```

#### Test Timeouts
```typescript
// Temporary increase for debugging
export default defineConfig({
  test: {
    testTimeout: 60000, // 1 minute for debugging
  }
})
```

#### Browser Compatibility Issues
```typescript
// Isolate browser testing
projects: [
  { name: 'chromium-only', use: { ...devices['Desktop Chrome'] } },
]
```

### Recovery Procedures

#### Rollback Configuration Changes
```bash
# Restore from backup
cp vitest.config.ts.backup vitest.config.ts

# Reset to last known good
git checkout HEAD~1 -- vitest.config.ts
```

#### Emergency Configuration
For critical issues, use minimal configuration:

```typescript
// emergency.config.ts
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
  }
})
```

## Best Practices

### General Rules
1. **Test configurations in isolation** before committing
2. **Use environment variables** for environment-specific settings
3. **Document configuration changes** in commit messages
4. **Validate configurations** automatically
5. **Monitor configuration impact** on test performance

### Performance Considerations
- **Parallel execution**: Balance workers with system resources
- **Timeouts**: Set appropriate timeouts for different test types
- **Retries**: Use retries judiciously to avoid masking real issues
- **Coverage**: Balance coverage requirements with execution time

### Security Considerations
- **Never commit secrets** in configuration files
- **Use environment variables** for sensitive data
- **Validate configuration sources** before use
- **Audit configuration changes** regularly

## Advanced Configuration

### Custom Test Environments
```typescript
// custom-environment.config.ts
export default defineConfig({
  test: {
    environment: './custom-environment.ts',
    setupFiles: ['./custom-setup.ts'],
  }
})
```

### Dynamic Configuration
```typescript
// dynamic.config.ts
export default defineConfig(async () => {
  const testEnv = process.env.TEST_ENV || 'development'

  return {
    test: {
      include: getTestPatterns(testEnv),
      setupFiles: getSetupFiles(testEnv),
    }
  }
})
```

### Configuration Inheritance
```typescript
// base.config.ts
const baseConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
  }
}

// specific.config.ts
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/**/*.test.ts'],
  }
})
```

## Support

For configuration issues:

1. Check the [Troubleshooting Guide](../troubleshooting/README.md)
2. Review configuration validation output
3. Test changes in isolation
4. Consult with the QA lead for complex changes

---

**Changelog**
- v1.0.0: Initial configuration management guide
- Added safe modification guidelines
- Included validation procedures
- Added troubleshooting section