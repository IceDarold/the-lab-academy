# CI/CD Integration Guide

This guide explains how the test infrastructure integrates with CI/CD pipelines and provides monitoring procedures.

## CI/CD Pipeline Overview

### Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Git Push  │ -> │   GitHub    │ -> │  Parallel   │
│             │    │   Actions   │    │   Jobs      │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
            ┌───────▼──────┐          ┌───────▼──────┐          ┌───────▼──────┐
            │   Unit       │          │ Integration  │          │   Backend     │
            │   Tests      │          │   Tests      │          │   Tests       │
            └───────▲──────┘          └───────▲──────┘          └───────▲──────┘
                    │                         │                         │
            ┌───────▼──────┐          ┌───────▼──────┐          ┌───────▼──────┐
            │   E2E API    │          │   E2E UI     │          │   Visual      │
            │   Tests      │          │   Tests      │          │   Regression  │
            └───────▲──────┘          └───────▲──────┘          └───────▲──────┘
                    │                         │                         │
            ┌───────▼──────┐          ┌───────▼──────┐          ┌───────▼──────┘
            │ Performance  │          │ Accessibility│
            │   Tests      │          │   Tests      │
            └───────▲──────┘          └───────▲──────┘
                    │                         │
            ┌───────▼──────┐          ┌───────▼──────┐
            │ Error Scenario│          │   Build &   │
            │   Tests       │          │   Deploy    │
            └───────▲──────┘          └───────▲──────┘
                    │                         │
            ┌───────▼──────┐          ┌───────▼──────┐
            │ Test Results │          │   Success!   │
            │ Aggregation  │          │              │
            └──────────────┘          └──────────────┘
```

### Pipeline Triggers

#### Automatic Triggers
```yaml
on:
  push:
    branches: [ main, develop, fix-test-failures ]
  pull_request:
    branches: [ main, develop ]
```

#### Manual Triggers
```yaml
on:
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Type of tests to run'
        required: true
        default: 'full'
        type: choice
        options:
          - full
          - unit
          - integration
          - e2e
          - performance
```

## Job Configuration Details

### Frontend Unit Tests Job

#### Configuration
```yaml
frontend-unit-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install dependencies
      run: |
        cd frontend
        npm ci

    - name: Run linting
      run: |
        cd frontend
        npm run lint

    - name: Run unit tests
      run: |
        cd frontend
        npm run test:run

    - name: Run unit tests with coverage
      run: |
        cd frontend
        npm run test:coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v4
      with:
        file: ./frontend/coverage/coverage-final.json
        flags: frontend-unittests
```

#### Key Features
- **Fast feedback**: Runs in ~2-3 minutes
- **Parallel execution**: No dependencies on other services
- **Coverage reporting**: Integrated with Codecov
- **Linting**: Code quality checks included

### Frontend Integration Tests Job

#### Configuration
```yaml
frontend-integration-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: test_db
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
      ports:
        - 5432:5432

  steps:
    - name: Setup backend
      run: |
        cd backend
        poetry install
        poetry run python scripts/seed_database.py --test
        poetry run uvicorn src.main:app --host 0.0.0.0 --port 8001 &

    - name: Run integration tests
      run: |
        cd frontend
        npm run test:integration:ci

    - name: Upload results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: integration-test-results-${{ github.run_id }}
        path: |
          frontend/test-results/
          frontend/coverage/
```

#### Key Features
- **Real database**: PostgreSQL service container
- **Backend dependency**: Full API integration testing
- **Artifact storage**: Test results preserved for 30 days
- **Health checks**: Database readiness validation

### E2E Testing Jobs

#### API E2E Tests
```yaml
e2e-api-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      # ... database setup
  steps:
    - name: Start backend
      run: |
        cd backend
        poetry run uvicorn src.main:app --host 0.0.0.0 --port 8001 &

    - name: Setup frontend
      run: |
        cd frontend
        npm ci
        npx playwright install --with-deps

    - name: Run API E2E tests
      run: |
        cd frontend
        npm run e2e:api:ci
```

#### UI E2E Tests
```yaml
e2e-ui-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      # ... database setup
  steps:
    - name: Start full stack
      run: |
        # Backend
        cd backend
        poetry run uvicorn src.main:app --host 0.0.0.0 --port 8001 &

        # Frontend build and serve
        cd frontend
        npm run build
        npm run preview --port 3000 &

    - name: Run UI E2E tests
      run: |
        cd frontend
        npm run e2e:ui-only:ci
```

#### Visual Regression Tests
```yaml
visual-regression-tests:
  runs-on: ubuntu-latest
  steps:
    # ... full stack setup
    - name: Run visual tests
      run: |
        cd frontend
        npm run e2e:visual:ci

    - name: Upload visual results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: visual-regression-results-${{ github.run_id }}
        path: |
          frontend/playwright-report/
          frontend/test-results/
```

## Pipeline Optimization Strategies

### Parallel Execution

#### Job Dependencies
```yaml
jobs:
  # Fast, independent jobs run first
  frontend-unit-tests:
  frontend-integration-tests:

  # Slower jobs with dependencies
  e2e-api-tests:
    needs: [frontend-unit-tests]  # Can run in parallel with integration

  e2e-ui-tests:
    needs: [frontend-integration-tests]  # Needs integration tests to pass

  # Specialized testing
  visual-regression-tests:
  performance-tests:
  accessibility-tests:

  # Final aggregation
  test-results-summary:
    needs: [frontend-unit-tests, frontend-integration-tests, ...]
    if: always()  # Always run, even if previous jobs fail
```

#### Matrix Strategies
```yaml
e2e-tests:
  strategy:
    matrix:
      browser: [chromium, firefox, webkit]
      shard: [1/3, 2/3, 3/3]
  steps:
    - name: Run sharded E2E tests
      run: |
        cd frontend
        npx playwright test --project ${{ matrix.browser }} --shard ${{ matrix.shard }}
```

### Caching Strategies

#### Dependency Caching
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json

- name: Setup Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.12'
    cache: 'poetry'
    cache-dependency-path: backend/poetry.lock
```

#### Browser Caching
```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('frontend/package-lock.json') }}
```

### Conditional Execution

#### Branch-Based Execution
```yaml
jobs:
  e2e-tests:
    if: |
      github.ref == 'refs/heads/main' ||
      github.ref == 'refs/heads/develop' ||
      contains(github.head_ref, 'e2e') ||
      contains(github.head_ref, 'test')
```

#### File-Based Triggers
```yaml
on:
  pull_request:
    paths:
      - 'frontend/src/**'
      - 'frontend/tests/**'
      - 'frontend/package.json'
```

## Monitoring and Observability

### Pipeline Metrics

#### Execution Time Tracking
```yaml
- name: Track job duration
  run: |
    echo "Job started at: $(date)"
    # ... job steps ...
    echo "Job completed at: $(date)"
```

#### Success/Failure Rates
```yaml
- name: Report pipeline status
  if: always()
  run: |
    if [ ${{ job.status }} == 'success' ]; then
      echo "✅ Pipeline successful"
    else
      echo "❌ Pipeline failed"
      # Send notification
    fi
```

### Test Result Aggregation

#### Comprehensive Reporting
```yaml
test-results-summary:
  runs-on: ubuntu-latest
  needs: [frontend-unit-tests, ...]
  if: always()
  steps:
    - name: Download all artifacts
      uses: actions/download-artifact@v4
      with:
        path: ./test-artifacts

    - name: Generate summary
      run: |
        cd frontend
        node scripts/generate-test-summary.js

    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          // Post test results as PR comment
```

### Alerting and Notifications

#### Slack Integration
```yaml
- name: Notify on failure
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    SLACK_MESSAGE: 'CI Pipeline failed: ${{ github.workflow }} #${{ github.run_number }}'
```

#### Email Notifications
```yaml
- name: Send email report
  if: always()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    to: qa-team@company.com
    subject: 'Test Results: ${{ github.workflow }} #${{ github.run_number }}'
    body: 'Check GitHub Actions for detailed results.'
```

## Local CI Simulation

### Simulating CI Environment

#### Environment Variables
```bash
# Simulate CI environment locally
export CI=true
export GITHUB_ACTIONS=true
export GITHUB_RUN_ID=12345
export GITHUB_SHA=$(git rev-parse HEAD)
```

#### Running CI Commands Locally
```bash
# Run same commands as CI
npm run test:integration:ci
npm run e2e:ci
npm run performance:ci

# With verbose output
DEBUG=* npm run ci:test:full
```

### Debugging CI Issues

#### Reproducing Failures
```bash
# Download CI artifacts
# Go to GitHub Actions -> Failed job -> Artifacts

# Extract and examine
unzip test-results.zip
cat test-results/error.log
```

#### Container Debugging
```bash
# Run CI container locally
docker run -it \
  -v $(pwd):/workspace \
  -w /workspace \
  ubuntu:latest \
  bash

# Install dependencies and reproduce
```

## Pipeline Maintenance

### Regular Maintenance Tasks

#### Weekly
- Review pipeline execution times
- Check for flaky tests
- Update dependencies
- Clean up old artifacts

#### Monthly
- Audit pipeline security
- Review caching effectiveness
- Update GitHub Actions versions
- Analyze test coverage trends

### Performance Optimization

#### Identifying Bottlenecks
```bash
# Analyze job durations
# Check GitHub Actions billing/usage

# Profile slow tests
npm run performance:profile
```

#### Optimization Strategies
- **Parallelization**: Split slow jobs across multiple runners
- **Caching**: Improve cache hit rates
- **Selective testing**: Run only affected tests
- **Resource allocation**: Adjust runner sizes

## Troubleshooting CI/CD Issues

### Common Pipeline Problems

#### Job Timeouts
```yaml
# Increase timeout for slow jobs
jobs:
  e2e-tests:
    timeout-minutes: 30  # Default is 360 (6 hours)
```

#### Resource Exhaustion
```yaml
# Use larger runners for memory-intensive jobs
jobs:
  performance-tests:
    runs-on: ubuntu-latest-8-cores  # More CPU cores
```

#### Flaky Tests
```yaml
# Add retries for flaky tests
jobs:
  e2e-tests:
    strategy:
      fail-fast: false  # Continue if one browser fails
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Run tests with retry
        uses: nick-invision/retry@v2
        with:
          command: npm run e2e -- --project ${{ matrix.browser }}
          timeout_minutes: 10
          max_attempts: 3
```

### Debugging Techniques

#### Verbose Logging
```yaml
- name: Debug information
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Git commit: $GITHUB_SHA"
    echo "Branch: $GITHUB_REF"
```

#### Artifact Collection
```yaml
- name: Collect debug information
  if: failure()
  run: |
    # System information
    uname -a > debug/system.txt
    df -h >> debug/system.txt

    # Process information
    ps aux > debug/processes.txt

    # Network information
    netstat -tlnp > debug/network.txt
```

## Advanced CI/CD Features

### Dynamic Pipeline Generation

#### Conditional Job Creation
```yaml
jobs:
  setup:
    outputs:
      run-e2e: ${{ steps.check.outputs.run-e2e }}
    steps:
      - id: check
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            echo "run-e2e=true" >> $GITHUB_OUTPUT
          else
            echo "run-e2e=false" >> $GITHUB_OUTPUT
          fi

  e2e-tests:
    needs: setup
    if: needs.setup.outputs.run-e2e == 'true'
    # ... e2e test configuration
```

### Custom Workflow Triggers

#### Scheduled Testing
```yaml
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
  workflow_dispatch:
```

#### External Triggers
```yaml
on:
  repository_dispatch:
    types: [test-trigger]
```

## Security Considerations

### Secret Management
```yaml
# Use GitHub secrets for sensitive data
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}

# Never log secrets
- name: Safe logging
  run: |
    echo "Testing with API key: ***"
```

### Access Control
- **Branch protection**: Require CI to pass before merge
- **Required reviews**: Code review requirements
- **Status checks**: Mandatory CI checks

### Audit Logging
```yaml
- name: Log pipeline execution
  run: |
    echo "$(date): Pipeline ${{ github.workflow }} executed by ${{ github.actor }}" >> audit.log
```

## Best Practices

### Pipeline Design
1. **Fast feedback**: Unit tests run first and fastest
2. **Fail fast**: Stop pipeline on critical failures
3. **Parallel execution**: Maximize concurrency
4. **Comprehensive reporting**: Clear success/failure indicators
5. **Incremental testing**: Test only what changed

### Maintenance
1. **Regular updates**: Keep actions and dependencies current
2. **Monitor performance**: Track and optimize execution times
3. **Documentation**: Keep pipeline documentation updated
4. **Alerting**: Set up notifications for failures
5. **Security**: Regular security audits and updates

### Troubleshooting
1. **Reproduce locally**: Test changes before committing
2. **Check logs**: Examine CI logs for error details
3. **Isolate issues**: Test individual jobs/components
4. **Version control**: Track pipeline configuration changes
5. **Documentation**: Document solutions to common issues

---

**Changelog**
- v1.0.0: Initial comprehensive CI/CD integration guide
- Added pipeline architecture and job configurations
- Included optimization strategies and monitoring
- Added troubleshooting and best practices